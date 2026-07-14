import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin requis." }, { status: 401 });
    }

    // Recent signups (last 10)
    const recentSignups = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        country: true,
        createdAt: true,
      },
    });

    // Recent orders (last 10)
    const recentOrders = await db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        buyer: { select: { name: true, email: true } },
        ebook: { select: { title: true } },
      },
    });

    // Recent payouts (last 5)
    const recentPayouts = await db.payout.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        creator: { select: { displayName: true } },
      },
    });

    // Recent reviews (last 5)
    const recentReviews = await db.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { name: true, email: true } },
        ebook: { select: { title: true } },
      },
    });

    return NextResponse.json({
      signups: recentSignups.map((u) => ({
        id: u.id,
        name: u.name || "Sans nom",
        email: u.email,
        role: u.role,
        country: u.country || "—",
        createdAt: u.createdAt.toISOString(),
      })),
      orders: recentOrders.map((o) => ({
        id: o.id,
        ref: o.ref,
        buyerName: o.buyer.name || o.buyer.email,
        ebookTitle: o.ebook.title,
        amount: o.amount,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt.toISOString(),
      })),
      payouts: recentPayouts.map((p) => ({
        id: p.id,
        ref: p.ref,
        creatorName: p.creator.displayName,
        amount: p.amount,
        method: p.method,
        status: p.status,
        createdAt: p.createdAt.toISOString(),
      })),
      reviews: recentReviews.map((r) => ({
        id: r.id,
        userName: r.user.name || r.user.email,
        ebookTitle: r.ebook.title,
        rating: r.rating,
        comment: r.comment?.slice(0, 80) || null,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("[admin.activity]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
