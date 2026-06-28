export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getAuthSession } from "@/lib/auth"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getAuthSession()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    const { data: docsWithTag } = await supabase
        .from("student_documents")
        .select("id, tags")
        .contains("tags", [id])
        .eq("agency_id", session.user.agency_id)

    if (docsWithTag) {
        for (const doc of docsWithTag) {
            const updatedTags = (doc.tags as string[]).filter(t => t !== id)
            await supabase
                .from("student_documents")
                .update({ tags: updatedTags })
                .eq("id", doc.id)
        }
    }

    const { error } = await supabase
        .from("document_tags")
        .delete()
        .eq("id", id)
        .eq("agency_id", session.user.agency_id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
