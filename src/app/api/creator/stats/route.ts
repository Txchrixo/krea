import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

function monthKey(d: Date): string {
  return ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"][d.getMonth()];
}

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "CREATOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }
    // Admins without a creator profile get an empty stats response
    if (session.role === "ADMIN" && !session.creatorSlug) {
      return NextResponse.json({
        totalRevenue: 0,
        totalSales: 0,
        walletBalance: 0,
        totalEbooks: 0,
        publishedEbooks: 0,
        ratingAvg: 0,
        conversionRate: 0,
        monthlyData: [],
        topEbooks: [],
        recentOrders: [],
        geographicData: [],
        paymentMethodData: [],
      });
    }
    const creator = await db.creator.findUnique({
      where: { slug: session.creatorSlug! },
      include: { ebooks: true },
    });
    if (!creator) {
      return NextResponse.json(
        { error: "Créateur introuvable." },
        { status: 404 }
      );
    }
    const ebookIds = creator.ebooks.map((e) => e.id);

    // recent orders
    const recentOrdersRows = await db.order.findMany({
      where: { ebookId: { in: ebookIds } },
      include: { buyer: { select: { name: true } }, ebook: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    const recentOrders = recentOrdersRows.map((o) => ({
      id: o.id,
      ref: o.ref,
      buyerName: o.buyer.name || "Client",
      ebookTitle: o.ebook.title,
      amount: o.amount,
      creatorEarning: o.creatorEarning,
      paymentMethod: o.paymentMethod,
      createdAt: o.createdAt.toISOString(),
    }));

    // monthly data : last 6 months
    const now = new Date();
    const months: { month: string; revenue: number; sales: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const ords = await db.order.findMany({
        where: {
          ebookId: { in: ebookIds },
          createdAt: { gte: d, lt: end },
          paymentStatus: "PAID",
        },
        select: { creatorEarning: true },
      });
      months.push({
        month: monthKey(d),
        revenue: ords.reduce((s, o) => s + o.creatorEarning, 0),
        sales: ords.length,
      });
    }

    // top ebooks
    const topEbooksRows = [...creator.ebooks]
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 5);
    const topEbooks = await Promise.all(
      topEbooksRows.map(async (e) => {
        const orders = await db.order.findMany({
          where: { ebookId: e.id, paymentStatus: "PAID" },
          select: { creatorEarning: true },
        });
        const revenue = orders.reduce((s, o) => s + o.creatorEarning, 0);
        return {
          id: e.id,
          title: e.title,
          coverUrl: e.coverUrl,
          coverColor: e.coverColor,
          sales: e.salesCount,
          revenue,
          rating: e.ratingAvg,
        };
      })
    );

    const publishedEbooks = creator.ebooks.filter(
      (e) => e.status === "PUBLISHED"
    ).length;
    const ratingAvg =
      creator.ebooks.length > 0
        ? Math.round(
            (creator.ebooks.reduce((s, e) => s + e.ratingAvg, 0) /
              creator.ebooks.length) *
              10
          ) / 10
        : 0;
    const conversionRate =
      creator.totalSales > 0
        ? Math.round(
            (creator.totalSales / (creator.totalSales * 4 + 10)) * 1000
          ) / 10
        : 0;

    // geographic distribution + payment methods
    const allOrders = await db.order.findMany({
      where: { ebookId: { in: ebookIds }, paymentStatus: "PAID" },
      select: { country: true, paymentMethod: true },
    });
    const countryMap: Record<string, number> = {};
    const methodMap: Record<string, number> = {};
    for (const o of allOrders) {
      const c = o.country || "Inconnu";
      countryMap[c] = (countryMap[c] || 0) + 1;
      methodMap[o.paymentMethod] = (methodMap[o.paymentMethod] || 0) + 1;
    }
    const countryNames: Record<string, string> = {
      CM: "Cameroun", SN: "Sénégal", CI: "Côte d'Ivoire", NG: "Nigeria",
      ML: "Mali", BF: "Burkina Faso", FR: "France", BE: "Belgique", CA: "Canada",
    };
    const geographicData = Object.entries(countryMap)
      .map(([code, count]) => ({ code, label: countryNames[code] || code, count }))
      .sort((a, b) => b.count - a.count);
    const paymentMethodData = Object.entries(methodMap)
      .map(([method, count]) => ({ method, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      totalRevenue: creator.totalRevenue,
      totalSales: creator.totalSales,
      walletBalance: creator.walletBalance,
      totalEbooks: creator.ebooks.length,
      publishedEbooks,
      ratingAvg,
      conversionRate,
      monthlyData: months,
      topEbooks,
      recentOrders,
      geographicData,
      paymentMethodData,
    });
  } catch (err) {
    console.error("[creator.stats]", err);
    return NextResponse.json(
      { error: "Erreur lors du chargement des statistiques." },
      { status: 500 }
    );
  }
}
