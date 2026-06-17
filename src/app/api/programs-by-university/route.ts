import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getAuthSession } from "@/lib/auth"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const university = searchParams.get("university")

    const session = await getAuthSession()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data } = await supabase
        .from("programs")
        .select(`
            id,
            name,
            tuition_fee,
            intake,
            universities (
                name
            )
        `)
        .eq("university_id", university)
        .eq("agency_id", session.user.agency_id)

    // Flatten structure
    const formatted = data?.map((p: any) => ({
        ...p,
        university_name: p.universities?.name
    }))

    return NextResponse.json(formatted)
}