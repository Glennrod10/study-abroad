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

    /* Get visa case info */

    const { data: visaCase } = await supabase
        .from("visa_cases")
        .select(`
      id,
      visa_type,
      applications (
        students (
          first_name,
          last_name,
          destination_country
        )
      )
    `)
        .eq("id", visaId)
        .single()

    const student =
        visaCase?.applications?.students

    const visaInfo = {
        student_name: `${student?.first_name ?? ""} ${student?.last_name ?? ""}`,
        country: student?.destination_country ?? "",
        visa_type: visaCase?.visa_type ?? ""
    }

    /* Load checklist */

    const { data: checklist } = await supabase
        .from("visa_checklist_items")
        .select("*")
        .eq("visa_case_id", visaId)
        .order("created_at")

    return NextResponse.json({
        visa: visaInfo,
        checklist: checklist ?? []
    })
}

export async function PATCH(
    req: Request,
    context: { params: Promise<{ visaId: string }> }
) {

    const resolvedParams = await context.params
    const visaId = resolvedParams.visaId

    const body = await req.json()

    const { id, completed } = body

    const { error } = await supabase
        .from("visa_checklist_items")
        .update({ completed })
        .eq("id", id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}