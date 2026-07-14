import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { slugify } from "@/lib/format";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const creatorSlug = url.searchParams.get("creatorSlug");
    const where: Record<string, unknown> = { status: "PUBLISHED" };
    if (creatorSlug) where.creator = { slug: creatorSlug };

    const bundles = await db.bundle.findMany({
      where,
      include: {
        creator: { select: { slug: true, displayName: true, avatarUrl: true, verified: true } },
        items: {
          include: {
            ebook: {
              select: {
                id: true, slug: true, title: true, subtitle: true, coverUrl: true,
                coverColor: true, price: true, category: true, ratingAvg: true,
                ratingCount: true, salesCount: true, pageCount: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      items: bundles.map((b) => ({
        id: b.id,
        title: b.title,
        slug: b.slug,
        description: b.description,
        price: b.price,
        originalTotal: b.originalTotal,
        discountPct: b.discountPct,
        coverColor: b.coverColor,
        creator: b.creator,
        ebooks: b.items.map((it) => it.ebook),
        ebookCount: b.items.length,
        createdAt: b.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("[bundles.list]", err);
    return NextResponse.json({ items: [] });
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
    const creator = await db.creator.findUnique({ where: { slug: session.creatorSlug! } });
    if (!creator) {
      return NextResponse.json({ error: "Créateur introuvable." }, { status: 404 });
    }

    const body = await req.json();
    const { title, description, price, ebookIds, coverColor } = body as {
      title?: string;
      description?: string;
      price?: number;
      ebookIds?: string[];
      coverColor?: string;
    };

    if (!title || !description || price === undefined || !ebookIds || ebookIds.length < 2) {
      return NextResponse.json({ error: "Titre, description, prix et au moins 2 ebooks requis." }, { status: 400 });
    }

    // Validate ebooks belong to creator
    const ebooks = await db.ebook.findMany({
      where: { id: { in: ebookIds }, creatorId: creator.id, status: "PUBLISHED" },
      select: { id: true, price: true },
    });
    if (ebooks.length !== ebookIds.length) {
      return NextResponse.json({ error: "Certains ebooks sont invalides." }, { status: 400 });
    }

    const originalTotal = ebooks.reduce((s, e) => s + e.price, 0);
    const discountPct = Math.round(((originalTotal - price) / originalTotal) * 100);

    let base = slugify(title);
    if (!base) base = `bundle-${Date.now().toString(36)}`;
    let slug = base;
    while (await db.bundle.findUnique({ where: { slug } })) {
      slug = `${base}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const bundle = await db.bundle.create({
      data: {
        creatorId: creator.id,
        title,
        slug,
        description,
        price: Math.max(0, Math.floor(price)),
        originalTotal,
        discountPct: Math.max(0, discountPct),
        coverColor: coverColor || "#1F4A2E",
        status: "PUBLISHED",
        items: {
          create: ebookIds.map((id: string) => ({ ebookId: id })),
        },
      },
    });

    return NextResponse.json({ id: bundle.id, slug: bundle.slug });
  } catch (err) {
    console.error("[bundles.create]", err);
    return NextResponse.json({ error: "Erreur lors de la création." }, { status: 500 });
  }
}
