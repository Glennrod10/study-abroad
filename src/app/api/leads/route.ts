import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/* =========================
   GET — FETCH LEADS
========================= */

export async function GET() {
    const session = await getAuthSession();

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("agency_id", session.user.agency_id)
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }

    await logAudit({
        agencyId: session.user.agency_id,
        userId: session.user.id,
        action: "lead.created",
        description: `Created lead from ${(data as any).student_name}`,
    });

    return NextResponse.json(data);
}

/* =========================
   POST — CREATE LEAD
========================= */

export async function POST(request: Request) {
    const session = await getAuthSession();

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const body = await request.json();

    const {
        student_name,
        phone,
        email,
        destination_country,
        budget_range,
        intake,
        source,
    } = body;

    const { data, error } = await supabase
        .from("leads")
        .insert([
            {
                student_name,
                phone,
                email,
                destination_country,
                budget_range,
                intake,
                source,
                stage: "new",
                score: 0,
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

    return NextResponse.json(data);
}