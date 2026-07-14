import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

function monthKey(d: Date): string {
  return ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"][d.getMonth()];
}

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin requis." }, { status: 401 });
    }
    const [
      creatorsCount,
      ebooksCount,
      buyersCount,
      pendingPayouts,
      pendingEbooks,
      totalRevenueAgg,
      totalPayoutsAgg,
    ] = await Promise.all([
      db.creator.count(),
      db.ebook.count(),
      db.user.count({ where: { role: "BUYER" } }),
      db.payout.count({ where: { status: "PENDING" } }),
      db.ebook.count({ where: { status: "DRAFT" } }),
      db.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { amount: true } }),
      db.payout.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    ]);

    // monthly revenue data (last 6 months)
    const now = new Date();
    const monthlyData: { month: string; revenue: number; sales: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const ords = await db.order.findMany({
        where: {
          createdAt: { gte: d, lt: end },
          paymentStatus: "PAID",
        },
        select: { amount: true },
      });
      monthlyData.push({
        month: monthKey(d),
        revenue: ords.reduce((s, o) => s + o.amount, 0),
        sales: ords.length,
      });
    }

    // top creators by revenue
    const topCreators = await db.creator.findMany({
      orderBy: { totalRevenue: "desc" },
      take: 5,
      select: { id: true, displayName: true, slug: true, totalSales: true, totalRevenue: true, plan: true },
    });

    return NextResponse.json({
      totalRevenue: totalRevenueAgg._sum.amount || 0,
      totalPayouts: totalPayoutsAgg._sum.amount || 0,
      totalCreators: creatorsCount,
      totalEbooks: ebooksCount,
      totalReaders: buyersCount,
      pendingPayouts,
      pendingEbooks,
      monthlyData,
      topCreators,
    });
  } catch (err) {
    console.error("[admin.stats]", err);
    return NextResponse.json(
      { error: "Erreur lors du chargement." },
      { status: 500 }
    );
  }
}
