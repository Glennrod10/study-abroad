"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { supabase } from "@/app/lib/supabase"
import { Users, FileText, Clock, Bell } from "lucide-react"

export default function CounsellorDashboard() {

    const { data: session } = useSession()

    const counsellorId = session?.user?.id

    const [students, setStudents] = useState<any[]>([])
    const [applications, setApplications] = useState<any[]>([])
    const [visaPending, setVisaPending] = useState(0)

    const [tasks, setTasks] = useState<any[]>([])
    const [pendingTasks, setPendingTasks] = useState(0)
    const [overdueTasks, setOverdueTasks] = useState(0)

    useEffect(() => {

        if (!counsellorId) return

        fetchStudents()
        fetchApplications()
        fetchVisaStats()
        fetchTasks()

    }, [counsellorId])

    const fetchStudents = async () => {

        const { data } = await supabase
            .from("students")
            .select("*")
            .eq("counsellor_id", counsellorId)

        setStudents(data || [])
    }

    const fetchApplications = async () => {

        const { data } = await supabase
            .from("applications")
            .select("*")
            .eq("counsellor_id", counsellorId)

        setApplications(data || [])
    }

    const fetchVisaStats = async () => {

        const { data } = await supabase
            .from("students")
            .select("id")
            .eq("counsellor_id", counsellorId)
            .eq("status", "Visa Pending")

        setVisaPending(data?.length || 0)
    }

    const fetchTasks = async () => {

        const { data } = await supabase
            .from("tasks")
            .select("*")
            .eq("assigned_to", counsellorId)
            .order("priority", { ascending: false })

        setTasks(data || [])

        const pending = data?.filter(
            (t: any) => t.status === "pending"
        ).length

        const overdue = data?.filter(
            (t: any) =>
                t.status !== "completed" &&
                t.due_date &&
                new Date(t.due_date) < new Date()
        ).length

        setPendingTasks(pending || 0)
        setOverdueTasks(overdue || 0)
    }

    return (
        <div className="space-y-8">

            {/* Header */}

            <div>
                <h1 className="text-3xl font-black">
                    My Dashboard
                </h1>

                <p className="text-text-secondary mt-1">
                    Overview of your students, applications and tasks
                </p>
            </div>

            {/* Stats */}

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">

                <StatCard
                    title="My Students"
                    value={students.length}
                    icon={<Users size={20} />}
                />

                <StatCard
                    title="Applications"
                    value={applications.length}
                    icon={<FileText size={20} />}
                />

                <StatCard
                    title="Visa Pending"
                    value={visaPending}
                    icon={<Clock size={20} />}
                />

                <StatCard
                    title="My Tasks"
                    value={tasks.length}
                    icon={<Clock size={20} />}
                />

                <StatCard
                    title="Pending Tasks"
                    value={pendingTasks}
                    icon={<Clock size={20} />}
                />

                <StatCard
                    title="Overdue Tasks"
                    value={overdueTasks}
                    icon={<Clock size={20} />}
                />

            </div>

            {/* Tasks Table */}

            <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">

                <div className="px-6 py-4 border-b border-border">

                    <h3 className="font-bold text-lg">
                        My Tasks
                    </h3>

                </div>

                <table className="w-full text-left">

                    <thead className="bg-gray-50 border-b border-border">

                        <tr>

                            <th className="px-6 py-3 text-xs font-bold uppercase">
                                Task
                            </th>

                            <th className="px-6 py-3 text-xs font-bold uppercase">
                                Priority
                            </th>

                            <th className="px-6 py-3 text-xs font-bold uppercase">
                                Due Date
                            </th>

                            <th className="px-6 py-3 text-xs font-bold uppercase">
                                Status
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {tasks.length === 0 && (

                            <tr>

                                <td
                                    colSpan={4}
                                    className="text-center py-10 text-text-secondary"
                                >
                                    No tasks assigned yet
                                </td>

                            </tr>

                        )}

                        {tasks.map((task) => {

                            const isOverdue =
                                task.status !== "completed" &&
                                task.due_date &&
                                new Date(task.due_date) < new Date()

                            return (

                                <tr
                                    key={task.id}
                                    className={`border-t hover:bg-gray-50
                                    ${isOverdue ? "bg-red-50" : ""}`}
                                >

                                    <td className="px-6 py-4 font-semibold flex items-center gap-2">

                                        {task.reminder_at && (
                                            <Bell
                                                size={14}
                                                className="text-yellow-500"
                                            />
                                        )}

                                        {task.title}

                                    </td>

                                    <td className="px-6 py-4 text-sm">
                                        {task.priority}
                                    </td>

                                    <td className="px-6 py-4 text-sm text-text-secondary">

                                        {task.due_date
                                            ? new Date(task.due_date).toLocaleDateString()
                                            : "-"}

                                    </td>

                                    <td className="px-6 py-4 text-sm">

                                        <span className="px-2 py-1 rounded-full bg-gray-100 text-xs">
                                            {task.status}
                                        </span>

                                    </td>

                                </tr>

                            )

                        })}

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