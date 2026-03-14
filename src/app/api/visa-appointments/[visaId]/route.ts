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

    const resolvedParams = await context.params
    const visaId = resolvedParams.visaId

    const { data, error } = await supabase
        .from("visa_appointments")
        .select("*")
        .eq("visa_case_id", visaId)
        .order("appointment_date")

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data ?? [])
}


export async function POST(
    req: Request,
    context: { params: Promise<{ visaId: string }> }
) {

    const resolvedParams = await context.params
    const visaId = resolvedParams.visaId

    const body = await req.json()

    const { data, error } = await supabase
        .from("visa_appointments")
        .insert([
            {
                visa_case_id: visaId,
                type: body.type,
                appointment_date: body.appointment_date,
                location: body.location,
                notes: body.notes
            }
        ])
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}