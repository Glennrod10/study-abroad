import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (
        mode === "subscribe" &&
        token === process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN
    ) {
        return new NextResponse(challenge);
    }

    return new NextResponse("Verification failed", { status: 403 });
}

export async function POST(req: Request) {
    const body = await req.json();

    console.log("Facebook Lead Event:", body);

    // Later we will parse the lead here
    // and send to /api/leads/capture

    return NextResponse.json({ success: true });
}