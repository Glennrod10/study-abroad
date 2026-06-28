"use client"

import { useState, useEffect } from "react"
import { Search, ChevronDown } from "lucide-react"
import AppDatePicker from "@/app/components/ui/AppDatePicker"

type Tag = { id: string; name: string; color: string }

export type FilterState = {
    search: string
    tags: string[]
    status: string
    dateFrom: string
    dateTo: string
}

export default function DocumentFilters({
    filters,
    onFilterChange,
}: {
    filters: FilterState
    onFilterChange: (filters: FilterState) => void
}) {
    const [tags, setTags] = useState<Tag[]>([])
    const [tagOpen, setTagOpen] = useState(false)
    const [statusOpen, setStatusOpen] = useState(false)

    useEffect(() => {
        fetch("/api/document-tags")
            .then(r => r.json())
            .then(d => setTags(d.tags || []))
    }, [])

    const [searchInput, setSearchInput] = useState(filters.search)

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== filters.search) {
                onFilterChange({ ...filters, search: searchInput })
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [searchInput])

    useEffect(() => {
        setSearchInput(filters.search)
    }, [filters.search])

    const update = (key: keyof FilterState, value: any) => {
        if (key === "search") {
            setSearchInput(value)
        } else {
            onFilterChange({ ...filters, [key]: value })
        }
    }

    const toggleTag = (id: string) => {
        const next = filters.tags.includes(id)
            ? filters.tags.filter(t => t !== id)
            : [...filters.tags, id]
        update("tags", next)
    }

    const statuses = ["", "Pending Review", "Approved", "Rejected"]

    return (
        <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                    type="text"
                    placeholder="Search student or document..."
                    value={searchInput}
                    onChange={e => update("search", e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
                />
            </div>

            <div className="relative">
                <button
                    onClick={() => setTagOpen(!tagOpen)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white hover:border-gray-300 cursor-pointer flex items-center gap-2"
                >
                    Tags {filters.tags.length > 0 && `(${filters.tags.length})`}
                </button>
                {tagOpen && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-3">
                        <p className="text-xs font-semibold text-text-secondary uppercase mb-2">Filter by tags</p>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                            {tags.map(tag => (
                                <label
                                    key={tag.id}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer text-sm"
                                >
                                    <input
                                        type="checkbox"
                                        checked={filters.tags.includes(tag.id)}
                                        onChange={() => toggleTag(tag.id)}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tag.color }} />
                                    {tag.name}
                                </label>
                            ))}
                            {tags.length === 0 && (
                                <p className="text-xs text-text-secondary">No tags created yet</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setStatusOpen(!statusOpen)}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white hover:border-gray-300 transition cursor-pointer min-w-[140px]"
                >
                    <span>{filters.status || "All Statuses"}</span>
                    <ChevronDown size={16} className="text-text-secondary ml-auto" />
                </button>
                {statusOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        {statuses.map(s => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => { update("status", s); setStatusOpen(false) }}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition cursor-pointer"
                            >
                                {s || "All Statuses"}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <AppDatePicker
                value={filters.dateFrom}
                onChange={v => update("dateFrom", v)}
                placeholder="From date"
            />

            <AppDatePicker
                value={filters.dateTo}
                onChange={v => update("dateTo", v)}
                placeholder="To date"
            />
        </div>
    )
}
