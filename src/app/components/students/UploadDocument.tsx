"use client"

import { useState } from "react"
import { UploadCloud, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"

const documentTypes = [
    "Passport",
    "SOP",
    "Transcript",
    "Offer Letter",
    "Visa Document",
]

export default function UploadDocument({ studentId }: { studentId: string }) {
    const router = useRouter()

    const [file, setFile] = useState<File | null>(null)
    const [type, setType] = useState("Passport")
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleUpload = async () => {
        if (!file) return

        setLoading(true)

        const formData = new FormData()
        formData.append("file", file)
        formData.append("student_id", studentId)
        formData.append("document_type", type)

        const res = await fetch("/api/student-documents", {
            method: "POST",
            body: formData,
        })

        setLoading(false)

        if (res.ok) {
            setFile(null)
            router.refresh()
        } else {
            alert("Upload failed")
        }
    }

    return (
        <div className="w-full bg-gray-50 border border-border rounded-xl p-4 space-y-4">

            {/* Document Type Dropdown */}
            <div className="relative w-48">
                <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-white border border-border rounded-lg text-sm font-medium hover:border-[var(--color-primary)] transition"
                >
                    {type}
                    <ChevronDown size={16} className="text-text-secondary" />
                </button>

                {open && (
                    <div className="absolute mt-2 w-full bg-white border border-border rounded-lg shadow-lg z-50">
                        {documentTypes.map((doc) => (
                            <button
                                key={doc}
                                type="button"
                                onClick={() => {
                                    setType(doc)
                                    setOpen(false)
                                }}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition"
                            >
                                {doc}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* File Upload Box */}
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-[var(--color-primary)] transition">
                <UploadCloud size={32} className="text-text-secondary mb-2" />

                <span className="text-sm font-medium">
                    {file ? file.name : "Click to upload document"}
                </span>

                <span className="text-xs text-text-secondary mt-1">
                    PDF, DOCX, JPG supported
                </span>

                <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
            </label>

            {/* Upload Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleUpload}
                    disabled={!file || loading}
                    className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition"
                >
                    {loading ? "Uploading..." : "Upload Document"}
                </button>
            </div>

        </div>
    )
}