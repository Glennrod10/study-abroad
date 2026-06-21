"use client"

import { TrendingUp, TrendingDown, FileText, Award, CheckCircle } from "lucide-react"

export default function SummaryCards({ applications }: any) {

    const now = new Date()
    const last30 = new Date(now)
    last30.setDate(now.getDate() - 30)

    const prev60 = new Date(now)
    prev60.setDate(now.getDate() - 60)

    // 🔢 Current vs Previous Period
    const currentPeriod = applications.filter(
        (a: any) => new Date(a.created_at) >= last30
    )

    const previousPeriod = applications.filter(
        (a: any) =>
            new Date(a.created_at) < last30 &&
            new Date(a.created_at) >= prev60
    )

    const calculateGrowth = (current: number, previous: number) => {
        if (previous === 0) return 100
        return Math.round(((current - previous) / previous) * 100)
    }

    // 📊 Total Applications
    const totalCurrent = currentPeriod.length
    const totalPrevious = previousPeriod.length
    const totalGrowth = calculateGrowth(totalCurrent, totalPrevious)

    // 🎓 Pending Offers
    const pendingCurrent = currentPeriod.filter(
        (a: any) => a.application_status === "Offer Received"
    ).length

    const pendingPrevious = previousPeriod.filter(
        (a: any) => a.application_status === "Offer Received"
    ).length

    const pendingGrowth = calculateGrowth(pendingCurrent, pendingPrevious)

    // ✅ Visa Success
    const visaApprovedCurrent = currentPeriod.filter(
        (a: any) => a.application_status === "Visa Approved"
    ).length

    const visaFiledCurrent = currentPeriod.filter(
        (a: any) => a.application_status === "Visa Filed"
    ).length

    const successRateCurrent =
        visaFiledCurrent > 0
            ? Math.round((visaApprovedCurrent / visaFiledCurrent) * 100)
            : 0

    const visaApprovedPrev = previousPeriod.filter(
        (a: any) => a.application_status === "Visa Approved"
    ).length

    const visaFiledPrev = previousPeriod.filter(
        (a: any) => a.application_status === "Visa Filed"
    ).length

    const successRatePrev =
        visaFiledPrev > 0
            ? Math.round((visaApprovedPrev / visaFiledPrev) * 100)
            : 0

    const successGrowth = calculateGrowth(successRateCurrent, successRatePrev)

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <AnalyticsCard
                title="Total Applications"
                value={totalCurrent}
                growth={totalGrowth}
                icon={<FileText size={20} />}
                color="indigo"
            />

            <AnalyticsCard
                title="Pending Offers"
                value={pendingCurrent}
                growth={pendingGrowth}
                icon={<Award size={20} />}
                color="amber"
            />

            <AnalyticsCard
                title="Visa Success Rate"
                value={`${successRateCurrent}%`}
                growth={successGrowth}
                icon={<CheckCircle size={20} />}
                color="emerald"
            />

        </div>
    )
}

function AnalyticsCard({ title, value, growth, icon, color }: any) {

    const isPositive = growth >= 0

    const colorMap: any = {
        indigo: {
            bg: "bg-indigo-50",
            iconBg: "bg-indigo-100",
            text: "text-indigo-600",
        },
        amber: {
            bg: "bg-amber-50",
            iconBg: "bg-amber-100",
            text: "text-amber-600",
        },
        emerald: {
            bg: "bg-emerald-50",
            iconBg: "bg-emerald-100",
            text: "text-emerald-600",
        },
    }

    const theme = colorMap[color]

    return (
        <div className={`${theme.bg} rounded-xl p-6 border border-gray-200 relative overflow-hidden`}>

            <div className="flex justify-between items-start">

                <div className="space-y-2">
                    <p className="text-xs text-text-secondary font-medium">
                        {title}
                    </p>

                    <p className="text-3xl font-black">
                        {value}
                    </p>

                    <div className={`flex items-center gap-1 text-xs font-semibold ${isPositive ? "text-emerald-600" : "text-red-500"
                        }`}>
                        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {Math.abs(growth)}% from last 30 days
                    </div>
                </div>

                <div className={`${theme.iconBg} p-3 rounded-lg ${theme.text}`}>
                    {icon}
                </div>

            </div>

        </div>
    )
}