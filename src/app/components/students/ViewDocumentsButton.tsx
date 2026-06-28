"use client"

import { useState } from "react"
import StudentDocumentsModal from "./StudentDocumentsModal"

export default function ViewDocumentsButton({ documents, allTags, studentName }: any) {

    const [open, setOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="text-sm text-[var(--color-primary)] font-medium cursor-pointer"
            >
                View Documents
            </button>

            <StudentDocumentsModal
                open={open}
                onClose={() => setOpen(false)}
                documents={documents}
                allTags={allTags}
                studentName={studentName}
            />
        </>
    )
}