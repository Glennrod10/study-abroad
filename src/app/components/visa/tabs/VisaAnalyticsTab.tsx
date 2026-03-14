"use client"

import { useEffect, useState } from "react"

export default function VisaAnalyticsTab() {

    const [stats, setStats] = useState<any>(null)

    useEffect(() => {
        fetchAnalytics()
    }, [])

    const fetchAnalytics = async () => {

        const res = await fetch("/api/visa-analytics")

        if (!res.ok) return

        const data = await res.json()

        setStats(data)

    }

    if (!stats) {
        return <div className="p-6">Loading analytics...</div>
    }

    const successColor =
        stats.approvalRate >= 80
            ? "green"
            : stats.approvalRate >= 50
                ? "yellow"
                : "red"

    return (

        <div className="space-y-8">

            {/* Header */}

            <div>
                <h1 className="text-3xl font-black">
                    Visa Analytics
                </h1>
                <p className="text-sm text-text-secondary mt-2">
                    Insights into visa performance, approvals, and trends.
                </p>
            </div>

            {/* KPI CARDS */}

            <div className="grid grid-cols-4 gap-6">

                <StatCard
                    title="Total Visa Cases"
                    value={stats.total}
                    color="yellow"
                />

                <StatCard
                    title="Approved"
                    value={stats.approved}
                    color="green"
                />

                <StatCard
                    title="Rejected"
                    value={stats.rejected}
                    color="red"
                />

                <StatCard
                    title="Success Rate"
                    value={`${stats.approvalRate}%`}
                    color={successColor}
                />

                <StatCard
                    title="Countries Covered"
                    value={stats.countries.length}
                    color="yellow"
                />

                <StatCard
                    title="Under Processing"
                    value={stats.processing ?? 0}
                    color="yellow"
                />

                <StatCard
                    title="Upcoming Appointments"
                    value={stats.upcomingAppointments ?? 0}
                    color="green"
                />

                <StatCard
                    title="Rejection Risk"
                    value={`${100 - stats.approvalRate}%`}
                    color="red"
                />

            </div>

            {/* COUNTRY BREAKDOWN */}

            <div className="p-6 border rounded-xl bg-white shadow-sm">

                <h3 className="font-semibold mb-4">
                    Visa Distribution by Country
                </h3>

                <div className="space-y-2">

                    {stats.countries.map((c: any) => (

                        <div
                            key={c.country}
                            className="flex justify-between border-b pb-2"
                        >

                            <span className="font-medium">
                                {c.country}
                            </span>

                            <span className="text-gray-600">
                                {c.count}
                            </span>

                        </div>

                    ))}

                </div>

            </div>

            {/* STATUS BREAKDOWN */}

            <div className="p-6 border rounded-xl bg-white shadow-sm">

                <h3 className="font-semibold mb-4">
                    Visa Status Breakdown
                </h3>

                <div className="space-y-2">

                    {stats.statuses.map((s: any) => (

                        <div
                            key={s.status}
                            className="flex justify-between border-b pb-2"
                        >

                            <span className="font-medium">
                                {s.status}
                            </span>

                            <span className="text-gray-600">
                                {s.count}
                            </span>

                        </div>

                    ))}

                </div>

            </div>

            {/* INSIGHTS */}

            <div className="p-6 border rounded-xl bg-white shadow-sm">

                <h3 className="font-semibold mb-4">
                    Operational Insights
                </h3>

                <ul className="space-y-2 text-sm text-gray-600">

                    <li>
                        Approval Rate: <b>{stats.approvalRate}%</b>
                    </li>

                    <li>
                        Most popular destination:{" "}
                        <b>{stats.countries[0]?.country ?? "N/A"}</b>
                    </li>

                    <li>
                        Total countries served:{" "}
                        <b>{stats.countries.length}</b>
                    </li>

                    <li>
                        Current processing load:{" "}
                        <b>{stats.processing ?? 0} active visas</b>
                    </li>

                </ul>

            </div>

        </div>

    )

}


/* =========================
   STAT CARD COMPONENT
========================= */

function StatCard({
    title,
    value,
    color
}: {
    title: string
    value: number | string
    color: "green" | "red" | "yellow"
}) {

    const colorStyles = {
        green: "bg-green-50 text-green-700 border-green-200",
        red: "bg-red-50 text-red-700 border-red-200",
        yellow: "bg-yellow-50 text-yellow-700 border-yellow-200"
    }

    return (

        <div
            className={`p-6 rounded-xl border shadow-sm ${colorStyles[color]}`}
        >

            <p className="text-sm font-medium mb-2">
                {title}
            </p>

            <h2 className="text-3xl font-bold">
                {value}
            </h2>

        </div>

    )

}