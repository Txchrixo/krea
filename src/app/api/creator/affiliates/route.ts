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
      return NextResponse.json({ error: "Créateur introuvable." }, { status: 404 });
    }
    const affiliates = await db.affiliateLink.findMany({
      where: { creatorId: creator.id },
      include: { ebook: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({
      items: affiliates.map((a) => ({
        id: a.id,
        code: a.code,
        commission: a.commission,
        clicks: a.clicks,
        conversions: a.conversions,
        ebook: a.ebook ? { title: a.ebook.title } : null,
        createdAt: a.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("[affiliates.get]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
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
      return NextResponse.json({ error: "Créateur introuvable." }, { status: 404 });
    }
    const body = await req.json();
    const { ebookId, commission } = body as { ebookId?: string; commission?: number };

    const code = (creator.slug + "-" + Math.random().toString(36).slice(2, 7)).toUpperCase();

    const aff = await db.affiliateLink.create({
      data: {
        code,
        creatorId: creator.id,
        ebookId: ebookId || null,
        commission: Math.max(5, Math.min(50, Math.floor(commission ?? 20))),
      },
      include: { ebook: { select: { title: true } } },
    });
    return NextResponse.json({
      item: {
        id: aff.id,
        code: aff.code,
        commission: aff.commission,
        clicks: aff.clicks,
        conversions: aff.conversions,
        ebook: aff.ebook ? { title: aff.ebook.title } : null,
        createdAt: aff.createdAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("[affiliates.post]", err);
    return NextResponse.json({ error: "Erreur lors de la création." }, { status: 500 });
  }
}
