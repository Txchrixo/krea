import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin requis." }, { status: 401 });
    }
    const payouts = await db.payout.findMany({
      where: { status: "PENDING" },
      include: { creator: { include: { user: true } } },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({
      items: payouts.map((p) => ({
        id: p.id,
        ref: p.ref,
        amount: p.amount,
        fee: p.fee,
        method: p.method,
        status: p.status,
        createdAt: p.createdAt.toISOString(),
        creator: {
          id: p.creator.id,
          slug: p.creator.slug,
          displayName: p.creator.displayName,
          email: p.creator.user.email,
        },
      })),
    });
  } catch (err) {
    console.error("[admin.payouts.list]", err);
    return NextResponse.json(
      { error: "Erreur lors du chargement." },
      { status: 500 }
    );
  }
}
