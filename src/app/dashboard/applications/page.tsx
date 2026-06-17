import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import { getAuthSession } from "@/lib/auth"
import ApplicationsTable from "@/app/components/applications/ApplicationsTable"
import ApplicationFilters from "@/app/components/applications/ApplicationFilters"
import SummaryCards from "@/app/components/applications/SummaryCards"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function ApplicationsPage({
    searchParams,
}: {
    searchParams: Promise<{
        q?: string
        intake?: string
        status?: string
        page?: string
    }>
}) {
    const params = await searchParams

    const q = params?.q || ""
    const intake = params?.intake || ""
    const status = params?.status || ""
    const page = Number(params?.page || 1)

    const PAGE_SIZE = 10

    const session = await getAuthSession()
    if (!session) return <div>Unauthorized</div>

    let query = supabase
        .from("applications")
        .select(`
  id,
  student_id,
  university_name,
  course_name,
  intake,
  tuition_fee,
  application_status,
  created_at,
  students (
    first_name,
    last_name
  )
`)
        .eq("agency_id", session.user.agency_id)

    if (intake) query = query.eq("intake", intake)
    if (status) query = query.eq("application_status", status)

    const { data: applications } = await query.order("created_at", {
        ascending: false,
    })

    let filtered = applications || []

    // 🔎 Safe JS search
    if (q) {
        const lower = q.toLowerCase()
        filtered = filtered.filter((app: any) => {
            const uni = app.university_name?.toLowerCase() || ""
            const first = app.students?.first_name?.toLowerCase() || ""
            const last = app.students?.last_name?.toLowerCase() || ""

            return (
                uni.includes(lower) ||
                first.includes(lower) ||
                last.includes(lower)
            )
        })
    }

    // 📄 Pagination
    const total = filtered.length
    const totalPages = Math.ceil(total / PAGE_SIZE)
    const start = (page - 1) * PAGE_SIZE
    const paginated = filtered.slice(start, start + PAGE_SIZE)

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black">Applications</h1>
                    <p className="text-text-secondary text-sm">
                        Manage student university applications
                    </p>
                </div>

                <Link
                    href="/dashboard/applications/new"
                    className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium"
                >
                    + Add Application
                </Link>
            </div>

            {/* 📊 Summary Cards */}
            <SummaryCards applications={filtered} />

            {/* 🔎 Filters */}
            <ApplicationFilters />

            {/* 📋 Table */}
            <ApplicationsTable applications={paginated} />

            {/* 📄 Pagination */}
            <div className="flex justify-end gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                    <Link
                        key={i}
                        href={`?page=${i + 1}`}
                        className={`px-3 py-1 rounded-md text-sm ${page === i + 1
                            ? "bg-[var(--color-primary)] text-white"
                            : "border border-border"
                            }`}
                    >
                        {i + 1}
                    </Link>
                ))}
            </div>

        </div>
    )
}