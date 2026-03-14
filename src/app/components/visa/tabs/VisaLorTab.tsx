"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function VisaLorTab({ visaId }: any) {

    const [lors, setLors] = useState<any[]>([])

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [university, setUniversity] = useState("")
    const [deadline, setDeadline] = useState("")

    useEffect(() => {

        if (!visaId) return

        fetchLors()

    }, [visaId])

    const fetchLors = async () => {

        const res = await fetch(`/api/visa-lor/${visaId}`)

        const data = await res.json()

        if (Array.isArray(data)) {
            setLors(data)
        }

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
            <div className="bg-white border rounded-xl p-6">
                Select visa case first
            </div>
        )
    }

    return (
        <div className="bg-white border rounded-xl shadow-sm p-6 space-y-6">

            <h2 className="text-xl font-semibold">
                LOR Tracker
            </h2>

            {/* Create LOR */}

            <div className="grid grid-cols-4 gap-3">

                <input
                    placeholder="Professor Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border rounded-md p-2"
                />

                <input
                    placeholder="Professor Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border rounded-md p-2"
                />

                <input
                    placeholder="University"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="border rounded-md p-2"
                />

                <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="border rounded-md p-2"
                />

            </div>

            <button
                onClick={createLor}
                className="bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer"
            >
                Add LOR Request
            </button>

            {/* LOR List */}

            <div className="space-y-3">

                {lors.map((lor) => (

                    <div
                        key={lor.id}
                        className="flex justify-between items-center border p-4 rounded-lg"
                    >

                        <div>

                            <p className="font-semibold">
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
                                className="border rounded-md p-2 text-sm"
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

                ))}

            </div>

        </div>
    )
}