"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/app/lib/supabase"
import {
    Building,
    Users,
    GraduationCap,
    FileText,
    Globe,
    FileCheck
} from "lucide-react"

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from "recharts"

export default function SuperAdminDashboard() {

    const [stats, setStats] = useState({
        agencies: 0,
        users: 0,
        students: 0,
        applications: 0,
        universities: 0,
        visas: 0
    })

    const [recentApplications, setRecentApplications] = useState<any[]>([])
    const [recentAgencies, setRecentAgencies] = useState<any[]>([])
    const [topAgencies, setTopAgencies] = useState<any[]>([])
    const [recentStudents, setRecentStudents] = useState<any[]>([])
    const [studentChart, setStudentChart] = useState<any[]>([])
    const [applicationChart, setApplicationChart] = useState<any[]>([])

    useEffect(() => {
        fetchDashboard()
    }, [])

    const fetchDashboard = async () => {

        const { data: agencies } = await supabase
            .from("agencies")
            .select("id,name,created_at")

        const { data: users } = await supabase
            .from("users")
            .select("id")

        const { data: students } = await supabase
            .from("students")
            .select("id,agency_id,created_at")

        const { data: applications } = await supabase
            .from("applications")
            .select("id,created_at,university_name,intake,students(first_name,last_name)")
            .order("created_at", { ascending: false })
            .limit(5)

        const { data: allApplications } = await supabase
            .from("applications")
            .select("created_at")

        const { data: universities } = await supabase
            .from("universities")
            .select("id")

        const { data: visas } = await supabase
            .from("visa_applications")
            .select("id")

        setStats({
            agencies: agencies?.length || 0,
            users: users?.length || 0,
            students: students?.length || 0,
            applications: allApplications?.length || 0,
            universities: universities?.length || 0,
            visas: visas?.length || 0
        })

        setRecentApplications(applications || [])

        setRecentAgencies(
            agencies
                ?.sort(
                    (a: any, b: any) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                )
                .slice(0, 5) || []
        )

        /* ---------- Top Agencies ---------- */

        const agencyCount: any = {}

        students?.forEach((s: any) => {
            agencyCount[s.agency_id] = (agencyCount[s.agency_id] || 0) + 1
        })

        const top = Object.entries(agencyCount)
            .sort((a: any, b: any) => b[1] - a[1])
            .slice(0, 5)

        const topAgencyList = top.map(([id, count]) => ({
            name: agencies?.find((a: any) => a.id === id)?.name,
            students: count
        }))

        setTopAgencies(topAgencyList)

        /* ---------- Recent Students ---------- */

        const { data: studentsRecent } = await supabase
            .from("students")
            .select("first_name,last_name,created_at")
            .order("created_at", { ascending: false })
            .limit(5)

        setRecentStudents(studentsRecent || [])

        /* ---------- Students Chart ---------- */

        const studentMonthly: any = {}

        students?.forEach((s: any) => {

            const month = new Date(s.created_at).toLocaleString("default", {
                month: "short"
            })

            studentMonthly[month] = (studentMonthly[month] || 0) + 1
        })

        const studentChartData = Object.keys(studentMonthly).map((m) => ({
            month: m,
            students: studentMonthly[m]
        }))

        setStudentChart(studentChartData)

        /* ---------- Applications Chart ---------- */

        const appMonthly: any = {}

        allApplications?.forEach((a: any) => {

            const month = new Date(a.created_at).toLocaleString("default", {
                month: "short"
            })

            appMonthly[month] = (appMonthly[month] || 0) + 1
        })

        const applicationChartData = Object.keys(appMonthly).map((m) => ({
            month: m,
            applications: appMonthly[m]
        }))

        setApplicationChart(applicationChartData)
    }

    return (
        <div className="space-y-10">

            <div>
                <h1 className="text-3xl font-black">
                    Super Admin Dashboard
                </h1>

                <p className="text-text-secondary mt-1">
                    Global platform analytics overview
                </p>
            </div>

            {/* ---------- Stats ---------- */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-6">

                <StatCard title="Agencies" value={stats.agencies} icon={<Building size={20} />} />
                <StatCard title="Users" value={stats.users} icon={<Users size={20} />} />
                <StatCard title="Students" value={stats.students} icon={<GraduationCap size={20} />} />
                <StatCard title="Applications" value={stats.applications} icon={<FileText size={20} />} />
                <StatCard title="Universities" value={stats.universities} icon={<Globe size={20} />} />
                <StatCard title="Visa Cases" value={stats.visas} icon={<FileCheck size={20} />} />

            </div>

            {/* ---------- Charts ---------- */}

            <div className="grid md:grid-cols-2 gap-6">

                <ChartCard title="Students Growth">

                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={studentChart}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="students"
                                stroke="#6366F1"
                                strokeWidth={3}
                            />
                        </LineChart>
                    </ResponsiveContainer>

                </ChartCard>

                <ChartCard title="Applications Trend">

                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={applicationChart}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="applications"
                                stroke="#22C55E"
                                strokeWidth={3}
                            />
                        </LineChart>
                    </ResponsiveContainer>

                </ChartCard>

            </div>

            {/* ---------- Existing Sections ---------- */}

            <AnalyticsGrid
                title="Top Agencies by Students"
                items={topAgencies}
                label="students"
            />

            <RecentList
                title="Recent Students"
                items={recentStudents}
                render={(s: any) => `${s.first_name} ${s.last_name}`}
            />

            <RecentList
                title="Recent Agencies"
                items={recentAgencies}
                render={(a: any) => a.name}
            />

            <RecentApplications applications={recentApplications} />

        </div>
    )
}

/* ---------- Components ---------- */
function StatCard({ title, value, icon }: any) {

    const colors: any = {
        Agencies: "from-indigo-500 to-indigo-600",
        Users: "from-blue-500 to-blue-600",
        Students: "from-emerald-500 to-emerald-600",
        Applications: "from-purple-500 to-purple-600",
        Universities: "from-orange-500 to-orange-600",
        "Visa Cases": "from-pink-500 to-pink-600"
    }

    return (
        <div className={`relative overflow-hidden rounded-xl p-6 text-white shadow-lg bg-gradient-to-r ${colors[title]} hover:scale-[1.02] transition`}>

            {/* Background Glow */}
            <div className="absolute -right-6 -top-6 opacity-20">
                <div className="w-24 h-24 bg-white rounded-full blur-2xl"></div>
            </div>

            <div className="flex items-center justify-between relative z-10">

                <div>
                    <p className="text-xs uppercase font-semibold opacity-90">
                        {title}
                    </p>

                    <h3 className="text-3xl font-black mt-1">
                        {value}
                    </h3>
                </div>

                <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                    {icon}
                </div>

            </div>

        </div>
    )
}

function ChartCard({ title, children }: any) {

    return (
        <div className="bg-white border border-border rounded-xl shadow-sm">

            <div className="px-6 py-4 border-b border-border">
                <h3 className="font-bold text-lg">{title}</h3>
            </div>

            <div className="p-6">{children}</div>

        </div>
    )
}

function AnalyticsGrid({ title, items, label }: any) {

    return (
        <div className="bg-white border border-border rounded-xl shadow-sm">

            <div className="px-6 py-4 border-b border-border">
                <h3 className="font-bold text-lg">{title}</h3>
            </div>

            <div className="p-6 space-y-3">

                {items.map((item: any, i: number) => (

                    <div key={i} className="flex justify-between border-b pb-2">

                        <span className="font-semibold">
                            {item.name}
                        </span>

                        <span className="text-sm text-text-secondary">
                            {item[label]} {label}
                        </span>

                    </div>

                ))}

            </div>

        </div>
    )
}

function RecentList({ title, items, render }: any) {

    return (
        <div className="bg-white border border-border rounded-xl shadow-sm">

            <div className="px-6 py-4 border-b border-border">
                <h3 className="font-bold text-lg">{title}</h3>
            </div>

            <div className="p-6 space-y-3">

                {items.map((item: any, i: number) => (

                    <div key={i} className="flex justify-between border-b pb-2">

                        <span className="font-semibold">
                            {render(item)}
                        </span>

                        <span className="text-sm text-text-secondary">
                            {new Date(item.created_at).toLocaleDateString()}
                        </span>

                    </div>

                ))}

            </div>

        </div>
    )
}

function RecentApplications({ applications }: any) {

    return (
        <div className="bg-white border border-border rounded-xl shadow-sm">

            <div className="px-6 py-4 border-b border-border">
                <h3 className="font-bold text-lg">
                    Recent Applications
                </h3>
            </div>

            <div className="p-6 space-y-3">

                {applications.map((app: any) => (

                    <div
                        key={app.id}
                        className="flex justify-between border-b pb-2"
                    >

                        <div>

                            <p className="font-semibold">
                                {app.students?.first_name}{" "}
                                {app.students?.last_name}
                            </p>

                            <p className="text-sm text-text-secondary">
                                {app.university_name}
                            </p>

                        </div>

                        <span className="text-sm text-text-secondary">
                            {app.intake}
                        </span>

                    </div>

                ))}

            </div>

        </div>
    )
}