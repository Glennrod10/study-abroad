import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    const session = await getAuthSession();

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const { data: visa, error: fetchError } = await supabase
        .from("visa_cases")
        .select("application_id")
        .eq("id", id)
        .eq("agency_id", session.user.agency_id)
        .single();

    if (fetchError) {
        return NextResponse.json(
            { error: fetchError.message },
            { status: 500 }
        );
    }

    let visaStudentId: string | null = null;
    if (visa?.application_id) {
        const { data: app } = await supabase
            .from("applications")
            .select("student_id")
            .eq("id", visa.application_id)
            .single();
        visaStudentId = app?.student_id ?? null;
    }

    const { error } = await supabase
        .from("visa_cases")
        .delete()
        .eq("id", id)
        .eq("agency_id", session.user.agency_id);

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }

    await logAudit({
        agencyId: session.user.agency_id,
        studentId: visaStudentId,
        userId: session.user.id,
        action: "visa.deleted",
        description: `Deleted visa case ${id}`,
    });

    return NextResponse.json({ success: true });
}