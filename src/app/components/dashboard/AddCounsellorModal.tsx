"use client"

import { useState } from "react"
import { X, Eye, EyeOff, UserPlus } from "lucide-react"
import { toast } from "sonner"

interface Props {
    open: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function AddCounsellorModal({
    open,
    onClose,
    onSuccess,
}: Props) {

    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        title: "",
        password: "",
    })

    if (!open) return null

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const createCounsellor = async () => {

        if (!form.name || !form.email || !form.password || !form.phone) {
            toast.error("Please fill all required fields")
            return
        }

        if (form.password.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }

        setLoading(true)

        const res = await fetch("/api/create-counsellor", {
            method: "POST",
            body: JSON.stringify({
                name: form.name,
                email: form.email,
                password: form.password,
                phone: form.phone,
                title: form.title,
            }),
        })

        const data = await res.json()

        setLoading(false)

        if (data.error) {
            toast.error(data.error)
            return
        }

        toast.success("Counsellor created successfully")

        setForm({
            name: "",
            email: "",
            phone: "",
            title: "",
            password: "",
        })

        onSuccess()
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-7 space-y-6">

                {/* HEADER */}
                <div className="flex items-center justify-between">

                    <h2 className="flex items-center gap-2 text-lg font-semibold">
                        <UserPlus size={18} />
                        Add Counsellor
                    </h2>

                    <button
                        onClick={onClose}
                        className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                    >
                        <X size={18} />
                    </button>

                </div>

                {/* NAME */}
                <div className="space-y-1">

                    <label className="text-sm font-medium">
                        Name *
                    </label>

                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) =>
                            handleChange("name", e.target.value)
                        }
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black outline-none"
                        placeholder="Enter counsellor name"
                    />

                </div>

                {/* EMAIL */}
                <div className="space-y-1">

                    <label className="text-sm font-medium">
                        Email *
                    </label>

                    <input
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                            handleChange("email", e.target.value)
                        }
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black outline-none"
                        placeholder="Enter email address"
                    />

                </div>
                {/* PHONE */}
                <div className="space-y-1">

                    <label className="text-sm font-medium">
                        Phone *
                    </label>

                    <input
                        type="text"
                        value={form.phone}
                        onChange={(e) =>
                            handleChange("phone", e.target.value)
                        }
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black outline-none"
                        placeholder="Enter phone number"
                    />

                </div>
                {/* TITLE */}
                <div className="space-y-1">

                    <label className="text-sm font-medium">
                        Title
                    </label>

                    <input
                        type="text"
                        value={form.title}
                        onChange={(e) =>
                            handleChange("title", e.target.value)
                        }
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black outline-none"
                        placeholder="Example: Senior Counsellor"
                    />

                </div>

                {/* PASSWORD */}
                <div className="space-y-1">

                    <label className="text-sm font-medium">
                        Password *
                    </label>

                    <div className="relative">

                        <input
                            type={showPassword ? "text" : "password"}
                            value={form.password}
                            onChange={(e) =>
                                handleChange("password", e.target.value)
                            }
                            className="w-full border rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-black outline-none"
                            placeholder="Create password"
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowPassword(!showPassword)
                            }
                            className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>

                    </div>

                </div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-3 pt-2">

                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-100 cursor-pointer"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={createCounsellor}
                        disabled={loading}
                        className="px-5 py-2 bg-black text-white rounded-lg cursor-pointer hover:opacity-90"
                    >
                        {loading ? "Creating..." : "Create Counsellor"}
                    </button>

                </div>

            </div>

        </div>
    )
}