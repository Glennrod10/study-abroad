export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agencyId = session.user.agency_id;

    /* ================= KPI ================= */

    const [
        studentsRes,
        applicationsRes,
        revenueRes,
        visasRes,
        monthlyAppsRes,
        monthlyRevenueRes,
        visaStatusRes,
        countryRes,
    ] = await Promise.all([

        supabase
            .from("students")
            .select("id", { count: "exact", head: true })
            .eq("agency_id", agencyId),

        supabase
            .from("applications")
            .select("id, status, created_at")
            .eq("agency_id", agencyId),

        supabase
            .from("applications")
            .select("commission_amount, created_at")
            .eq("agency_id", agencyId),

        supabase
            .from("visa_cases")
            .select("status")
            .eq("agency_id", agencyId),

        supabase
            .from("applications")
            .select("created_at")
            .eq("agency_id", agencyId),

        supabase
            .from("applications")
            .select("commission_amount, created_at")
            .eq("agency_id", agencyId),

        supabase
            .from("visa_cases")
            .select("status")
            .eq("agency_id", agencyId),

        supabase
            .from("applications")
            .select(`
        id,
        students (
          destination_country
        )
      `)
            .eq("agency_id", agencyId),
    ]);

    /* ===== Basic KPIs ===== */

    const totalStudents = studentsRes.count ?? 0;
    const totalApplications = applicationsRes.data?.length ?? 0;

    const activeApplications =
        applicationsRes.data?.filter(
            (a: any) => a.status !== "completed"
        ).length ?? 0;

    const totalRevenue =
        revenueRes.data?.reduce(
            (sum: number, a: any) =>
                sum + (Number(a.commission_amount) || 0),
            0
        ) ?? 0;

    const totalVisas = visasRes.data?.length ?? 0;
    const approvedCount =
        visasRes.data?.filter((v: any) => v.status === "approved").length ?? 0;

    const rejectedCount =
        visasRes.data?.filter((v: any) => v.status === "rejected").length ?? 0;

    const successRate =
        totalVisas === 0
            ? 0
            : Math.round((approvedCount / totalVisas) * 100);

    const rejectionRate =
        totalVisas === 0
            ? 0
            : Math.round((rejectedCount / totalVisas) * 100);

    /* ===== Monthly Applications ===== */

    const monthlyApplications: Record<string, number> = {};

    monthlyAppsRes.data?.forEach((app: any) => {
        const month = new Date(app.created_at)
            .toLocaleString("default", { month: "short" });
        monthlyApplications[month] =
            (monthlyApplications[month] || 0) + 1;
    });

    const monthlyRevenue: Record<string, number> = {};

    monthlyRevenueRes.data?.forEach((app: any) => {
        const month = new Date(app.created_at)
            .toLocaleString("default", { month: "short" });

        monthlyRevenue[month] =
            (monthlyRevenue[month] || 0) +
            (Number(app.commission_amount) || 0);
    });

    /* ===== Visa Status Distribution ===== */

    const visaDistribution: Record<string, number> = {};

    visaStatusRes.data?.forEach((v: any) => {
        visaDistribution[v.status] =
            (visaDistribution[v.status] || 0) + 1;
    });

    /* ===== Country Distribution ===== */

    const countryDistribution: Record<string, number> = {};

    countryRes.data?.forEach((app: any) => {
        const country = app.students?.destination_country || "Unknown";
        countryDistribution[country] =
            (countryDistribution[country] || 0) + 1;
    });

    return NextResponse.json({
        totalStudents,
        totalApplications,
        activeApplications,
        totalRevenue,
        successRate,
        rejectionRate,
        monthlyApplications,
        monthlyRevenue,
        visaDistribution,
        countryDistribution,
    });
}