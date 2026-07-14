import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(url.searchParams.get("limit") || "10", 10))
    );
    // find ebook by id or slug
    const ebook = await db.ebook.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });
    if (!ebook) {
      return NextResponse.json({ error: "Introuvable." }, { status: 404 });
    }
    const [total, reviews] = await Promise.all([
      db.review.count({ where: { ebookId: ebook.id } }),
      db.review.findMany({
        where: { ebookId: ebook.id },
        include: {
          user: { select: { name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return NextResponse.json({
      items: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt.toISOString(),
        user: { name: r.user.name, avatarUrl: r.user.avatarUrl },
      })),
      total,
      page,
    });
  } catch (err) {
    console.error("[reviews.list]", err);
    return NextResponse.json(
      { error: "Erreur lors du chargement." },
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
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
    }
    const ebook = await db.ebook.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });
    if (!ebook) {
      return NextResponse.json({ error: "Ebook introuvable." }, { status: 404 });
    }
    const license = await db.license.findFirst({
      where: { userId: session.id, ebookId: ebook.id },
    });
    if (!license) {
      return NextResponse.json(
        { error: "Vous devez posséder cet ebook pour le noter." },
        { status: 403 }
      );
    }
    const body = await req.json();
    const rating = Math.max(1, Math.min(5, Math.floor(Number(body.rating) || 0)));
    if (!rating) {
      return NextResponse.json({ error: "Note invalide." }, { status: 400 });
    }
    const comment = typeof body.comment === "string" ? body.comment : null;

    // upsert unique (userId, ebookId)
    const existing = await db.review.findUnique({
      where: { userId_ebookId: { userId: session.id, ebookId: ebook.id } },
    });
    let review;
    if (existing) {
      review = await db.review.update({
        where: { id: existing.id },
        data: { rating, comment },
      });
    } else {
      review = await db.review.create({
        data: { userId: session.id, ebookId: ebook.id, rating, comment },
      });
    }

    // recompute ebook aggregates
    const agg = await db.review.aggregate({
      where: { ebookId: ebook.id },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await db.ebook.update({
      where: { id: ebook.id },
      data: {
        ratingAvg: Math.round((agg._avg.rating || 0) * 10) / 10,
        ratingCount: agg._count.rating,
      },
    });
    return NextResponse.json({ id: review.id });
  } catch (err) {
    console.error("[reviews.create]", err);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'avis." },
      { status: 500 }
    );
  }
}
