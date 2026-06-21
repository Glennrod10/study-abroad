"use client"

import { useEffect, useState, useRef, useMemo, useCallback } from "react"
import { toast } from "sonner"
import { Upload, X, FileText, Plus, ExternalLink, Search } from "lucide-react"

interface VisaDocument {
    id: number | null
    checklist_id: number | null
    item_name: string
    file_name: string | null
    file_url: string | null
    tags: string[]
}

interface UploadResult {
    file: string
    error?: string
}

export default function VisaDocumentsTab({ visaId }: { visaId: string | null }) {

    const [docs, setDocs] = useState<VisaDocument[]>([])
    const [uploading, setUploading] = useState(false)
    const [filterTag, setFilterTag] = useState("")
    const [editingTags, setEditingTags] = useState<Record<string, string>>({})
    const fileInputRef = useRef<HTMLInputElement>(null)

    const fetchDocs = useCallback(async () => {

        const res = await fetch(`/api/visa-documents/${visaId}`)

        const data = await res.json()

        const allDocs: VisaDocument[] = [
            ...(data.merged ?? []).filter((d: VisaDocument) => d.file_url),
            ...(data.customDocs ?? [])
        ]

        setDocs(allDocs)

    }, [visaId])

    useEffect(() => {

        if (!visaId) return

        fetchDocs()

    }, [visaId, fetchDocs])

    const handleFilesSelected = async (files: FileList | null) => {

        if (!files || files.length === 0) return

        setUploading(true)

        const formData = new FormData()
        formData.append("visaId", visaId!)
        formData.append("tags", "[]")

        for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i])
        }

        const res = await fetch("/api/visa-documents/upload", {
            method: "POST",
            body: formData
        })

        const result = await res.json()

        if (res.ok) {
            toast.success(`${files.length} document(s) uploaded`)
        } else {
            const errors = (result.results as UploadResult[])
                ?.filter((r) => r.error)
                ?.map((r) => r.error)
                ?.join("; ")
            toast.error(errors || "Upload failed")
        }

        setUploading(false)
        fetchDocs()

    }

    const updateTags = async (documentId: number, tags: string[]) => {

        const res = await fetch(`/api/visa-documents/${visaId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ documentId, tags })
        })

        if (res.ok) {
            setDocs((prev) =>
                prev.map((d) =>
                    d.id === documentId ? { ...d, tags } : d
                )
            )
            toast.success("Tags updated")
        } else {
            toast.error("Failed to update tags")
        }

    }

    const handleAddTag = (docId: number) => {

        const raw = editingTags[docId] ?? ""
        const input = raw.split(",").map((t) => t.trim()).filter(Boolean)

        if (input.length === 0) return

        const current = docs.find((d) => d.id === docId)?.tags ?? []
        const merged = [...new Set([...current, ...input])]

        setEditingTags((prev) => ({ ...prev, [docId]: "" }))
        updateTags(docId, merged)

    }

    const handleRemoveTag = (docId: number, tag: string) => {

        const current = docs.find((d) => d.id === docId)?.tags ?? []
        const updated = current.filter((t: string) => t !== tag)
        updateTags(docId, updated)

    }

    const handleKeyDown = (e: React.KeyboardEvent, docId: number) => {

        if (e.key === "Enter") {
            e.preventDefault()
            handleAddTag(docId)
        }

    }

    const filteredDocs = useMemo(() => {
        if (!filterTag.trim()) return docs
        const q = filterTag.trim().toLowerCase()
        return docs.filter((d) =>
            (d.tags ?? []).some((t: string) => t.toLowerCase().includes(q))
        )
    }, [docs, filterTag])

    if (!visaId) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 flex flex-col items-center justify-center text-center">
                <FileText size={40} className="text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">Select a visa case first</p>
                <p className="text-sm text-gray-400 mt-1">Pick a visa from the Board to view its documents.</p>
            </div>
        )
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-6">

            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                    Visa Documents
                </h2>
                <span className="text-sm text-gray-500">
                    {filterTag.trim()
                        ? `${filteredDocs.length} / ${docs.length} document(s)`
                        : `${docs.length} document(s)`}
                </span>
            </div>

            {/* Upload Area */}
            <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition"
            >
                <Upload size={32} className="mx-auto text-gray-400 mb-3" />
                <p className="font-medium text-gray-600">
                    {uploading ? "Uploading..." : "Click to upload documents"}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                    Upload multiple files at once
                </p>

                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFilesSelected(e.target.files)}
                    disabled={uploading}
                />
            </div>

            {/* Tag Filter */}
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    value={filterTag}
                    onChange={(e) => setFilterTag(e.target.value)}
                    placeholder="Filter by tag..."
                    className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
            </div>

            {/* Document List */}
            {filteredDocs.length === 0 ? (
                filterTag.trim() ? (
                    <div className="flex flex-col items-center justify-center text-center py-8 text-gray-400">
                        <Search size={32} className="text-gray-300 mb-2" />
                        <p className="text-sm">No documents match tag &quot;{filterTag}&quot;.</p>
                    </div>
                ) :
                <div className="flex flex-col items-center justify-center text-center py-8 text-gray-400">
                    <FileText size={32} className="text-gray-300 mb-2" />
                    <p className="text-sm">No documents uploaded yet.</p>
                    <p className="text-xs mt-1">Upload files above to get started.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredDocs.map((doc: VisaDocument) => {
                        const docId = doc.id!
                        const isEditing = editingTags[String(docId)] !== undefined
                        const currentTags = doc.tags ?? []

                        return (
                            <div
                                key={docId}
                                className="border border-gray-200 rounded-lg p-4"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 min-w-0">
                                        <FileText size={20} className="text-gray-400 mt-0.5 shrink-0" />
                                        <div className="min-w-0">
                                            <p className="font-medium text-gray-800 truncate">
                                                {doc.item_name || doc.file_name}
                                            </p>
                                            {doc.file_url && (
                                                <a
                                                    href={doc.file_url}
                                                    target="_blank"
                                                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-0.5"
                                                >
                                                    View file <ExternalLink size={12} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                    {currentTags.map((tag: string) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                                        >
                                            {tag}
                                            <button
                                                onClick={() => handleRemoveTag(docId, tag)}
                                                className="hover:text-red-600 cursor-pointer"
                                            >
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                    {isEditing ? (
                                        <div className="flex items-center gap-1">
                                            <input
                                                value={editingTags[String(docId)] ?? ""}
                                                onChange={(e) =>
                                                    setEditingTags((prev) => ({
                                                        ...prev,
                                                        [String(docId)]: e.target.value
                                                    }))
                                                }
                                                onKeyDown={(e) => handleKeyDown(e, docId)}
                                                placeholder="Tag1, Tag2..."
                                                className="text-xs border border-gray-300 rounded px-2 py-1 w-36 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => handleAddTag(docId)}
                                                className="text-blue-600 hover:text-blue-800 cursor-pointer"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() =>
                                                setEditingTags((prev) => ({
                                                    ...prev,
                                                    [String(docId)]: ""
                                                }))
                                            }
                                            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 cursor-pointer"
                                        >
                                            <Plus size={12} /> Add tag
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

        </div>
    )
}
