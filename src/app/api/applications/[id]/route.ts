export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getAuthSession } from "@/lib/auth"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const resolvedParams = await context.params
    const id = resolvedParams.id

    const session = await getAuthSession() as { user?: { agency_id: string } } | null
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase
        .from("applications")
        .delete()
        .eq("id", id)
        .eq("agency_id", session.user.agency_id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}

export async function PUT(
    req: Request,
    { params }: any
) {
    const { id } = await params

    const session = await getAuthSession() as { user?: { agency_id: string } } | null
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    const { error } = await supabase
        .from("applications")
        .update(body)
        .eq("id", id)
        .eq("agency_id", session.user.agency_id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}