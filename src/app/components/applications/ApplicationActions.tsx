"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function ApplicationActions({ id }: { id: string }) {
    const router = useRouter()

    const handleDelete = async () => {
        const confirmed = confirm("Delete this application?")
        if (!confirmed) return

        const res = await fetch(`/api/applications/${id}`, {
            method: "DELETE",
        })

        if (res.ok) {
            toast.success("Application deleted")
            router.push("/dashboard/applications")
        } else {
            toast.error("Delete failed")
        }
    }

    return (
        <div className="flex gap-3">
            <a
                href={`/dashboard/applications/${id}/edit`}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
            >
                Edit
            </a>

            <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm"
            >
                Delete
            </button>
        </div>
    )
}