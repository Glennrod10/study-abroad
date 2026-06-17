import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getAuthSession } from "@/lib/auth"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {

    const session = await getAuthSession()

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    const {
        first_name,
        last_name,
        email,
        phone,
        country_interest,
        status,
        assigned_staff,
        avatar_url,
        student_code,
        last_activity_note,
        last_activity_at,
    } = body

    if (!first_name || !email) {
        return NextResponse.json(
            { error: "Required fields missing" },
            { status: 400 }
        )
    }

    const { data: student, error } = await supabase
        .from("students")
        .insert([
            {
                first_name,
                last_name,
                email,
                phone,
                country_interest,
                status,
                assigned_staff,
                avatar_url,
                student_code,
                last_activity_note,
                last_activity_at,
                agency_id: session.user.agency_id,
            },
        ])
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await supabase.from("activities").insert({
        agency_id: session.user.agency_id,
        student_id: student.id,
        user_id: session.user.id,
        action: "Student Created",
        description: `${student.first_name} ${student.last_name} profile created`,
    })

    return NextResponse.json({ success: true })
}