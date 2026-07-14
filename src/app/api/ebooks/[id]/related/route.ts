import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // resolve ebook by id or slug
    const ebook = await db.ebook.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      select: { id: true, category: true, creatorId: true },
    });
    if (!ebook) {
      return NextResponse.json({ items: [] });
    }
    // same category first, then same creator, exclude self
    const related = await db.ebook.findMany({
      where: {
        status: "PUBLISHED",
        id: { not: ebook.id },
        OR: [{ category: ebook.category }, { creatorId: ebook.creatorId }],
      },
      include: { creator: { select: { slug: true, displayName: true, avatarUrl: true, verified: true } } },
      take: 6,
      orderBy: { salesCount: "desc" },
    });
    const items = related.map((e) => ({
      id: e.id,
      slug: e.slug,
      title: e.title,
      subtitle: e.subtitle,
      coverUrl: e.coverUrl,
      coverColor: e.coverColor,
      price: e.price,
      compareAtPrice: e.compareAtPrice,
      currency: e.currency,
      category: e.category,
      ratingAvg: e.ratingAvg,
      ratingCount: e.ratingCount,
      salesCount: e.salesCount,
      pageCount: e.pageCount,
      isBestseller: e.isBestseller,
      featured: e.featured,
      creator: e.creator,
    }));
    return NextResponse.json({ items });
  } catch (err) {
    console.error("[ebooks.related]", err);
    return NextResponse.json({ items: [] });
  }
}
