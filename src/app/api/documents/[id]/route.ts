export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getAuthSession } from "@/lib/auth"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getAuthSession()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const body = await req.json()

    const updates: Record<string, any> = {}
    if (body.tags !== undefined) updates.tags = body.tags
    if (body.document_name !== undefined) updates.document_name = body.document_name
    if (body.status !== undefined) updates.status = body.status

    const { error } = await supabase
        .from("student_documents")
        .update(updates)
        .eq("id", id)
        .eq("agency_id", session.user.agency_id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}

export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getAuthSession()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    const { data: doc } = await supabase
        .from("student_documents")
        .select("file_url")
        .eq("id", id)
        .eq("agency_id", session.user.agency_id)
        .single()

    if (doc?.file_url) {
        const fileName = doc.file_url.split("/").pop()
        if (fileName) {
            await supabase.storage
                .from("student-documents")
                .remove([fileName])
        }
    }

    const { error } = await supabase
        .from("student_documents")
        .delete()
        .eq("id", id)
        .eq("agency_id", session.user.agency_id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
