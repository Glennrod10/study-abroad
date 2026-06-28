"use client"

import { FileText, Eye, ChevronLeft, ChevronRight } from "lucide-react"
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

export default function DocumentTable({
    documents,
    total,
    page,
    limit,
    loading,
    onPageChange,
    onDocumentClick,
}: {
    documents: Document[]
    total: number
    page: number
    limit: number
    loading?: boolean
    onPageChange: (page: number) => void
    onDocumentClick: (doc: Document) => void
}) {
    const totalPages = Math.ceil(total / limit)

    const statusStyles: Record<string, string> = {
        "Approved": "bg-green-50 text-green-600",
        "Rejected": "bg-red-50 text-red-600",
        "Pending Review": "bg-amber-50 text-amber-600",
    }

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    if (documents.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">
                <FileText size={48} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-text-primary mb-1">No documents found</h3>
                <p className="text-sm text-text-secondary">
                    Try adjusting your filters or upload a new document.
                </p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 text-left">
                            <th className="px-6 py-4 text-sm font-semibold text-text-secondary">Student</th>
                            <th className="px-6 py-4 text-sm font-semibold text-text-secondary">Document</th>
                            <th className="px-6 py-4 text-sm font-semibold text-text-secondary">Tags</th>
                            <th className="px-6 py-4 text-sm font-semibold text-text-secondary">Status</th>
                            <th className="px-6 py-4 text-sm font-semibold text-text-secondary">Uploaded</th>
                            <th className="px-6 py-4 text-sm font-semibold text-text-secondary text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.map((doc) => (
                            <tr
                                key={doc.id}
                                className="border-t border-gray-100 hover:bg-gray-50 transition cursor-pointer"
                                onClick={() => onDocumentClick(doc)}
                            >
                                <td className="px-6 py-4">
                                    <p className="text-sm font-medium">{doc.student_name}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <FileText size={14} className="text-text-secondary shrink-0" />
                                        <span className="text-sm truncate max-w-[200px]">
                                            {doc.document_name}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {doc.tag_details.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {doc.tag_details.slice(0, 3).map(t => (
                                                <TagBadge key={t.id} name={t.name} color={t.color} />
                                            ))}
                                            {doc.tag_details.length > 3 && (
                                                <span className="text-xs text-text-secondary">
                                                    +{doc.tag_details.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-text-disabled">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`text-xs px-2 py-0.5 rounded-full ${
                                            statusStyles[doc.status] || "bg-gray-50 text-gray-600"
                                        }`}
                                    >
                                        {doc.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-text-secondary">
                                        {new Date(doc.created_at).toLocaleDateString("en-US", {
                                            month: "short", day: "numeric", year: "numeric"
                                        })}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDocumentClick(doc) }}
                                        className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                                        title="Preview"
                                    >
                                        <Eye size={16} className="text-text-secondary" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                    <p className="text-sm text-text-secondary">
                        Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onPageChange(page - 1)}
                            disabled={page <= 1}
                            className="p-2 hover:bg-gray-100 rounded disabled:opacity-30 cursor-pointer"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm font-medium px-2">{page} of {totalPages}</span>
                        <button
                            onClick={() => onPageChange(page + 1)}
                            disabled={page >= totalPages}
                            className="p-2 hover:bg-gray-100 rounded disabled:opacity-30 cursor-pointer"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
