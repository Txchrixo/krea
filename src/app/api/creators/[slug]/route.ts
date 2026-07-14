import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const creator = await db.creator.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        displayName: true,
        bio: true,
        tagline: true,
        avatarUrl: true,
        bannerUrl: true,
        bannerColor: true,
        plan: true,
        verified: true,
        totalSales: true,
        totalRevenue: true,
        createdAt: true,
        user: { select: { country: true } },
        ebooks: {
          where: { status: "PUBLISHED" },
          select: { id: true, ratingAvg: true },
        },
      },
    });
    if (!creator) {
      return NextResponse.json({ error: "Créateur introuvable." }, { status: 404 });
    }
    const ratingAvg =
      creator.ebooks.length > 0
        ? Math.round((creator.ebooks.reduce((s, e) => s + e.ratingAvg, 0) / creator.ebooks.length) * 10) / 10
        : 0;
    return NextResponse.json({
      creator: {
        id: creator.id,
        slug: creator.slug,
        displayName: creator.displayName,
        bio: creator.bio,
        tagline: creator.tagline,
        avatarUrl: creator.avatarUrl,
        bannerUrl: creator.bannerUrl,
        bannerColor: creator.bannerColor,
        plan: creator.plan,
        verified: creator.verified,
        totalSales: creator.totalSales,
        totalEbooks: creator.ebooks.length,
        ratingAvg,
        country: creator.user.country,
        createdAt: creator.createdAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("[creators.get]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
