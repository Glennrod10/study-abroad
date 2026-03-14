"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginForm() {
    const router = useRouter()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        })

        if (res?.ok) {
            router.push("/dashboard")
        } else {
            setError("Invalid email or password")
        }

        setLoading(false)
    }

    return (
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
            <p className="text-gray-500 mb-6">
                Please enter your details to sign in.
            </p>

            {error && (
                <div className="bg-red-100 text-red-600 p-2 mb-4 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm mb-1">
                        Email Address
                    </label>
                    <input
                        type="email"
                        required
                        className="w-full border rounded-lg p-3"
                        placeholder="name@company.com"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        required
                        className="w-full border rounded-lg p-3"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg transition"
                >
                    {loading ? "Signing in..." : "Sign In"}
                </button>
            </form>

            <div className="mt-6 text-center text-sm">
                Don't have an account?{" "}
                <a href="/register" className="text-indigo-600 font-medium">
                    Create an Account
                </a>
            </div>
        </div>
    )
}