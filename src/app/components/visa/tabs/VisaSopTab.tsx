"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function VisaSopTab({ visaId }: any) {

    const [drafts, setDrafts] = useState<any[]>([])
    const [background, setBackground] = useState("")
    const [courseReason, setCourseReason] = useState("")
    const [countryReason, setCountryReason] = useState("")
    const [careerGoals, setCareerGoals] = useState("")
    const [financial, setFinancial] = useState("")
    const [generated, setGenerated] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {

        if (!visaId) return

        fetchDrafts()

    }, [visaId])


    const fetchDrafts = async () => {

        try {

            const res = await fetch(`/api/visa-sop/${visaId}`)

            if (!res.ok) return

            const data = await res.json()

            if (Array.isArray(data)) {
                setDrafts(data)
            }

        } catch (error) {

            console.error(error)

        }

    }


    const generateSop = async () => {

        if (!background || !courseReason || !countryReason) {
            toast.error("Please fill required fields first")
            return
        }

        try {

            setLoading(true)

            const res = await fetch("/api/ai/generate-sop", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    student_name: "Student",
                    background,
                    course_reason: courseReason,
                    country_reason: countryReason,
                    career_goals: careerGoals,
                    financial_support: financial
                })
            })

            if (!res.ok) {
                toast.error("AI generation failed")
                setLoading(false)
                return
            }

            const data = await res.json()

            if (!data?.sop) {
                toast.error("Failed to generate SOP")
                setLoading(false)
                return
            }

            setGenerated(data.sop)

            toast.success("SOP generated successfully")

        } catch (error) {

            console.error(error)
            toast.error("AI generation failed")

        } finally {

            setLoading(false)

        }

    }


    const saveSop = async () => {

        if (!generated) {
            toast.error("Generate SOP first")
            return
        }

        try {

            const res = await fetch(`/api/visa-sop/${visaId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    content: generated
                })
            })

            if (!res.ok) {
                toast.error("Failed to save SOP")
                return
            }

            toast.success("SOP saved")

            fetchDrafts()

        } catch (error) {

            console.error(error)
            toast.error("Save failed")

        }

    }


    if (!visaId) {
        return (
            <div className="bg-white border rounded-xl p-6">
                Select visa case first
            </div>
        )
    }


    return (
        <div className="bg-white border rounded-xl shadow-sm p-6 space-y-6">

            <h2 className="text-xl font-semibold">
                SOP Builder
            </h2>

            {/* Inputs */}

            <div className="grid grid-cols-2 gap-4">

                <textarea
                    placeholder="Student background"
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    className="border rounded-md p-3"
                />

                <textarea
                    placeholder="Why this course?"
                    value={courseReason}
                    onChange={(e) => setCourseReason(e.target.value)}
                    className="border rounded-md p-3"
                />

                <textarea
                    placeholder="Why this country?"
                    value={countryReason}
                    onChange={(e) => setCountryReason(e.target.value)}
                    className="border rounded-md p-3"
                />

                <textarea
                    placeholder="Career goals"
                    value={careerGoals}
                    onChange={(e) => setCareerGoals(e.target.value)}
                    className="border rounded-md p-3"
                />

                <textarea
                    placeholder="Financial support"
                    value={financial}
                    onChange={(e) => setFinancial(e.target.value)}
                    className="border rounded-md p-3"
                />

            </div>

            <div className="flex gap-3">

                <button
                    onClick={generateSop}
                    disabled={loading}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md cursor-pointer disabled:opacity-50"
                >
                    {loading ? "Generating..." : "Generate SOP"}
                </button>

                <button
                    onClick={saveSop}
                    className="bg-green-600 text-white px-4 py-2 rounded-md cursor-pointer"
                >
                    Save Version
                </button>

            </div>

            {/* Generated SOP */}

            {generated && (

                <textarea
                    value={generated}
                    onChange={(e) => setGenerated(e.target.value)}
                    className="w-full h-64 border rounded-md p-4"
                />

            )}

            {/* Versions */}

            <div className="space-y-2">

                <h3 className="font-semibold">
                    Previous Versions
                </h3>

                {drafts.map((draft) => (

                    <div
                        key={draft.id}
                        className="border p-3 rounded-lg text-sm"
                    >
                        Version {draft.version}
                    </div>

                ))}

            </div>

        </div>
    )
}