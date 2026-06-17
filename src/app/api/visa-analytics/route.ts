import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getAuthSession } from "@/lib/auth"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {

    const session = await getAuthSession()

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        )
    }

    /* ======================
       FETCH VISA DATA
    ====================== */

    const { data: visas } = await supabase
        .from("visa_cases")
        .select(`
      status,
      created_at,
      applications (
        students (
          destination_country
        )
      )
    `)
        .eq("agency_id", session.user.agency_id)

    /* ======================
       BASIC STATS
    ====================== */

    const total = visas?.length ?? 0

    const approved =
        visas?.filter(v => v.status === "approved").length ?? 0

    const rejected =
        visas?.filter(v => v.status === "rejected").length ?? 0

    const approvalRate =
        total > 0 ? Math.round((approved / total) * 100) : 0

    /* ======================
       COUNTRY BREAKDOWN
    ====================== */

    const countryMap: Record<string, number> = {}

    visas?.forEach((v: any) => {

        const country =
            v.applications?.students?.destination_country ?? "Unknown"

        if (!countryMap[country]) {
            countryMap[country] = 0
        }

        countryMap[country] += 1

    })

    const countries = Object.entries(countryMap).map(
        ([country, count]) => ({
            country,
            count
        })
    )

    /* ======================
       STATUS BREAKDOWN
    ====================== */

    const statusMap: Record<string, number> = {}

    visas?.forEach((v: any) => {

        if (!statusMap[v.status]) {
            statusMap[v.status] = 0
        }

        statusMap[v.status] += 1

    })

    const statuses = Object.entries(statusMap).map(
        ([status, count]) => ({
            status,
            count
        })
    )

    return NextResponse.json({
        total,
        approved,
        rejected,
        approvalRate,
        countries,
        statuses
    })
}