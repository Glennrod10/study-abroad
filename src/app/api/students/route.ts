import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getAuthSession } from "@/lib/auth"
import { logAudit } from "@/lib/audit"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
    const session = await getAuthSession()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""

    let query = supabase
        .from("students")
        .select("id, first_name, last_name, email")
        .eq("agency_id", session.user.agency_id)
        .limit(10)

    if (search) {
        query = query.or(
            `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
        )
    }

    const { data: students } = await query.order("first_name")

    return NextResponse.json({ students: students || [] })
}

export async function POST(req: Request) {

    const session = await getAuthSession()

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    const {
        first_name,
        last_name,
        email,
        phone,
        country_interest,
        status,
        assigned_staff,
        avatar_url,
        student_code,
        last_activity_note,
        last_activity_at,
    } = body

    if (!first_name || !email) {
        return NextResponse.json(
            { error: "Required fields missing" },
            { status: 400 }
        )
    }

    const { data: student, error } = await supabase
        .from("students")
        .insert([
            {
                first_name,
                last_name,
                email,
                phone,
                country_interest,
                status,
                assigned_staff,
                avatar_url,
                student_code,
                last_activity_note,
                last_activity_at,
                agency_id: session.user.agency_id,
            },
        ])
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await logAudit({
        agencyId: session.user.agency_id,
        studentId: student.id,
        userId: session.user.id,
        action: "student.created",
        description: `Created student ${student.first_name} ${student.last_name}`,
    })

    return NextResponse.json({ success: true })
}