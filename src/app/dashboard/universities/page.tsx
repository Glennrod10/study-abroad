import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import { getAuthSession } from "@/lib/auth"
import UniversityCard from "@/app/components/universities/UniversityCard"
import UniversityFilters from "@/app/components/universities/UniversityFilters"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PAGE_SIZE = 12

export default async function UniversitiesPage({
    searchParams,
}: {
    searchParams: Promise<{
        page?: string
        q?: string
        country?: string
        minRank?: string
        maxRank?: string
        year?: string
    }>
}) {
    const params = await searchParams

    const page = Number(params?.page || 1)
    const q = params?.q || ""
    const country = params?.country || ""
    const minRank = params?.minRank ? Number(params.minRank) : null
    const maxRank = params?.maxRank ? Number(params.maxRank) : null
    const year = params?.year || ""

    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const session = await getAuthSession()
    if (!session) return <div>Unauthorized</div>

    let query = supabase
        .from("universities")
        .select("*", { count: "exact" })
        .eq("agency_id", session.user.agency_id)

    // 🔎 Search by name
    if (q) {
        query = query.ilike("name", `%${q}%`)
    }

    // 🌍 Filter by country
    if (country) {
        query = query.eq("country", country)
    }

    // 🎯 Ranking range
    // Only apply ranking filter if explicitly set in URL
    if (params?.minRank) {
        query = query.gte("ranking", Number(params.minRank))
    }

    if (params?.maxRank) {
        query = query.lte("ranking", Number(params.maxRank))
    }

    if (year) {
        query = query.contains("intake_periods", [year])
    }

    const { data: universities, count } = await query
        .order("ranking", { ascending: true })
        .range(from, to)

    const totalPages = Math.ceil((count || 0) / PAGE_SIZE)

    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black">University Directory</h1>
                    <p className="text-text-secondary text-sm">
                        Filter and manage ranked institutions
                    </p>
                </div>

                <Link
                    href="/dashboard/universities/new"
                    className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-semibold"
                >
                    + Add University
                </Link>
            </div>

            {/* Filters */}
            <UniversityFilters />

            {/* Cards */}
            {universities?.length ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {universities.map((uni) => (
                            <UniversityCard key={uni.id} university={uni} />
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center items-center gap-2 pt-6">

                        {page > 1 && (
                            <Link
                                href={`?page=${page - 1}`}
                                className="px-3 py-1 border border-border rounded-md text-sm"
                            >
                                Previous
                            </Link>
                        )}

                        {Array.from({ length: totalPages }).map((_, i) => {
                            const pageNumber = i + 1
                            return (
                                <Link
                                    key={pageNumber}
                                    href={`?page=${pageNumber}`}
                                    className={`px-3 py-1 rounded-md text-sm ${page === pageNumber
                                        ? "bg-[var(--color-primary)] text-white"
                                        : "border border-border"
                                        }`}
                                >
                                    {pageNumber}
                                </Link>
                            )
                        })}

                        {page < totalPages && (
                            <Link
                                href={`?page=${page + 1}`}
                                className="px-3 py-1 border border-border rounded-md text-sm"
                            >
                                Next
                            </Link>
                        )}

                    </div>
                </>
            ) : (
                <div className="bg-white border border-border rounded-xl p-10 text-center shadow-sm">
                    <p className="text-text-secondary">
                        No universities match your filters.
                    </p>
                </div>
            )}

        </div>
    )
}