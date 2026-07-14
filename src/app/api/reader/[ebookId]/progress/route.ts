import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ ebookId: string }> }
) {
  try {
    const { ebookId: ebookParam } = await params;
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
    }
    const ebook = await db.ebook.findFirst({
      where: { OR: [{ id: ebookParam }, { slug: ebookParam }] },
      select: { id: true },
    });
    if (!ebook) {
      return NextResponse.json({ error: "Ebook introuvable." }, { status: 404 });
    }
    const license = await db.license.findFirst({
      where: { userId: session.id, ebookId: ebook.id },
    });
    if (!license) {
      return NextResponse.json(
        { error: "Licence introuvable." },
        { status: 403 }
      );
    }
    const body = await req.json();
    const progress = Math.max(
      0,
      Math.min(100, Math.floor(Number(body.progress) || 0))
    );
    await db.license.update({
      where: { id: license.id },
      data: {
        progress,
        lastReadAt: new Date(),
      },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[reader.progress]", err);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour." },
      { status: 500 }
    );
  }
}
