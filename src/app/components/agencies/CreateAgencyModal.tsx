"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { supabase } from "@/app/lib/supabase"
import { toast } from "sonner"

export default function CreateAgencyModal({
    open,
    onClose,
    onCreated,
}: any) {

    const [loading, setLoading] = useState(false)

    const [form, setForm] = useState({
        agency_name: "",
        agency_email: "",
        agency_phone: "",
        admin_name: "",
        admin_email: "",
        admin_password: "",
    })

    const [errors, setErrors] = useState<any>({})

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const validate = () => {

        const newErrors: any = {}

        if (!form.agency_name)
            newErrors.agency_name = "Agency name required"

        if (!form.agency_email)
            newErrors.agency_email = "Agency email required"

        if (!form.admin_name)
            newErrors.admin_name = "Admin name required"

        if (!form.admin_email)
            newErrors.admin_email = "Admin email required"

        if (!form.admin_password)
            newErrors.admin_password = "Password required"

        setErrors(newErrors)

        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: any) => {

        e.preventDefault()

        if (!validate()) return

        setLoading(true)

        const { data: agency, error } = await supabase
            .from("agencies")
            .insert({
                name: form.agency_name,
                email: form.agency_email,
                phone: form.agency_phone,
            })
            .select()
            .single()

        if (error || !agency) {
            toast.error("Agency creation failed")
            setLoading(false)
            return
        }

        await fetch("/api/create-agency-admin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                agency_id: agency.id,
                name: form.admin_name,
                email: form.admin_email,
                password: form.admin_password,
            }),
        })

        toast.success("Agency created")

        setLoading(false)
        onClose()
        onCreated()
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white w-full max-w-lg rounded-xl shadow-xl">

                {/* Header */}

                <div className="flex justify-between items-center border-b px-6 py-4">

                    <h3 className="text-lg font-bold">
                        Create Agency
                    </h3>

                    <button
                        onClick={onClose}
                        className="cursor-pointer"
                    >
                        <X size={18} />
                    </button>

                </div>

                <form
                    onSubmit={handleSubmit}
                    className="p-6 space-y-6"
                >

                    {/* Agency Info */}

                    <div className="space-y-3">

                        <h4 className="text-sm font-semibold text-gray-600">
                            Agency Information
                        </h4>

                        <div className="grid grid-cols-2 gap-4">

                            <Field
                                label="Agency Name *"
                                name="agency_name"
                                value={form.agency_name}
                                onChange={handleChange}
                                error={errors.agency_name}
                            />

                            <Field
                                label="Agency Email *"
                                name="agency_email"
                                value={form.agency_email}
                                onChange={handleChange}
                                error={errors.agency_email}
                            />

                            <Field
                                label="Agency Phone"
                                name="agency_phone"
                                value={form.agency_phone}
                                onChange={handleChange}
                                error={errors.agency_phone}
                            />

                        </div>

                    </div>


                    {/* Admin Info */}

                    <div className="space-y-3">

                        <h4 className="text-sm font-semibold text-gray-600">
                            Admin Account
                        </h4>

                        <div className="grid grid-cols-2 gap-4">

                            <Field
                                label="Admin Name *"
                                name="admin_name"
                                value={form.admin_name}
                                onChange={handleChange}
                                error={errors.admin_name}
                            />

                            <Field
                                label="Admin Email *"
                                name="admin_email"
                                value={form.admin_email}
                                onChange={handleChange}
                                error={errors.admin_email}
                            />

                            <Field
                                label="Password *"
                                name="admin_password"
                                type="password"
                                value={form.admin_password}
                                onChange={handleChange}
                                error={errors.admin_password}
                            />

                        </div>

                    </div>

                    {/* Submit */}

                    <button
                        disabled={loading}
                        className="w-full h-11 rounded-lg text-white font-semibold cursor-pointer hover:opacity-90 transition"
                        style={{ backgroundColor: "var(--color-primary)" }}
                    >
                        {loading ? "Creating..." : "Create Agency"}
                    </button>

                </form>

            </div>

        </div>
    )
}

function Field({
    label,
    name,
    value,
    onChange,
    type = "text",
    error,
}: any) {

    return (

        <div className="flex flex-col gap-1">

            <label className="text-xs font-semibold text-gray-600">
                {label}
            </label>

            <input
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                className={`h-10 px-3 border rounded-md text-sm transition
                ${error
                        ? "border-red-400"
                        : "border-gray-200 focus:ring-2 focus:ring-[var(--color-primary-light)]"
                    }`}
            />

            <div className="h-4 text-xs text-red-500">
                {error}
            </div>

        </div>

    )
}