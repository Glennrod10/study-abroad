"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { toast } from "sonner"

export default function ResetAdminPasswordModal({
    open,
    onClose,
    userId,
}: any) {

    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const handleReset = async () => {

        if (!password) {
            toast.error("Password required")
            return
        }

        setLoading(true)

        const res = await fetch("/api/reset-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId,
                password,
            }),
        })

        if (res.ok) {
            toast.success("Password updated")
            onClose()
        } else {
            toast.error("Failed to update password")
        }

        setLoading(false)
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white rounded-xl w-full max-w-sm p-6 space-y-4">

                <div className="flex justify-between items-center">
                    <h3 className="font-bold">Reset Password</h3>

                    <button
                        onClick={onClose}
                        className="cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                <input
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 border border-border rounded-lg px-4"
                />

                <button
                    onClick={handleReset}
                    disabled={loading}
                    className="w-full h-11 bg-[var(--color-primary)] text-white rounded-lg cursor-pointer"
                >
                    {loading ? "Updating..." : "Update Password"}
                </button>

            </div>

        </div>
    )
}