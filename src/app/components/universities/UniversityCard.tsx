"use client"

import Link from "next/link"
import { MapPin } from "lucide-react"

export default function UniversityCard({ university }: any) {

    const getInitials = (name: string) => {
        if (!name) return "U"
        const words = name.split(" ")
        return words.length === 1
            ? words[0][0].toUpperCase()
            : (words[0][0] + words[1][0]).toUpperCase()
    }

    return (
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-md transition group">

            {/* 🔹 Banner Section */}
            <div className="relative h-40 bg-gray-100">

                {university.banner_url ? (
                    <img
                        src={university.banner_url}
                        alt={university.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-600 text-sm font-medium">
                        No Banner Image
                    </div>
                )}

                {/* Ranking Badge */}
                {university.ranking && (
                    <div className="absolute top-3 right-3 bg-[var(--color-primary)] text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                        Rank #{university.ranking}
                    </div>
                )}
            </div>

            {/* 🔹 Body */}
            <div className="p-5 space-y-3">

                <div className="flex items-center gap-3">

                    {/* Logo OR Initials */}
                    {university.logo_url ? (
                        <img
                            src={university.logo_url}
                            alt="logo"
                            className="w-12 h-12 rounded-xl object-contain bg-white p-2 border border-border"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                            {getInitials(university.name)}
                        </div>
                    )}

                    <div>
                        <h3 className="font-semibold text-lg leading-tight">
                            {university.name}
                        </h3>

                        <div className="flex items-center gap-1 text-xs text-text-secondary mt-1">
                            <MapPin size={12} />
                            {university.city
                                ? `${university.city}, ${university.country}`
                                : university.country}
                        </div>
                    </div>
                </div>

                {/* Program Tags */}
                {university.program_levels?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {university.program_levels.map((level: string) => (
                            <span
                                key={level}
                                className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full"
                            >
                                {level}
                            </span>
                        ))}
                    </div>
                )}

                <Link
                    href={`/dashboard/universities/${university.id}`}
                    className="inline-block text-sm font-semibold text-[var(--color-primary)] mt-2 group-hover:underline"
                >
                    View Details →
                </Link>

            </div>

        </div>
    )
}