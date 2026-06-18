import { NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth"
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
        .from("users")
        .select("*")
        .eq("agency_id", session.user.agency_id)
        .eq("role", "counsellor")
        .order("created_at", { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function DELETE(req: Request) {

    const session = await getAuthSession()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await req.json()

    const { error: unlinkError } = await supabase
        .from("students")
        .update({ counsellor_id: null })
        .eq("counsellor_id", id)

    if (unlinkError) {
        return NextResponse.json({ error: unlinkError.message }, { status: 500 })
    }

    const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", id)
        .eq("agency_id", session.user.agency_id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
