"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/app/lib/supabase"
import { X } from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

interface Props {
    open: boolean
    onClose: () => void
    studentId: string | null
    onSuccess: () => void
}

export default function AssignCounsellorModal({
    open,
    onClose,
    studentId,
    onSuccess,
}: Props) {

    const { data: session } = useSession()

    const [counsellors, setCounsellors] = useState<any[]>([])
    const [selectedCounsellor, setSelectedCounsellor] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchCounsellors()
    }, [])

    const fetchCounsellors = async () => {

        const { data } = await supabase
            .from("users")
            .select("id,name")
            .eq("agency_id", session?.user?.agency_id)
            .eq("role", "counsellor")

        setCounsellors(data || [])
    }

    const assignCounsellor = async () => {

        if (!selectedCounsellor) {
            toast.error("Please select a counsellor")
            return
        }

        setLoading(true)

        const { error } = await supabase
            .from("students")
            .update({ counsellor_id: selectedCounsellor })
            .eq("id", studentId)

        setLoading(false)

        if (error) {
            toast.error(error.message)
            return
        }

        toast.success("Counsellor assigned successfully")

        onSuccess()
        onClose()
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 space-y-6">

                <div className="flex items-center justify-between">

                    <h2 className="text-lg font-semibold">
                        Assign Counsellor
                    </h2>

                    <button
                        onClick={onClose}
                        className="cursor-pointer"
                    >
                        <X size={18} />
                    </button>

                </div>

                <div className="space-y-2">

                    <label className="text-sm font-medium">
                        Select Counsellor *
                    </label>

                    <select
                        value={selectedCounsellor}
                        onChange={(e) =>
                            setSelectedCounsellor(e.target.value)
                        }
                        className="w-full border rounded-lg px-3 py-2"
                    >

                        <option value="">
                            Select counsellor
                        </option>

                        {counsellors.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}

                    </select>

                </div>

                <div className="flex justify-end gap-3">

                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded-lg cursor-pointer"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={assignCounsellor}
                        disabled={loading}
                        className="px-5 py-2 bg-black text-white rounded-lg cursor-pointer"
                    >
                        {loading ? "Saving..." : "Assign"}
                    </button>

                </div>

            </div>

        </div>
    )
}