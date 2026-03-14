import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(req: Request) {

    try {

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: "OPENAI_API_KEY missing in environment" },
                { status: 500 }
            )
        }

        const body = await req.json()

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        })

        const prompt = `
Write a strong Statement of Purpose for a student visa application.

Student Background:
${body.background}

Why this course:
${body.course_reason}

Why this country:
${body.country_reason}

Career goals:
${body.career_goals}

Financial support:
${body.financial_support}

Requirements:
- Professional tone
- Clear study progression
- Genuine student intent
- 600–800 words
`

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are an expert immigration SOP writer."
                },
                {
                    role: "user",
                    content: prompt
                }
            ]
        })

        const sop = completion.choices?.[0]?.message?.content

        return NextResponse.json({
            sop: sop ?? ""
        })

    } catch (error: any) {

        console.error("AI SOP ERROR:", error)

        return NextResponse.json(
            { error: error.message ?? "SOP generation failed" },
            { status: 500 }
        )

    }

}