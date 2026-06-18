import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"
import { verifyResetToken } from "@/lib/reset-token"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json()

        if (!token || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }

        if (password.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
        }

        const payload = verifyResetToken(token)
        if (!payload) {
            return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 })
        }

        const hashed = await bcrypt.hash(password, 10)

        const { error } = await supabase
            .from("users")
            .update({ password: hashed })
            .eq("id", payload.userId)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Reset password error:", error)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}
