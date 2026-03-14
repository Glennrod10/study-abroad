"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
    LayoutDashboard,
    Building2,
    Users,
    FileText,
    GraduationCap,
    Plane,
    UserSquare2,
    ListTodo,
    PieChart,
    LucideIcon
} from "lucide-react"

type NavItem = {
    name: string
    href: string
    roles: string[]
    icon: LucideIcon
}

const navItems: NavItem[] = [
    {
        name: "Dashboard",
        href: "/dashboard",
        roles: ["superadmin", "admin", "counsellor"],
        icon: LayoutDashboard,
    },
    {
        name: "Agencies",
        href: "/dashboard/agencies",
        roles: ["superadmin"],
        icon: Building2,
    },
    {
        name: "Students",
        href: "/dashboard/students",
        roles: ["admin", "counsellor"],
        icon: Users,
    },
    {
        name: "Applications",
        href: "/dashboard/applications",
        roles: ["admin", "counsellor"],
        icon: FileText,
    },
    {
        name: "Universities",
        href: "/dashboard/universities",
        roles: ["admin", "counsellor"],
        icon: GraduationCap,
    },
    {
        name: "Visa Tracking",
        href: "/dashboard/visa",
        roles: ["admin", "counsellor"],
        icon: Plane,
    },
    {
        name: "Counsellors",
        href: "/dashboard/counsellors",
        roles: ["admin"],
        icon: UserSquare2,
    },
    {
        name: "Tasks",
        href: "/dashboard/tasks",
        roles: ["admin", "counsellor"],
        icon: ListTodo,
    },
    {
        name: "Leads",
        href: "/dashboard/leads",
        roles: ["admin", "counsellor"],
        icon: Users,
    },
    {
        name: "Reports",
        href: "/dashboard/reports",
        roles: ["admin"],
        icon: PieChart,
    },
]

export default function Sidebar() {

    const pathname = usePathname()
    const { data: session } = useSession()

    const role = session?.user?.role

    const isActive = (href: string) => {
        if (href === "/dashboard") {
            return pathname === "/dashboard"
        }

        return pathname.startsWith(href)
    }

    const filteredNavItems = navItems.filter((item) =>
        item.roles.includes(role ?? "")
    )

    return (
        <aside
            className="w-[280px] border-r border-border flex flex-col justify-between"
            style={{ backgroundColor: "var(--color-sidebar-bg)" }}
        >
            <div>
                <div className="p-6 text-xl font-semibold">
                    StudyAbroad CRM
                </div>

                <nav className="space-y-2 px-4">
                    {filteredNavItems.map((item) => {

                        const active = isActive(item.href)
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-medium transition-all
                                ${active
                                        ? "bg-indigo-50 text-indigo-700 border-r-[4px] border-indigo-600"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-r-[4px] border-transparent"
                                    }`}
                            >
                                <Icon size={20} className={active ? "text-indigo-600" : "text-gray-500"} />
                                <span>{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="p-4">
                <button
                    className="w-full h-11 rounded-sm text-white cursor-pointer"
                    style={{ backgroundColor: "var(--color-primary)" }}
                >
                    + New Application
                </button>
            </div>
        </aside>
    )
}