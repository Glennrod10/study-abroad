"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { UploadCloud, Trash2 } from "lucide-react"
import { toast } from "sonner"
import ProfileSkeleton from "./ProfileSkeleton"

interface Profile {
    id: string
    name: string
    email: string
    role: string
    avatar_url: string | null
    created_at: string
    phone?: string
    timezone?: string
    bio?: string
    organization_name?: string
    support_email?: string
    support_phone?: string
    expertise?: string
    experience_years?: number
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ProfilePage() {

    const [data, setData] = useState<Profile | null>(null)
    const [form, setForm] = useState<any>({})
    const [avatar, setAvatar] = useState<string | null>(null)

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    /* ---------------- FETCH PROFILE ---------------- */

    useEffect(() => {

        const fetchProfile = async () => {

            const res = await fetch("/api/profile")
            const json = await res.json()

            setData(json)
            setAvatar(json.avatar_url)

            setForm({
                name: json.name || "",
                email: json.email || "",
                phone: json.phone || "",
                timezone: json.timezone || "",
                bio: json.bio || "",
                organization_name: json.organization_name || "",
                support_email: json.support_email || "",
                support_phone: json.support_phone || "",
                expertise: json.expertise || "",
                experience_years: json.experience_years || ""
            })

            setLoading(false)

        }

        fetchProfile()

    }, [])

    const handleChange = (e: any) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        })

    }

    /* ---------------- AVATAR UPLOAD ---------------- */

    const handleAvatarUpload = async (e: any) => {

        if (!data) return

        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith("image/")) {
            toast.error("Only image files allowed")
            return
        }

        const fileExt = file.name.split(".").pop()
        const fileName = `${data.id}.${fileExt}`

        const { error } = await supabase.storage
            .from("avatars")
            .upload(fileName, file, { upsert: true })

        if (error) {
            toast.error(error.message)
            return
        }

        const { data: publicUrlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(fileName)

        setAvatar(publicUrlData.publicUrl)

        toast.success("Avatar updated")

    }

    const removeAvatar = () => {

        setAvatar(null)

    }

    /* ---------------- SAVE ---------------- */

    const handleSave = async () => {

        setSaving(true)

        const res = await fetch("/api/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...form,
                avatar_url: avatar
            })
        })

        if (!res.ok) {
            toast.error("Failed to update profile")
        } else {

            toast.success("Profile updated")

            window.dispatchEvent(new Event("profileUpdated"))

        }

        setSaving(false)

    }

    const getInitials = () => {

        if (!form.name) return "?"

        return form.name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()

    }

    if (loading) return <ProfileSkeleton />

    return (

        <div className="space-y-8">

            {/* HEADER */}

            <div>
                <h1 className="text-3xl font-black">
                    Profile Settings
                </h1>
                <p className="text-text-secondary mt-2">
                    Manage your account information and preferences.
                </p>
            </div>

            {/* PROFILE PHOTO CARD */}

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex items-center justify-between">

                <div className="flex items-center gap-6">

                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold overflow-hidden">

                        {avatar ? (
                            <img
                                src={avatar}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            getInitials()
                        )}

                    </div>

                    <div>

                        <h3 className="font-semibold">
                            Upload a new photo
                        </h3>

                        <p className="text-sm text-text-secondary">
                            Recommended size 400x400px. JPG, GIF or PNG. Max size 2MB.
                        </p>

                        <div className="flex items-center gap-4 mt-3">

                            <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer text-sm font-medium">

                                <UploadCloud size={16} />

                                Change Photo

                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarUpload}
                                />

                            </label>

                            {avatar && (

                                <button
                                    onClick={removeAvatar}
                                    className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
                                >
                                    <Trash2 size={14} />
                                    Remove
                                </button>

                            )}

                        </div>

                    </div>

                </div>

            </div>

            {/* ACCOUNT FORM */}

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 space-y-6">

                <h2 className="font-semibold text-lg">
                    Account Information
                </h2>

                <div className="grid md:grid-cols-2 gap-6">

                    <Input label="Full Name" name="name" value={form.name} onChange={handleChange} />
                    <Input label="Email Address" name="email" value={form.email} onChange={handleChange} />

                    <Input label="Phone Number" name="phone" value={form.phone} onChange={handleChange} />
                    <Input label="Timezone" name="timezone" value={form.timezone} onChange={handleChange} />

                </div>

                <Textarea label="Bio" name="bio" value={form.bio} onChange={handleChange} />

                {/* ROLE BASED */}

                {data?.role === "counsellor" && (

                    <div className="grid md:grid-cols-2 gap-6">

                        <Input label="Expertise Countries" name="expertise" value={form.expertise} onChange={handleChange} />

                        <Input label="Experience Years" name="experience_years" value={form.experience_years} onChange={handleChange} />

                    </div>

                )}

                {data?.role === "admin" && (

                    <div className="grid md:grid-cols-2 gap-6">

                        <Input label="Organization Name" name="organization_name" value={form.organization_name} onChange={handleChange} />

                        <Input label="Support Email" name="support_email" value={form.support_email} onChange={handleChange} />

                        <Input label="Support Phone" name="support_phone" value={form.support_phone} onChange={handleChange} />

                    </div>

                )}

                {/* SAVE */}

                <div className="flex justify-end">

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition cursor-pointer disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>

                </div>

            </div>

        </div>

    )

}

function Input({ label, ...props }: any) {

    return (

        <div className="flex flex-col gap-2">

            <label className="text-sm font-medium">
                {label}
            </label>

            <input
                {...props}
                className="h-11 px-4 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)] transition"
            />

        </div>

    )

}

function Textarea({ label, ...props }: any) {

    return (

        <div className="flex flex-col gap-2">

            <label className="text-sm font-medium">
                {label}
            </label>

            <textarea
                {...props}
                rows={4}
                className="p-4 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)] transition"
            />

        </div>

    )

}