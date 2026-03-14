"use client"

import { useSession } from "next-auth/react"
import AdminDashboard from "@/app/components/dashboard/AdminDashboard"
import CounsellorDashboard from "@/app/components/dashboard/CounsellorDashboard"
import SuperAdminDashboard from "@/app/components/dashboard/SuperAdminDashboard"

export default function DashboardPage() {

    const { data: session, status } = useSession()

    if (status === "loading") {
        return (
            <div className="p-6">
                Loading dashboard...
            </div>
        )
    }

    const role = session?.user?.role

    if (role === "superadmin") {
        return <SuperAdminDashboard />
    }

    if (role === "admin") {
        return <AdminDashboard />
    }

    if (role === "counsellor") {
        return <CounsellorDashboard />
    }

    return (
        <div className="p-6">
            Unauthorized
        </div>
    )
}