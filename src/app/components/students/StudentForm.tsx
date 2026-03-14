"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { UploadCloud } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/app/lib/supabase"

type Props = {
    initialData?: any
    mode: "create" | "edit"
}

export default function StudentForm({ initialData = {}, mode }: Props) {

    const router = useRouter()

    const [avatarFile, setAvatarFile] = useState<File | null>(null)

    const [avatarPreview, setAvatarPreview] = useState(
        initialData?.avatar_url || null
    )

    const [counsellors, setCounsellors] = useState<any[]>([])

    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        date_of_birth: "",
        mailing_address: "",
        qualification: "",
        english_proficiency: "",
        destination_country: "",
        intake: "",
        application_stage: "Profile Created",
        status: "Applied",
        counsellor_id: "",
        ...initialData,
    })

    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<any>({})

    useEffect(() => {

        const fetchCounsellors = async () => {

            const { data } = await supabase
                .from("users")
                .select("id,name")
                .eq("role", "counsellor")

            setCounsellors(data || [])
        }

        fetchCounsellors()

    }, [])

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const validate = () => {

        const newErrors: any = {}

        if (!form.first_name) newErrors.first_name = "Required"
        if (!form.last_name) newErrors.last_name = "Required"
        if (!form.email) newErrors.email = "Required"
        if (!form.phone) newErrors.phone = "Required"

        setErrors(newErrors)

        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: any) => {

        e.preventDefault()

        if (!validate()) return

        setLoading(true)

        let avatar_url = form.avatar_url || ""

        if (avatarFile) {

            const formData = new FormData()

            formData.append("file", avatarFile)

            const uploadRes = await fetch("/api/upload-avatar", {
                method: "POST",
                body: formData,
            })

            if (!uploadRes.ok) {
                toast.error("Avatar upload failed")
                setLoading(false)
                return
            }

            const uploadData = await uploadRes.json()

            avatar_url = uploadData.url
        }

        const payload = {
            ...form,
            avatar_url,
        }

        const url =
            mode === "create"
                ? "/api/students"
                : `/api/students/${initialData.id}`

        const method = mode === "create" ? "POST" : "PUT"

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })

        setLoading(false)

        if (res.ok) {

            toast.success(
                mode === "create"
                    ? "Student created successfully"
                    : "Student updated successfully"
            )

            setTimeout(() => {

                if (mode === "create") {
                    router.push("/dashboard/students")
                } else {
                    router.push(`/dashboard/students/${initialData.id}`)
                }

            }, 800)

        } else {

            toast.error("Something went wrong")

        }

    }

    return (
        <div className="w-full space-y-8">

            <div>

                <h1 className="text-3xl font-black">
                    {mode === "create" ? "Add Student" : "Edit Student"}
                </h1>

                <p className="text-text-secondary mt-1">
                    Manage student profile information
                </p>

            </div>

            <div className="bg-white border border-border rounded-xl shadow-sm p-8">

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >

                    <div className="md:col-span-2 flex items-center gap-6">

                        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border">

                            {avatarPreview ? (

                                <img
                                    src={avatarPreview}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />

                            ) : (

                                <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-400">
                                    {form.first_name?.[0] || "S"}
                                </div>

                            )}

                        </div>

                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl px-6 py-4 cursor-pointer hover:border-[var(--color-primary)] transition">

                            <UploadCloud size={20} className="text-text-secondary mb-1" />

                            <span className="text-sm font-medium">
                                Change Profile Photo
                            </span>

                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {

                                    const file = e.target.files?.[0]

                                    if (file) {

                                        setAvatarFile(file)

                                        setAvatarPreview(
                                            URL.createObjectURL(file)
                                        )

                                    }

                                }}
                            />

                        </label>

                    </div>

                    <Input name="first_name" label="First Name *" value={form.first_name} onChange={handleChange} error={errors.first_name} />
                    <Input name="last_name" label="Last Name *" value={form.last_name} onChange={handleChange} error={errors.last_name} />
                    <Input name="email" label="Email *" value={form.email} onChange={handleChange} error={errors.email} />
                    <Input name="phone" label="Phone *" value={form.phone} onChange={handleChange} error={errors.phone} />
                    <Input name="date_of_birth" label="Date of Birth" type="date" value={form.date_of_birth} onChange={handleChange} />
                    <Input name="mailing_address" label="Mailing Address" value={form.mailing_address} onChange={handleChange} />

                    <Input name="qualification" label="Qualification" value={form.qualification} onChange={handleChange} />
                    <Input name="english_proficiency" label="English Proficiency" value={form.english_proficiency} onChange={handleChange} />
                    <Input name="destination_country" label="Destination Country" value={form.destination_country} onChange={handleChange} />
                    <Input name="intake" label="Intake" value={form.intake} onChange={handleChange} />

                    <div className="flex flex-col gap-2">

                        <label className="text-sm font-medium">
                            Assign Counsellor
                        </label>

                        <select
                            name="counsellor_id"
                            value={form.counsellor_id || ""}
                            onChange={handleChange}
                            className="h-11 px-4 border border-border rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)] transition"
                        >

                            <option value="">
                                Unassigned
                            </option>

                            {counsellors.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}

                        </select>

                    </div>

                    <Select
                        name="application_stage"
                        label="Application Stage"
                        value={form.application_stage}
                        onChange={handleChange}
                        options={[
                            "Profile Created",
                            "Applied",
                            "Offer Letter",
                            "Visa Pending",
                            "Enrolled",
                        ]}
                    />

                    <Select
                        name="status"
                        label="Status"
                        value={form.status}
                        onChange={handleChange}
                        options={[
                            "Applied",
                            "Offer Letter",
                            "Visa Pending",
                            "Enrolled",
                        ]}
                    />

                    <div className="md:col-span-2 pt-4">

                        <button
                            type="submit"
                            disabled={loading}
                            className="h-11 px-6 bg-[var(--color-primary)] text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition"
                        >

                            {loading
                                ? "Saving..."
                                : mode === "create"
                                    ? "Create Student"
                                    : "Save Changes"}

                        </button>

                    </div>

                </form>

            </div>

        </div>
    )
}

function Input({ name, label, value, onChange, type = "text", error }: any) {

    return (
        <div className="flex flex-col gap-2">

            <label className="text-sm font-medium">
                {label}
            </label>

            <input
                name={name}
                type={type}
                value={value || ""}
                onChange={onChange}
                className={`h-11 px-4 border rounded-lg text-sm transition
                ${error
                        ? "border-red-400 focus:ring-red-200 focus:border-red-500"
                        : "border-border focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)]"
                    }`}
            />

            {error && (
                <p className="text-xs text-red-500">
                    {error}
                </p>
            )}

        </div>
    )

}

function Select({ name, label, value, onChange, options }: any) {

    return (
        <div className="flex flex-col gap-2">

            <label className="text-sm font-medium">
                {label}
            </label>

            <select
                name={name}
                value={value || ""}
                onChange={onChange}
                className="h-11 px-4 border border-border rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)] transition"
            >

                {options.map((opt: string) => (
                    <option key={opt}>
                        {opt}
                    </option>
                ))}

            </select>

        </div>
    )

}