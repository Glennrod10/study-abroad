"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/app/lib/supabase"
import {
    Building,
    Users,
    GraduationCap,
    FileText,
    Globe,
    FileCheck,
    TrendingUp,
    RefreshCw,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts"

interface StatItem {
    agencies: number
    users: number
    students: number
    applications: number
    universities: number
    visas: number
    studentsGrowth: number
    applicationsGrowth: number
}

interface RecentApplication {
    id: string
    created_at: string
    university_name: string
    intake: string
    students: { first_name: string; last_name: string }[] | null
}

interface TopAgency {
    name: string
    students: number
}

interface RecentStudent {
    first_name: string
    last_name: string
    created_at: string
}

interface RecentAgency {
    id: string
    name: string
    created_at: string
}

interface ChartDataPoint {
    month: string
    students?: number
    applications?: number
}

export default function SuperAdminDashboard() {

    const [stats, setStats] = useState<StatItem | null>(null)
    const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([])
    const [recentAgencies, setRecentAgencies] = useState<RecentAgency[]>([])
    const [topAgencies, setTopAgencies] = useState<TopAgency[]>([])
    const [recentStudents, setRecentStudents] = useState<RecentStudent[]>([])
    const [studentChart, setStudentChart] = useState<ChartDataPoint[]>([])
    const [applicationChart, setApplicationChart] = useState<ChartDataPoint[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const fetchDashboard = useCallback(async () => {
        setLoading(true)
        setError("")

        try {
            const [
                { data: agencies },
                { data: users },
                { data: students },
                { data: applications },
                { data: allApplications },
                { data: universities },
                { data: visas },
                { data: studentsRecent },
            ] = await Promise.all([
                supabase.from("agencies").select("id,name,created_at"),
                supabase.from("users").select("id"),
                supabase.from("students").select("id,agency_id,created_at"),
                supabase.from("applications")
                    .select("id,created_at,university_name,intake,students(first_name,last_name)")
                    .order("created_at", { ascending: false })
                    .limit(5),
                supabase.from("applications").select("created_at"),
                supabase.from("universities").select("id"),
                supabase.from("visa_applications").select("id"),
                supabase.from("students")
                    .select("first_name,last_name,created_at")
                    .order("created_at", { ascending: false })
                    .limit(5),
            ])

            // Stats
            const totalStudents = students?.length || 0
            const totalApplications = allApplications?.length || 0

            // Growth rates (compare current month vs last month)
            const now = new Date()
            const currentMonth = now.getMonth()
            const currentYear = now.getFullYear()

            const currentMonthStudents = students?.filter((s) => {
                const d = new Date(s.created_at)
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear
            }).length || 0

            const lastMonthStudents = students?.filter((s) => {
                const d = new Date(s.created_at)
                const last = new Date(currentYear, currentMonth - 1, 1)
                return d >= last && d < new Date(currentYear, currentMonth, 1)
            }).length || 0

            const currentMonthApps = allApplications?.filter((a) => {
                const d = new Date(a.created_at)
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear
            }).length || 0

            const lastMonthApps = allApplications?.filter((a) => {
                const d = new Date(a.created_at)
                const last = new Date(currentYear, currentMonth - 1, 1)
                return d >= last && d < new Date(currentYear, currentMonth, 1)
            }).length || 0

            setStats({
                agencies: agencies?.length || 0,
                users: users?.length || 0,
                students: totalStudents,
                applications: totalApplications,
                universities: universities?.length || 0,
                visas: visas?.length || 0,
                studentsGrowth: lastMonthStudents > 0
                    ? Math.round(((currentMonthStudents - lastMonthStudents) / lastMonthStudents) * 100)
                    : currentMonthStudents > 0 ? 100 : 0,
                applicationsGrowth: lastMonthApps > 0
                    ? Math.round(((currentMonthApps - lastMonthApps) / lastMonthApps) * 100)
                    : currentMonthApps > 0 ? 100 : 0,
            })

            setRecentApplications((applications as unknown as RecentApplication[]) || [])
            setRecentStudents((studentsRecent as unknown as RecentStudent[]) || [])

            setRecentAgencies(
                (agencies as unknown as RecentAgency[] || [])
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 5)
            )

            // Top agencies
            const agencyCount: Record<string, number> = {}
            students?.forEach((s: any) => {
                agencyCount[s.agency_id] = (agencyCount[s.agency_id] || 0) + 1
            })

            const top = Object.entries(agencyCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)

            setTopAgencies(
                top.map(([id, count]) => ({
                    name: (agencies as unknown as RecentAgency[] || []).find((a) => a.id === id)?.name || "Unknown",
                    students: count,
                }))
            )

            // Charts
            const studentMonthly: Record<string, number> = {}
            students?.forEach((s: any) => {
                const month = new Date(s.created_at).toLocaleString("default", { month: "short" })
                studentMonthly[month] = (studentMonthly[month] || 0) + 1
            })

            setStudentChart(
                Object.keys(studentMonthly).map((m) => ({ month: m, students: studentMonthly[m] }))
            )

            const appMonthly: Record<string, number> = {}
            allApplications?.forEach((a: any) => {
                const month = new Date(a.created_at).toLocaleString("default", { month: "short" })
                appMonthly[month] = (appMonthly[month] || 0) + 1
            })

            setApplicationChart(
                Object.keys(appMonthly).map((m) => ({ month: m, applications: appMonthly[m] }))
            )
        } catch {
            setError("Failed to load dashboard data")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchDashboard()
    }, [fetchDashboard])

    if (loading) return <SuperAdminSkeleton />
    if (error) return <ErrorState message={error} onRetry={fetchDashboard} />

    return (
        <div className="space-y-10">

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black">Super Admin Dashboard</h1>
                    <p className="text-text-secondary mt-1">Global platform analytics overview</p>
                </div>
                <button
                    onClick={fetchDashboard}
                    className="flex items-center gap-2 text-sm text-text-secondary hover:text-gray-900 transition cursor-pointer"
                >
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <GradStatCard title="Agencies" value={stats!.agencies} icon={<Building size={18} />} color="indigo" />
                <GradStatCard title="Users" value={stats!.users} icon={<Users size={18} />} color="blue" />
                <GradStatCard title="Students" value={stats!.students} icon={<GraduationCap size={18} />} color="emerald" growth={stats!.studentsGrowth} />
                <GradStatCard title="Applications" value={stats!.applications} icon={<FileText size={18} />} color="purple" growth={stats!.applicationsGrowth} />
                <GradStatCard title="Universities" value={stats!.universities} icon={<Globe size={18} />} color="orange" />
                <GradStatCard title="Visa Cases" value={stats!.visas} icon={<FileCheck size={18} />} color="pink" />
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
                <ChartCard title="Students Growth">
                    {studentChart.length === 0 ? (
                        <ChartEmpty />
                    ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={studentChart}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Line type="monotone" dataKey="students" stroke="#6366F1" strokeWidth={3} dot={{ fill: "#6366F1" }} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>
                <ChartCard title="Applications Trend">
                    {applicationChart.length === 0 ? (
                        <ChartEmpty />
                    ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={applicationChart}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Line type="monotone" dataKey="applications" stroke="#22C55E" strokeWidth={3} dot={{ fill: "#22C55E" }} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>
            </div>

            {/* Bottom Grid */}
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

                {/* Top Agencies */}
                <SectionCard title="Top Agencies by Students">
                    {topAgencies.length === 0 ? (
                        <SectionEmpty message="No student data yet" />
                    ) : (
                        <div className="space-y-3">
                            {topAgencies.map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-xs font-bold text-text-secondary w-5">{i + 1}.</span>
                                        <span className="font-semibold text-sm truncate">{item.name}</span>
                                    </div>
                                    <span className="text-xs text-text-secondary shrink-0">{item.students} students</span>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>

                {/* Recent Students */}
                <SectionCard title="Recent Students">
                    {recentStudents.length === 0 ? (
                        <SectionEmpty message="No students registered yet" />
                    ) : (
                        <div className="space-y-3">
                            {recentStudents.map((s, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <span className="font-semibold text-sm">
                                        {s.first_name} {s.last_name}
                                    </span>
                                    <span className="text-xs text-text-secondary">
                                        {new Date(s.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>

                {/* Recent Agencies */}
                <SectionCard title="Recent Agencies">
                    {recentAgencies.length === 0 ? (
                        <SectionEmpty message="No agencies registered yet" />
                    ) : (
                        <div className="space-y-3">
                            {recentAgencies.map((a) => (
                                <div key={a.id} className="flex items-center justify-between">
                                    <span className="font-semibold text-sm">{a.name}</span>
                                    <span className="text-xs text-text-secondary">
                                        {new Date(a.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>

                {/* Recent Applications */}
                <SectionCard title="Recent Applications">
                    {recentApplications.length === 0 ? (
                        <SectionEmpty message="No applications submitted yet" />
                    ) : (
                        <div className="space-y-3">
                            {recentApplications.map((app) => {
                                const s = app.students?.[0]
                                return (
                                    <div key={app.id}>
                                        <p className="font-semibold text-sm">
                                            {s?.first_name} {s?.last_name || "Unknown"}
                                        </p>
                                        <p className="text-xs text-text-secondary truncate">{app.university_name}</p>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </SectionCard>

            </div>
        </div>
    )
}

/* ---------- Sub-components ---------- */

function GradStatCard({
    title,
    value,
    icon,
    color,
    growth,
}: {
    title: string
    value: number
    icon: React.ReactNode
    color: "indigo" | "blue" | "emerald" | "purple" | "orange" | "pink"
    growth?: number
}) {

    const gradients: Record<string, string> = {
        indigo: "from-indigo-500 to-indigo-600",
        blue: "from-blue-500 to-blue-600",
        emerald: "from-emerald-500 to-emerald-600",
        purple: "from-purple-500 to-purple-600",
        orange: "from-orange-500 to-orange-600",
        pink: "from-pink-500 to-pink-600",
    }

    return (
        <div className={`relative overflow-hidden rounded-xl p-4 text-white shadow bg-gradient-to-r ${gradients[color]} hover:scale-[1.02] transition`}>
            <div className="absolute -right-4 -top-4 opacity-20">
                <div className="w-16 h-16 bg-white rounded-full blur-2xl" />
            </div>
            <div className="relative z-10">
                <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase font-semibold opacity-90">{title}</p>
                    <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">{icon}</div>
                </div>
                <p className="text-2xl font-black mt-1">{value.toLocaleString()}</p>
                {growth !== undefined && (
                    <p className={`text-[10px] mt-1 flex items-center gap-0.5 ${growth >= 0 ? "text-green-200" : "text-red-200"}`}>
                        {growth >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                        {growth >= 0 ? "+" : ""}{growth}% this month
                    </p>
                )}
            </div>
        </div>
    )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="font-bold text-lg">{title}</h3>
            </div>
            <div className="p-6">{children}</div>
        </div>
    )
}

function ChartEmpty() {
    return (
        <div className="flex flex-col items-center justify-center h-[260px] text-center text-text-secondary">
            <TrendingUp size={32} className="text-gray-300 mb-2" />
            <p className="text-sm">No chart data available yet</p>
            <p className="text-xs mt-1">Data will appear once students and applications are created</p>
        </div>
    )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="px-5 py-3 border-b border-gray-200">
                <h3 className="font-bold text-sm">{title}</h3>
            </div>
            <div className="p-5">{children}</div>
        </div>
    )
}

function SectionEmpty({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle size={24} className="text-gray-300 mb-2" />
            <p className="text-sm text-text-secondary">{message}</p>
        </div>
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

function SuperAdminSkeleton() {
    return (
        <div className="space-y-10 animate-pulse">
            <div className="h-8 w-64 bg-gray-200 rounded" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-28 bg-gray-200 rounded-xl" />
                ))}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="h-80 bg-gray-200 rounded-xl" />
                <div className="h-80 bg-gray-200 rounded-xl" />
            </div>
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-48 bg-gray-200 rounded-xl" />
                ))}
            </div>
        </div>
    )
}
