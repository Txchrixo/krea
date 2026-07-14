import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toEbookDetail } from "@/lib/mappers";
import { getSessionUser } from "@/lib/auth";
import { slugify } from "@/lib/format";

function isCuid(s: string): boolean {
  return /^c[a-z0-9]{20,}$/i.test(s);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ebook = await db.ebook.findFirst({
      where: isCuid(id) ? { id } : { slug: id },
      include: {
        creator: { include: { user: true } },
        chapters: {
          select: { id: true, title: true, order: true, wordCount: true },
        },
        reviews: {
          include: {
            user: { select: { name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!ebook || ebook.status !== "PUBLISHED") {
      // creators can see their own drafts
      if (ebook) {
        const session = await getSessionUser();
        if (
          session &&
          ebook.creator.userId === session.id
        ) {
          let owned = false;
          if (session) {
            const lic = await db.license.findFirst({
              where: { userId: session.id, ebookId: ebook.id },
            });
            owned = !!lic;
          }
          return NextResponse.json(toEbookDetail(ebook, owned));
        }
      }
      return NextResponse.json(
        { error: "Ebook introuvable." },
        { status: 404 }
      );
    }
    const session = await getSessionUser();
    let owned = false;
    if (session) {
      const lic = await db.license.findFirst({
        where: { userId: session.id, ebookId: ebook.id },
      });
      owned = !!lic;
    }
    return NextResponse.json(toEbookDetail(ebook, owned));
  } catch (err) {
    console.error("[ebooks.detail]", err);
    return NextResponse.json(
      { error: "Erreur lors du chargement." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "CREATOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }
    const { id } = await params;
    const ebook = await db.ebook.findUnique({
      where: { id },
      include: { creator: true, chapters: true },
    });
    if (!ebook) {
      return NextResponse.json({ error: "Introuvable." }, { status: 404 });
    }
    if (
      session.role !== "ADMIN" &&
      ebook.creator.userId !== session.id
    ) {
      return NextResponse.json({ error: "Non propriétaire." }, { status: 403 });
    }
    const body = await req.json();
    const allowed: Record<string, unknown> = {};
    const fields = [
      "title",
      "subtitle",
      "description",
      "price",
      "compareAtPrice",
      "category",
      "coverUrl",
      "coverColor",
      "featured",
      "isBestseller",
      "allowDownload",
      "watermarkMode",
      "deviceLimit",
      "status",
    ];
    for (const f of fields) {
      if (f in body) allowed[f] = body[f];
    }
    if (typeof allowed.price === "number")
      allowed.price = Math.max(0, Math.floor(allowed.price as number));
    if (typeof allowed.deviceLimit === "number")
      allowed.deviceLimit = Math.max(1, Math.floor(allowed.deviceLimit as number));

    // recompute word/page counts
    const chapters = ebook.chapters;
    const totalWords = chapters.reduce(
      (sum, c) => sum + c.wordCount,
      0
    );
    const totalPages = Math.max(1, Math.ceil(totalWords / 350));
    allowed.wordCount = totalWords;
    allowed.pageCount = totalPages;

    if (allowed.status === "PUBLISHED") {
      allowed.publishedAt = new Date();
    }
    if (typeof allowed.title === "string") {
      let base = slugify(allowed.title as string);
      if (!base) base = ebook.slug;
      if (base !== ebook.slug) {
        let slug = base;
        while (
          (await db.ebook.findFirst({
            where: { slug, NOT: { id: ebook.id } },
          }))
        ) {
          slug = `${base}-${Math.floor(1000 + Math.random() * 9000)}`;
        }
        allowed.slug = slug;
      }
    }

    const updated = await db.ebook.update({
      where: { id },
      data: allowed,
    });
    return NextResponse.json({ id: updated.id });
  } catch (err) {
    console.error("[ebooks.update]", err);
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
    const session = await getSessionUser();
    if (!session || (session.role !== "CREATOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }
    const { id } = await params;
    const ebook = await db.ebook.findUnique({
      where: { id },
      include: { creator: true },
    });
    if (!ebook) {
      return NextResponse.json({ error: "Introuvable." }, { status: 404 });
    }
    if (
      session.role !== "ADMIN" &&
      ebook.creator.userId !== session.id
    ) {
      return NextResponse.json({ error: "Non propriétaire." }, { status: 403 });
    }
    await db.ebook.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[ebooks.delete]", err);
    return NextResponse.json(
      { error: "Erreur lors de la suppression." },
      { status: 500 }
    );
  }
}
