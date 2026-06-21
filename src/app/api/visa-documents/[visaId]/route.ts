import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
    req: Request,
    context: { params: Promise<{ visaId: string }> }
) {

    const { visaId } = await context.params

    /* get checklist */

    const { data: checklist } = await supabase
        .from("visa_checklist_items")
        .select("id, item_name")
        .eq("visa_case_id", visaId)

    /* get uploaded docs (including custom ones with no checklist_item_id) */

    const { data: docs } = await supabase
        .from("visa_documents")
        .select("*")
        .eq("visa_case_id", visaId)
        .order("created_at", { ascending: false })

    /* merge checklist items with uploaded docs */

    const merged = checklist?.map((item: any) => {

        const doc = docs?.find(
            (d: any) => d.checklist_item_id === item.id
        )

        return {
            id: doc?.id ?? null,
            checklist_id: item.id,
            item_name: item.item_name,
            file_name: doc?.file_name ?? null,
            file_url: doc?.file_url ?? null,
            tags: doc?.tags ?? []
        }

    })

    /* custom docs (uploaded without a checklist_item_id) */

    const linkedIds = new Set(checklist?.map((c: any) => c.id) ?? [])
    const customDocs = docs?.filter(
        (d: any) => !d.checklist_item_id || !linkedIds.has(d.checklist_item_id)
    ) ?? []

    const customItems = customDocs.map((doc: any) => ({
        id: doc.id,
        checklist_id: null,
        item_name: doc.file_name,
        file_name: doc.file_name,
        file_url: doc.file_url,
        tags: doc.tags ?? []
    }))

    return NextResponse.json({ merged, customDocs: customItems })
}

export async function PATCH(
    req: Request,
    context: { params: Promise<{ visaId: string }> }
) {

    const { visaId } = await context.params
    const body = await req.json()
    const { documentId, tags } = body

    const { error } = await supabase
        .from("visa_documents")
        .update({ tags })
        .eq("id", documentId)
        .eq("visa_case_id", visaId)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}