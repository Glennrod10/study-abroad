"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/app/lib/supabase"
import { useSession } from "next-auth/react"
import AddCounsellorModal from "@/app/components/dashboard/AddCounsellorModal"

export default function CounsellorsPage() {

    const { data: session } = useSession()

    const [openModal, setOpenModal] = useState(false)
    const [counsellors, setCounsellors] = useState<any[]>([])

    const fetchCounsellors = async () => {

        if (!session?.user?.agency_id) return

        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("agency_id", session.user.agency_id)
            .eq("role", "counsellor")

        if (!error) {
            setCounsellors(data || [])
        }
    }

    useEffect(() => {
        fetchCounsellors()
    }, [session])

    return (
        <div className="p-6 space-y-6">

            <div className="flex items-center justify-between">

                <h1 className="text-2xl font-semibold">
                    Counsellors
                </h1>

                <button
                    onClick={() => setOpenModal(true)}
                    className="px-4 py-2 text-white rounded-lg cursor-pointer"
                    style={{ backgroundColor: "var(--color-primary)" }}
                >
                    + Add Counsellor
                </button>

            </div>

            <div className="border rounded-xl overflow-hidden">

                <table className="w-full text-sm">

                    <thead className="bg-gray-50">
                        <tr className="text-left">
                            <th className="p-4">Name</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Created</th>
                        </tr>
                    </thead>

                    <tbody>

                        {counsellors.map((c) => (
                            <tr key={c.id} className="border-t">

                                <td className="p-4">{c.name}</td>
                                <td className="p-4">{c.email}</td>
                                <td className="p-4 capitalize">{c.role}</td>
                                <td className="p-4">
                                    {new Date(c.created_at).toLocaleDateString()}
                                </td>

                            </tr>
                        ))}

                    </tbody>

                </table>

            </div>
            <AddCounsellorModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                onSuccess={fetchCounsellors}
            />
        </div>
    )
}