import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin requis." }, { status: 401 });
    }
    const url = new URL(req.url);
    const role = url.searchParams.get("role");
    const q = url.searchParams.get("q");
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = 20;

    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (q) {
      where.OR = [
        { email: { contains: q } },
        { name: { contains: q } },
      ];
    }

    const [total, users] = await Promise.all([
      db.user.count({ where }),
      db.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          banned: true,
          bannedReason: true,
          country: true,
          phone: true,
          createdAt: true,
          creator: {
            select: {
              slug: true,
              displayName: true,
              plan: true,
              totalSales: true,
              totalRevenue: true,
              walletBalance: true,
              verified: true,
            },
          },
          _count: {
            select: { orders: true, licenses: true, reviews: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      items: users.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      })),
      total,
      page,
    });
  } catch (err) {
    console.error("[admin.users]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
