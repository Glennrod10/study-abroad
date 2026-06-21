"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/app/lib/supabase"
import CreateAgencyModal from "@/app/components/agencies/CreateAgencyModal"
import ResetAdminPasswordModal from "@/app/components/agencies/ResetAdminPasswordModal"

export default function AgenciesPage() {

    const [agencies, setAgencies] = useState<any[]>([])
    const [open, setOpen] = useState(false)

    const [resetOpen, setResetOpen] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

    useEffect(() => {
        fetchAgencies()
    }, [])

    const fetchAgencies = async () => {

        const { data } = await supabase
            .from("agencies")
            .select("*")
            .order("created_at", { ascending: false })

        setAgencies(data || [])
    }

    const openResetModal = async (agency: any) => {

        const { data } = await supabase
            .from("users")
            .select("id")
            .eq("agency_id", agency.id)
            .eq("role", "admin")
            .single()

        if (data) {
            setSelectedUserId(data.id)
            setResetOpen(true)
        }
    }

    return (
        <div className="space-y-8">

            <div className="flex justify-between items-center">

                <div>
                    <h1 className="text-3xl font-black">
                        Agencies
                    </h1>

                    <p className="text-text-secondary">
                        Manage platform agencies
                    </p>
                </div>

                <button
                    onClick={() => setOpen(true)}
                    className="px-5 h-11 rounded-lg text-white cursor-pointer"
                    style={{ backgroundColor: "var(--color-primary)" }}
                >
                    + Create Agency
                </button>

            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

                <table className="w-full text-left">

                    <thead className="bg-gray-50 border-b border-gray-200">

                        <tr>

                            <th className="px-6 py-3 text-xs font-bold uppercase">
                                Agency
                            </th>

                            <th className="px-6 py-3 text-xs font-bold uppercase">
                                Created
                            </th>

                            <th className="px-6 py-3 text-xs font-bold uppercase">
                                Actions
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {agencies.map((agency) => (

                            <tr
                                key={agency.id}
                                className="border-t hover:bg-gray-50"
                            >

                                <td className="px-6 py-4 font-semibold">
                                    {agency.name}
                                </td>

                                <td className="px-6 py-4 text-sm text-text-secondary">
                                    {new Date(
                                        agency.created_at
                                    ).toLocaleDateString()}
                                </td>

                                <td className="px-6 py-4">

                                    <button
                                        className="text-sm text-blue-600 hover:underline cursor-pointer"
                                        onClick={() => openResetModal(agency)}
                                    >
                                        Reset Admin Password
                                    </button>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

            <CreateAgencyModal
                open={open}
                onClose={() => setOpen(false)}
                onCreated={fetchAgencies}
            />

            <ResetAdminPasswordModal
                open={resetOpen}
                onClose={() => setResetOpen(false)}
                userId={selectedUserId}
            />

        </div>
    )
}