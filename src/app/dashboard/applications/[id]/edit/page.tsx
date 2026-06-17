import { createClient } from "@supabase/supabase-js"
import { getAuthSession } from "@/lib/auth"
import { notFound } from "next/navigation"
import ApplicationForm from "@/app/components/applications/ApplicationForm"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function EditApplicationPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const session = await getAuthSession()
    if (!session) return <div>Unauthorized</div>

    const { data: application } = await supabase
        .from("applications")
        .select("*")
        .eq("id", id)
        .eq("agency_id", session.user.agency_id)
        .single()

    if (!application) return notFound()

    return <ApplicationForm application={application} mode="edit" />
}