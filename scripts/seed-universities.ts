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

interface UniSeed {
    name: string
    country: string
    city: string
    ranking: number
}

const UNIVERSITIES: UniSeed[] = [
    // ── UK (20) ──
    { name: "University of Oxford", country: "United Kingdom", city: "Oxford", ranking: 1 },
    { name: "University of Cambridge", country: "United Kingdom", city: "Cambridge", ranking: 2 },
    { name: "Imperial College London", country: "United Kingdom", city: "London", ranking: 3 },
    { name: "University College London", country: "United Kingdom", city: "London", ranking: 4 },
    { name: "London School of Economics", country: "United Kingdom", city: "London", ranking: 5 },
    { name: "University of Edinburgh", country: "United Kingdom", city: "Edinburgh", ranking: 6 },
    { name: "King's College London", country: "United Kingdom", city: "London", ranking: 7 },
    { name: "University of Manchester", country: "United Kingdom", city: "Manchester", ranking: 8 },
    { name: "University of Bristol", country: "United Kingdom", city: "Bristol", ranking: 9 },
    { name: "University of Glasgow", country: "United Kingdom", city: "Glasgow", ranking: 10 },
    { name: "University of Birmingham", country: "United Kingdom", city: "Birmingham", ranking: 11 },
    { name: "University of Leeds", country: "United Kingdom", city: "Leeds", ranking: 12 },
    { name: "University of Sheffield", country: "United Kingdom", city: "Sheffield", ranking: 13 },
    { name: "University of Nottingham", country: "United Kingdom", city: "Nottingham", ranking: 14 },
    { name: "University of Southampton", country: "United Kingdom", city: "Southampton", ranking: 15 },
    { name: "University of Warwick", country: "United Kingdom", city: "Coventry", ranking: 16 },
    { name: "University of St Andrews", country: "United Kingdom", city: "St Andrews", ranking: 17 },
    { name: "Durham University", country: "United Kingdom", city: "Durham", ranking: 18 },
    { name: "University of York", country: "United Kingdom", city: "York", ranking: 19 },
    { name: "University of Leicester", country: "United Kingdom", city: "Leicester", ranking: 20 },

    // ── USA (20) ──
    { name: "Harvard University", country: "United States", city: "Cambridge", ranking: 21 },
    { name: "Stanford University", country: "United States", city: "Stanford", ranking: 22 },
    { name: "Massachusetts Institute of Technology", country: "United States", city: "Cambridge", ranking: 23 },
    { name: "Yale University", country: "United States", city: "New Haven", ranking: 24 },
    { name: "Princeton University", country: "United States", city: "Princeton", ranking: 25 },
    { name: "Columbia University", country: "United States", city: "New York", ranking: 26 },
    { name: "University of California, Berkeley", country: "United States", city: "Berkeley", ranking: 27 },
    { name: "University of California, Los Angeles", country: "United States", city: "Los Angeles", ranking: 28 },
    { name: "University of Chicago", country: "United States", city: "Chicago", ranking: 29 },
    { name: "Cornell University", country: "United States", city: "Ithaca", ranking: 30 },
    { name: "University of Pennsylvania", country: "United States", city: "Philadelphia", ranking: 31 },
    { name: "New York University", country: "United States", city: "New York", ranking: 32 },
    { name: "University of Michigan", country: "United States", city: "Ann Arbor", ranking: 33 },
    { name: "University of Southern California", country: "United States", city: "Los Angeles", ranking: 34 },
    { name: "Carnegie Mellon University", country: "United States", city: "Pittsburgh", ranking: 35 },
    { name: "University of Texas at Austin", country: "United States", city: "Austin", ranking: 36 },
    { name: "University of Washington", country: "United States", city: "Seattle", ranking: 37 },
    { name: "Boston University", country: "United States", city: "Boston", ranking: 38 },
    { name: "Northeastern University", country: "United States", city: "Boston", ranking: 39 },
    { name: "University of Illinois Urbana-Champaign", country: "United States", city: "Urbana", ranking: 40 },

    // ── Canada (15) ──
    { name: "University of Toronto", country: "Canada", city: "Toronto", ranking: 41 },
    { name: "University of British Columbia", country: "Canada", city: "Vancouver", ranking: 42 },
    { name: "McGill University", country: "Canada", city: "Montreal", ranking: 43 },
    { name: "University of Alberta", country: "Canada", city: "Edmonton", ranking: 44 },
    { name: "University of Montreal", country: "Canada", city: "Montreal", ranking: 45 },
    { name: "University of Waterloo", country: "Canada", city: "Waterloo", ranking: 46 },
    { name: "University of Calgary", country: "Canada", city: "Calgary", ranking: 47 },
    { name: "University of Ottawa", country: "Canada", city: "Ottawa", ranking: 48 },
    { name: "Western University", country: "Canada", city: "London", ranking: 49 },
    { name: "Queen's University", country: "Canada", city: "Kingston", ranking: 50 },
    { name: "Simon Fraser University", country: "Canada", city: "Burnaby", ranking: 51 },
    { name: "University of Victoria", country: "Canada", city: "Victoria", ranking: 52 },
    { name: "York University", country: "Canada", city: "Toronto", ranking: 53 },
    { name: "Dalhousie University", country: "Canada", city: "Halifax", ranking: 54 },
    { name: "University of Saskatchewan", country: "Canada", city: "Saskatoon", ranking: 55 },

    // ── Australia (15) ──
    { name: "University of Melbourne", country: "Australia", city: "Melbourne", ranking: 56 },
    { name: "University of Sydney", country: "Australia", city: "Sydney", ranking: 57 },
    { name: "University of New South Wales", country: "Australia", city: "Sydney", ranking: 58 },
    { name: "Australian National University", country: "Australia", city: "Canberra", ranking: 59 },
    { name: "Monash University", country: "Australia", city: "Melbourne", ranking: 60 },
    { name: "University of Queensland", country: "Australia", city: "Brisbane", ranking: 61 },
    { name: "University of Western Australia", country: "Australia", city: "Perth", ranking: 62 },
    { name: "University of Adelaide", country: "Australia", city: "Adelaide", ranking: 63 },
    { name: "University of Technology Sydney", country: "Australia", city: "Sydney", ranking: 64 },
    { name: "RMIT University", country: "Australia", city: "Melbourne", ranking: 65 },
    { name: "Macquarie University", country: "Australia", city: "Sydney", ranking: 66 },
    { name: "Deakin University", country: "Australia", city: "Geelong", ranking: 67 },
    { name: "University of Wollongong", country: "Australia", city: "Wollongong", ranking: 68 },
    { name: "University of Tasmania", country: "Australia", city: "Hobart", ranking: 69 },
    { name: "Griffith University", country: "Australia", city: "Brisbane", ranking: 70 },

    // ── New Zealand (5) ──
    { name: "University of Auckland", country: "New Zealand", city: "Auckland", ranking: 71 },
    { name: "University of Otago", country: "New Zealand", city: "Dunedin", ranking: 72 },
    { name: "Victoria University of Wellington", country: "New Zealand", city: "Wellington", ranking: 73 },
    { name: "University of Canterbury", country: "New Zealand", city: "Christchurch", ranking: 74 },
    { name: "Massey University", country: "New Zealand", city: "Palmerston North", ranking: 75 },

    // ── Europe (15) ──
    { name: "ETH Zurich", country: "Switzerland", city: "Zurich", ranking: 76 },
    { name: "EPFL", country: "Switzerland", city: "Lausanne", ranking: 77 },
    { name: "University of Zurich", country: "Switzerland", city: "Zurich", ranking: 78 },
    { name: "Delft University of Technology", country: "Netherlands", city: "Delft", ranking: 79 },
    { name: "University of Amsterdam", country: "Netherlands", city: "Amsterdam", ranking: 80 },
    { name: "Utrecht University", country: "Netherlands", city: "Utrecht", ranking: 81 },
    { name: "Leiden University", country: "Netherlands", city: "Leiden", ranking: 82 },
    { name: "Technical University of Munich", country: "Germany", city: "Munich", ranking: 83 },
    { name: "Ludwig Maximilian University of Munich", country: "Germany", city: "Munich", ranking: 84 },
    { name: "Heidelberg University", country: "Germany", city: "Heidelberg", ranking: 85 },
    { name: "University of Copenhagen", country: "Denmark", city: "Copenhagen", ranking: 86 },
    { name: "Karolinska Institute", country: "Sweden", city: "Stockholm", ranking: 87 },
    { name: "University of Helsinki", country: "Finland", city: "Helsinki", ranking: 88 },
    { name: "University of Oslo", country: "Norway", city: "Oslo", ranking: 89 },
    { name: "Trinity College Dublin", country: "Ireland", city: "Dublin", ranking: 90 },

    // ── Asia (10) ──
    { name: "National University of Singapore", country: "Singapore", city: "Singapore", ranking: 91 },
    { name: "Nanyang Technological University", country: "Singapore", city: "Singapore", ranking: 92 },
    { name: "University of Tokyo", country: "Japan", city: "Tokyo", ranking: 93 },
    { name: "Kyoto University", country: "Japan", city: "Kyoto", ranking: 94 },
    { name: "Tsinghua University", country: "China", city: "Beijing", ranking: 95 },
    { name: "Peking University", country: "China", city: "Beijing", ranking: 96 },
    { name: "University of Hong Kong", country: "Hong Kong", city: "Hong Kong", ranking: 97 },
    { name: "Hong Kong University of Science and Technology", country: "Hong Kong", city: "Hong Kong", ranking: 98 },
    { name: "Seoul National University", country: "South Korea", city: "Seoul", ranking: 99 },
    { name: "KAIST", country: "South Korea", city: "Daejeon", ranking: 100 },
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

        const categories = Object.keys(PROGRAMS_BY_CATEGORY)
        const catIdx = (created + categories.length) % categories.length
        const cat = categories[catIdx]
        const picked = PROGRAMS_BY_CATEGORY[cat].slice(0, 2 + (created % 2))

        const levels: string[] = []
        const years: string[] = []
        for (const p of picked) {
            if (p.name.startsWith("B")) levels.push("Undergraduate")
            else if (p.name.startsWith("M") || p.name.startsWith("P")) levels.push("Postgraduate")
            const intake = INTAKES[Math.floor(Math.random() * INTAKES.length)]
            const year = intake.slice(-4)
            if (!years.includes(year)) years.push(year)
        }
        if (levels.length === 0) levels.push("Undergraduate", "Postgraduate")
        if (years.length === 0) years.push("2026", "2027")

        const { data: uni, error: uniErr } = await supabase
            .from("universities")
            .insert({
                name: u.name,
                agency_id: agencyId,
                country: u.country,
                city: u.city,
                ranking: u.ranking,
                intake_periods: years,
                program_levels: [...new Set(levels)],
            })
            .select()
            .single()

        if (uniErr) {
            console.error(`  ❌ ${u.name}: ${uniErr.message}`)
            continue
        }

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
    console.log(`   Each has country, city, ranking (1-100), intake periods, program levels, and programs.\n`)
}

main().catch((err) => {
    console.error("❌ Seed failed:", err)
})
