import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthSession } from "@/lib/auth";

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

    return NextResponse.json({ success: true });
}