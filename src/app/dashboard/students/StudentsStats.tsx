import { Send, DraftingCompass, Clock, CheckCircle } from "lucide-react"

export default function StudentsStats({ students }: { students: any[] }) {

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
                icon={<Send size={18} />}
                color="blue"
            />

            <StatCard
                title="Offers"
                value={offers}
                subtitle="offer letters received"
                icon={<DraftingCompass size={18} />}
                color="indigo"
            />

            <StatCard
                title="Visa Pending"
                value={pending}
                subtitle="waiting for visa decision"
                icon={<Clock size={18} />}
                color="amber"
            />

            <StatCard
                title="Enrolled"
                value={enrolled}
                subtitle="successfully enrolled"
                icon={<CheckCircle size={18} />}
                color="emerald"
            />

        </div>

    )
}

function StatCard({
    title,
    value,
    subtitle,
    icon,
    color
}: any) {

    const styles: any = {

        blue: {
            card: "bg-blue-50",
            icon: "bg-blue-100 text-blue-600"
        },

        indigo: {
            card: "bg-indigo-50",
            icon: "bg-indigo-100 text-indigo-600"
        },

        amber: {
            card: "bg-amber-50",
            icon: "bg-amber-100 text-amber-600"
        },

        emerald: {
            card: "bg-emerald-50",
            icon: "bg-emerald-100 text-emerald-600"
        }

    }

    return (

        <div
            className={`${styles[color].card} rounded-xl p-5 flex items-center gap-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[2px]`}
        >

            {/* Icon */}

            <div
                className={`w-11 h-11 rounded-lg flex items-center justify-center ${styles[color].icon}`}
            >
                {icon}
            </div>

            {/* Text */}

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