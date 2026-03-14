"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function NewUniversityPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    // ✅ Single image states
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [bannerFile, setBannerFile] = useState<File | null>(null)

    // ✅ Multiple gallery images
    const [galleryFiles, setGalleryFiles] = useState<File[]>([])

    const [form, setForm] = useState({
        name: "",
        country: "",
        city: "",
        description: "",
        ranking: "",
        website: "",
        intake_periods: "",
        program_levels: "",
        default_commission_type: "percentage",
        default_commission_value: "",
    })

    const handleChange = (e: any) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const uploadImage = async (file: File) => {
        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch("/api/upload-university-image", {
            method: "POST",
            body: formData,
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error)

        return data.url
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault()

        if (!form.name || !form.country) {
            toast.error("University name and country are required")
            return
        }

        try {
            setLoading(true)

            let logo_url = ""
            let banner_url = ""
            let gallery_urls: string[] = []

            // Upload single images
            if (logoFile) logo_url = await uploadImage(logoFile)
            if (bannerFile) banner_url = await uploadImage(bannerFile)

            // Upload multiple gallery images
            for (const file of galleryFiles) {
                const url = await uploadImage(file)
                gallery_urls.push(url)
            }

            const payload = {
                ...form,
                ranking: form.ranking ? Number(form.ranking) : null,
                default_commission_value: form.default_commission_value
                    ? Number(form.default_commission_value)
                    : 0,
                intake_periods: form.intake_periods
                    ? form.intake_periods.split(",").map((i) => i.trim())
                    : [],
                program_levels: form.program_levels
                    ? form.program_levels.split(",").map((i) => i.trim())
                    : [],
                logo_url,
                banner_url,
                gallery_urls,
            }

            const res = await fetch("/api/universities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            toast.success("University created successfully")
            router.push(`/dashboard/universities/${data.id}`)

        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full space-y-8">

            <div>
                <h1 className="text-3xl font-black">Add University</h1>
                <p className="text-text-secondary text-sm">
                    Create a new partner institution
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="w-full bg-white p-10 rounded-2xl border border-border shadow-sm space-y-8"
            >

                {/* BASIC INFO */}
                <Section title="Basic Information">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Input label="University Name *" name="name" value={form.name} onChange={handleChange} />
                        <Input label="Country *" name="country" value={form.country} onChange={handleChange} />
                        <Input label="City" name="city" value={form.city} onChange={handleChange} />
                        <Input label="World Ranking" type="number" name="ranking" value={form.ranking} onChange={handleChange} />
                        <Input label="Website URL" name="website" value={form.website} onChange={handleChange} />
                    </div>
                </Section>

                <Section title="Description">
                    <Textarea name="description" value={form.description} onChange={handleChange} />
                </Section>

                {/* IMAGE SECTION */}
                <Section title="Images">

                    <SingleImageUpload
                        label="Logo (Single)"
                        file={logoFile}
                        setFile={setLogoFile}
                    />

                    <SingleImageUpload
                        label="Banner (Single)"
                        file={bannerFile}
                        setFile={setBannerFile}
                    />

                    <MultiImageUpload
                        label="Gallery (Multiple Images)"
                        files={galleryFiles}
                        setFiles={setGalleryFiles}
                    />

                </Section>

                {/* ACADEMIC DETAILS */}
                <Section title="Academic Details">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Intake Periods (comma separated)"
                            name="intake_periods"
                            value={form.intake_periods}
                            onChange={handleChange}
                        />
                        <Input
                            label="Program Levels (comma separated)"
                            name="program_levels"
                            value={form.program_levels}
                            onChange={handleChange}
                        />
                    </div>
                </Section>

                {/* COMMISSION */}
                <Section title="Commission Defaults">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <select
                            name="default_commission_type"
                            value={form.default_commission_type}
                            onChange={handleChange}
                            className="h-12 px-4 border border-border rounded-xl"
                        >
                            <option value="percentage">Percentage</option>
                            <option value="fixed">Fixed</option>
                        </select>

                        <Input
                            label="Commission Value"
                            name="default_commission_value"
                            value={form.default_commission_value}
                            onChange={handleChange}
                        />
                    </div>
                </Section>

                <button
                    type="submit"
                    disabled={loading}
                    className="h-12 px-8 bg-[var(--color-primary)] text-white rounded-xl font-semibold hover:opacity-90 transition"
                >
                    {loading ? "Creating..." : "Create University"}
                </button>

            </form>
        </div>
    )
}

/* ---------------- UI COMPONENTS ---------------- */

function Section({ title, children }: any) {
    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold">{title}</h2>
            {children}
        </div>
    )
}

function Input({ label, ...props }: any) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{label}</label>
            <input
                {...props}
                className="h-12 px-4 border border-border rounded-xl focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)]"
            />
        </div>
    )
}

function Textarea(props: any) {
    return (
        <textarea
            {...props}
            rows={4}
            className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)]"
        />
    )
}

/* ---------- SINGLE IMAGE UPLOAD ---------- */

function SingleImageUpload({ label, file, setFile }: any) {
    return (
        <div className="space-y-3">
            <label className="text-sm font-medium">{label}</label>

            <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm"
            />

            {file && (
                <div className="flex items-center justify-between bg-gray-50 border border-border rounded-lg px-3 py-2">
                    <div className="flex items-center gap-3">
                        <img
                            src={URL.createObjectURL(file)}
                            className="w-10 h-10 object-cover rounded-md border"
                        />
                        <p className="text-sm truncate max-w-[200px]">{file.name}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-red-500 text-sm font-medium"
                    >
                        Remove
                    </button>
                </div>
            )}
        </div>
    )
}

/* ---------- MULTI IMAGE UPLOAD ---------- */

function MultiImageUpload({ label, files, setFiles }: any) {
    return (
        <div className="space-y-3">
            <label className="text-sm font-medium">{label}</label>

            <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) =>
                    setFiles((prev: File[]) => [
                        ...prev,
                        ...Array.from(e.target.files || []),
                    ])
                }
                className="block w-full text-sm"
            />

            <div className="space-y-2">
                {files.map((file: File, index: number) => (
                    <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 border border-border rounded-lg px-3 py-2"
                    >
                        <div className="flex items-center gap-3">
                            <img
                                src={URL.createObjectURL(file)}
                                className="w-10 h-10 object-cover rounded-md border"
                            />
                            <p className="text-sm truncate max-w-[250px]">
                                {file.name}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setFiles(files.filter((_: any, i: number) => i !== index))
                            }
                            className="text-red-500 text-sm font-medium"
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}