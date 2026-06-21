"use client"

import { Suspense, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Lock, CheckCircle } from "lucide-react"

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="text-center py-12 text-gray-500">Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    )
}

function ResetPasswordForm() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get("token")

    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [done, setDone] = useState(false)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError("")

        if (password.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }
        if (password !== confirm) {
            setError("Passwords do not match")
            return
        }

        setLoading(true)

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to reset password")
            }

            setDone(true)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                <h1 className="text-xl font-semibold mb-2">Invalid link</h1>
                <p className="text-gray-600 text-sm mb-6">This reset link is missing or invalid.</p>
                <Link href="/auth/forgot-password" className="text-blue-600 hover:underline text-sm">
                    Request a new reset link
                </Link>
            </div>
        )
    }

    if (done) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-xl font-semibold mb-2">Password reset</h1>
                <p className="text-gray-600 text-sm mb-6">Your password has been successfully reset.</p>
                <Link href="/login" className="text-blue-600 hover:underline text-sm">
                    Sign in with new password
                </Link>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h1 className="text-xl font-semibold mb-2">Set new password</h1>
            <p className="text-gray-600 text-sm mb-6">Enter your new password below.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1.5">New password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min. 6 characters"
                            className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1.5">Confirm password</label>
                    <input
                        type="password"
                        required
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="Repeat password"
                        className="w-full h-11 px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? "Resetting..." : "Reset password"}
                </button>
            </form>
        </div>
    )
}
