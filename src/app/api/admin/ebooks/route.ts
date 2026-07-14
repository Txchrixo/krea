import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin requis." }, { status: 401 });
    }
    const ebooks = await db.ebook.findMany({
      include: { creator: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({
      items: ebooks.map((e) => ({
        id: e.id,
        slug: e.slug,
        title: e.title,
        status: e.status,
        price: e.price,
        category: e.category,
        salesCount: e.salesCount,
        ratingAvg: e.ratingAvg,
        featured: e.featured,
        isBestseller: e.isBestseller,
        createdAt: e.createdAt.toISOString(),
        creator: {
          id: e.creator.id,
          slug: e.creator.slug,
          displayName: e.creator.displayName,
        },
      })),
    });
  } catch (err) {
    console.error("[admin.ebooks.list]", err);
    return NextResponse.json(
      { error: "Erreur lors du chargement." },
      { status: 500 }
    );
  }
}
