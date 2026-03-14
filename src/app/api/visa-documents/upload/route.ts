import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {

    const formData = await req.formData()

    const file = formData.get("file") as File
    const visaId = formData.get("visaId") as string
    const checklistItemId = formData.get("checklistItemId") as string

    const filePath = `${visaId}/${Date.now()}-${file.name}`

    const { error: uploadError } = await supabase.storage
        .from("visa-documents")
        .upload(filePath, file)

    if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data } = supabase.storage
        .from("visa-documents")
        .getPublicUrl(filePath)

    const { error } = await supabase
        .from("visa_documents")
        .insert([
            {
                visa_case_id: visaId,
                checklist_item_id: checklistItemId,
                file_name: file.name,
                file_url: data.publicUrl
            }
        ])

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}