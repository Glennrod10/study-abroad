import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import StudentForm from "@/app/components/students/StudentForm"
import { createClient } from "@supabase/supabase-js"
import { getServerSession } from "next-auth"



const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function EditStudent({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const session = await getServerSession(authOptions)
    if (!session) return <div>Unauthorized</div>

    const resolvedParams = await params
    const id = resolvedParams.id

    const { data: student } = await supabase
        .from("students")
        .select("*")
        .eq("id", id)
        .eq("agency_id", session.user.agency_id)
        .single()

    if (!student) return <div>Student not found</div>

    return <StudentForm initialData={student} mode="edit" />
}