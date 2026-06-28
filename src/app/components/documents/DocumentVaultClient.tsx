"use client"

import { useState, useEffect, useCallback } from "react"
import { Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import DocumentFilters, { FilterState } from "./DocumentFilters"
import DocumentTable from "./DocumentTable"
import DocumentPreviewModal from "./DocumentPreviewModal"
import UploadDocumentModal from "./UploadDocumentModal"

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

export default function DocumentVaultClient() {
    const router = useRouter()
    const [filters, setFilters] = useState<FilterState>({
        search: "", tags: [], status: "", dateFrom: "", dateTo: "",
    })
    const [page, setPage] = useState(1)
    const [documents, setDocuments] = useState<Document[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [previewDoc, setPreviewDoc] = useState<Document | null>(null)
    const [uploadOpen, setUploadOpen] = useState(false)
    const limit = 25

    const fetchDocuments = useCallback(async () => {
        setLoading(true)
        const params = new URLSearchParams()
        if (filters.search) params.set("search", filters.search)
        filters.tags.forEach(t => params.append("tags", t))
        if (filters.status) params.set("status", filters.status)
        if (filters.dateFrom) params.set("date_from", filters.dateFrom)
        if (filters.dateTo) params.set("date_to", filters.dateTo)
        params.set("page", String(page))
        params.set("limit", String(limit))

        const res = await fetch(`/api/documents?${params}`)
        const data = await res.json()
        setDocuments(data.documents || [])
        setTotal(data.total || 0)
        setLoading(false)
    }, [filters, page, limit])

    useEffect(() => {
        fetchDocuments()
    }, [fetchDocuments])

    const handleFilterChange = (f: FilterState) => {
        setFilters(f)
        setPage(1)
    }

    const handleDelete = async (id: string) => {
        const res = await fetch(`/api/documents/${id}`, { method: "DELETE" })
        if (res.ok) {
            setPreviewDoc(null)
            fetchDocuments()
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black">Document Vault</h1>
                    <p className="text-sm text-text-secondary mt-1">
                        Browse and manage all student documents
                    </p>
                </div>
                <button
                    onClick={() => setUploadOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition cursor-pointer"
                >
                    <Upload size={16} />
                    Upload Document
                </button>
            </div>

            <DocumentFilters filters={filters} onFilterChange={handleFilterChange} />

            <DocumentTable
                documents={documents}
                total={total}
                page={page}
                limit={limit}
                loading={loading}
                onPageChange={setPage}
                onDocumentClick={setPreviewDoc}
            />

            <DocumentPreviewModal
                document={previewDoc}
                onClose={() => setPreviewDoc(null)}
                onDelete={handleDelete}
            />

            <UploadDocumentModal
                open={uploadOpen}
                onClose={() => { setUploadOpen(false); fetchDocuments() }}
            />
        </div>
    )
}
