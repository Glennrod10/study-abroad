import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {

    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {

        const { name, email, password, phone, title } = await req.json()

        if (!name || !email || !password || !phone) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const { error } = await supabase
            .from("users")
            .insert({
                name,
                email,
                password: hashedPassword,
                phone,
                title: title || null,
                role: "counsellor",
                status: "active",
                agency_id: session.user.agency_id,
            })

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })

    } catch {

        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        )

    }

}
