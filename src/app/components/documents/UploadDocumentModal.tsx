"use client"

import { useState, useEffect } from "react"
import { X, UploadCloud, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import TagBadge from "./TagBadge"

type Tag = { id: string; name: string; color: string }

export default function UploadDocumentModal({
    open,
    onClose,
}: {
    open: boolean
    onClose: () => void
}) {
    const router = useRouter()
    const [file, setFile] = useState<File | null>(null)
    const [studentId, setStudentId] = useState("")
    const [studentSearch, setStudentSearch] = useState("")
    const [students, setStudents] = useState<any[]>([])
    const [tags, setTags] = useState<Tag[]>([])
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [tagOpen, setTagOpen] = useState(false)
    const [docType, setDocType] = useState("Passport")
    const [docTypeOpen, setDocTypeOpen] = useState(false)

    const documentTypes = ["Passport", "SOP", "Transcript", "Offer Letter", "Visa Document", "Other"]

    useEffect(() => {
        fetch("/api/document-tags")
            .then(r => r.json())
            .then(d => setTags(d.tags || []))
    }, [])

    useEffect(() => {
        if (studentSearch.length < 1) { setStudents([]); return }
        const timer = setTimeout(async () => {
            const res = await fetch(`/api/students?search=${encodeURIComponent(studentSearch)}`)
            const d = await res.json()
            setStudents(d.students || [])
        }, 300)
        return () => clearTimeout(timer)
    }, [studentSearch])

    if (!open) return null

    const handleUpload = async () => {
        if (!file || !studentId) return
        setLoading(true)

        const formData = new FormData()
        formData.append("file", file)
        formData.append("student_id", studentId)
        formData.append("document_type", docType)
        selectedTags.forEach(t => formData.append("tags", t))

        const res = await fetch("/api/student-documents", {
            method: "POST",
            body: formData,
        })

        setLoading(false)

        if (res.ok) {
            setFile(null)
            setStudentId("")
            setSelectedTags([])
            router.refresh()
            onClose()
        }
    }

    const toggleTag = (id: string) => {
        setSelectedTags(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        )
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold">Upload Document</h3>
                    <button onClick={onClose} className="cursor-pointer">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="relative">
                        <p className="text-sm font-medium mb-1">Student</p>
                        <input
                            type="text"
                            placeholder="Search student..."
                            value={studentSearch}
                            onChange={e => setStudentSearch(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        />
                        {students.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                                {students.map((s: any) => (
                                    <button
                                        key={s.id}
                                        onClick={() => { setStudentId(s.id); setStudentSearch(`${s.first_name} ${s.last_name || ""}`.trim()); setStudents([]) }}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                                    >
                                        {s.first_name} {s.last_name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Document Type Dropdown */}
                    <div>
                        <p className="text-sm font-medium mb-1">Document Type</p>
                        <div className="relative w-48">
                            <button
                                type="button"
                                onClick={() => setDocTypeOpen(!docTypeOpen)}
                                className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:border-[var(--color-primary)] transition cursor-pointer"
                            >
                                {docType}
                                <ChevronDown size={16} className="text-text-secondary" />
                            </button>
                            {docTypeOpen && (
                                <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                                    {documentTypes.map((dt) => (
                                        <button
                                            key={dt}
                                            type="button"
                                            onClick={() => { setDocType(dt); setDocTypeOpen(false) }}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition cursor-pointer"
                                        >
                                            {dt}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-[var(--color-primary)] transition">
                        <UploadCloud size={32} className="text-text-secondary mb-2" />
                        <span className="text-sm font-medium">
                            {file ? file.name : "Click to upload document"}
                        </span>
                        <span className="text-xs text-text-secondary mt-1">PDF, DOCX, JPG, PNG supported</span>
                        <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
                    </label>
                </div>

                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-gray-100 rounded-lg cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={!file || !studentId || loading}
                        className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? "Uploading..." : "Upload"}
                    </button>
                </div>
            </div>
        </div>
    )
}
