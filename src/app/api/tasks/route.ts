import { NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth"
import { logAudit } from "@/lib/audit"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {

    const session = await getAuthSession()

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("agency_id", session.user.agency_id)
        .order("created_at", { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function POST(req: Request) {

    const session = await getAuthSession()

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const payload = Object.fromEntries(
        Object.entries(body).map(([k, v]) => [k, v === "" ? null : v])
    )

    const { error } = await supabase
        .from("tasks")
        .insert({
            ...payload,
            status: payload.status || "pending",
            agency_id: session.user.agency_id,
            created_by: session.user.id
        })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await logAudit({
        agencyId: session.user.agency_id,
        studentId: (payload.student_id as string) || null,
        userId: session.user.id,
        action: "task.created",
        description: "Created task",
    })

    return NextResponse.json({ success: true })
}

export async function PATCH(req: Request) {

    const session = await getAuthSession()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, ...updates } = await req.json()
    const payload = Object.fromEntries(
        Object.entries(updates).map(([k, v]) => [k, v === "" ? null : v])
    )

    const { data: task, error: fetchError } = await supabase
        .from("tasks")
        .select("student_id")
        .eq("id", id)
        .single()

    if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    const { error } = await supabase
        .from("tasks")
        .update(payload)
        .eq("id", id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await logAudit({
        agencyId: session.user.agency_id,
        studentId: task?.student_id || null,
        userId: session.user.id,
        action: "task.updated",
        description: `Updated task ${id}`,
    })

    return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {

    const session = await getAuthSession()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { ids } = await req.json()
    const query = Array.isArray(ids) && ids.length > 1
        ? supabase.from("tasks").delete().in("id", ids)
        : supabase.from("tasks").delete().eq("id", ids[0])

    const { error } = await query

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await logAudit({
        agencyId: session.user.agency_id,
        userId: session.user.id,
        action: "task.deleted",
        description: `Deleted ${Array.isArray(ids) ? ids.length : 1} task(s)`,
    })

    return NextResponse.json({ success: true })
}