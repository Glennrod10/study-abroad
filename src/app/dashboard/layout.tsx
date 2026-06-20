
import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import Sidebar from "../components/dashboard/Sidebar"
import Topbar from "../components/dashboard/Topbar"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getAuthSession()

    if (!session) {
        redirect("/login")
    }

    const { count: counsellorCount } = await supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("agency_id", session.user.agency_id)
        .eq("role", "counsellor")

    const { count: studentCount } = await supabase
        .from("students")
        .select("id", { count: "exact", head: true })
        .eq("agency_id", session.user.agency_id)

    if (counsellorCount === 0 && studentCount === 0 && session.user.role === "admin") {
        redirect("/dashboard/onboarding")
    }

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                <Topbar />
                <main className="p-8 max-w-content w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}