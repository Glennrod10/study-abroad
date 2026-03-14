"use client"

import { Award, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

const COUNTRIES = [
    "United Kingdom",
    "United States",
    "Australia",
    "Canada",
    "Germany",
    "Ireland",
    "Netherlands",
    "New Zealand",
]

const YEARS = ["2024", "2025", "2026", "2027"]

export default function UniversityFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [q, setQ] = useState(searchParams.get("q") || "")
    const [country, setCountry] = useState(searchParams.get("country") || "")
    const [year, setYear] = useState(searchParams.get("year") || "")

    const [minRank, setMinRank] = useState(
        Number(searchParams.get("minRank") || 1)
    )
    const [maxRank, setMaxRank] = useState(
        Number(searchParams.get("maxRank") || 150)
    )

    useEffect(() => {
        const timeout = setTimeout(() => {
            const params = new URLSearchParams()

            if (q) params.set("q", q)
            if (country) params.set("country", country)
            if (year) params.set("year", year)

            if (minRank !== 1) params.set("minRank", String(minRank))
            if (maxRank !== 150) params.set("maxRank", String(maxRank))

            router.push(`/dashboard/universities?${params.toString()}`)
        }, 400)

        return () => clearTimeout(timeout)
    }, [q, country, year, minRank, maxRank])

    const clearAll = () => {
        setQ("")
        setCountry("")
        setYear("")
        setMinRank(1)
        setMaxRank(150)

        router.push("/dashboard/universities")
    }

    return (
        <div className="bg-white border border-border rounded-xl p-5 flex flex-wrap gap-6 items-center shadow-sm">

            {/* Search */}
            <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search university..."
                className="h-10 px-4 border border-border rounded-lg text-sm min-w-[200px]"
            />

            {/* Country */}
            <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="h-10 px-4 border border-border rounded-lg text-sm"
            >
                <option value="">All Countries</option>
                {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                        {c}
                    </option>
                ))}
            </select>

            {/* Intake Year */}
            <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="h-10 px-4 border border-border rounded-lg text-sm"
            >
                <option value="">All Intake Years</option>
                {YEARS.map((y) => (
                    <option key={y} value={y}>
                        {y}
                    </option>
                ))}
            </select>

            {/* Ranking Slider */}
            <div className="flex flex-col gap-3 min-w-[260px]">
                <label className="text-sm font-medium">
                    Rank: {minRank} – {maxRank}
                </label>

                <div className="relative h-8 flex items-center">

                    {/* Background Track */}
                    <div className="absolute w-full h-1 bg-gray-200 rounded-full" />

                    {/* Active Range Track */}
                    <div
                        className="absolute h-1 bg-[var(--color-primary)] rounded-full"
                        style={{
                            left: `${((minRank - 1) / 149) * 100}%`,
                            right: `${100 - ((maxRank - 1) / 149) * 100}%`,
                        }}
                    />

                    {/* Min Slider */}
                    <input
                        type="range"
                        min="1"
                        max="150"
                        value={minRank}
                        onChange={(e) =>
                            setMinRank(Math.min(Number(e.target.value), maxRank - 1))
                        }
                        className="absolute w-full appearance-none bg-transparent pointer-events-none
                                [&::-webkit-slider-thumb]:pointer-events-auto
                                [&::-webkit-slider-thumb]:appearance-none
                                [&::-webkit-slider-thumb]:h-4
                                [&::-webkit-slider-thumb]:w-4
                                [&::-webkit-slider-thumb]:rounded-full
                                [&::-webkit-slider-thumb]:bg-[var(--color-primary)]
                                [&::-webkit-slider-thumb]:cursor-pointer"
                    />

                    {/* Max Slider */}
                    <input
                        type="range"
                        min="1"
                        max="150"
                        value={maxRank}
                        onChange={(e) =>
                            setMaxRank(Math.max(Number(e.target.value), minRank + 1))
                        }
                        className="absolute w-full appearance-none bg-transparent pointer-events-none
        [&::-webkit-slider-thumb]:pointer-events-auto
        [&::-webkit-slider-thumb]:appearance-none
        [&::-webkit-slider-thumb]:h-4
        [&::-webkit-slider-thumb]:w-4
        [&::-webkit-slider-thumb]:rounded-full
        [&::-webkit-slider-thumb]:bg-[var(--color-primary)]
        [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                </div>
            </div>

            {/* Clear */}
            <button
                onClick={clearAll}
                className="flex items-center gap-2 h-10 px-4 border border-red-500 text-red-500 rounded-lg text-sm font-medium hover:bg-red-50 transition cursor-pointer"
            >
                <X size={14} />
                Clear
            </button>

        </div>
    )
}