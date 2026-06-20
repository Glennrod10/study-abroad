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
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 flex flex-col items-center justify-center text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 mb-3"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
                <p className="text-gray-500 font-medium">Select a visa case first</p>
                <p className="text-sm text-gray-400 mt-1">Pick a visa from the Board to build its SOP.</p>
            </div>
        )
    }


    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-6">

            <h2 className="text-xl font-semibold">
                SOP Builder
            </h2>

            {/* Inputs */}

            <div className="grid grid-cols-2 gap-4">

                <textarea
                    placeholder="Student background"
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    className="border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none resize-none"
                    rows={4}
                />

                <textarea
                    placeholder="Why this course?"
                    value={courseReason}
                    onChange={(e) => setCourseReason(e.target.value)}
                    className="border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none resize-none"
                    rows={4}
                />

                <textarea
                    placeholder="Why this country?"
                    value={countryReason}
                    onChange={(e) => setCountryReason(e.target.value)}
                    className="border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none resize-none"
                    rows={4}
                />

                <textarea
                    placeholder="Career goals"
                    value={careerGoals}
                    onChange={(e) => setCareerGoals(e.target.value)}
                    className="border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none resize-none"
                    rows={4}
                />

                <textarea
                    placeholder="Financial support"
                    value={financial}
                    onChange={(e) => setFinancial(e.target.value)}
                    className="border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none resize-none"
                    rows={4}
                />

            </div>

            <div className="flex gap-3">

                <button
                    onClick={generateSop}
                    disabled={loading}
                    className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                >
                    {loading ? "Generating..." : "Generate SOP"}
                </button>

                <button
                    onClick={saveSop}
                    className="bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition cursor-pointer"
                >
                    Save Version
                </button>

            </div>

            {/* Generated SOP */}

            {generated && (

                <textarea
                    value={generated}
                    onChange={(e) => setGenerated(e.target.value)}
                    className="w-full h-64 border border-gray-300 rounded-lg p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                />

            )}

            {/* Versions */}

            <div className="space-y-2">

                <h3 className="font-semibold text-gray-800">
                    Previous Versions
                </h3>

                {drafts.length === 0 ? (
                    <p className="text-sm text-gray-400">No saved versions yet.</p>
                ) : (
                    drafts.map((draft) => (

                        <div
                            key={draft.id}
                            className="border border-gray-200 p-3 rounded-lg text-sm text-gray-700"
                        >
                            Version {draft.version}
                        </div>

                    ))
                )}

            </div>

        </div>
    )
}