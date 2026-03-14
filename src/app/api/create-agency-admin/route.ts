import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { supabase } from "@/app/lib/supabase"

export async function POST(req: Request) {

    const body = await req.json()

    const hashed = await bcrypt.hash(body.password, 10)

    const { error } = await supabase
        .from("users")
        .insert({
            name: body.name,
            email: body.email,
            password: hashed,
            role: "admin",
            agency_id: body.agency_id,
        })

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }

    return NextResponse.json({ success: true })
}