"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, Users, GraduationCap, CheckCircle } from "lucide-react"

const STEPS = [
    { id: "welcome", label: "Welcome" },
    { id: "agency", label: "Agency" },
    { id: "counsellors", label: "Team" },
    { id: "students", label: "Students" },
    { id: "done", label: "Done" },
]

export default function OnboardingPage() {
    const router = useRouter()
    const [step, setStep] = useState("welcome")
    const [loading, setLoading] = useState(false)

    async function finish() {
        setLoading(true)
        await new Promise((r) => setTimeout(r, 500))
        router.push("/dashboard")
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Progress bar */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        {STEPS.map((s, i) => (
                            <div key={s.id} className="flex items-center gap-2">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                                        ${step === s.id ? "bg-blue-600 text-white" : ""}
                                        ${STEPS.findIndex((x) => x.id === step) > i ? "bg-green-500 text-white" : ""}
                                        ${STEPS.findIndex((x) => x.id === step) < i ? "bg-gray-200 text-gray-500" : ""}
                                    `}
                                >
                                    {STEPS.findIndex((x) => x.id === step) > i ? (
                                        <CheckCircle className="w-5 h-5" />
                                    ) : (
                                        i + 1
                                    )}
                                </div>
                                <span className={`text-sm hidden sm:inline ${step === s.id ? "font-medium text-blue-600" : "text-gray-500"}`}>
                                    {s.label}
                                </span>
                                {i < STEPS.length - 1 && (
                                    <div className={`w-8 sm:w-16 h-0.5 ml-2 ${STEPS.findIndex((x) => x.id === step) > i ? "bg-green-500" : "bg-gray-200"}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-lg">
                    {step === "welcome" && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Building2 className="w-10 h-10 text-blue-600" />
                            </div>
                            <h1 className="text-2xl font-bold mb-2">Welcome to StudyAbroad CRM!</h1>
                            <p className="text-gray-600 mb-8">
                                Let&apos;s get your agency set up in a few quick steps.
                                You&apos;ll be tracking students and applications in no time.
                            </p>
                            <button
                                onClick={() => setStep("agency")}
                                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                            >
                                Get started
                            </button>
                        </div>
                    )}

                    {step === "agency" && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                            <h2 className="text-xl font-semibold mb-2">Your agency profile</h2>
                            <p className="text-gray-600 text-sm mb-6">
                                Your agency is already set up. You can update details anytime from Settings.
                            </p>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-3 text-sm">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    Agency name is configured
                                </li>
                                <li className="flex items-center gap-3 text-sm">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    Admin account is active
                                </li>
                                <li className="flex items-center gap-3 text-sm text-gray-400">
                                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                                    Add counsellors (next step)
                                </li>
                            </ul>
                            <button
                                onClick={() => setStep("counsellors")}
                                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                            >
                                Next: Add team members
                            </button>
                        </div>
                    )}

                    {step === "counsellors" && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-purple-600" />
                            </div>
                            <h2 className="text-xl font-semibold mb-2 text-center">Add counsellors</h2>
                            <p className="text-gray-600 text-sm mb-6 text-center">
                                Counsellors help you manage students and applications.
                            </p>
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <p className="text-sm text-gray-600">
                                    You can add counsellors later from the{" "}
                                    <strong>Counsellors</strong> page in the sidebar.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep("students")}
                                    className="flex-1 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Skip for now
                                </button>
                                <button
                                    onClick={() => {
                                        router.push("/dashboard/counsellors")
                                    }}
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                                >
                                    Add counsellors
                                </button>
                            </div>
                        </div>
                    )}

                    {step === "students" && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <GraduationCap className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-xl font-semibold mb-2 text-center">Add students</h2>
                            <p className="text-gray-600 text-sm mb-6 text-center">
                                Start tracking students and their applications.
                            </p>
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <p className="text-sm text-gray-600">
                                    You can add students later from the{" "}
                                    <strong>Students</strong> page in the sidebar.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep("done")}
                                    className="flex-1 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Skip for now
                                </button>
                                <button
                                    onClick={() => {
                                        router.push("/dashboard/students/new")
                                    }}
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                                >
                                    Add students
                                </button>
                            </div>
                        </div>
                    )}

                    {step === "done" && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h1 className="text-2xl font-bold mb-2">You&apos;re all set!</h1>
                            <p className="text-gray-600 mb-8">
                                Your agency is ready to go. Start exploring the dashboard.
                            </p>
                            <button
                                onClick={finish}
                                disabled={loading}
                                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? "Loading..." : "Go to dashboard"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
