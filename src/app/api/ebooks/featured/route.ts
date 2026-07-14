import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toEbookCard } from "@/lib/mappers";

export async function GET() {
  try {
    const [featured, bestsellers] = await Promise.all([
      db.ebook.findMany({
        where: { status: "PUBLISHED", featured: true },
        include: { creator: { include: { user: true } } },
        orderBy: { salesCount: "desc" },
        take: 4,
      }),
      db.ebook.findMany({
        where: { status: "PUBLISHED", isBestseller: true },
        include: { creator: { include: { user: true } } },
        orderBy: { salesCount: "desc" },
        take: 4,
      }),
    ]);
    return NextResponse.json({
      featured: featured.map(toEbookCard),
      bestsellers: bestsellers.map(toEbookCard),
    });
  } catch (err) {
    console.error("[ebooks.featured]", err);
    return NextResponse.json(
      { error: "Erreur lors du chargement." },
      { status: 500 }
    );
  }
}
