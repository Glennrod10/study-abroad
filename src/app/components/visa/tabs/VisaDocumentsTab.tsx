"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function VisaDocumentsTab({ visaId }: any) {

    const [docs, setDocs] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {

        if (!visaId) return

        fetchDocs()

    }, [visaId])


    const fetchDocs = async () => {

        setLoading(true)
        const res = await fetch(`/api/visa-documents/${visaId}`)

        const data = await res.json()

        if (Array.isArray(data)) {
            setDocs(data)
        }
        setLoading(false)

    }


    const uploadFile = async (
        e: any,
        checklistItemId: string
    ) => {

        const file = e.target.files[0]

        const formData = new FormData()

        formData.append("file", file)
        formData.append("visaId", visaId)
        formData.append("checklistItemId", checklistItemId)

        await fetch("/api/visa-documents/upload", {
            method: "POST",
            body: formData
        })

        toast.success("Document uploaded")

        fetchDocs()

    }


    if (!visaId) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 flex flex-col items-center justify-center text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 mb-3"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                <p className="text-gray-500 font-medium">Select a visa case first</p>
                <p className="text-sm text-gray-400 mt-1">Pick a visa from the Board to view its documents.</p>
            </div>
        )
    }


    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">

            <h2 className="text-xl font-semibold mb-4">
                Visa Documents
            </h2>

            {loading ? (
                <div className="space-y-3 animate-pulse">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex justify-between items-center border border-gray-200 p-3 rounded-lg">
                            <div className="space-y-2">
                                <div className="h-4 w-40 bg-gray-200 rounded" />
                                <div className="h-3 w-24 bg-gray-200 rounded" />
                            </div>
                            <div className="h-4 w-16 bg-gray-200 rounded" />
                        </div>
                    ))}
                </div>
            ) : docs.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-8 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 mb-2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <p className="text-sm">No documents found for this visa.</p>
                </div>
            ) : (
                <div className="space-y-3">

                    {docs.map((doc) => (

                        <div
                            key={doc.checklist_id}
                            className="flex justify-between items-center border border-gray-200 p-3 rounded-lg"
                        >

                            <div>

                                <p className="font-medium text-gray-800">
                                    {doc.item_name}
                                </p>

                                {doc.file_url ? (

                                    <a
                                        href={doc.file_url}
                                        target="_blank"
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        {doc.file_name}
                                    </a>

                                ) : (

                                    <p className="text-sm text-gray-400">
                                        No document uploaded
                                    </p>

                                )}

                            </div>

                            <label className="cursor-pointer text-blue-600 text-sm font-medium hover:text-blue-700 transition">

                                Upload

                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) =>
                                        uploadFile(e, doc.checklist_id)
                                    }
                                />

                            </label>

                        </div>

                    ))}

                </div>
            )}

        </div>
    )
}