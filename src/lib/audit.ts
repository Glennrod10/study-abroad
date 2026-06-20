import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type AuditAction =
    | "student.created"
    | "student.updated"
    | "student.deleted"
    | "application.created"
    | "application.updated"
    | "application.deleted"
    | "application.status_changed"
    | "lead.created"
    | "lead.updated"
    | "lead.deleted"
    | "lead.converted"
    | "visa.created"
    | "visa.updated"
    | "visa.deleted"
    | "counsellor.created"
    | "counsellor.deleted"
    | "task.created"
    | "task.updated"
    | "task.deleted"
    | "user.login"
    | "password.changed"
    | "password.reset"

export async function logAudit({
    agencyId,
    studentId,
    userId,
    action,
    description,
}: {
    agencyId: string
    studentId?: string | null
    userId: string
    action: AuditAction
    description: string
}) {
    const { error } = await supabase.from("activities").insert({
        agency_id: agencyId,
        student_id: studentId || null,
        user_id: userId,
        action,
        description,
    })

    if (error) {
        console.error("Audit log error:", error)
    }
}
