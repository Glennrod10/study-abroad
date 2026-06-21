"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [sent, setSent] = useState(false)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Failed to send email")
            }

            setSent(true)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (sent) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-xl font-semibold mb-2">Check your email</h1>
                <p className="text-gray-600 text-sm mb-6">
                    If an account exists with <strong>{email}</strong>, we&apos;ve sent password reset instructions.
                </p>
                <Link href="/login" className="text-blue-600 hover:underline text-sm">
                    Back to login
                </Link>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <Link href="/login" className="text-gray-500 hover:text-gray-700 inline-flex items-center gap-1 text-sm mb-6">
                <ArrowLeft className="w-4 h-4" /> Back to login
            </Link>

            <h1 className="text-xl font-semibold mb-2">Forgot password?</h1>
            <p className="text-gray-600 text-sm mb-6">
                Enter your email and we&apos;ll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1.5">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? "Sending..." : "Send reset link"}
                </button>
            </form>
        </div>
    )
}
