import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ebook = await db.ebook.findUnique({
      where: { id },
      include: { creator: true },
    });
    if (!ebook) {
      return NextResponse.json({ error: "Introuvable." }, { status: 404 });
    }
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }
    const isOwner = ebook.creator.userId === session.id || session.role === "ADMIN";
    let licensed = false;
    if (!isOwner) {
      const lic = await db.license.findFirst({
        where: { userId: session.id, ebookId: ebook.id, status: "ACTIVE" },
      });
      licensed = !!lic;
    }
    if (!isOwner && !licensed) {
      return NextResponse.json(
        { error: "Accès refusé — licence requise." },
        { status: 403 }
      );
    }
    const chapters = await db.chapter.findMany({
      where: { ebookId: ebook.id },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({
      chapters: chapters.map((c) => ({
        id: c.id,
        title: c.title,
        content: c.content,
        order: c.order,
        wordCount: c.wordCount,
      })),
    });
  } catch (err) {
    console.error("[chapters.list]", err);
    return NextResponse.json(
      { error: "Erreur lors du chargement des chapitres." },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ebook = await db.ebook.findUnique({
      where: { id },
      include: { creator: true, chapters: true },
    });
    if (!ebook) {
      return NextResponse.json({ error: "Introuvable." }, { status: 404 });
    }
    const session = await getSessionUser();
    if (!session || (session.role !== "CREATOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }
    if (
      session.role !== "ADMIN" &&
      ebook.creator.userId !== session.id
    ) {
      return NextResponse.json({ error: "Non propriétaire." }, { status: 403 });
    }
    const body = await req.json();
    const { title, content, order } = body as {
      title?: string;
      content?: string;
      order?: number;
    };
    if (!title) {
      return NextResponse.json({ error: "Titre requis." }, { status: 400 });
    }
    const wc = (content || "").trim().split(/\s+/).filter(Boolean).length;
    const nextOrder =
      typeof order === "number"
        ? order
        : ebook.chapters.reduce((m, c) => Math.max(m, c.order), -1) + 1;
    const chapter = await db.chapter.create({
      data: {
        ebookId: ebook.id,
        title,
        content: content || "",
        order: nextOrder,
        wordCount: wc,
      },
    });
    // recompute ebook stats
    const allCh = await db.chapter.findMany({
      where: { ebookId: ebook.id },
      select: { wordCount: true },
    });
    const totalWords = allCh.reduce((s, c) => s + c.wordCount, 0);
    await db.ebook.update({
      where: { id: ebook.id },
      data: {
        wordCount: totalWords,
        pageCount: Math.max(1, Math.ceil(totalWords / 350)),
      },
    });
    return NextResponse.json({ id: chapter.id });
  } catch (err) {
    console.error("[chapters.create]", err);
    return NextResponse.json(
      { error: "Erreur lors de la création du chapitre." },
      { status: 500 }
    );
  }
}
