import { NextResponse } from "next/server";

export async function GET() {

    const clientId = process.env.FACEBOOK_APP_ID;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/facebook/callback`;

    const url =
        `https://www.facebook.com/v19.0/dialog/oauth` +
        `?client_id=${clientId}` +
        `&redirect_uri=${redirectUri}` +
        `&scope=pages_show_list,leads_retrieval`;

    return NextResponse.redirect(url);
}