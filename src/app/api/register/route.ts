import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { agencyName, name, email, password } = body

        if (!agencyName || !name || !email || !password) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            )
        }

        // 1️⃣ Check if email already exists
        const { data: existingUser } = await supabase
            .from("users")
            .select("id")
            .eq("email", email)
            .single()

        if (existingUser) {
            return NextResponse.json(
                { error: "Email already registered" },
                { status: 400 }
            )
        }

        // 2️⃣ Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // 3️⃣ Create agency
        const { data: agency, error: agencyError } = await supabase
            .from("agencies")
            .insert([{ name: agencyName, email }])
            .select()
            .single()

        if (agencyError) throw agencyError

        // 4️⃣ Create admin user
        const { error: userError } = await supabase
            .from("users")
            .insert([
                {
                    name,
                    email,
                    password: hashedPassword,
                    role: "admin",
                    agency_id: agency.id
                }
            ])

        if (userError) throw userError

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    }
}