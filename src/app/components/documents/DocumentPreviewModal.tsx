"use client"

import { X, FileText, ExternalLink, Trash2 } from "lucide-react"
import TagBadge from "./TagBadge"

type TagDetail = { id: string; name: string; color: string }

type Document = {
    id: string
    student_id: string
    student_name: string
    document_name: string
    file_url: string
    document_type: string
    tags: string[]
    tag_details: TagDetail[]
    status: string
    created_at: string
}

export default function DocumentPreviewModal({
    document,
    onClose,
    onDelete,
}: {
    document: Document | null
    onClose: () => void
    onDelete?: (id: string) => void
}) {
    if (!document) return null

    const fileUrl = document.file_url
    const fileName = document.document_name || ""
    const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(fileName)
    const isPdf = /\.pdf$/i.test(fileName)
    const isDocx = /\.docx?$/i.test(fileName)

    const renderPreview = () => {
        if (isImage) {
            return (
                <img
                    src={fileUrl}
                    alt={document.document_name}
                    className="max-w-full max-h-full object-contain"
                />
            )
        }

        if (isPdf) {
            return (
                <iframe
                    src={`${fileUrl}#toolbar=0`}
                    className="w-full h-full rounded-lg"
                    title={document.document_name}
                />
            )
        }

        if (isDocx) {
            return (
                <iframe
                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                    className="w-full h-full rounded-lg"
                    title={document.document_name}
                />
            )
        }

        return (
            <div className="flex flex-col items-center justify-center h-full text-text-secondary gap-3">
                <FileText size={48} />
                <p className="text-sm">Preview not available</p>
                <a
                    href={fileUrl}
                    target="_blank"
                    className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
                >
                    <ExternalLink size={16} className="inline mr-1" />
                    Open File
                </a>
            </div>
        )
    }

    const statusColors: Record<string, string> = {
        "Approved": "bg-green-50 text-green-600",
        "Rejected": "bg-red-50 text-red-600",
        "Pending Review": "bg-amber-50 text-amber-600",
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-xl shadow-xl flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <h3 className="text-lg font-bold truncate">
                            {document.document_name}
                        </h3>
                        <span
                            className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                                statusColors[document.status] || "bg-gray-50 text-gray-600"
                            }`}
                        >
                            {document.status}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                            title="Open in new tab"
                        >
                            <ExternalLink size={16} />
                        </a>
                        {onDelete && (
                            <button
                                onClick={() => onDelete(document.id)}
                                className="p-2 hover:bg-red-50 rounded text-red-500 cursor-pointer"
                                title="Delete"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded cursor-pointer">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-1 min-h-0">
                    <div className="flex-1 bg-gray-100 flex items-center justify-center p-4 overflow-auto">
                        {renderPreview()}
                    </div>

                    <div className="w-64 border-l border-gray-200 p-4 space-y-4 overflow-y-auto shrink-0">
                        <div>
                            <p className="text-xs font-semibold text-text-secondary uppercase mb-1">Student</p>
                            <p className="text-sm font-medium">{document.student_name}</p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-text-secondary uppercase mb-1">Document Type</p>
                            <p className="text-sm">{document.document_type || "—"}</p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-text-secondary uppercase mb-1">Tags</p>
                            <div className="flex flex-wrap gap-1">
                                {document.tag_details.length > 0
                                    ? document.tag_details.map(t => (
                                        <TagBadge key={t.id} name={t.name} color={t.color} />
                                    ))
                                    : <span className="text-sm text-text-secondary">None</span>
                                }
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-text-secondary uppercase mb-1">Uploaded</p>
                            <p className="text-sm">
                                {new Date(document.created_at).toLocaleDateString("en-US", {
                                    year: "numeric", month: "short", day: "numeric"
                                })}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-text-secondary uppercase mb-1">File</p>
                            <p className="text-sm text-text-secondary break-all">{document.document_name}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
