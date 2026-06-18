export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getAuthSession } from "@/lib/auth"
import { logAudit } from "@/lib/audit"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/* =========================
   GET — FETCH APPLICATIONS
========================= */
export async function GET() {
    const session = await getAuthSession()

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        )
    }

    const { data, error } = await supabase
        .from("applications")
        .select(`
      id,
      intake,
      students (
        id,
        first_name,
        last_name,
        destination_country
      )
    `)
        .eq("agency_id", session.user.agency_id)
        .order("created_at", { ascending: false })

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }

    // Format clean response for frontend dropdown
    const formatted = data.map((app: any) => ({
        id: app.id,
        intake: app.intake,
        country: app.students?.destination_country,
        student_name: `${app.students?.first_name} ${app.students?.last_name}`,
    }))

    return NextResponse.json(formatted)
}

/* =========================
   POST — CREATE APPLICATION
========================= */
export async function POST(req: Request) {
    const session = await getAuthSession()

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        )
    }

    const body = await req.json()

    const {
        student_mode,
        student_id,
        student_data,
        application_data,
    } = body

    let finalStudentId = student_id

    if (student_mode === "new") {
        const requiredFields = [
            "first_name",
            "last_name",
            "email",
            "phone",
            "destination_country",
            "intake",
        ]

        for (const field of requiredFields) {
            if (!student_data?.[field]) {
                return NextResponse.json(
                    { error: `Missing required field: ${field}` },
                    { status: 400 }
                )
            }
        }

        const { data: newStudent, error: studentError } = await supabase
            .from("students")
            .insert([
                {
                    ...student_data,
                    agency_id: session.user.agency_id,
                },
            ])
            .select()
            .single()

        if (studentError) {
            return NextResponse.json(
                { error: studentError.message },
                { status: 500 }
            )
        }

        finalStudentId = newStudent.id
    }

    if (!finalStudentId) {
        return NextResponse.json(
            { error: "Student not selected" },
            { status: 400 }
        )
    }

    const {
        tuition_fee,
        commission_type,
        commission_value,
        manual_override,
        commission_amount: manualCommission,
    } = application_data

    let calculatedCommission = 0

    if (manual_override) {
        calculatedCommission = Number(manualCommission || 0)
    } else {
        if (commission_type === "percentage") {
            calculatedCommission =
                Number(tuition_fee || 0) *
                (Number(commission_value || 0) / 100)
        } else {
            calculatedCommission = Number(commission_value || 0)
        }
    }

    const { data: application, error: appError } = await supabase
        .from("applications")
        .insert([
            {
                ...application_data,
                student_id: finalStudentId,
                agency_id: session.user.agency_id,
                commission_amount: calculatedCommission,
            },
        ])
        .select()
        .single()

    if (appError) {
        return NextResponse.json(
            { error: appError.message },
            { status: 500 }
        )
    }

    await logAudit({
        agencyId: session.user.agency_id,
        studentId: application.student_id,
        userId: session.user.id,
        action: "application.created",
        description: `Created application for student ${finalStudentId}`,
    })

    return NextResponse.json({
        success: true,
        application,
    })
}