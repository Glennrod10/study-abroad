import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthSession } from "@/lib/auth";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
    const session = await getAuthSession();

    if (!session) {
        return NextResponse.redirect("/login");
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
        return NextResponse.json({ error: "Missing code" });
    }

    const tokenResponse = await fetch(
        `https://graph.facebook.com/v19.0/oauth/access_token` +
        `?client_id=${process.env.FACEBOOK_APP_ID}` +
        `&client_secret=${process.env.FACEBOOK_APP_SECRET}` +
        `&redirect_uri=${process.env.NEXTAUTH_URL}/api/integrations/facebook/callback` +
        `&code=${code}`
    );

    const tokenData = await tokenResponse.json();

    const accessToken = tokenData.access_token;

    await supabase
        .from("agency_integrations")
        .insert([
            {
                agency_id: session.user.agency_id,
                provider: "facebook",
                access_token: accessToken
            }
        ]);

    return NextResponse.redirect("/dashboard/integrations");
}