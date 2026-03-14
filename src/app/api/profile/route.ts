export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/* ================= GET PROFILE ================= */

export async function GET() {

    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
        return NextResponse.json(
            { error: "Unauthorized or missing user ID" },
            { status: 401 }
        );
    }

    const { data, error } = await supabase
        .from("users")
        .select(`
            id,
            name,
            email,
            role,
            avatar_url,
            created_at,
            phone,
            timezone,
            bio,
            organization_name,
            support_email,
            support_phone,
            expertise,
            experience_years
        `)
        .eq("id", session.user.id)
        .single();

    if (error) {
        console.error("GET PROFILE ERROR:", error);

        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json(data);
}


/* ================= UPDATE PROFILE ================= */

export async function PUT(req: Request) {

    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
        return NextResponse.json(
            { error: "Unauthorized or missing user ID" },
            { status: 401 }
        );
    }

    const body = await req.json();

    const {
        name,
        email,
        avatar_url,
        phone,
        timezone,
        bio,
        organization_name,
        support_email,
        support_phone,
        expertise,
        experience_years
    } = body;

    /* ---------- SAFE INTEGER PARSE ---------- */

    let parsedExperience: number | null = null;

    if (
        experience_years !== undefined &&
        experience_years !== null &&
        experience_years !== ""
    ) {
        const num = Number(experience_years);
        parsedExperience = isNaN(num) ? null : num;
    }

    /* ---------- CLEAN EMPTY STRINGS ---------- */

    const clean = (value: any) => value === "" ? null : value;

    const updatePayload = {
        name: clean(name),
        email: clean(email),
        avatar_url: clean(avatar_url),
        phone: clean(phone),
        timezone: clean(timezone),
        bio: clean(bio),
        organization_name: clean(organization_name),
        support_email: clean(support_email),
        support_phone: clean(support_phone),
        expertise: clean(expertise),
        experience_years: parsedExperience,
        updated_at: new Date()
    };

    const { data, error } = await supabase
        .from("users")
        .update(updatePayload)
        .eq("id", session.user.id)
        .select()
        .single();

    if (error) {

        console.error("PUT PROFILE ERROR:", error);

        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );

    }

    return NextResponse.json(data);

}