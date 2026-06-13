import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"
import * as fs from "fs"
import * as path from "path"

/* ── Load .env ──────────────────────────────────────────────────────────── */
function loadEnv() {
    const envPath = path.resolve(process.cwd(), ".env")
    if (!fs.existsSync(envPath)) {
        console.error("❌ .env file not found. Copy .env.example to .env and fill in your Supabase credentials.")
        return false
    }
    const content = fs.readFileSync(envPath, "utf-8")
    for (const line of content.split("\n")) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith("#")) continue
        const eqIdx = trimmed.indexOf("=")
        if (eqIdx === -1) continue
        const key = trimmed.slice(0, eqIdx).trim()
        let value = trimmed.slice(eqIdx + 1).trim()
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1)
        }
        process.env[key] = value
    }
    return true
}

if (!loadEnv()) process.exit(1)

/* ── Clients ────────────────────────────────────────────────────────────── */
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/* ── Helpers ────────────────────────────────────────────────────────────── */
async function main() {
    console.log("🌱 Seeding StudyAbroad CRM...\n")

    /* 1. Agency */
    const { data: existingAgency } = await supabase
        .from("agencies")
        .select("id, name")
        .eq("email", "admin@globalstudy.com")
        .maybeSingle()

    let agency = existingAgency
    if (!agency) {
        const { data: newAgency, error: agencyErr } = await supabase
            .from("agencies")
            .insert({ name: "Global Study Assist", email: "admin@globalstudy.com" })
            .select()
            .single()

        if (agencyErr) { console.error("❌ agencies:", agencyErr.message); return }
        agency = newAgency
        console.log(`✅ Agency: ${agency.name} (${agency.id})`)
    } else {
        console.log(`  ↪ Agency exists: ${agency.name}`)
    }

    const agencyId = agency.id

    /* 2. Users */
    const hash = (pw: string) => bcrypt.hashSync(pw, 10)
    const pw = "password123"

    const usersData = [
        { name: "Super Admin", email: "superadmin@globalstudy.com", password: hash(pw), role: "superadmin", agency_id: null, title: "Platform Owner" },
        { name: "Admin User", email: "admin@globalstudy.com", password: hash(pw), role: "admin", agency_id: agencyId, title: "Agency Director" },
        { name: "Sarah Counsellor", email: "sarah@globalstudy.com", password: hash(pw), role: "counsellor", agency_id: agencyId, title: "Senior Counsellor" },
        { name: "Mike Counsellor", email: "mike@globalstudy.com", password: hash(pw), role: "counsellor", agency_id: agencyId, title: "Education Counsellor" },
    ]

    const users: any[] = []
    for (const u of usersData) {
        const { data: existing } = await supabase.from("users").select("id").eq("email", u.email).maybeSingle()
        if (existing) {
            users.push(existing)
            console.log(`  ↪ User exists: ${u.email}`)
            continue
        }
        const { data, error } = await supabase.from("users").insert(u).select().single()
        if (error) { console.error(`❌ users (${u.email}):`, error.message); return }
        users.push(data)
        console.log(`  ✅ User: ${u.email} (role: ${u.role})`)
    }

    const adminId = users[1].id
    const sarahId = users[2].id
    const mikeId = users[3].id

    /* 3. Universities & Programs */
    const uniData = [
        { name: "University of Oxford", programs: [{ name: "BA in Economics", tuition_fee: 38000, intake: "Sep 2026" }, { name: "MSc Computer Science", tuition_fee: 42000, intake: "Sep 2026" }] },
        { name: "University of Toronto", programs: [{ name: "BSc Business Administration", tuition_fee: 35000, intake: "Sep 2026" }, { name: "MEng Mechanical Engineering", tuition_fee: 40000, intake: "Jan 2027" }] },
        { name: "University of Melbourne", programs: [{ name: "BA in International Relations", tuition_fee: 32000, intake: "Feb 2027" }, { name: "MSc Data Science", tuition_fee: 38000, intake: "Feb 2027" }] },
    ]

    const universityMap: Record<string, string> = {}
    for (const u of uniData) {
        const { data: uni, error: uniErr } = await supabase.from("universities").insert({ name: u.name, agency_id: agencyId }).select().single()
        if (uniErr) { console.error("❌ universities:", uniErr.message); continue }
        universityMap[u.name] = uni.id
        console.log(`  ✅ University: ${uni.name}`)
        for (const p of u.programs) {
            await supabase.from("programs").insert({ ...p, university_id: uni.id, agency_id: agencyId })
        }
    }

    /* 4. Students */
    const studentsData = [
        { first_name: "Emily", last_name: "Johnson", email: "emily.j@email.com", phone: "+44 7700 900001", destination_country: "UK", country_interest: "UK", status: "active", counsellor_id: sarahId },
        { first_name: "James", last_name: "Williams", email: "james.w@email.com", phone: "+44 7700 900002", destination_country: "Canada", country_interest: "Canada", status: "active", counsellor_id: sarahId },
        { first_name: "Sophia", last_name: "Brown", email: "sophia.b@email.com", phone: "+44 7700 900003", destination_country: "Australia", country_interest: "Australia", status: "active", counsellor_id: mikeId },
        { first_name: "Oliver", last_name: "Davis", email: "oliver.d@email.com", phone: "+44 7700 900004", destination_country: "UK", country_interest: "UK", status: "new", counsellor_id: mikeId },
    ]

    const students: any[] = []
    for (const s of studentsData) {
        const { data, error } = await supabase.from("students").insert({ ...s, agency_id: agencyId }).select().single()
        if (error) { console.error("❌ students:", error.message); continue }
        students.push(data)
        console.log(`  ✅ Student: ${data.first_name} ${data.last_name}`)
        await supabase.from("activities").insert({ agency_id: agencyId, student_id: data.id, user_id: adminId, action: "Student Created", description: `${data.first_name} ${data.last_name} profile created` })
    }

    /* 5. Leads */
    const leadsData = [
        { student_name: "Liam Taylor", phone: "+44 7700 900005", email: "liam.t@email.com", destination_country: "Canada", budget_range: "$25k-$35k", intake: "Sep 2026", source: "facebook_ads", stage: "new", score: 35, counsellor_id: sarahId },
        { student_name: "Ava Martinez", phone: "+44 7700 900006", email: "ava.m@email.com", destination_country: "UK", budget_range: "$30k-$45k", intake: "Sep 2026", source: "google_ads", stage: "contacted", score: 30, counsellor_id: mikeId },
        { student_name: "Noah Anderson", phone: "+44 7700 900007", email: "noah.a@email.com", destination_country: "Australia", budget_range: "$20k-$30k", intake: "Feb 2027", source: "referral", stage: "qualified", score: 20, counsellor_id: sarahId },
    ]

    const leads: any[] = []
    for (const l of leadsData) {
        const { data, error } = await supabase.from("leads").insert({ ...l, agency_id: agencyId }).select().single()
        if (error) { console.error("❌ leads:", error.message); continue }
        leads.push(data)
        console.log(`  ✅ Lead: ${data.student_name}`)
    }

    /* 6. Applications */
    const appsData = [
        { student_id: students[0].id, university_name: "University of Oxford", course_name: "BA in Economics", intake: "Sep 2026", tuition_fee: 38000, commission_type: "percentage", commission_value: 10, status: "active", application_status: "submitted" },
        { student_id: students[1].id, university_name: "University of Toronto", course_name: "BSc Business Administration", intake: "Sep 2026", tuition_fee: 35000, commission_type: "fixed", commission_value: 3000, status: "active", application_status: "started" },
    ]

    for (const a of appsData) {
        const commission = a.commission_type === "percentage" ? a.tuition_fee * (a.commission_value / 100) : a.commission_value
        const { data, error } = await supabase.from("applications").insert({ ...a, commission_amount: commission, agency_id: agencyId }).select().single()
        if (error) { console.error("❌ applications:", error.message); continue }
        console.log(`  ✅ Application: ${a.course_name} @ ${a.university_name} for student ${a.student_id}`)

        /* Create a visa case for the submitted application */
        if (a.application_status === "submitted") {
            const { data: visa } = await supabase.from("visa_cases").insert({
                visa_type: "Student Visa (Tier 4)",
                status: "documents_pending",
                notes: "Initial application received, pending document collection.",
                tags: "priority",
                application_id: data.id,
                agency_id: agencyId,
            }).select().single()

            if (visa) {
                console.log(`    ✅ Visa case created: ${visa.id}`)
                for (const item of ["Valid Passport", "CAS Letter", "Bank Statements", "English Test Score", "Tuberculosis Test"]) {
                    await supabase.from("visa_checklist_items").insert({ visa_case_id: visa.id, item_name: item })
                }
            }
        }
    }

    /* 7. Dashboard-ready data: activities for student 0 */
    await supabase.from("activities").insert([
        { agency_id: agencyId, student_id: students[0].id, user_id: sarahId, action: "Application Submitted", description: "Application for BA Economics submitted to Oxford" },
        { agency_id: agencyId, student_id: students[0].id, user_id: sarahId, action: "Documents Uploaded", description: "Transcript and recommendation letters uploaded" },
        { agency_id: agencyId, student_id: students[0].id, user_id: adminId, action: "Payment Received", description: "Application fee of £75 confirmed" },
    ])

    /* ── Summary ──────────────────────────────────────────────────────── */
    console.log("\n═══════════════════════════════════════════")
    console.log("  🌱  Seed complete!")
    console.log("═══════════════════════════════════════════\n")
    console.log("  🔐  All users share this password: password123\n")
    console.log("  ┌──────────────────────────┬──────────────────────────────────────┬──────────────┐")
    console.log("  │ Email                    │ Role                                │ Password     │")
    console.log("  ├──────────────────────────┼──────────────────────────────────────┼──────────────┤")
    console.log(`  │ superadmin@globalstudy.com │ superadmin (platform-level)          │ ${pw} │`)
    console.log(`  │ admin@globalstudy.com      │ admin (agency-level)                 │ ${pw} │`)
    console.log(`  │ sarah@globalstudy.com      │ counsellor                           │ ${pw} │`)
    console.log(`  │ mike@globalstudy.com       │ counsellor                           │ ${pw} │`)
    console.log("  └──────────────────────────┴──────────────────────────────────────┴──────────────┘\n")
    console.log("  📍  http://localhost:3000/login\n")
}

main().catch((err) => {
    console.error("❌ Seed failed:", err)
})
