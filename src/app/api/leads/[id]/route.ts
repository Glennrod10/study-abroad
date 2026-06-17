export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthSession } from "@/lib/auth";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/* =========================
   PATCH — UPDATE LEAD
========================= */

export async function PATCH(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getAuthSession();

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const resolvedParams = await context.params;
    const leadId = resolvedParams.id;

    const body = await req.json();

    const {
        student_name,
        destination_country,
        phone,
        score,
        stage,
    } = body;

    const { error } = await supabase
        .from("leads")
        .update({
            student_name,
            destination_country,
            phone,
            score,
            stage,
            updated_at: new Date(),
        })
        .eq("id", leadId)
        .eq("agency_id", session.user.agency_id);

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true });
}

/* =========================
   DELETE — REMOVE LEAD
========================= */

export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getAuthSession();

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const resolvedParams = await context.params;
    const leadId = resolvedParams.id;

    const { error } = await supabase
        .from("leads")
        .delete()
        .eq("id", leadId)
        .eq("agency_id", session.user.agency_id);

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true });
}