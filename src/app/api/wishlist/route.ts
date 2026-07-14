import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { toEbookCard } from "@/lib/mappers";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ items: [], ids: [] });
    }
    const items = await db.wishlist.findMany({
      where: { userId: session.id },
      include: { ebook: { include: { creator: { include: { user: true } } } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({
      ids: items.map((w) => w.ebookId),
      items: items.map((w) => toEbookCard(w.ebook)),
    });
  } catch (err) {
    console.error("[wishlist.list]", err);
    return NextResponse.json({ items: [], ids: [] });
  }
}
