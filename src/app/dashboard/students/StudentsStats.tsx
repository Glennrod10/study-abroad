import { Send, DraftingCompass, Clock, CheckCircle, LucideIcon } from "lucide-react"
import type { StudentRecord } from "./page"

export default function StudentsStats({ students }: { students: StudentRecord[] }) {

    const applied = students.filter(s => s.status === "Applied").length
    const offers = students.filter(s => s.status === "Offer Letter").length
    const pending = students.filter(s => s.status === "Visa Pending").length
    const enrolled = students.filter(s => s.status === "Enrolled").length

    return (

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">

            <StatCard
                title="Applied"
                value={applied}
                subtitle="students applied"
                icon={Send}
                color="blue"
            />

            <StatCard
                title="Offers"
                value={offers}
                subtitle="offer letters received"
                icon={DraftingCompass}
                color="indigo"
            />

            <StatCard
                title="Visa Pending"
                value={pending}
                subtitle="waiting for visa decision"
                icon={Clock}
                color="amber"
            />

            <StatCard
                title="Enrolled"
                value={enrolled}
                subtitle="successfully enrolled"
                icon={CheckCircle}
                color="emerald"
            />

        </div>

    )
}

type StatColor = "blue" | "indigo" | "amber" | "emerald"

const statStyles: Record<StatColor, { card: string; icon: string }> = {
    blue: { card: "bg-blue-50", icon: "bg-blue-100 text-blue-600" },
    indigo: { card: "bg-indigo-50", icon: "bg-indigo-100 text-indigo-600" },
    amber: { card: "bg-amber-50", icon: "bg-amber-100 text-amber-600" },
    emerald: { card: "bg-emerald-50", icon: "bg-emerald-100 text-emerald-600" },
}

function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    color
}: {
    title: string
    value: number
    subtitle: string
    icon: LucideIcon
    color: StatColor
}) {

    const s = statStyles[color]

    return (

        <div
            className={`${s.card} rounded-xl p-5 flex items-center gap-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[2px]`}
        >

            <div
                className={`w-11 h-11 rounded-lg flex items-center justify-center ${s.icon}`}
            >
                <Icon size={18} />
            </div>

            <div>

                <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    {title}
                </p>
                <p className="text-xs text-text-secondary mt-1">
                    {subtitle}
                </p>

                <h4 className="text-2xl font-black mt-0.5">
                    {value}
                </h4>

            </div>

        </div>

    )
}