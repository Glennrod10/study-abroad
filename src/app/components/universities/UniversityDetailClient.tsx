"use client"

import { useState } from "react"
import Link from "next/link"

export default function UniversityDetailClient({
    university,
    programs,
}: any) {
    const [activeTab, setActiveTab] = useState("overview")

    return (
        <div className="space-y-8">

            {/* HERO SECTION */}
            <div className="relative bg-white border border-border rounded-2xl overflow-hidden shadow-sm">

                <div className="h-56 bg-gray-200">
                    {university.banner_url ? (
                        <img
                            src={university.banner_url}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Banner Uploaded
                        </div>
                    )}
                </div>

                <div className="p-6 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        {university.logo_url ? (
                            <img
                                src={university.logo_url}
                                className="w-16 h-16 rounded-lg border"
                            />
                        ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center font-bold text-lg">
                                {university.name.slice(0, 2).toUpperCase()}
                            </div>
                        )}

                        <div>
                            <h1 className="text-2xl font-bold">
                                {university.name}
                            </h1>
                            <p className="text-text-secondary text-sm">
                                {university.city}, {university.country}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Link
                            href={`/dashboard/applications/new?university=${university.id}`}
                            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-semibold"
                        >
                            Apply Now
                        </Link>
                    </div>
                </div>
            </div>

            {/* KPI SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="World Ranking" value={`#${university.ranking}`} />
                <StatCard
                    label="Default Commission"
                    value={`${university.default_commission_value}%`}
                />
                <StatCard
                    label="Total Programs"
                    value={programs.length}
                />
            </div>

            {/* TABS */}
            <div className="bg-white border border-border rounded-xl p-6">

                <div className="flex gap-6 border-b border-border pb-3 mb-6">
                    {["overview", "programs", "campus", "contact"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`text-sm font-medium capitalize ${activeTab === tab
                                ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] pb-2"
                                : "text-text-secondary"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* TAB CONTENT */}
                {activeTab === "overview" && (
                    <div className="space-y-4 text-sm text-text-secondary">
                        <p>{university.description || "No description available."}</p>
                    </div>
                )}

                {activeTab === "programs" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {programs.map((program: any) => (
                            <div
                                key={program.id}
                                className="border border-border rounded-xl p-4 space-y-2 hover:shadow-sm transition"
                            >
                                <h3 className="font-semibold">
                                    {program.name}
                                </h3>
                                <p className="text-sm text-text-secondary">
                                    {program.level} • {program.duration}
                                </p>
                                <p className="text-sm font-medium">
                                    ${program.tuition_fee}
                                </p>
                                <p className="text-xs text-text-secondary">
                                    Intake: {program.intake}
                                </p>

                                <Link
                                    href={`/dashboard/applications/new?university=${university.id}&program=${program.id}`}
                                    className="inline-block mt-2 text-sm text-[var(--color-primary)] font-medium"
                                >
                                    Apply for this Program →
                                </Link>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === "campus" && (
                    <div className="text-sm text-text-secondary">
                        Campus life details coming soon.
                    </div>
                )}

                {activeTab === "contact" && (
                    <div className="text-sm text-text-secondary space-y-2">
                        <p>Website: {university.website || "N/A"}</p>
                    </div>
                )}

            </div>

        </div>
    )
}

function StatCard({ label, value }: any) {
    return (
        <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
            <p className="text-sm text-text-secondary">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
    )
}