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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const page = await db.sitePage.findUnique({ where: { id } });
    if (!page || page.creatorId !== creator.id) {
      return NextResponse.json({ error: "Page introuvable." }, { status: 404 });
    }
    const body = await req.json();
    const { title, content, slug, showInNav, order, published } = body as {
      title?: string;
      content?: string;
      slug?: string;
      showInNav?: boolean;
      order?: number;
      published?: boolean;
    };

    const data: Record<string, unknown> = {};
    if (typeof title === "string") data.title = title.trim();
    if (typeof content === "string") data.content = content;
    if (typeof showInNav === "boolean") data.showInNav = showInNav;
    if (typeof order === "number") data.order = order;
    if (typeof published === "boolean") data.published = published;
    if (typeof slug === "string" && slug.trim()) {
      const newSlug = slugify(slug);
      if (newSlug && newSlug !== page.slug) {
        const exists = await db.sitePage.findUnique({
          where: { creatorId_slug: { creatorId: creator.id, slug: newSlug } },
        });
        if (exists) {
          return NextResponse.json({ error: "Ce slug est déjà utilisé." }, { status: 400 });
        }
        data.slug = newSlug;
      }
    }

    await db.sitePage.update({ where: { id }, data });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[site-page.patch]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const page = await db.sitePage.findUnique({ where: { id } });
    if (!page || page.creatorId !== creator.id) {
      return NextResponse.json({ error: "Page introuvable." }, { status: 404 });
    }
    await db.sitePage.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[site-page.delete]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
