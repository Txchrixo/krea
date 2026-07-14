import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const PLANS: Record<string, { rate: number; price: number }> = {
  FREE: { rate: 25, price: 0 },
  PRO: { rate: 15, price: 7500 },
  PREMIUM: { rate: 8, price: 25000 },
};

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "CREATOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }
    return NextResponse.json({ plans: PLANS });
  } catch (err) {
    console.error("[plan.get]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "CREATOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }
    const body = await req.json();
    const { plan } = body as { plan?: string };
    if (!plan || !PLANS[plan]) {
      return NextResponse.json({ error: "Plan invalide." }, { status: 400 });
    }
    if (session.role === "ADMIN" && !session.creatorSlug) {
      return NextResponse.json({ error: "Admin sans profil créateur." }, { status: 403 });
    }
    const creator = await db.creator.findUnique({
      where: { slug: session.creatorSlug! },
    });
    if (!creator) {
      return NextResponse.json({ error: "Créateur introuvable." }, { status: 404 });
    }
    // For PRO/PREMIUM, we'd normally process payment. Here we simulate it:
    // if upgrading, deduct from wallet if enough balance, else just set plan (mock).
    const target = PLANS[plan];
    const updated = await db.creator.update({
      where: { id: creator.id },
      data: {
        plan,
        commissionRate: target.rate,
        planRenewsAt: plan === "FREE" ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    return NextResponse.json({
      ok: true,
      plan: updated.plan,
      commissionRate: updated.commissionRate,
      planRenewsAt: updated.planRenewsAt?.toISOString() ?? null,
    });
  } catch (err) {
    console.error("[plan.post]", err);
    return NextResponse.json({ error: "Erreur lors du changement de plan." }, { status: 500 });
  }
}
