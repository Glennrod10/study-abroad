import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendPasswordResetEmail } from "@/lib/email"
import { createResetToken } from "@/lib/reset-token"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
    try {
        const { email } = await req.json()
        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        const { data: user } = await supabase
            .from("users")
            .select("id, name, email")
            .eq("email", email)
            .single()

        if (!user) {
            return NextResponse.json({ success: true })
        }

        const token = createResetToken(user.id)
        const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`

        console.log("Password reset link:", resetLink)

        await sendPasswordResetEmail({
            email: user.email!,
            name: user.name || user.email!,
            resetLink,
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Forgot password error:", error)
        return NextResponse.json({ error: "Failed to send reset email" }, { status: 500 })
    }
}
