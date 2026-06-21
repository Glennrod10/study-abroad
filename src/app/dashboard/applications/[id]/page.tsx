import { createClient } from "@supabase/supabase-js"
import { getAuthSession } from "@/lib/auth"
import { notFound } from "next/navigation"
import ApplicationActions from "@/app/components/applications/ApplicationActions"
import ApplicationStatus from "@/app/components/applications/ApplicationStatus"
import Link from "next/link"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function ApplicationDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {

    const { id } = await params

    const session = await getAuthSession()
    if (!session) return <div>Unauthorized</div>

    const { data: application } = await supabase
        .from("applications")
        .select(`
            *,
            students (
                id,
                first_name,
                last_name,
                email
            )
        `)
        .eq("id", id)
        .eq("agency_id", session.user.agency_id)
        .single()

    if (!application) return notFound()

    return (

        <div className="space-y-8">

            {/* Header */}
            <div className="flex justify-between items-center">

                <div>
                    <h1 className="text-3xl font-black">
                        {application.course_name}
                    </h1>

                    <p className="text-text-secondary text-sm">
                        {application.university_name}
                    </p>
                </div>

                <ApplicationActions id={application.id} />

            </div>


            {/* Student */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">

                <h2 className="font-bold mb-4">
                    Student
                </h2>

                <Link
                    href={`/dashboard/students/${application.students?.id}`}
                    className="block hover:bg-gray-50 rounded-lg p-3 transition"
                >

                    <p className="font-medium">
                        {application.students?.first_name} {application.students?.last_name}
                    </p>

                    <p className="text-sm text-text-secondary">
                        {application.students?.email}
                    </p>

                </Link>

            </div>


            {/* Application Details */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">

                <h2 className="font-bold mb-4">
                    Application Details
                </h2>

                <div className="grid grid-cols-2 gap-6 text-sm">

                    <div>
                        <p className="text-text-secondary">Intake</p>
                        <p className="font-medium">
                            {application.intake}
                        </p>
                    </div>

                    <div>
                        <p className="text-text-secondary">Tuition Fee</p>
                        <p className="font-medium">
                            $ {application.tuition_fee}
                        </p>
                    </div>

                    <div>
                        <p className="text-text-secondary">Commission</p>
                        <p className="font-medium">
                            ₹ {application.commission_amount || 0}
                        </p>
                    </div>

                    <div>
                        <p className="text-text-secondary">Status</p>

                        <ApplicationStatus
                            applicationId={application.id}
                            currentStatus={application.application_status}
                        />

                    </div>

                </div>

            </div>

        </div>

    )
}