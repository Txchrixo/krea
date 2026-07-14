import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toEbookCard } from "@/lib/mappers";
import { slugify } from "@/lib/format";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category") || undefined;
    const q = url.searchParams.get("q") || undefined;
    const sort = url.searchParams.get("sort") || "popular";
    const creatorSlug = url.searchParams.get("creatorSlug") || undefined;
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.min(
      60,
      Math.max(1, parseInt(url.searchParams.get("limit") || "12", 10))
    );

    const where: Record<string, unknown> = { status: "PUBLISHED" };
    if (category && category !== "all") where.category = category;
    if (creatorSlug) {
      where.creator = { slug: creatorSlug };
    }
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { subtitle: { contains: q } },
      ];
    }
    // price range filter
    const minPrice = url.searchParams.get("minPrice");
    const maxPrice = url.searchParams.get("maxPrice");
    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (minPrice) priceFilter.gte = parseInt(minPrice, 10);
      if (maxPrice) priceFilter.lte = parseInt(maxPrice, 10);
      where.price = priceFilter;
    }

    let orderBy: Record<string, "asc" | "desc"> = { salesCount: "desc" };
    if (sort === "new") orderBy = { publishedAt: "desc" };
    else if (sort === "price_asc") orderBy = { price: "asc" };
    else if (sort === "price_desc") orderBy = { price: "desc" };
    else if (sort === "rating") orderBy = { ratingAvg: "desc" };

    const [total, rows] = await Promise.all([
      db.ebook.count({ where: where as never }),
      db.ebook.findMany({
        where: where as never,
        include: { creator: { include: { user: true } } },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      items: rows.map(toEbookCard),
      total,
      page,
    });
  } catch (err) {
    console.error("[ebooks.list]", err);
    return NextResponse.json(
      { error: "Erreur lors du chargement des ebooks." },
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
    const creator = await db.creator.findUnique({
      where: { slug: session.creatorSlug! },
    });
    if (!creator) {
      return NextResponse.json(
        { error: "Profil créateur introuvable." },
        { status: 404 }
      );
    }
    const body = await req.json();
    const {
      title,
      subtitle,
      description,
      price,
      category,
      coverUrl,
      coverColor,
    } = body as {
      title?: string;
      subtitle?: string;
      description?: string;
      price?: number;
      category?: string;
      coverUrl?: string;
      coverColor?: string;
    };
    if (!title || !description || price === undefined || !category) {
      return NextResponse.json(
        { error: "Titre, description, prix et catégorie requis." },
        { status: 400 }
      );
    }
    let base = slugify(title);
    if (!base) base = `ebook-${Date.now().toString(36)}`;
    let slug = base;
    while (await db.ebook.findUnique({ where: { slug } })) {
      slug = `${base}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    const ebook = await db.ebook.create({
      data: {
        creatorId: creator.id,
        title,
        subtitle: subtitle || null,
        description,
        price: Math.max(0, Math.floor(price)),
        category,
        coverUrl: coverUrl ?? "",
        coverColor: coverColor || "#1F4A2E",
        status: "DRAFT",
      },
    });
    return NextResponse.json({ id: ebook.id });
  } catch (err) {
    console.error("[ebooks.create]", err);
    return NextResponse.json(
      { error: "Erreur lors de la création." },
      { status: 500 }
    );
  }
}
