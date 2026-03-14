"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

export default function ApplicationFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [q, setQ] = useState(searchParams.get("q") || "")
    const [intake, setIntake] = useState(searchParams.get("intake") || "")
    const [status, setStatus] = useState(searchParams.get("status") || "")

    useEffect(() => {
        const timeout = setTimeout(() => {
            const params = new URLSearchParams()
            if (q) params.set("q", q)
            if (intake) params.set("intake", intake)
            if (status) params.set("status", status)

            router.push(`/dashboard/applications?${params.toString()}`)
        }, 500)

        return () => clearTimeout(timeout)
    }, [q, intake, status])

    return (
        <div className="bg-white border border-border rounded-xl p-4 flex gap-3 items-center">

            <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search student or university"
                className="h-9 px-3 border border-border rounded-md text-sm"
            />

            <input
                value={intake}
                onChange={(e) => setIntake(e.target.value)}
                placeholder="Intake"
                className="h-9 px-3 border border-border rounded-md text-sm"
            />

            <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-9 px-3 border border-border rounded-md text-sm"
            >
                <option value="">All Status</option>
                <option>Draft</option>
                <option>Applied</option>
                <option>Offer Received</option>
                <option>Visa Filed</option>
                <option>Visa Approved</option>
                <option>Enrolled</option>
                <option>Completed</option>
                <option>Rejected</option>
            </select>

        </div>
    )
}