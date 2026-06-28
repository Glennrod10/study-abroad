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

export default async function StudentsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; status?: string }>
}) {

    const session = await getAuthSession()

    if (!session) {
        return <div>Unauthorized</div>
    }

    const params = await searchParams
    const q = params?.q
    const status = params?.status

    let query = supabase
        .from("students")
        .select(`
            *,
            counsellor:users(name)
        `)
        .eq("agency_id", session.user.agency_id)

    if (q) {
        query = query.or(
            `first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`
        )
    }

    if (status && status !== "All") {
        query = query.eq("status", status)
    }

    const { data: students, error } = await query.order("created_at", {
        ascending: false,
    })

    if (error) {
        console.error("Error fetching students:", error)
    }

    return (
        <div className="space-y-8">

            <StudentsHeader count={students?.length || 0} />

            <StudentsStats students={students || []} />
            <StudentsFilters />
            <StudentsTable students={students || []} />


        </div>
    )
}