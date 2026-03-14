import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
        return NextResponse.json({ error: "No file" }, { status: 400 })
    }

    const fileName = `${Date.now()}-${file.name}`

    const { error } = await supabase.storage
        .from("student-avatars")
        .upload(fileName, file)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data } = supabase.storage
        .from("student-avatars")
        .getPublicUrl(fileName)

    return NextResponse.json({ url: data.publicUrl })
}