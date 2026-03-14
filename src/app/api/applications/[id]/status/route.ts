import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {

    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status } = await req.json()

    // update application status
    const { data: application, error } = await supabase
        .from("applications")
        .update({ application_status: status })
        .eq("id", params.id)
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

    return NextResponse.json({ success: true })
}