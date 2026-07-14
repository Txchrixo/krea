import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCreator } from "@/lib/auth";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireCreator();
    if (!session || !session.creatorSlug) {
      return NextResponse.json({ error: "Créateur requis." }, { status: 403 });
    }
    const creator = await db.creator.findUnique({
      where: { slug: session.creatorSlug },
      select: { id: true },
    });
    if (!creator) {
      return NextResponse.json({ error: "Créateur introuvable." }, { status: 404 });
    }
    const body = await req.json();
    const { title, content, showInNav = true } = body as {
      title?: string;
      content?: string;
      showInNav?: boolean;
    };
    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Le titre est requis." }, { status: 400 });
    }
    let slug = slugify(title);
    if (!slug) slug = "page";
    // ensure uniqueness per creator
    let suffix = 1;
    const base = slug;
    while (
      await db.sitePage.findUnique({
        where: { creatorId_slug: { creatorId: creator.id, slug } },
      })
    ) {
      slug = `${base}-${suffix++}`;
    }
    const order = await db.sitePage.count({ where: { creatorId: creator.id } });
    const page = await db.sitePage.create({
      data: {
        creatorId: creator.id,
        slug,
        title: title.trim(),
        content: content ?? "",
        showInNav: !!showInNav,
        order,
        published: true,
      },
    });
    return NextResponse.json({
      page: {
        id: page.id,
        slug: page.slug,
        title: page.title,
        content: page.content,
        showInNav: page.showInNav,
        order: page.order,
        published: page.published,
        createdAt: page.createdAt.toISOString(),
        updatedAt: page.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("[site-page.create]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
