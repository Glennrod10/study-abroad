"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function DeleteApplicationButton({
    applicationId,
}: {
    applicationId: string
}) {
    const router = useRouter()

    const handleDelete = async () => {
        const confirmed = confirm("Delete this application?")
        if (!confirmed) return

        const res = await fetch(`/api/applications/${applicationId}`, {
            method: "DELETE",
        })

        if (res.ok) {
            toast.success("Application deleted")
            router.push("/dashboard/applications")
        } else {
            toast.error("Failed to delete")
        }
    }

    return (
        <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:opacity-90"
        >
            Delete
        </button>
    )
}