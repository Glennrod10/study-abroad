import { createClient } from "@supabase/supabase-js"
import { getAuthSession } from "@/lib/auth"
import UploadDocument from "@/app/components/students/UploadDocument"
import Link from "next/link"
import { Pencil } from "lucide-react"
import StudentTimeline from "@/app/components/students/StudentTimeline"
import ViewDocumentsButton from "@/app/components/students/ViewDocumentsButton"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function StudentDetails({
    params,
}: {
    params: Promise<{ id: string }>
}) {

    const session = await getAuthSession()

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

    const { data: documents } = await supabase
        .from("student_documents")
        .select("*")
        .eq("student_id", id)

    const { data: timeline } = await supabase
        .from("student_timeline")
        .select("*")
        .eq("student_id", id)
        .order("event_date", { ascending: false })

    return (
        <>
            <div className="flex items-center justify-between mb-8">

                {/* Breadcrumbs */}
                <div className="text-sm text-text-secondary">
                    <Link href="/dashboard" className="hover:text-text-primary">
                        Dashboard
                    </Link>
                    {" / "}
                    <Link href="/dashboard/students" className="hover:text-text-primary">
                        Students
                    </Link>
                    {" / "}
                    <span className="text-text-primary font-medium">
                        {student.first_name}
                    </span>
                </div>

                {/* Edit Button */}
                <Link
                    href={`/dashboard/students/${student.id}/edit`}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
                >
                    <Pencil size={16} />
                    Edit Student
                </Link>

            </div>

            <div className="space-y-8">

                {/* Profile Header */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 flex items-center justify-between">

                    <div className="flex items-center gap-4">

                        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
                            {student.avatar_url ? (
                                <img
                                    src={student.avatar_url}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl font-bold">
                                    {student.first_name?.[0]}
                                </div>
                            )}
                        </div>

                        <div>
                            <h1 className="text-2xl font-black">
                                {student.first_name} {student.last_name}
                            </h1>

                            <p className="text-text-secondary text-sm">
                                {student.destination_country} • {student.intake}
                            </p>

                            <p className="text-xs text-text-secondary mt-1">
                                {student.student_code}
                            </p>
                        </div>

                    </div>

                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Personal Details */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200">

                            <h3 className="font-bold mb-4">
                                Personal Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">

                                <Detail label="Email" value={student.email} />
                                <Detail label="Phone" value={student.phone} />
                                <Detail label="Date of Birth" value={student.date_of_birth} />
                                <Detail label="Qualification" value={student.qualification} />
                                <Detail label="English Proficiency" value={student.english_proficiency} />
                                <Detail label="Mailing Address" value={student.mailing_address} />

                            </div>

                        </div>

                        {/* Documents */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200">

                            <div className="flex items-center justify-between mb-3">

                                <h3 className="font-bold">
                                    Documents
                                </h3>

                            </div>

                            <UploadDocument studentId={id} />

                            <div className="flex items-center justify-between mt-4">

                                <p className="text-sm text-text-secondary">
                                    {documents?.length || 0} document(s) uploaded
                                </p>

                                <ViewDocumentsButton documents={documents} />

                            </div>

                        </div>

                    </div>

                    {/* Right Column */}
                    <div>

                        <StudentTimeline studentId={student.id} />

                    </div>

                </div>

            </div>
        </>
    )
}

function Detail({ label, value }: any) {
    return (
        <div>
            <p className="text-xs text-text-secondary">
                {label}
            </p>
            <p className="font-medium">
                {value || "—"}
            </p>
        </div>
    )
}