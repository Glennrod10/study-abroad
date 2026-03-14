import { createClient } from "@supabase/supabase-js"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import UniversityDetailClient from "@/app/components/universities/UniversityDetailClient"


const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function UniversityDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const session = await getServerSession(authOptions)
    if (!session) return <div>Unauthorized</div>

    // Fetch university
    const { data: university } = await supabase
        .from("universities")
        .select("*")
        .eq("id", id)
        .eq("agency_id", session.user.agency_id)
        .single()

    if (!university) {
        return <div>University not found</div>
    }

    // Fetch programs
    const { data: programs } = await supabase
        .from("programs")
        .select("*")
        .eq("university_id", id)
        .eq("agency_id", session.user.agency_id)
        .order("level", { ascending: true })

    return (
        <UniversityDetailClient
            university={university}
            programs={programs || []}
        />
    )
}