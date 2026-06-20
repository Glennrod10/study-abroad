"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function VisaLorTab({ visaId }: any) {

    const [lors, setLors] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [university, setUniversity] = useState("")
    const [deadline, setDeadline] = useState("")

    useEffect(() => {

        if (!visaId) return

        fetchLors()

    }, [visaId])

    const fetchLors = async () => {

        setLoading(true)
        const res = await fetch(`/api/visa-lor/${visaId}`)

        const data = await res.json()

        if (Array.isArray(data)) {
            setLors(data)
        }
        setLoading(false)

    }

    const createLor = async () => {

        if (!name || !email) {
            toast.error("Professor name and email required")
            return
        }

        await fetch(`/api/visa-lor/${visaId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                professor_name: name,
                professor_email: email,
                university,
                deadline
            })
        })

        toast.success("LOR request created")

        setName("")
        setEmail("")
        setUniversity("")
        setDeadline("")

        fetchLors()

    }

    const updateStatus = async (id: string, status: string) => {

        await fetch(`/api/visa-lor/${visaId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id, status })
        })

        toast.success("Status updated")

        fetchLors()

    }

    if (!visaId) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 flex flex-col items-center justify-center text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 mb-3"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/></svg>
                <p className="text-gray-500 font-medium">Select a visa case first</p>
                <p className="text-sm text-gray-400 mt-1">Pick a visa from the Board to manage LOR requests.</p>
            </div>
        )
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-6">

            <h2 className="text-xl font-semibold">
                LOR Tracker
            </h2>

            {/* Create LOR */}

            <div className="grid grid-cols-4 gap-3">

                <input
                    placeholder="Professor Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                />

                <input
                    placeholder="Professor Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                />

                <input
                    placeholder="University"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                />

                <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                />

            </div>

            <button
                onClick={createLor}
                className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition cursor-pointer"
            >
                Add LOR Request
            </button>

            {/* LOR List */}

            <div className="space-y-3">

                {loading ? (
                    <div className="space-y-3 animate-pulse">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex justify-between items-center border border-gray-200 p-4 rounded-lg">
                                <div className="space-y-2">
                                    <div className="h-4 w-32 bg-gray-200 rounded" />
                                    <div className="h-3 w-48 bg-gray-200 rounded" />
                                    <div className="h-3 w-24 bg-gray-200 rounded" />
                                </div>
                                <div className="h-8 w-24 bg-gray-200 rounded" />
                            </div>
                        ))}
                    </div>
                ) : lors.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-8 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 mb-2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/></svg>
                        <p className="text-sm">No LOR requests yet.</p>
                    </div>
                ) : (
                    lors.map((lor) => (

                        <div
                            key={lor.id}
                            className="flex justify-between items-center border border-gray-200 p-4 rounded-lg"
                        >

                            <div>

                                <p className="font-semibold text-gray-800">
                                    {lor.professor_name}
                                </p>

                                <p className="text-sm text-gray-500">
                                    {lor.professor_email}
                                </p>

                                <p className="text-xs text-gray-400">
                                    {lor.university}
                                </p>

                            </div>

                            <div className="flex items-center gap-3">

                                <select
                                    value={lor.status}
                                    onChange={(e) =>
                                        updateStatus(lor.id, e.target.value)
                                    }
                                    className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                                >

                                    <option>Requested</option>
                                    <option>Reminder Sent</option>
                                    <option>Received</option>
                                    <option>Declined</option>

                                </select>

                                {lor.deadline && (
                                    <span className="text-xs text-gray-500">
                                        Due {lor.deadline}
                                    </span>
                                )}

                            </div>

                        </div>

                    ))
                )}

            </div>

        </div>
    )
}