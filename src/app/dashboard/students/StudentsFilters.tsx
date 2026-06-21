"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Search, Filter, ChevronDown, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export default function StudentsFilters() {

    const router = useRouter()
    const searchParams = useSearchParams()

    const statuses = ["All", "Applied", "Offer Letter", "Visa Pending", "Enrolled"]

    const [search, setSearch] = useState(searchParams.get("q") || "")
    const [status, setStatus] = useState(searchParams.get("status") || "All")
    const [open, setOpen] = useState(false)

    const dropdownRef = useRef<HTMLDivElement | null>(null)

    /* ---------------- SEARCH DEBOUNCE ---------------- */

    useEffect(() => {

        const delay = setTimeout(() => {
            applyFilters(search, status)
        }, 400)

        return () => clearTimeout(delay)

    }, [search])

    /* ---------------- STATUS CHANGE ---------------- */

    useEffect(() => {

        applyFilters(search, status)

    }, [status])

    /* ---------------- CLOSE DROPDOWN OUTSIDE ---------------- */

    useEffect(() => {

        const handleClickOutside = (event: MouseEvent) => {

            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setOpen(false)
            }

        }

        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false)
        }

        document.addEventListener("mousedown", handleClickOutside)
        document.addEventListener("keydown", handleEsc)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            document.removeEventListener("keydown", handleEsc)
        }

    }, [])

    const applyFilters = (q: string, s: string) => {

        const params = new URLSearchParams()

        if (q) params.set("q", q)
        if (s && s !== "All") params.set("status", s)

        router.push(`/dashboard/students?${params.toString()}`)

    }

    return (

        <div className="flex flex-wrap items-center gap-4">

            {/* SEARCH INPUT */}

            <div className="flex-1 min-w-[260px] relative">

                <Search
                    size={16}
                    className="absolute left-4 top-3.5 text-text-secondary"
                />

                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search students by name or email..."
                    className="
                    w-full
                    pl-10
                    pr-10
                    h-11
                    rounded-lg
                    bg-gray-50
                    border border-gray-200
                    text-sm
                    transition
                    focus:outline-none
                    focus:bg-white
                    focus:ring-2
                    focus:ring-[var(--color-primary-light)]
                    focus:border-[var(--color-primary)]
                    "
                />

                {search && (

                    <button
                        onClick={() => {
                            setSearch("")
                            applyFilters("", status)
                        }}
                        className="
                        absolute
                        right-3
                        top-3
                        text-gray-400
                        hover:text-gray-600
                        transition
                        cursor-pointer
                        "
                    >
                        <X size={16} />
                    </button>

                )}

            </div>

            {/* STATUS FILTER */}

            <div ref={dropdownRef} className="relative">

                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        setOpen(!open)
                    }}
                    className="
                    flex items-center gap-2
                    h-11 px-4
                    rounded-xl
                    bg-gray-50
                    border border-gray-200
                    text-sm font-medium
                    hover:bg-gray-100
                    transition
                    cursor-pointer
                    "
                >
                    <Filter size={16} />
                    {status}

                    <ChevronDown size={16} className="text-gray-400" />
                </button>

                {open && (

                    <div
                        className="
                        absolute left-0 top-full mt-2
                        min-w-full
                        w-max
                        max-w-[220px]
                        bg-white
                        rounded-xl
                        shadow-lg
                        border border-gray-200
                        overflow-hidden
                        z-50
                        "
                    >

                        {statuses.map((s) => (

                            <button
                                key={s}
                                onClick={() => {
                                    setStatus(s)
                                    setOpen(false)
                                }}
                                className={`
                                w-full
                                text-left
                                px-4 py-2.5
                                text-sm
                                flex items-center justify-between
                                hover:bg-gray-50
                                transition
                                cursor-pointer
                                ${status === s ? "bg-gray-100 font-medium" : ""}
                                `}
                            >
                                {s}
                            </button>

                        ))}

                    </div>

                )}

            </div>

        </div>

    )
}