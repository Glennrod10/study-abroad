export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getAuthSession } from "@/lib/auth"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
    const session = await getAuthSession()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const student_id = formData.get("student_id") as string
    const document_type = formData.get("document_type") as string
    const tagsRaw = formData.getAll("tags") as string[]

    if (!file || !student_id) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const fileName = `${Date.now()}-${file.name}`

    const { error: uploadError } = await supabase.storage
        .from("student-documents")
        .upload(fileName, file)

    if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data } = supabase.storage
        .from("student-documents")
        .getPublicUrl(fileName)

    await supabase.from("student_documents").insert([
        {
            student_id,
            agency_id: session.user.agency_id,
            document_name: file.name,
            file_url: data.publicUrl,
            document_type,
            tags: tagsRaw.length > 0 ? tagsRaw : [],
            status: "Pending Review",
        },
    ])

    return NextResponse.json({ success: true })
}