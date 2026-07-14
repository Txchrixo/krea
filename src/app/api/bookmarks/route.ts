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
    const items = await db.bookmark.findMany({
      where,
      include: { ebook: { select: { title: true, slug: true, coverColor: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({
      items: items.map((b) => ({
        id: b.id,
        ebookId: b.ebookId,
        chapterIdx: b.chapterIdx,
        label: b.label,
        note: b.note,
        createdAt: b.createdAt.toISOString(),
        ebook: b.ebook,
      })),
    });
  } catch (err) {
    console.error("[bookmarks.list]", err);
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
    const { ebookId, chapterIdx, label, note } = body as {
      ebookId?: string;
      chapterIdx?: number;
      label?: string;
      note?: string;
    };
    if (!ebookId) {
      return NextResponse.json({ error: "Ebook requis." }, { status: 400 });
    }
    const bookmark = await db.bookmark.create({
      data: {
        userId: session.id,
        ebookId,
        chapterIdx: chapterIdx ?? 0,
        label: label || "",
        note: note || null,
      },
    });
    return NextResponse.json({ id: bookmark.id });
  } catch (err) {
    console.error("[bookmarks.create]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
