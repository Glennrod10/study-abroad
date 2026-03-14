"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/app/lib/supabase"
import { Users } from "lucide-react"

export default function AdminDashboard() {

    const [counsellors, setCounsellors] = useState<any[]>([])
    const [studentsCount, setStudentsCount] = useState(0)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {

        const { data: counsellorData } = await supabase
            .from("users")
            .select("id,name")
            .eq("role", "counsellor")

        const { data: students } = await supabase
            .from("students")
            .select("counsellor_id")

        setStudentsCount(students?.length || 0)

        const stats = counsellorData?.map((c) => {

            const count =
                students?.filter(
                    (s) => s.counsellor_id === c.id
                ).length || 0

            return {
                ...c,
                students: count,
            }

        })

        setCounsellors(stats || [])
    }

    return (
        <div className="space-y-8">

            <div>
                <h1 className="text-3xl font-black">
                    Admin Dashboard
                </h1>
                <p className="text-text-secondary mt-1">
                    Overview of your agency performance
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <StatCard
                    title="Total Students"
                    value={studentsCount}
                    icon={<Users size={20} />}
                />

                <StatCard
                    title="Counsellors"
                    value={counsellors.length}
                    icon={<Users size={20} />}
                />

            </div>

            {/* Counsellor Performance */}

            <div className="bg-white border border-border rounded-xl shadow-sm">

                <div className="px-6 py-4 border-b border-border">
                    <h3 className="font-bold text-lg">
                        Counsellor Performance
                    </h3>
                </div>

                <table className="w-full text-left">

                    <thead className="bg-gray-50 border-b border-border">

                        <tr>

                            <th className="px-6 py-3 text-xs font-bold uppercase">
                                Counsellor
                            </th>

                            <th className="px-6 py-3 text-xs font-bold uppercase">
                                Students
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {counsellors.map((c) => (

                            <tr
                                key={c.id}
                                className="border-t hover:bg-gray-50"
                            >

                                <td className="px-6 py-4 font-semibold">
                                    {c.name}
                                </td>

                                <td className="px-6 py-4">
                                    {c.students}
                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    )
}

function StatCard({ title, value, icon }: any) {

    return (
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex items-center gap-4">

            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                {icon}
            </div>

            <div>
                <p className="text-xs uppercase font-bold text-text-secondary">
                    {title}
                </p>

                <h4 className="text-2xl font-black">
                    {value}
                </h4>
            </div>

        </div>
    )
}