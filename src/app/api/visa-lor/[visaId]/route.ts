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
        .from("visa_lor_requests")
        .select("*")
        .eq("visa_case_id", visaId)
        .order("created_at", { ascending: false })

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

    const { data, error } = await supabase
        .from("visa_lor_requests")
        .insert([
            {
                visa_case_id: visaId,
                professor_name: body.professor_name,
                professor_email: body.professor_email,
                university: body.university,
                deadline: body.deadline
            }
        ])
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function PATCH(req: Request) {

    const body = await req.json()

    const { data, error } = await supabase
        .from("visa_lor_requests")
        .update({
            status: body.status
        })
        .eq("id", body.id)
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}