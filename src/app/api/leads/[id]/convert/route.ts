import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {

    const { id } = await context.params;

    try {

        /* =========================
           FETCH LEAD
        ========================= */

        const { data: lead, error: leadError } = await supabase
            .from("leads")
            .select("*")
            .eq("id", id)
            .single();

        if (leadError) throw leadError;

        /* =========================
           CREATE STUDENT
        ========================= */

        const nameParts = lead.student_name?.split(" ") || [];

        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        const { data: student, error: studentError } = await supabase
            .from("students")
            .insert([
                {
                    first_name: firstName,
                    last_name: lastName,
                    email: lead.email,
                    phone: lead.phone,
                    destination_country: lead.destination_country,
                    counsellor_id: lead.counsellor_id,
                    agency_id: lead.agency_id,
                    status: "new"
                }
            ])
            .select()
            .single();

        if (studentError) throw studentError;

        /* =========================
            CREATE APPLICATION
        ========================= */

        const { data: application, error } = await supabase
            .from("applications")
            .insert([
                {
                    student_id: student.id,
                    agency_id: lead.agency_id,
                    lead_id: lead.id,
                    status: "new",
                    application_status: "started"
                }
            ])
            .select()
            .single();

        if (error) throw error;

        /* =========================
           UPDATE LEAD STAGE
        ========================= */

        await supabase
            .from("leads")
            .update({
                stage: "application_started"
            })
            .eq("id", id);

        return NextResponse.json({
            success: true,
            application
        });

    } catch (err: any) {

        return NextResponse.json(
            { error: err.message },
            { status: 500 }
        );

    }

}