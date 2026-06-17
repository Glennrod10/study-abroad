
import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Sidebar from "../components/dashboard/Sidebar"
import Topbar from "../components/dashboard/Topbar"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getAuthSession()

    if (!session) {
        redirect("/login")
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