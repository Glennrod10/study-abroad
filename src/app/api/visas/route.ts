import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
    const session = await getAuthSession();

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    /* =========================
       FETCH VISA CASES
    ========================= */

    const { data: visas, error } = await supabase
        .from("visa_cases")
        .select(`
            id,
            visa_type,
            status,
            notes,
            tags,
            application_id,
            applications (
                id,
                intake,
                students (
                    id,
                    first_name,
                    last_name,
                    destination_country
                )
            )
        `)
        .eq("agency_id", session.user.agency_id)
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }

    /* =========================
       FETCH CHECKLIST COUNTS
    ========================= */

    const visaIds = visas.map((v: any) => v.id);

    const { data: checklistCounts } = await supabase
        .from("visa_checklist_items")
        .select("visa_case_id, completed");

    /* =========================
       BUILD CHECKLIST MAP
    ========================= */

    const checklistMap: Record<
        string,
        { total: number; completed: number }
    > = {};

    checklistCounts?.forEach((item: any) => {

        if (!checklistMap[item.visa_case_id]) {
            checklistMap[item.visa_case_id] = {
                total: 0,
                completed: 0
            };
        }

        checklistMap[item.visa_case_id].total += 1;

        if (item.completed) {
            checklistMap[item.visa_case_id].completed += 1;
        }

    });

    /* =========================
    FETCH APPOINTMENTS
    ========================= */

    const { data: appointments } = await supabase
        .from("visa_appointments")
        .select("visa_case_id, appointment_date, type")
        .order("appointment_date");
    /* =========================
    BUILD APPOINTMENT MAP
    ========================= */

    const appointmentMap: Record<string, any> = {};

    appointments?.forEach((appt: any) => {

        const existing = appointmentMap[appt.visa_case_id];

        if (!existing) {
            appointmentMap[appt.visa_case_id] = appt;
        } else {

            const current = new Date(existing.appointment_date);
            const next = new Date(appt.appointment_date);

            if (next < current) {
                appointmentMap[appt.visa_case_id] = appt;
            }
        }

    });

    /* =========================
       FORMAT RESPONSE
    ========================= */

    const formatted = visas.map((visa: any) => {

        const counts =
            checklistMap[visa.id] ?? { total: 0, completed: 0 };

        const appointment =
            appointmentMap[visa.id] ?? null;

        return {
            id: visa.id,
            visa_type: visa.visa_type,
            status: visa.status,
            notes: visa.notes,
            tags: visa.tags,
            application_id: visa.application_id,

            student_name: `${visa.applications?.students?.first_name ?? ""} ${visa.applications?.students?.last_name ?? ""}`,

            country: visa.applications?.students?.destination_country,

            intake: visa.applications?.intake,

            checklist_total: counts.total,
            checklist_completed: counts.completed,

            next_appointment: appointment?.appointment_date ?? null,
            next_appointment_type: appointment?.type ?? null
        };
    });

    return NextResponse.json(formatted);
}

export async function POST(request: Request) {
    const session = await getAuthSession();

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const body = await request.json();

    const { data, error } = await supabase
        .from("visa_cases")
        .insert([
            {
                ...body,
                agency_id: session.user.agency_id,
            },
        ])
        .select()
        .single();

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }

    let visaStudentId: string | null = null;
    if (data?.application_id) {
        const { data: app } = await supabase
            .from("applications")
            .select("student_id")
            .eq("id", data.application_id)
            .single();
        visaStudentId = app?.student_id ?? null;
    }

    await logAudit({
        agencyId: session.user.agency_id,
        studentId: visaStudentId,
        userId: session.user.id,
        action: "visa.created",
        description: `Created visa case for application ${data?.application_id}`,
    });

    return NextResponse.json(data);
}