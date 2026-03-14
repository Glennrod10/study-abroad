"use client"

import { useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { Eye, Edit, Trash2, MoreVertical, User } from "lucide-react"
import { toast } from "sonner"
import ConfirmModal from "../ui/ConfirmModal"
import { supabase } from "@/app/lib/supabase"

export default function StudentActions({ studentId }: { studentId: string }) {

    const router = useRouter()

    const [open, setOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const [showConfirm, setShowConfirm] = useState(false)

    const [showAssignModal, setShowAssignModal] = useState(false)

    const [counsellors, setCounsellors] = useState<any[]>([])

    const [selectedCounsellor, setSelectedCounsellor] = useState("")

    useEffect(() => {

        function handleClickOutside(event: MouseEvent) {

            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setOpen(false)
            }

        }

        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }

    }, [])

    useEffect(() => {

        const fetchCounsellors = async () => {

            const { data } = await supabase
                .from("users")
                .select("id,name")
                .eq("role", "counsellor")

            setCounsellors(data || [])

        }

        fetchCounsellors()

    }, [])

    const handleDelete = async () => {

        const res = await fetch(`/api/students/${studentId}`, {
            method: "DELETE",
        })

        if (res.ok) {

            toast.success("Student deleted successfully")

            router.refresh()

        } else {

            toast.error("Delete failed")

        }

        setShowConfirm(false)

    }

    const assignCounsellor = async () => {

        if (!selectedCounsellor) {

            toast.error("Please select a counsellor")

            return

        }

        const { error } = await supabase
            .from("students")
            .update({ counsellor_id: selectedCounsellor })
            .eq("id", studentId)

        if (error) {

            toast.error("Failed to assign counsellor")

            return

        }

        toast.success("Counsellor assigned")

        setShowAssignModal(false)

        router.refresh()

    }

    return (
        <>
            <div className="relative" ref={dropdownRef}>

                <button
                    onClick={() => setOpen(!open)}
                    className="p-1 hover:text-[var(--color-primary)] cursor-pointer"
                >
                    <MoreVertical size={18} />
                </button>

                {open && (
                    <div className="absolute right-0 mt-2 w-44 bg-white border border-border rounded-lg shadow-lg z-50 overflow-hidden">

                        <button
                            onClick={() => router.push(`/dashboard/students/${studentId}`)}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                        >
                            <Eye size={16} />
                            View
                        </button>

                        <button
                            onClick={() =>
                                router.push(`/dashboard/students/${studentId}/edit`)
                            }
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                        >
                            <Edit size={16} />
                            Edit
                        </button>

                        <button
                            onClick={() => {
                                setOpen(false)
                                setShowAssignModal(true)
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                        >
                            <User size={16} />
                            <span className="truncate">Assign Counsellor</span>
                        </button>

                        <button
                            onClick={() => setShowConfirm(true)}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 cursor-pointer"
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>

                    </div>
                )}
            </div>

            <ConfirmModal
                open={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleDelete}
                title="Delete Student"
                description="Are you sure you want to delete this student? This action cannot be undone."
            />

            {showAssignModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

                    <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-xl">

                        <h3 className="text-lg font-bold mb-4">
                            Assign Counsellor
                        </h3>

                        <select
                            value={selectedCounsellor}
                            onChange={(e) => setSelectedCounsellor(e.target.value)}
                            className="w-full h-11 px-4 border border-border rounded-lg mb-6"
                        >

                            <option value="">
                                Select Counsellor
                            </option>

                            {counsellors.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}

                        </select>

                        <div className="flex justify-end gap-3">

                            <button
                                onClick={() => setShowAssignModal(false)}
                                className="px-4 py-2 border border-border rounded-lg text-sm"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={assignCounsellor}
                                className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm hover:opacity-90"
                            >
                                Assign
                            </button>

                        </div>

                    </div>

                </div>
            )}
        </>
    )
}