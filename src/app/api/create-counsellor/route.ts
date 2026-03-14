import { NextResponse } from "next/server"
import { supabase } from "@/app/lib/supabase"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {

    try {

        const { name, email, password, phone, title, agency_id } = await req.json()

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
                title,
                role: "counsellor",
                status: "active",
                agency_id,
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