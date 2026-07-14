import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ ebookId: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
    }
    const { ebookId } = await params;
    const ebook = await db.ebook.findUnique({ where: { id: ebookId } });
    if (!ebook) {
      return NextResponse.json({ error: "Ebook introuvable." }, { status: 404 });
    }
    // upsert (unique userId+ebookId)
    const existing = await db.wishlist.findUnique({
      where: { userId_ebookId: { userId: session.id, ebookId } },
    });
    if (existing) {
      await db.wishlist.delete({ where: { id: existing.id } });
      return NextResponse.json({ wishlisted: false });
    }
    await db.wishlist.create({ data: { userId: session.id, ebookId } });
    return NextResponse.json({ wishlisted: true });
  } catch (err) {
    console.error("[wishlist.toggle]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
