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
    const highlight = await db.highlight.findUnique({ where: { id } });
    if (!highlight || highlight.userId !== session.id) {
      return NextResponse.json({ error: "Introuvable." }, { status: 404 });
    }
    await db.highlight.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[highlights.delete]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
