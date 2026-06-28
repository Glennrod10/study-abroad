"use client"

import { useState, useEffect } from "react"
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
    FolderOpen,
    PanelLeftClose,
    PanelLeftOpen,
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
        name: "Documents",
        href: "/dashboard/documents",
        roles: ["admin", "counsellor"],
        icon: FolderOpen,
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
    const [collapsed, setCollapsed] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem("sidebar-collapsed")
        if (saved === "true") setCollapsed(true)
    }, [])

    useEffect(() => {
        localStorage.setItem("sidebar-collapsed", String(collapsed))
    }, [collapsed])

    const pathname = usePathname()
    const { data: session } = useSession()

    const role = (session?.user as any)?.role

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
            className={`${collapsed ? "w-[72px]" : "w-[280px]"} border-r border-gray-200 flex flex-col justify-between transition-all duration-300`}
            style={{ backgroundColor: "var(--color-sidebar-bg)" }}
        >
            <div>
                <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} p-4 gap-2`}>
                    <div className="text-xl font-semibold">
                        {collapsed ? (
                            <span className="text-indigo-600 font-bold text-2xl">S</span>
                        ) : (
                            "StudyAbroad"
                        )}
                    </div>
                    <button
                        onClick={() => setCollapsed((c) => !c)}
                        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        className="h-8 w-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer shrink-0"
                    >
                        {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                    </button>
                </div>

                <nav className="space-y-2 px-3">
                    {filteredNavItems.map((item) => {

                        const active = isActive(item.href)
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                title={collapsed ? item.name : undefined}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-medium transition-all whitespace-nowrap
                                ${active
                                        ? "bg-indigo-50 text-indigo-700 border-r-[4px] border-indigo-600"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-r-[4px] border-transparent"
                                    }
                                ${collapsed ? "justify-center px-0" : ""}`}
                            >
                                <Icon size={20} className={`shrink-0 ${active ? "text-indigo-600" : "text-gray-500"}`} />
                                {!collapsed && <span>{item.name}</span>}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="p-3">
                {!collapsed && (
                    <button
                        className="w-full h-11 rounded-sm text-white cursor-pointer text-sm"
                        style={{ backgroundColor: "var(--color-primary)" }}
                    >
                        + New Application
                    </button>
                )}
            </div>
        </aside>
    )
}