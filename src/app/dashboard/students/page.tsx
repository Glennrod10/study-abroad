import { createClient } from "@supabase/supabase-js"
import { getAuthSession } from "@/lib/auth"
import StudentsHeader from "./StudentsHeader"
import StudentsTable from "./StudentsTable"
import StudentsStats from "./StudentsStats"
import StudentsFilters from "./StudentsFilters"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface StudentRecord {
    id: string
    first_name: string
    last_name: string
    email: string
    avatar_url?: string
    student_code?: string
    status: string
    counsellor_id?: string
    created_at: string
    counsellor?: { name: string }
}

export default async function StudentsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; status?: string }>
}) {

    const session = await getAuthSession()

    if (!session) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <p className="text-text-secondary">Please log in to view students.</p>
            </div>
        )
    }

    const params = await searchParams
    const q = params?.q
    const status = params?.status

    let query = supabase
        .from("students")
        .select(`*`)
        .eq("agency_id", session.user.agency_id)

    if (q) {
        query = query.or(
            `first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`
        )
    }

    if (status && status !== "All") {
        query = query.eq("status", status)
    }

    const { data: rawStudents, error } = await query.order("created_at", {
        ascending: false,
    })

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
                <p className="text-lg font-semibold text-red-600">Failed to load students</p>
                <p className="text-sm text-text-secondary">{error.message}</p>
                <a
                    href="/dashboard/students"
                    className="mt-2 px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
                >
                    Try again
                </a>
            </div>
        )
    }

    const counsellorIds = [
        ...new Set((rawStudents || []).map((s) => s.counsellor_id).filter(Boolean)),
    ]

    let counsellorMap: Record<string, string> = {}

    if (counsellorIds.length > 0) {
        const { data: users } = await supabase
            .from("users")
            .select("id, name")
            .in("id", counsellorIds)

        if (users) {
            counsellorMap = Object.fromEntries(
                users.map((u) => [u.id, u.name])
            )
        }
    }

    const students: StudentRecord[] = (rawStudents || []).map((s) => ({
        ...s,
        counsellor: s.counsellor_id && counsellorMap[s.counsellor_id]
            ? { name: counsellorMap[s.counsellor_id] }
            : undefined,
    }))

    return (
        <div className="space-y-8">

            <StudentsHeader count={students?.length || 0} />

            <StudentsStats students={students || []} />
            <StudentsFilters />
            <StudentsTable students={students || []} />

        </div>
    )
}
