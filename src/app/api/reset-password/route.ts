import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {

    const { userId, password } = await req.json()

    if (!userId || !password) {
        return NextResponse.json(
            { error: "Missing fields" },
            { status: 400 }
        )
    }

    const hashed = await bcrypt.hash(password, 10)

    const { error } = await supabase
        .from("users")
        .update({ password: hashed })
        .eq("id", userId)

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }

    return NextResponse.json({ success: true })
}