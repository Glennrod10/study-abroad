"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/app/lib/supabase"
import {
    Users,
    GraduationCap,
    FileText,
    Plus,
    RefreshCw,
    AlertCircle,
    TrendingUp,
    TrendingDown,
} from "lucide-react"
import Link from "next/link"

interface CounsellorStat {
    id: string
    name: string
    students: number
}

interface DashboardData {
    totalStudents: number
    totalCounsellors: number
    activeApplications: number
    counsellorStats: CounsellorStat[]
    recentStudents: number
    recentApplications: number
}

export default function AdminDashboard() {

    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const fetchData = useCallback(async () => {
        setLoading(true)
        setError("")

        try {
            const [counsellorsRes, dashboardRes, { data: students }] = await Promise.all([
                fetch("/api/counsellors"),
                fetch("/api/dashboard/overview"),
                supabase.from("students").select("counsellor_id"),
            ])

            if (!counsellorsRes.ok || !dashboardRes.ok) {
                throw new Error("Failed to load")
            }

            const counsellors = await counsellorsRes.json()
            const overview = await dashboardRes.json()

            const counsellorStats: CounsellorStat[] = (counsellors as any[]).map((c: any) => ({
                id: c.id,
                name: c.name,
                students: students?.filter((s) => s.counsellor_id === c.id).length || 0,
            }))

            setData({
                totalStudents: overview.totalStudents || 0,
                totalCounsellors: counsellors.length || 0,
                activeApplications: overview.activeApplications || 0,
                counsellorStats,
                recentStudents: 0,
                recentApplications: 0,
            })
        } catch {
            setError("Failed to load dashboard data")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    if (loading) return <AdminSkeleton />
    if (error) return <ErrorState message={error} onRetry={fetchData} />

    return (
        <div className="space-y-8">

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black">Admin Dashboard</h1>
                    <p className="text-text-secondary mt-1">Overview of your agency performance</p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 text-sm text-text-secondary hover:text-gray-900 transition cursor-pointer"
                >
                    <RefreshCw size={14} />
                    Refresh
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Students"
                    value={data!.totalStudents}
                    icon={<GraduationCap size={20} />}
                    color="emerald"
                />
                <StatCard
                    title="Counsellors"
                    value={data!.totalCounsellors}
                    icon={<Users size={20} />}
                    color="blue"
                />
                <StatCard
                    title="Applications"
                    value={data!.activeApplications}
                    icon={<FileText size={20} />}
                    color="purple"
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <QuickAction
                    href="/dashboard/students/new"
                    icon={<Plus size={18} />}
                    label="Add Student"
                />
                <QuickAction
                    href="/dashboard/applications/new"
                    icon={<FileText size={18} />}
                    label="New Application"
                />
                <QuickAction
                    href="/dashboard/students"
                    icon={<GraduationCap size={18} />}
                    label="View All Students"
                />
            </div>

            {/* Counsellor Performance */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-bold text-lg">Counsellor Performance</h3>
                    <span className="text-xs text-text-secondary">
                        {data!.counsellorStats.length} counsellor(s)
                    </span>
                </div>

                {data!.counsellorStats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Users size={40} className="text-gray-300 mb-3" />
                        <p className="font-medium text-text-secondary">No counsellors yet</p>
                        <p className="text-sm text-gray-400 mt-1">
                            Add counsellors to start tracking performance
                        </p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-bold uppercase">Counsellor</th>
                                <th className="px-6 py-3 text-xs font-bold uppercase">Students</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data!.counsellorStats
                                .sort((a, b) => b.students - a.students)
                                .map((c) => (
                                    <tr key={c.id} className="border-t hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-semibold">{c.name}</td>
                                        <td className="px-6 py-4">{c.students}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                )}
            </div>

        </div>
    )
}

function StatCard({
    title,
    value,
    icon,
    color,
}: {
    title: string
    value: number
    icon: React.ReactNode
    color: "emerald" | "blue" | "purple"
}) {

    const gradients: Record<string, string> = {
        emerald: "from-emerald-500 to-emerald-600",
        blue: "from-blue-500 to-blue-600",
        purple: "from-purple-500 to-purple-600",
    }

    return (
        <div
            className={`relative overflow-hidden rounded-xl p-6 text-white shadow-lg bg-gradient-to-r ${gradients[color]} hover:scale-[1.02] transition`}
        >
            <div className="absolute -right-6 -top-6 opacity-20">
                <div className="w-24 h-24 bg-white rounded-full blur-2xl" />
            </div>

            <div className="flex items-center justify-between relative z-10">
                <div>
                    <p className="text-xs uppercase font-semibold opacity-90">{title}</p>
                    <h3 className="text-3xl font-black mt-1">{value.toLocaleString()}</h3>
                </div>
                <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">{icon}</div>
            </div>
        </div>
    )
}

function QuickAction({
    href,
    icon,
    label,
}: {
    href: string
    icon: React.ReactNode
    label: string
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md hover:-translate-y-[2px] transition cursor-pointer"
        >
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                {icon}
            </div>
            <span className="font-semibold text-sm">{label}</span>
        </Link>
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
                <RefreshCw size={14} />
                Retry
            </button>
        </div>
    )
}

function AdminSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="h-8 w-60 bg-gray-200 rounded" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded-xl" />
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded-xl" />
                ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
    )
}
