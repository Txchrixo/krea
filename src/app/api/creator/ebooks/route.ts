import { NextResponse } from "next/server";
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
    const ebooks = await db.ebook.findMany({
      where: { creatorId: creator.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({
      items: ebooks.map((e) => ({
        id: e.id,
        slug: e.slug,
        title: e.title,
        coverUrl: e.coverUrl,
        coverColor: e.coverColor,
        price: e.price,
        status: e.status,
        salesCount: e.salesCount,
        ratingAvg: e.ratingAvg,
        pageCount: e.pageCount,
        createdAt: e.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("[creator.ebooks]", err);
    return NextResponse.json(
      { error: "Erreur lors du chargement." },
      { status: 500 }
    );
  }
}
