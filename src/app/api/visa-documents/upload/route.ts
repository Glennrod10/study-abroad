import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {

    const formData = await req.formData()

    const files = formData.getAll("files") as File[]
    const visaId = formData.get("visaId") as string
    const tagsRaw = formData.get("tags") as string
    const tags: string[] = tagsRaw ? JSON.parse(tagsRaw) : []

    if (files.length === 0) {
        return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    const results = []
    let hasError = false

    for (const file of files) {
        const filePath = `${visaId}/${Date.now()}-${file.name}`

        const { error: uploadError } = await supabase.storage
            .from("visa-documents")
            .upload(filePath, file)

        if (uploadError) {
            results.push({ file: file.name, error: uploadError.message })
            hasError = true
            continue
        }

        const { data } = supabase.storage
            .from("visa-documents")
            .getPublicUrl(filePath)

        const insertPayload: Record<string, any> = {
            visa_case_id: visaId,
            file_name: file.name,
            file_url: data.publicUrl,
        }
        if (tags.length > 0) insertPayload.tags = tags

        const { error } = await supabase
            .from("visa_documents")
            .insert([insertPayload])

        if (error) {
            results.push({ file: file.name, error: error.message })
            hasError = true
        } else {
            results.push({ file: file.name, success: true })
        }
    }

    if (hasError) {
        return NextResponse.json({ results }, { status: 500 })
    }

    return NextResponse.json({ results })
}