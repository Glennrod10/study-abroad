export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getAuthSession } from "@/lib/auth"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
    const session = await getAuthSession()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const tagIds = searchParams.getAll("tags")
    const studentId = searchParams.get("student_id") || ""
    const status = searchParams.get("status") || ""
    const dateFrom = searchParams.get("date_from") || ""
    const dateTo = searchParams.get("date_to") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "25")
    const offset = (page - 1) * limit

    const agencyId = session.user.agency_id

    const { data: allTags } = await supabase
        .from("document_tags")
        .select("*")
        .eq("agency_id", agencyId)

    const tagMap = new Map((allTags || []).map(t => [t.id, t]))

    let query = supabase
        .from("student_documents")
        .select("*, students!inner(first_name, last_name)", { count: "exact" })
        .eq("agency_id", agencyId)

    if (search) {
        const sanitized = search.replace(/[%_]/g, "")

        const { data: matchingStudents } = await supabase
            .from("students")
            .select("id")
            .or(`first_name.ilike.%${sanitized}%,last_name.ilike.%${sanitized}%`)
            .eq("agency_id", agencyId)

        const studentIds = (matchingStudents || []).map(s => s.id)

        const conditions = [`document_name.ilike.%${sanitized}%`]
        if (studentIds.length > 0) {
            conditions.push(`student_id.in.(${studentIds.join(",")})`)
        }
        query = query.or(conditions.join(","))
    }

    if (tagIds.length > 0) {
        const tagFilters = tagIds.map(id => `tags.cs.${JSON.stringify([id])}`)
        query = query.or(tagFilters.join(","))
    }

    if (studentId) {
        query = query.eq("student_id", studentId)
    }

    if (status) {
        query = query.eq("status", status)
    }

    if (dateFrom) {
        query = query.gte("created_at", dateFrom)
    }

    if (dateTo) {
        query = query.lte("created_at", dateTo)
    }

    const { data: documents, count, error } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const mapped = (documents || []).map(doc => ({
        id: doc.id,
        student_id: doc.student_id,
        student_name: doc.students
            ? `${doc.students.first_name || ""} ${doc.students.last_name || ""}`.trim()
            : "Unknown",
        document_name: doc.document_name,
        file_url: doc.file_url,
        document_type: doc.document_type,
        tags: doc.tags || [],
        tag_details: (doc.tags || []).map((tagId: string) => tagMap.get(tagId)).filter(Boolean),
        status: doc.status,
        created_at: doc.created_at,
    }))

    return NextResponse.json({ documents: mapped, total: count || 0 })
}
