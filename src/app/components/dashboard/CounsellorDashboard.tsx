"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { supabase } from "@/app/lib/supabase"
import {
    Users,
    FileText,
    Clock,
    Bell,
    AlertCircle,
    RefreshCw,
    Calendar,
    CheckCircle2,
    ListTodo,
} from "lucide-react"
import Link from "next/link"

interface DashboardTask {
    id: string
    title: string
    priority: string
    status: string
    due_date: string | null
    reminder_at: string | null
}

interface DashboardData {
    studentsCount: number
    applicationsCount: number
    visaPending: number
    tasks: DashboardTask[]
    pendingTasks: number
    overdueTasks: number
    upcomingDeadlines: DashboardTask[]
}

export default function CounsellorDashboard() {

    const { data: session } = useSession()
    const counsellorId = (session?.user as any)?.id

    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const fetchData = useCallback(async () => {
        if (!counsellorId) return
        setLoading(true)
        setError("")

        try {
            const [
                { data: students },
                { data: applications },
                { data: visaStudents },
                { data: tasksData },
            ] = await Promise.all([
                supabase.from("students").select("id").eq("counsellor_id", counsellorId),
                supabase.from("applications").select("id").eq("counsellor_id", counsellorId),
                supabase.from("students").select("id").eq("counsellor_id", counsellorId).eq("status", "Visa Pending"),
                supabase.from("tasks").select("*").eq("assigned_to", counsellorId).order("priority", { ascending: false }),
            ])

            const tasks = (tasksData as DashboardTask[]) || []
            const now = new Date()

            const pendingTasks = tasks.filter((t) => t.status === "pending").length

            const overdueTasks = tasks.filter(
                (t) => t.status !== "completed" && t.due_date && new Date(t.due_date) < now
            ).length

            const upcomingDeadlines = tasks
                .filter((t) => t.status !== "completed" && t.due_date)
                .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
                .slice(0, 5)

            setData({
                studentsCount: students?.length || 0,
                applicationsCount: applications?.length || 0,
                visaPending: visaStudents?.length || 0,
                tasks,
                pendingTasks,
                overdueTasks,
                upcomingDeadlines,
            })
        } catch {
            setError("Failed to load dashboard")
        } finally {
            setLoading(false)
        }
    }, [counsellorId])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    if (loading) return <CounsellorSkeleton />
    if (error) return <ErrorState message={error} onRetry={fetchData} />

    return (
        <div className="space-y-8">

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black">My Dashboard</h1>
                    <p className="text-text-secondary mt-1">Your students, applications and tasks</p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 text-sm text-text-secondary hover:text-gray-900 transition cursor-pointer"
                >
                    <RefreshCw size={14} />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <MiniStatCard
                    title="Students"
                    value={data!.studentsCount}
                    icon={<Users size={18} />}
                    color="emerald"
                />
                <MiniStatCard
                    title="Applications"
                    value={data!.applicationsCount}
                    icon={<FileText size={18} />}
                    color="blue"
                />
                <MiniStatCard
                    title="Visa Pending"
                    value={data!.visaPending}
                    icon={<Clock size={18} />}
                    color="amber"
                />
                <MiniStatCard
                    title="Total Tasks"
                    value={data!.tasks.length}
                    icon={<ListTodo size={18} />}
                    color="purple"
                />
                <MiniStatCard
                    title="Pending"
                    value={data!.pendingTasks}
                    icon={<Bell size={18} />}
                    color="rose"
                />
                <MiniStatCard
                    title="Overdue"
                    value={data!.overdueTasks}
                    icon={<AlertCircle size={18} />}
                    color="red"
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <QuickAction href="/dashboard/students/new" label="Add Student" />
                <QuickAction href="/dashboard/applications/new" label="New Application" />
                <QuickAction href="/dashboard/tasks" label="View Tasks" />
                <QuickAction href="/dashboard/visa" label="Visa Tracking" />
            </div>

            {/* Two-column layout */}
            <div className="grid md:grid-cols-2 gap-6">

                {/* Upcoming Deadlines */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Calendar size={16} className="text-blue-500" />
                            Upcoming Deadlines
                        </h3>
                    </div>

                    {data!.upcomingDeadlines.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <CheckCircle2 size={36} className="text-green-300 mb-2" />
                            <p className="text-sm text-text-secondary">No upcoming deadlines</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {data!.upcomingDeadlines.map((task) => {
                                const daysLeft = Math.ceil(
                                    (new Date(task.due_date!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                                )
                                return (
                                    <div key={task.id} className="px-6 py-3 flex items-center justify-between">
                                        <div className="min-w-0">
                                            <p className="font-semibold text-sm truncate">{task.title}</p>
                                            <p className="text-xs text-text-secondary mt-0.5">{task.priority}</p>
                                        </div>
                                        <span
                                            className={`text-xs font-medium shrink-0 ${
                                                daysLeft <= 2 ? "text-red-500" : "text-text-secondary"
                                            }`}
                                        >
                                            {daysLeft <= 0 ? "Overdue" : `${daysLeft}d left`}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Recent Tasks */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <ListTodo size={16} className="text-purple-500" />
                            My Tasks
                        </h3>
                        <Link
                            href="/dashboard/tasks"
                            className="text-xs text-indigo-600 hover:underline"
                        >
                            View all
                        </Link>
                    </div>

                    {data!.tasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <ListTodo size={36} className="text-gray-300 mb-2" />
                            <p className="text-sm text-text-secondary">No tasks assigned yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {data!.tasks.slice(0, 5).map((task) => {
                                const isOverdue =
                                    task.status !== "completed" &&
                                    task.due_date &&
                                    new Date(task.due_date) < new Date()

                                return (
                                    <div
                                        key={task.id}
                                        className={`px-6 py-3 flex items-center justify-between ${isOverdue ? "bg-red-50" : ""}`}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            {task.reminder_at && (
                                                <Bell size={14} className="text-yellow-500 shrink-0" />
                                            )}
                                            <span className="font-semibold text-sm truncate">{task.title}</span>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className="text-xs text-text-secondary">
                                                {task.due_date
                                                    ? new Date(task.due_date).toLocaleDateString()
                                                    : "-"}
                                            </span>
                                            <StatusBadge status={task.status} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}

function MiniStatCard({
    title,
    value,
    icon,
    color,
}: {
    title: string
    value: number
    icon: React.ReactNode
    color: "emerald" | "blue" | "amber" | "purple" | "rose" | "red"
}) {

    const gradients: Record<string, string> = {
        emerald: "from-emerald-500 to-emerald-600",
        blue: "from-blue-500 to-blue-600",
        amber: "from-amber-500 to-amber-600",
        purple: "from-purple-500 to-purple-600",
        rose: "from-rose-500 to-rose-600",
        red: "from-red-500 to-red-600",
    }

    return (
        <div
            className={`relative overflow-hidden rounded-xl p-4 text-white shadow bg-gradient-to-r ${gradients[color]} hover:scale-[1.02] transition`}
        >
            <div className="absolute -right-4 -top-4 opacity-20">
                <div className="w-16 h-16 bg-white rounded-full blur-2xl" />
            </div>
            <div className="flex items-center justify-between relative z-10">
                <div>
                    <p className="text-[10px] uppercase font-semibold opacity-90">{title}</p>
                    <p className="text-2xl font-black mt-0.5">{value}</p>
                </div>
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">{icon}</div>
            </div>
        </div>
    )
}

function QuickAction({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl p-3 bg-white hover:shadow-md hover:-translate-y-[2px] transition text-sm font-semibold cursor-pointer"
        >
            {label}
        </Link>
    )
}

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        pending: "bg-yellow-100 text-yellow-700",
        in_progress: "bg-blue-100 text-blue-700",
        completed: "bg-green-100 text-green-700",
    }
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase ${colors[status] || "bg-gray-100 text-gray-600"}`}>
            {status.replace("_", " ")}
        </span>
    )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle size={48} className="text-red-400 mb-4" />
            <p className="font-semibold text-gray-800">{message}</p>
            <button
                onClick={onRetry}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition cursor-pointer"
            >
                <RefreshCw size={14} /> Retry
            </button>
        </div>
    )
}

function CounsellorSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded-xl" />
                ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded-xl" />
                ))}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="h-48 bg-gray-200 rounded-xl" />
                <div className="h-48 bg-gray-200 rounded-xl" />
            </div>
        </div>
    )
}
