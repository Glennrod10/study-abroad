export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const resolvedParams = await context.params;
    const visaId = resolvedParams.id;

    const body = await req.json();

    const {
        status,
        visa_type,
        notes,
        tags,
    } = body;

    // Update visa INCLUDING notes + tags
    const { error } = await supabase
        .from("visa_cases")
        .update({
            status,
            visa_type,
            notes,
            tags,
            updated_at: new Date(),
        })
        .eq("id", visaId);

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true });
}