export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json([], { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    if (!q) return NextResponse.json([]);

    const agencyId = session.user.agency_id;

    /* ================= STUDENTS ================= */

    const { data: students } = await supabase
        .from("students")
        .select("id, first_name, last_name, email, destination_country")
        .eq("agency_id", agencyId)
        .or(
            `first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%,destination_country.ilike.%${q}%`
        )
        .limit(5);

    /* ================= APPLICATIONS ================= */

    const { data: applications } = await supabase
        .from("applications")
        .select("id, university_name, course_name, intake, application_status")
        .eq("agency_id", agencyId)
        .or(
            `university_name.ilike.%${q}%,course_name.ilike.%${q}%,intake.ilike.%${q}%,application_status.ilike.%${q}%`
        )
        .limit(5);

    /* ================= VISAS ================= */

    const { data: visas } = await supabase
        .from("visa_cases")
        .select("id, visa_type, status, student_name")
        .eq("agency_id", agencyId)
        .or(
            `visa_type.ilike.%${q}%,status.ilike.%${q}%,student_name.ilike.%${q}%`
        )
        .limit(5);

    /* ================= FORMAT RESULTS ================= */

    const results = [
        ...(students || []).map((s: any) => ({
            id: s.id,
            type: "student",
            label: `${s.first_name} ${s.last_name} (${s.destination_country})`,
        })),
        ...(applications || []).map((a: any) => ({
            id: a.id,
            type: "application",
            label: `${a.university_name} - ${a.course_name}`,
        })),
        ...(visas || []).map((v: any) => ({
            id: v.id,
            type: "visa",
            label: `${v.student_name} - ${v.status}`,
        })),
    ];

    return NextResponse.json(results);
}