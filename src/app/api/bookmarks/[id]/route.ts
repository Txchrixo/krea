import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
    }
    const { id } = await params;
    const bookmark = await db.bookmark.findUnique({ where: { id } });
    if (!bookmark || bookmark.userId !== session.id) {
      return NextResponse.json({ error: "Introuvable." }, { status: 404 });
    }
    await db.bookmark.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[bookmarks.delete]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
