"use client"

import { useState } from "react"
import { toast } from "sonner"

const STATUS_OPTIONS = [
    "Draft",
    "Applied",
    "Offer Received",
    "Visa Filed",
    "Visa Approved",
    "Enrolled",
    "Completed",
    "Rejected",
]

export default function ApplicationStatus({
    applicationId,
    currentStatus,
}: {
    applicationId: string
    currentStatus: string
}) {
    const [status, setStatus] = useState(currentStatus)
    const [loading, setLoading] = useState(false)

    const updateStatus = async (newStatus: string) => {
        setStatus(newStatus)
        setLoading(true)

        const res = await fetch(`/api/applications/${applicationId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
        })

        setLoading(false)

        if (res.ok) {
            toast.success("Status updated")
        } else {
            toast.error("Failed to update status")
        }
    }

    return (
        <select
            value={status}
            disabled={loading}
            onChange={(e) => updateStatus(e.target.value)}
            className="mt-2 px-3 py-1 text-xs rounded-full border border-border bg-white"
        >
            {STATUS_OPTIONS.map((s) => (
                <option key={s}>{s}</option>
            ))}
        </select>
    )
}