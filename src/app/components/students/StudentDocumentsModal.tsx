"use client"

import { X, FileText, ExternalLink, Eye, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

export default function StudentDocumentsModal({
    open,
    onClose,
    documents,
}: any) {

    if (!open) return null
    const updateStatus = async (docId: string, status: string) => {

        const res = await fetch(`/api/student-documents/${docId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status }),
        })

        if (res.ok) {

            toast.success(
                status === "Approved"
                    ? "Document approved successfully"
                    : "Document rejected"
            )

            location.reload()

        } else {

            toast.error("Failed to update document status")

        }

    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">

                    <h3 className="text-lg font-bold">
                        Student Documents
                    </h3>

                    <button
                        onClick={onClose}
                        className="cursor-pointer"
                    >
                        <X size={18} />
                    </button>

                </div>

                {/* Documents */}
                <div className="p-6 space-y-4 max-h-[450px] overflow-y-auto">

                    {!documents?.length && (
                        <p className="text-sm text-text-secondary">
                            No documents uploaded
                        </p>
                    )}

                    {documents?.map((doc: any) => (

                        <div
                            key={doc.id}
                            className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-50 transition"
                        >

                            {/* Left Side */}
                            <div className="flex items-center gap-4">

                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <FileText size={18} className="text-gray-500" />
                                </div>

                                <div>
                                    <p className="font-medium text-sm">
                                        {doc.document_name}
                                    </p>

                                    <p className="text-xs text-text-secondary">
                                        {doc.document_type}
                                    </p>
                                </div>

                            </div>


                            {/* Right Side */}
                            <div className="flex items-center gap-3">

                                {/* Status */}
                                <span
                                    className={`text-xs px-2 py-1 rounded-full
                    ${doc.status === "Approved" ? "bg-green-50 text-green-600"
                                            : doc.status === "Rejected" ? "bg-red-50 text-red-600"
                                                : "bg-amber-50 text-amber-600"
                                        }`}
                                >
                                    {doc.status}
                                </span>


                                {/* View */}
                                <a
                                    href={doc.file_url}
                                    target="_blank"
                                    className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                                >
                                    <Eye size={16} />
                                </a>


                                {/* Approve */}
                                <button
                                    onClick={() => updateStatus(doc.id, "Approved")}
                                    className="p-2 hover:bg-green-50 rounded text-green-600 cursor-pointer"
                                >
                                    <CheckCircle size={16} />
                                </button>


                                {/* Reject */}
                                <button
                                    onClick={() => updateStatus(doc.id, "Rejected")}
                                    className="p-2 hover:bg-red-50 rounded text-red-600 cursor-pointer"
                                >
                                    <XCircle size={16} />
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </div>
    )
}