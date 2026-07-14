import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

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
    const coupons = await db.coupon.findMany({
      where: { creatorId: creator.id },
      include: { ebook: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({
      items: coupons.map((c) => ({
        id: c.id,
        code: c.code,
        percentOff: c.percentOff,
        ebookId: c.ebookId,
        ebook: c.ebook ? { title: c.ebook.title } : null,
        maxRedemptions: c.maxRedemptions,
        redeemed: c.redeemed,
        active: c.active,
        expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
        createdAt: c.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("[coupons.list]", err);
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
    const {
      code,
      percentOff,
      ebookId,
      maxRedemptions,
      expiresAt,
    } = body as {
      code?: string;
      percentOff?: number;
      ebookId?: string;
      maxRedemptions?: number;
      expiresAt?: string;
    };
    if (!code || percentOff === undefined) {
      return NextResponse.json(
        { error: "Code et pourcentage requis." },
        { status: 400 }
      );
    }
    const pct = Math.max(1, Math.min(90, Math.floor(percentOff)));
    const existing = await db.coupon.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json(
        { error: "Ce code existe déjà." },
        { status: 409 }
      );
    }
    // if ebookId given, ensure it belongs to creator
    if (ebookId) {
      const eb = await db.ebook.findUnique({ where: { id: ebookId } });
      if (!eb || eb.creatorId !== creator.id) {
        return NextResponse.json(
          { error: "Ebook invalide." },
          { status: 400 }
        );
      }
    }
    const coupon = await db.coupon.create({
      data: {
        code: code.toUpperCase(),
        creatorId: creator.id,
        ebookId: ebookId || null,
        percentOff: pct,
        maxRedemptions: maxRedemptions ?? 100,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        active: true,
      },
    });
    return NextResponse.json({ id: coupon.id });
  } catch (err) {
    console.error("[coupons.create]", err);
    return NextResponse.json(
      { error: "Erreur lors de la création." },
      { status: 500 }
    );
  }
}
