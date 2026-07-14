import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { genRef } from "@/lib/format";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "CREATOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }
    if (session.role === "ADMIN" && !session.creatorSlug) {
      return NextResponse.json({ items: [] });
    }
    const creator = await db.creator.findUnique({
      where: { slug: session.creatorSlug! },
    });
    if (!creator) {
      return NextResponse.json(
        { error: "Créateur introuvable." },
        { status: 404 }
      );
    }
    const payouts = await db.payout.findMany({
      where: { creatorId: creator.id },
      orderBy: { createdAt: "desc" },
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
      })),
    });
  } catch (err) {
    console.error("[creator.payouts.list]", err);
    return NextResponse.json(
      { error: "Erreur lors du chargement." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "CREATOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }
    if (session.role === "ADMIN" && !session.creatorSlug) {
      return NextResponse.json({ error: "Admin sans profil créateur." }, { status: 403 });
    }
    const creator = await db.creator.findUnique({
      where: { slug: session.creatorSlug! },
    });
    if (!creator) {
      return NextResponse.json(
        { error: "Créateur introuvable." },
        { status: 404 }
      );
    }
    const body = await req.json();
    const amount = Math.floor(Number(body.amount) || 0);
    const method = typeof body.method === "string" ? body.method : "MTN";
    if (amount < 10000) {
      return NextResponse.json(
        { error: "Le retrait minimum est de 10 000 FCFA." },
        { status: 400 }
      );
    }
    if (amount > creator.walletBalance) {
      return NextResponse.json(
        { error: "Solde insuffisant." },
        { status: 400 }
      );
    }
    const fee = Math.max(200, Math.round(amount * 0.02));
    const ref = genRef("PAY");
    const payout = await db.payout.create({
      data: {
        ref,
        creatorId: creator.id,
        amount,
        fee,
        method,
        status: "PENDING",
      },
    });
    await db.creator.update({
      where: { id: creator.id },
      data: { walletBalance: { decrement: amount } },
    });
    return NextResponse.json({
      id: payout.id,
      ref: payout.ref,
      amount: payout.amount,
      fee: payout.fee,
      method: payout.method,
      status: payout.status,
      createdAt: payout.createdAt.toISOString(),
    });
  } catch (err) {
    console.error("[creator.payouts.create]", err);
    return NextResponse.json(
      { error: "Erreur lors de la demande de retrait." },
      { status: 500 }
    );
  }
}
