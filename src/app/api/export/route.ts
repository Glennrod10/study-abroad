import { NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth"
import { createClient } from "@supabase/supabase-js"
import { toCSV } from "@/lib/csv"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
    const session = await getAuthSession()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")

    if (!type) {
        return NextResponse.json({ error: "Missing export type" }, { status: 400 })
    }

    let filename: string
    let csv: string

    switch (type) {
        case "students": {
            const { data } = await supabase
                .from("students")
                .select("first_name, last_name, email, phone, destination_country, status, created_at")
                .eq("agency_id", session.user.agency_id)
                .order("created_at", { ascending: false })

            filename = "students.csv"
            csv = toCSV(
                ["First Name", "Last Name", "Email", "Phone", "Destination", "Status", "Created"],
                (data || []).map((s) => [
                    s.first_name || "",
                    s.last_name || "",
                    s.email || "",
                    s.phone || "",
                    s.destination_country || "",
                    s.status || "",
                    s.created_at || "",
                ])
            )
            break
        }

        case "applications": {
            const { data } = await supabase
                .from("applications")
                .select("id, university_name, course_name, intake, application_status, commission_amount, created_at, students(first_name, last_name)")
                .eq("agency_id", session.user.agency_id)
                .order("created_at", { ascending: false })

            filename = "applications.csv"
            csv = toCSV(
                ["ID", "Student", "University", "Course", "Intake", "Status", "Commission", "Created"],
                (data || []).map((a) => [
                    a.id || "",
                    `${a.students?.[0]?.first_name || ""} ${a.students?.[0]?.last_name || ""}`,
                    a.university_name || "",
                    a.course_name || "",
                    a.intake || "",
                    a.application_status || "",
                    a.commission_amount ? String(a.commission_amount) : "",
                    a.created_at || "",
                ])
            )
            break
        }

        case "leads": {
            const { data } = await supabase
                .from("leads")
                .select("student_name, email, phone, destination_country, source, stage, score, created_at")
                .eq("agency_id", session.user.agency_id)
                .order("created_at", { ascending: false })

            filename = "leads.csv"
            csv = toCSV(
                ["Name", "Email", "Phone", "Destination", "Source", "Stage", "Score", "Created"],
                (data || []).map((l) => [
                    l.student_name || "",
                    l.email || "",
                    l.phone || "",
                    l.destination_country || "",
                    l.source || "",
                    l.stage || "",
                    l.score != null ? String(l.score) : "",
                    l.created_at || "",
                ])
            )
            break
        }

        case "visas": {
            const { data } = await supabase
                .from("visa_cases")
                .select("id, visa_type, status, created_at, applications(id, students(first_name, last_name))")
                .eq("agency_id", session.user.agency_id)
                .order("created_at", { ascending: false })

            filename = "visas.csv"
            csv = toCSV(
                ["ID", "Student", "Visa Type", "Status", "Created"],
                (data || []).map((v) => [
                    v.id || "",
                    `${v.applications?.[0]?.students?.[0]?.first_name || ""} ${v.applications?.[0]?.students?.[0]?.last_name || ""}`,
                    v.visa_type || "",
                    v.status || "",
                    v.created_at || "",
                ])
            )
            break
        }

        case "tasks": {
            const { data } = await supabase
                .from("tasks")
                .select("title, status, priority, due_date, created_at, students(first_name, last_name)")
                .eq("agency_id", session.user.agency_id)
                .order("created_at", { ascending: false })

            filename = "tasks.csv"
            csv = toCSV(
                ["Title", "Student", "Status", "Priority", "Due Date", "Created"],
                (data || []).map((t) => [
                    t.title || "",
                    `${t.students?.[0]?.first_name || ""} ${t.students?.[0]?.last_name || ""}`,
                    t.status || "",
                    t.priority || "",
                    t.due_date || "",
                    t.created_at || "",
                ])
            )
            break
        }

        default:
            return NextResponse.json({ error: "Invalid export type" }, { status: 400 })
    }

    return new NextResponse(csv, {
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`,
        },
    })
}
