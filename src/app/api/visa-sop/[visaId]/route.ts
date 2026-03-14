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

    const { data, error } = await supabase
        .from("visa_sop_drafts")
        .select("*")
        .eq("visa_case_id", visaId)
        .order("version", { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data ?? [])
}


export async function POST(
    req: Request,
    context: { params: Promise<{ visaId: string }> }
) {

    const { visaId } = await context.params
    const body = await req.json()

    const { data: latest } = await supabase
        .from("visa_sop_drafts")
        .select("version")
        .eq("visa_case_id", visaId)
        .order("version", { ascending: false })
        .limit(1)

    const nextVersion =
        (latest?.[0]?.version ?? 0) + 1

    const { data, error } = await supabase
        .from("visa_sop_drafts")
        .insert([
            {
                visa_case_id: visaId,
                content: body.content,
                version: nextVersion
            }
        ])
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}