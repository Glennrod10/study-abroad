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

    /* get uploaded docs */

    const { data: docs } = await supabase
        .from("visa_documents")
        .select("*")
        .eq("visa_case_id", visaId)

    /* merge */

    const result = checklist?.map((item: any) => {

        const doc = docs?.find(
            (d: any) => d.checklist_item_id === item.id
        )

        return {
            checklist_id: item.id,
            item_name: item.item_name,
            file_name: doc?.file_name ?? null,
            file_url: doc?.file_url ?? null
        }

    })

    return NextResponse.json(result ?? [])
}