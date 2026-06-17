import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getAuthSession } from "@/lib/auth"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {

    const session = await getAuthSession()

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    const { status } = await req.json()

    if (!id) {
        return NextResponse.json({ error: "Missing document id" }, { status: 400 })
    }

    const { error } = await supabase
        .from("student_documents")
        .update({ status })
        .eq("id", id)

    if (error) {
        console.error(error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}