"use client"

import { UserPlus } from "lucide-react"
import Link from "next/link"

export default function StudentsHeader({ count }: { count: number }) {
    return (
        <div className="flex items-end justify-between">
            <div>
                <h2 className="text-3xl font-black tracking-tight">
                    Students
                </h2>
                <p className="text-text-secondary mt-1">
                    Manage and track your {count} student profiles
                </p>
            </div>

            <Link
                href="/dashboard/students/new"
                className="bg-[var(--color-primary)] text-white rounded-md px-6 py-2.5 text-sm font-bold flex items-center gap-2 shadow-md hover:opacity-90 transition"
            >
                <UserPlus size={18} />
                Add Student
            </Link>
        </div>
    )
}