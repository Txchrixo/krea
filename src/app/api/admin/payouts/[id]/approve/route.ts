import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin requis." }, { status: 401 });
    }
    const { id } = await params;
    const payout = await db.payout.findUnique({ where: { id } });
    if (!payout) {
      return NextResponse.json(
        { error: "Paiement introuvable." },
        { status: 404 }
      );
    }
    const updated = await db.payout.update({
      where: { id },
      data: { status: "PAID" },
    });
    // update platform stats totalPayouts
    await db.platformStats.upsert({
      where: { id: "singleton" },
      update: { totalPayouts: { increment: payout.amount } },
      create: {
        id: "singleton",
        totalPayouts: payout.amount,
      },
    });
    return NextResponse.json({ id: updated.id, status: updated.status });
  } catch (err) {
    console.error("[admin.payouts.approve]", err);
    return NextResponse.json(
      { error: "Erreur lors de l'approbation." },
      { status: 500 }
    );
  }
}
