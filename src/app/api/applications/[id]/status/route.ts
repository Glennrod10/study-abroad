import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getAuthSession } from "@/lib/auth"
import { logAudit } from "@/lib/audit"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    const session = await getAuthSession()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status } = await req.json()

    // update application status
    const { data: application, error } = await supabase
        .from("applications")
        .update({ application_status: status })
        .eq("id", id)
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // AUTO CREATE VISA RECORD
    if (status === "Visa Filed") {

        await supabase.from("visa_applications").insert({
            student_id: application.student_id,
            application_id: application.id,
            agency_id: session.user.agency_id,
            visa_status: "Filed"
        })

    }

    await logAudit({
        agencyId: session.user.agency_id,
        studentId: application.student_id,
        userId: session.user.id,
        action: "application.status_changed",
        description: `Changed application ${id} status to ${status}`,
    })

    return NextResponse.json({ success: true })
}