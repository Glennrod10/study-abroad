import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getAuthSession } from "@/lib/auth"
import { logAudit } from "@/lib/audit"


const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getAuthSession()

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await context.params
    const id = resolvedParams.id

    const { data: student, error: fetchError } = await supabase
        .from("students")
        .select("first_name, last_name")
        .eq("id", id)
        .eq("agency_id", session.user.agency_id)
        .single()

    if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", id)
        .eq("agency_id", session.user.agency_id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await logAudit({
        agencyId: session.user.agency_id,
        userId: session.user.id,
        action: "student.deleted",
        description: `Deleted student ${student.first_name} ${student.last_name}`,
    })

    return NextResponse.json({ success: true })
}

export async function PUT(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getAuthSession()

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ✅ IMPORTANT: await params
    const resolvedParams = await context.params
    const id = resolvedParams.id

    const body = await req.json()

    const { data: student, error: fetchError } = await supabase
        .from("students")
        .select("first_name, last_name")
        .eq("id", id)
        .eq("agency_id", session.user.agency_id)
        .single()

    if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    const { error } = await supabase
        .from("students")
        .update(body)
        .eq("id", id)
        .eq("agency_id", session.user.agency_id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await logAudit({
        agencyId: session.user.agency_id,
        userId: session.user.id,
        action: "student.updated",
        description: `Updated student ${student.first_name} ${student.last_name}`,
    })

    return NextResponse.json({ success: true })
}