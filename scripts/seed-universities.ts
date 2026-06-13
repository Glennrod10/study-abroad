import { createClient } from "@supabase/supabase-js"
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

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const UNIVERSITIES = [
    // ── UK (20) ──
    { name: "University of Oxford", country: "UK" },
    { name: "University of Cambridge", country: "UK" },
    { name: "Imperial College London", country: "UK" },
    { name: "University College London", country: "UK" },
    { name: "London School of Economics", country: "UK" },
    { name: "University of Edinburgh", country: "UK" },
    { name: "King's College London", country: "UK" },
    { name: "University of Manchester", country: "UK" },
    { name: "University of Bristol", country: "UK" },
    { name: "University of Glasgow", country: "UK" },
    { name: "University of Birmingham", country: "UK" },
    { name: "University of Leeds", country: "UK" },
    { name: "University of Sheffield", country: "UK" },
    { name: "University of Nottingham", country: "UK" },
    { name: "University of Southampton", country: "UK" },
    { name: "University of Warwick", country: "UK" },
    { name: "University of St Andrews", country: "UK" },
    { name: "Durham University", country: "UK" },
    { name: "University of York", country: "UK" },
    { name: "University of Leicester", country: "UK" },

    // ── USA (20) ──
    { name: "Harvard University", country: "USA" },
    { name: "Stanford University", country: "USA" },
    { name: "Massachusetts Institute of Technology", country: "USA" },
    { name: "Yale University", country: "USA" },
    { name: "Princeton University", country: "USA" },
    { name: "Columbia University", country: "USA" },
    { name: "University of California, Berkeley", country: "USA" },
    { name: "University of California, Los Angeles", country: "USA" },
    { name: "University of Chicago", country: "USA" },
    { name: "Cornell University", country: "USA" },
    { name: "University of Pennsylvania", country: "USA" },
    { name: "New York University", country: "USA" },
    { name: "University of Michigan", country: "USA" },
    { name: "University of Southern California", country: "USA" },
    { name: "Carnegie Mellon University", country: "USA" },
    { name: "University of Texas at Austin", country: "USA" },
    { name: "University of Washington", country: "USA" },
    { name: "Boston University", country: "USA" },
    { name: "Northeastern University", country: "USA" },
    { name: "University of Illinois Urbana-Champaign", country: "USA" },

    // ── Canada (15) ──
    { name: "University of Toronto", country: "Canada" },
    { name: "University of British Columbia", country: "Canada" },
    { name: "McGill University", country: "Canada" },
    { name: "University of Alberta", country: "Canada" },
    { name: "University of Montreal", country: "Canada" },
    { name: "University of Waterloo", country: "Canada" },
    { name: "University of Calgary", country: "Canada" },
    { name: "University of Ottawa", country: "Canada" },
    { name: "Western University", country: "Canada" },
    { name: "Queen's University", country: "Canada" },
    { name: "Simon Fraser University", country: "Canada" },
    { name: "University of Victoria", country: "Canada" },
    { name: "York University", country: "Canada" },
    { name: "Dalhousie University", country: "Canada" },
    { name: "University of Saskatchewan", country: "Canada" },

    // ── Australia (15) ──
    { name: "University of Melbourne", country: "Australia" },
    { name: "University of Sydney", country: "Australia" },
    { name: "University of New South Wales", country: "Australia" },
    { name: "Australian National University", country: "Australia" },
    { name: "Monash University", country: "Australia" },
    { name: "University of Queensland", country: "Australia" },
    { name: "University of Western Australia", country: "Australia" },
    { name: "University of Adelaide", country: "Australia" },
    { name: "University of Technology Sydney", country: "Australia" },
    { name: "RMIT University", country: "Australia" },
    { name: "Macquarie University", country: "Australia" },
    { name: "Deakin University", country: "Australia" },
    { name: "University of Wollongong", country: "Australia" },
    { name: "University of Tasmania", country: "Australia" },
    { name: "Griffith University", country: "Australia" },

    // ── New Zealand (5) ──
    { name: "University of Auckland", country: "New Zealand" },
    { name: "University of Otago", country: "New Zealand" },
    { name: "Victoria University of Wellington", country: "New Zealand" },
    { name: "University of Canterbury", country: "New Zealand" },
    { name: "Massey University", country: "New Zealand" },

    // ── Europe (15) ──
    { name: "ETH Zurich", country: "Switzerland" },
    { name: "EPFL", country: "Switzerland" },
    { name: "University of Zurich", country: "Switzerland" },
    { name: "Delft University of Technology", country: "Netherlands" },
    { name: "University of Amsterdam", country: "Netherlands" },
    { name: "Utrecht University", country: "Netherlands" },
    { name: "Leiden University", country: "Netherlands" },
    { name: "Technical University of Munich", country: "Germany" },
    { name: "Ludwig Maximilian University of Munich", country: "Germany" },
    { name: "Heidelberg University", country: "Germany" },
    { name: "University of Copenhagen", country: "Denmark" },
    { name: "Karolinska Institute", country: "Sweden" },
    { name: "University of Helsinki", country: "Finland" },
    { name: "University of Oslo", country: "Norway" },
    { name: "Trinity College Dublin", country: "Ireland" },

    // ── Asia (10) ──
    { name: "National University of Singapore", country: "Singapore" },
    { name: "Nanyang Technological University", country: "Singapore" },
    { name: "University of Tokyo", country: "Japan" },
    { name: "Kyoto University", country: "Japan" },
    { name: "Tsinghua University", country: "China" },
    { name: "Peking University", country: "China" },
    { name: "University of Hong Kong", country: "Hong Kong" },
    { name: "Hong Kong University of Science and Technology", country: "Hong Kong" },
    { name: "Seoul National University", country: "South Korea" },
    { name: "KAIST", country: "South Korea" },
]

const PROGRAMS_BY_CATEGORY: Record<string, { name: string; fee: number }[]> = {
    "Business": [
        { name: "BBA", fee: 28000 },
        { name: "MBA", fee: 45000 },
        { name: "MSc International Business", fee: 32000 },
        { name: "MSc Finance", fee: 35000 },
        { name: "BSc Economics", fee: 26000 },
        { name: "MSc Marketing", fee: 30000 },
        { name: "BSc Accounting", fee: 25000 },
        { name: "PhD Economics", fee: 22000 },
    ],
    "Engineering": [
        { name: "BEng Mechanical Engineering", fee: 30000 },
        { name: "BEng Civil Engineering", fee: 29000 },
        { name: "MSc Computer Science", fee: 35000 },
        { name: "MSc Data Science", fee: 34000 },
        { name: "BSc Artificial Intelligence", fee: 32000 },
        { name: "MSc Electrical Engineering", fee: 33000 },
        { name: "BSc Software Engineering", fee: 31000 },
        { name: "MSc Cybersecurity", fee: 36000 },
    ],
    "Medicine & Health": [
        { name: "MBBS Medicine", fee: 40000 },
        { name: "BSc Nursing", fee: 25000 },
        { name: "MSc Public Health", fee: 30000 },
        { name: "BSc Pharmacy", fee: 28000 },
        { name: "MSc Biotechnology", fee: 32000 },
        { name: "PhD Neuroscience", fee: 26000 },
    ],
    "Arts & Humanities": [
        { name: "BA English Literature", fee: 22000 },
        { name: "BA History", fee: 21000 },
        { name: "BA International Relations", fee: 24000 },
        { name: "BA Psychology", fee: 23000 },
        { name: "MA Education", fee: 25000 },
        { name: "BA Law (LLB)", fee: 28000 },
        { name: "LLM International Law", fee: 30000 },
    ],
    "Science": [
        { name: "BSc Biology", fee: 26000 },
        { name: "BSc Chemistry", fee: 25000 },
        { name: "BSc Physics", fee: 25000 },
        { name: "MSc Environmental Science", fee: 28000 },
        { name: "BSc Mathematics", fee: 24000 },
        { name: "PhD Molecular Biology", fee: 22000 },
    ],
}

const INTAKES = ["Sep 2026", "Jan 2027", "Feb 2027", "Sep 2027", "Jan 2028"]

async function main() {
    console.log("🏫 Seeding 100 universities with programs...\n")

    const { data: agencies } = await supabase.from("agencies").select("id").limit(1)
    if (!agencies || agencies.length === 0) {
        console.error("❌ No agencies found. Run `npm run db:seed` first to create an agency.")
        return
    }
    const agencyId = agencies[0].id

    let created = 0
    let skipped = 0

    for (const u of UNIVERSITIES) {
        const { data: existing } = await supabase
            .from("universities")
            .select("id")
            .eq("name", u.name)
            .eq("agency_id", agencyId)
            .maybeSingle()

        if (existing) {
            skipped++
            continue
        }

        const { data: uni, error: uniErr } = await supabase
            .from("universities")
            .insert({ name: u.name, agency_id: agencyId })
            .select()
            .single()

        if (uniErr) {
            console.error(`  ❌ ${u.name}: ${uniErr.message}`)
            continue
        }

        const categories = Object.keys(PROGRAMS_BY_CATEGORY)
        const cat = categories[created % categories.length]
        const programs = PROGRAMS_BY_CATEGORY[cat]
        const picked = programs.slice(0, 2 + (created % 2))

        for (const p of picked) {
            const intake = INTAKES[Math.floor(Math.random() * INTAKES.length)]
            await supabase.from("programs").insert({
                name: p.name,
                tuition_fee: p.fee + Math.floor(Math.random() * 5000),
                intake,
                university_id: uni.id,
                agency_id: agencyId,
            })
        }

        created++
        if (created % 10 === 0) {
            console.log(`  ✅ ${created} / 100 universities seeded...`)
        }
    }

    console.log(`\n✅ Done! ${created} universities created, ${skipped} already existed.`)
    console.log(`   Programs were added with realistic names, tuition fees, and intakes.\n`)
}

main().catch((err) => {
    console.error("❌ Seed failed:", err)
})
