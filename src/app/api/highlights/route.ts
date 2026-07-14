import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ items: [] });
    }
    const url = new URL(req.url);
    const ebookId = url.searchParams.get("ebookId");
    const where: Record<string, unknown> = { userId: session.id };
    if (ebookId) where.ebookId = ebookId;
    const items = await db.highlight.findMany({
      where,
      include: { ebook: { select: { title: true, slug: true, coverColor: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({
      items: items.map((h) => ({
        id: h.id,
        ebookId: h.ebookId,
        chapterIdx: h.chapterIdx,
        text: h.text,
        note: h.note,
        color: h.color,
        createdAt: h.createdAt.toISOString(),
        ebook: h.ebook,
      })),
    });
  } catch (err) {
    console.error("[highlights.list]", err);
    return NextResponse.json({ items: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
    }
    const body = await req.json();
    const { ebookId, chapterIdx, text, note, color } = body as {
      ebookId?: string;
      chapterIdx?: number;
      text?: string;
      note?: string;
      color?: string;
    };
    if (!ebookId || !text) {
      return NextResponse.json({ error: "Ebook et texte requis." }, { status: 400 });
    }
    const highlight = await db.highlight.create({
      data: {
        userId: session.id,
        ebookId,
        chapterIdx: chapterIdx ?? 0,
        text: text.slice(0, 1000),
        note: note || null,
        color: color || "yellow",
      },
    });
    return NextResponse.json({ id: highlight.id });
  } catch (err) {
    console.error("[highlights.create]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
