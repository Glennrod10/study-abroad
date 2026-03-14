"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function VisaDocumentsTab({ visaId }: any) {

    const [docs, setDocs] = useState<any[]>([])

    useEffect(() => {

        if (!visaId) return

        fetchDocs()

    }, [visaId])


    const fetchDocs = async () => {

        const res = await fetch(`/api/visa-documents/${visaId}`)

        const data = await res.json()

        if (Array.isArray(data)) {
            setDocs(data)
        }

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
            <div className="bg-white border rounded-xl p-6">
                Select visa case first
            </div>
        )
    }


    return (
        <div className="bg-white border rounded-xl shadow-sm p-6">

            <h2 className="text-xl font-semibold mb-4">
                Visa Documents
            </h2>
            <div className="space-y-3">

                {docs.map((doc) => (

                    <div
                        key={doc.checklist_id}
                        className="flex justify-between items-center border p-3 rounded-lg"
                    >

                        <div>

                            <p className="font-medium">
                                {doc.item_name}
                            </p>

                            {doc.file_url ? (

                                <a
                                    href={doc.file_url}
                                    target="_blank"
                                    className="text-sm text-blue-600"
                                >
                                    {doc.file_name}
                                </a>

                            ) : (

                                <p className="text-sm text-gray-400">
                                    No document uploaded
                                </p>

                            )}

                        </div>

                        <label className="cursor-pointer text-blue-600 text-sm">

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

        </div>
    )
}