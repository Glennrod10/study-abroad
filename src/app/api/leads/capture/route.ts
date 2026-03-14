import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const {
            student_name,
            phone,
            email,
            destination_country,
            source,
            campaign,
            agency_id
        } = body;

        if (!student_name || !agency_id) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        /* =========================
           DUPLICATE DETECTION
        ========================= */

        if (phone || email) {

            const { data: existingLead } = await supabase
                .from("leads")
                .select("id")
                .eq("agency_id", agency_id)
                .or(`phone.eq.${phone},email.eq.${email}`)
                .maybeSingle();

            if (existingLead) {

                await supabase
                    .from("leads")
                    .update({
                        updated_at: new Date()
                    })
                    .eq("id", existingLead.id);

                return NextResponse.json({
                    duplicate: true,
                    lead_id: existingLead.id,
                    message: "Lead already exists, interaction updated"
                });

            }
        }

        /* =========================
           LEAD SCORING ENGINE
        ========================= */

        let score = 0;

        // High demand destinations
        if (
            destination_country === "UK" ||
            destination_country === "Canada"
        ) {
            score += 20;
        }

        // Paid source
        if (source === "facebook_ads" || source === "google_ads") {
            score += 15;
        }

        // Campaign urgency example
        if (campaign?.toLowerCase().includes("sept")) {
            score += 10;
        }
        /* =========================
           SMART COUNSELLOR ASSIGNMENT
        ========================= */

        let counsellorId = null;

        const { data: counsellors } = await supabase
            .from("users")
            .select("id")
            .eq("agency_id", agency_id)
            .eq("role", "counsellor");

        if (counsellors && counsellors.length > 0) {
            const randomIndex = Math.floor(Math.random() * counsellors.length);
            counsellorId = counsellors[randomIndex].id;
        }

        /* =========================
           INSERT LEAD
        ========================= */

        const { data, error } = await supabase
            .from("leads")
            .insert([
                {
                    student_name,
                    phone,
                    email,
                    destination_country,
                    source,
                    campaign,
                    stage: "new",
                    score,
                    agency_id,
                    counsellor_id: counsellorId
                }
            ])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            lead: data
        });

    } catch (err: any) {
        return NextResponse.json(
            { error: err.message },
            { status: 500 }
        );
    }
}