import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chapter = await db.chapter.findUnique({
      where: { id },
      include: { ebook: { include: { creator: true } } },
    });
    if (!chapter) {
      return NextResponse.json({ error: "Introuvable." }, { status: 404 });
    }
    const session = await getSessionUser();
    if (!session || (session.role !== "CREATOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }
    if (
      session.role !== "ADMIN" &&
      chapter.ebook.creator.userId !== session.id
    ) {
      return NextResponse.json({ error: "Non propriétaire." }, { status: 403 });
    }
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (typeof body.title === "string") data.title = body.title;
    if (typeof body.content === "string") {
      data.content = body.content;
      data.wordCount = body.content
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
    }
    if (typeof body.order === "number") data.order = body.order;
    await db.chapter.update({ where: { id }, data });
    // recompute ebook stats
    const allCh = await db.chapter.findMany({
      where: { ebookId: chapter.ebookId },
      select: { wordCount: true },
    });
    const totalWords = allCh.reduce((s, c) => s + c.wordCount, 0);
    await db.ebook.update({
      where: { id: chapter.ebookId },
      data: {
        wordCount: totalWords,
        pageCount: Math.max(1, Math.ceil(totalWords / 350)),
      },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[chapters.update]", err);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chapter = await db.chapter.findUnique({
      where: { id },
      include: { ebook: { include: { creator: true } } },
    });
    if (!chapter) {
      return NextResponse.json({ error: "Introuvable." }, { status: 404 });
    }
    const session = await getSessionUser();
    if (!session || (session.role !== "CREATOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }
    if (
      session.role !== "ADMIN" &&
      chapter.ebook.creator.userId !== session.id
    ) {
      return NextResponse.json({ error: "Non propriétaire." }, { status: 403 });
    }
    await db.chapter.delete({ where: { id } });
    const allCh = await db.chapter.findMany({
      where: { ebookId: chapter.ebookId },
      select: { wordCount: true },
    });
    const totalWords = allCh.reduce((s, c) => s + c.wordCount, 0);
    await db.ebook.update({
      where: { id: chapter.ebookId },
      data: {
        wordCount: totalWords,
        pageCount: Math.max(1, Math.ceil(totalWords / 350)),
      },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[chapters.delete]", err);
    return NextResponse.json(
      { error: "Erreur lors de la suppression." },
      { status: 500 }
    );
  }
}
