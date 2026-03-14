"use client"

import { useState } from "react"
import StudentRow from "./StudentRow"
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import { toast } from "sonner"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function StudentsTable({ students }: { students: any[] }) {

    const [selected, setSelected] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    /* ---------------- PAGINATION ---------------- */

    const [page, setPage] = useState(1)
    const perPage = 10

    const totalPages = Math.ceil(students.length / perPage)

    const start = (page - 1) * perPage
    const end = start + perPage

    const paginatedStudents = students.slice(start, end)

    /* ---------------- PAGINATION WINDOW ---------------- */

    const maxVisiblePages = 5

    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2))
    let endPage = startPage + maxVisiblePages - 1

    if (endPage > totalPages) {
        endPage = totalPages
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    const visiblePages: number[] = []

    for (let i = startPage; i <= endPage; i++) {
        visiblePages.push(i)
    }

    /* ---------------- EMPTY STATE ---------------- */

    if (!students || students.length === 0) {
        return (
            <div className="bg-white border border-border rounded-xl p-12 text-center shadow-sm">
                <p className="text-text-secondary text-sm">
                    No students match your filters.
                </p>
            </div>
        )
    }

    /* ---------------- SELECT ---------------- */

    const toggleSelect = (id: string) => {

        if (selected.includes(id)) {
            setSelected(selected.filter((i) => i !== id))
        } else {
            setSelected([...selected, id])
        }

    }

    const toggleSelectAll = () => {

        const pageIds = paginatedStudents.map((s) => s.id)

        if (pageIds.every((id) => selected.includes(id))) {

            setSelected(selected.filter((id) => !pageIds.includes(id)))

        } else {

            setSelected([...new Set([...selected, ...pageIds])])

        }

    }

    /* ---------------- BULK DELETE ---------------- */

    const bulkDelete = async () => {

        if (selected.length === 0) return

        if (!confirm(`Delete ${selected.length} students?`)) return

        setLoading(true)

        const { error } = await supabase
            .from("students")
            .delete()
            .in("id", selected)

        if (error) {

            toast.error("Failed to delete students")

        } else {

            toast.success(`${selected.length} students deleted`)

            window.location.reload()

        }

        setLoading(false)

    }

    return (

        <div className="space-y-4">

            {/* BULK BAR */}

            {selected.length > 0 && (

                <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-4 py-3">

                    <p className="text-sm font-semibold">
                        {selected.length} selected
                    </p>

                    <div className="flex gap-4">

                        <button
                            onClick={() => setSelected([])}
                            className="text-sm text-gray-600 cursor-pointer"
                        >
                            Cancel
                        </button>

                        <button
                            disabled={loading}
                            onClick={bulkDelete}
                            className="flex items-center gap-2 text-sm font-semibold text-red-600 cursor-pointer"
                        >
                            <Trash2 size={16} />
                            Delete Selected
                        </button>

                    </div>

                </div>

            )}

            {/* TABLE */}

            <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">

                <table className="w-full text-left">

                    <thead className="bg-gray-50 border-b border-border">

                        <tr>

                            <th className="px-6 py-4 w-[40px]">

                                <input
                                    type="checkbox"
                                    checked={
                                        paginatedStudents.length > 0 &&
                                        paginatedStudents.every((s) => selected.includes(s.id))
                                    }
                                    onChange={toggleSelectAll}
                                    className="cursor-pointer"
                                />

                            </th>

                            <th className="px-6 py-4 text-xs font-bold uppercase">
                                Student
                            </th>

                            <th className="px-6 py-4 text-xs font-bold uppercase">
                                Email
                            </th>

                            <th className="px-6 py-4 text-xs font-bold uppercase">
                                Assigned Staff
                            </th>

                            <th className="px-6 py-4 text-xs font-bold uppercase">
                                Status
                            </th>

                            <th className="px-6 py-4 text-xs font-bold uppercase text-right">
                                Actions
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {paginatedStudents.map((student) => (

                            <StudentRow
                                key={student.id}
                                student={student}
                                selected={selected.includes(student.id)}
                                toggleSelect={toggleSelect}
                            />

                        ))}

                    </tbody>

                </table>

            </div>

            {/* PAGINATION */}

            <div className="flex items-center justify-between">

                <p className="text-sm text-text-secondary">
                    Showing {start + 1} – {Math.min(end, students.length)} of {students.length}
                </p>

                <div className="flex items-center gap-2">

                    {/* PREVIOUS */}

                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="h-9 w-9 flex items-center justify-center rounded-lg border border-border hover:bg-gray-50 disabled:opacity-40"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    {/* FIRST PAGE */}

                    {startPage > 1 && (
                        <>
                            <button
                                onClick={() => setPage(1)}
                                className="h-9 w-9 rounded-lg border border-border hover:bg-gray-50"
                            >
                                1
                            </button>

                            {startPage > 2 && (
                                <span className="px-2 text-sm text-gray-400">...</span>
                            )}
                        </>
                    )}

                    {/* PAGE WINDOW */}

                    {visiblePages.map((p) => (

                        <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`
                            h-9 w-9 rounded-lg text-sm font-medium
                            ${page === p
                                    ? "bg-[var(--color-primary)] text-white"
                                    : "border border-border hover:bg-gray-50"}
                            `}
                        >
                            {p}
                        </button>

                    ))}

                    {/* LAST PAGE */}

                    {endPage < totalPages && (
                        <>
                            {endPage < totalPages - 1 && (
                                <span className="px-2 text-sm text-gray-400">...</span>
                            )}

                            <button
                                onClick={() => setPage(totalPages)}
                                className="h-9 w-9 rounded-lg border border-border hover:bg-gray-50"
                            >
                                {totalPages}
                            </button>
                        </>
                    )}

                    {/* NEXT */}

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="h-9 w-9 flex items-center justify-center rounded-lg border border-border hover:bg-gray-50 disabled:opacity-40"
                    >
                        <ChevronRight size={16} />
                    </button>

                </div>

            </div>

        </div>

    )

}