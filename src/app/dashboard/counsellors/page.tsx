"use client"

import { useEffect, useState, useCallback } from "react"
import AddCounsellorModal from "@/app/components/dashboard/AddCounsellorModal"
import ConfirmModal from "@/app/components/ui/ConfirmModal"
import { UserPlus, Users, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface Counsellor {
    id: string
    name: string
    email: string
    role: string
    title: string | null
    phone: string | null
    created_at: string
}

export default function CounsellorsPage() {

    const [counsellors, setCounsellors] = useState<Counsellor[]>([])
    const [loading, setLoading] = useState(true)
    const [openModal, setOpenModal] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

    const fetchCounsellors = useCallback(async () => {
        setLoading(true)
        const res = await fetch("/api/counsellors")
        if (res.ok) {
            setCounsellors(await res.json())
        } else {
            setCounsellors([])
        }
        setLoading(false)
    }, [])

    const deleteCounsellor = async (id: string) => {
        const res = await fetch("/api/counsellors", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        })

        if (!res.ok) {
            toast.error("Failed to delete counsellor")
            return
        }

        toast.success("Counsellor removed")
        setDeleteTarget(null)
        fetchCounsellors()
    }

    useEffect(() => {
        fetchCounsellors()
    }, [fetchCounsellors])

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black">Counsellors</h1>
                    <p className="text-text-secondary">Manage your counselling team</p>
                </div>
                <button
                    onClick={() => setOpenModal(true)}
                    className="px-6 h-11 rounded-lg text-white cursor-pointer font-semibold flex items-center gap-2"
                    style={{ backgroundColor: "var(--color-primary)" }}
                >
                    <UserPlus size={18} />
                    Add Counsellor
                </button>
            </div>

            {loading ? (
                <LoadingSkeleton />
            ) : counsellors.length === 0 ? (
                <EmptyState onAdd={() => setOpenModal(true)} />
            ) : (
                <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr className="text-xs uppercase text-gray-500">
                                <th className="px-6 py-3 text-left">Name</th>
                                <th className="px-6 py-3 text-left">Email</th>
                                <th className="px-6 py-3 text-left">Title</th>
                                <th className="px-6 py-3 text-left">Phone</th>
                                <th className="px-6 py-3 text-left">Created</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {counsellors.map((c) => (
                                <tr key={c.id} className="border-t transition hover:bg-gray-50">
                                    <td className="px-6 py-4 font-semibold">{c.name}</td>
                                    <td className="px-6 py-4 text-gray-600">{c.email}</td>
                                    <td className="px-6 py-4 text-gray-600">{c.title || "-"}</td>
                                    <td className="px-6 py-4 text-gray-600">{c.phone || "-"}</td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(c.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Trash2
                                            size={18}
                                            className="text-red-600 cursor-pointer inline-block"
                                            onClick={() => setDeleteTarget(c.id)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <AddCounsellorModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                onSuccess={fetchCounsellors}
            />

            <ConfirmModal
                open={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => deleteTarget && deleteCounsellor(deleteTarget)}
                title="Remove Counsellor"
                description="Are you sure you want to remove this counsellor? This action cannot be undone."
            />
        </div>
    )
}

/* ---------- LOADING SKELETON ---------- */

function LoadingSkeleton() {
    return (
        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50 border-b">
                    <tr className="text-xs uppercase text-gray-500">
                        <th className="px-6 py-3 text-left">Name</th>
                        <th className="px-6 py-3 text-left">Email</th>
                        <th className="px-6 py-3 text-left">Title</th>
                        <th className="px-6 py-3 text-left">Phone</th>
                        <th className="px-6 py-3 text-left">Created</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <tr key={i} className="border-t animate-pulse">
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32" /></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-48" /></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28" /></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                            <td className="px-6 py-4 text-right"><div className="h-5 w-5 bg-gray-200 rounded inline-block" /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

/* ---------- EMPTY STATE ---------- */

function EmptyState({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="bg-white border border-border rounded-xl p-16 text-center shadow-sm">
            <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Users size={32} className="text-gray-400" />
                </div>
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">No counsellors yet</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                Add counsellors to your team so they can manage students, track applications, and collaborate on tasks.
            </p>
            <button
                onClick={onAdd}
                className="px-6 h-11 rounded-lg text-white cursor-pointer font-semibold inline-flex items-center gap-2"
                style={{ backgroundColor: "var(--color-primary)" }}
            >
                <UserPlus size={18} />
                Add Your First Counsellor
            </button>
        </div>
    )
}