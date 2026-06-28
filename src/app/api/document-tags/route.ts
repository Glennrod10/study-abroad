export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getAuthSession } from "@/lib/auth"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
    const session = await getAuthSession()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: tags, error } = await supabase
        .from("document_tags")
        .select("*")
        .eq("agency_id", session.user.agency_id)
        .order("name")

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ tags })
}

export async function POST(req: Request) {
    const session = await getAuthSession()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, color } = await req.json()

    if (!name || typeof name !== "string" || !name.trim()) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const { data: tag, error } = await supabase
        .from("document_tags")
        .insert([{ name: name.trim(), color: color || "#6366F1", agency_id: session.user.agency_id }])
        .select()
        .single()

    if (error) {
        if (error.code === "23505") {
            return NextResponse.json({ error: "Tag already exists" }, { status: 409 })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ tag })
}
