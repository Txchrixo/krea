import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toEbookCard } from "@/lib/mappers";
import type { SiteSocial } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const creator = await db.creator.findUnique({
      where: { slug },
      include: {
        user: { select: { country: true } },
        sitePages: {
          where: { published: true },
          orderBy: { order: "asc" },
        },
        ebooks: {
          where: { status: "PUBLISHED" },
          include: { creator: { include: { user: true } } },
          orderBy: { salesCount: "desc" },
        },
        bundles: {
          where: { status: "PUBLISHED" },
          include: { items: { include: { ebook: { include: { creator: { include: { user: true } } } } } } },
        },
      },
    });
    if (!creator) {
      return NextResponse.json({ error: "Créateur introuvable." }, { status: 404 });
    }

    let social: SiteSocial = {};
    try {
      social = creator.siteSocial ? JSON.parse(creator.siteSocial) : {};
    } catch {
      social = {};
    }

    const totalSales = creator.ebooks.reduce((s, e) => s + e.salesCount, 0);
    const ratingCount = creator.ebooks.reduce((s, e) => s + e.ratingCount, 0);
    const ratingSum = creator.ebooks.reduce((s, e) => s + e.ratingAvg * e.ratingCount, 0);
    const ratingAvg = ratingCount > 0 ? ratingSum / ratingCount : 0;

    const ebooks = creator.ebooks.map(toEbookCard);

    const bundles = creator.bundles.map((b) => {
      const originalTotal = b.items.reduce((s, it) => s + it.ebook.price, 0);
      return {
        id: b.id,
        title: b.title,
        slug: b.slug,
        description: b.description,
        price: b.price,
        originalTotal,
        discountPct: b.discountPct,
        coverColor: b.coverColor,
        ebookCount: b.items.length,
        ebooks: b.items.map((it) => toEbookCard(it.ebook)),
        creator: {
          slug: creator.slug,
          displayName: creator.displayName,
          avatarUrl: creator.avatarUrl,
          verified: creator.verified,
        },
        createdAt: b.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      creator: {
        slug: creator.slug,
        displayName: creator.displayName,
        bio: creator.bio,
        tagline: creator.tagline,
        avatarUrl: creator.avatarUrl,
        bannerUrl: creator.bannerUrl,
        bannerColor: creator.bannerColor,
        verified: creator.verified,
        totalEbooks: ebooks.length,
        totalSales,
        ratingAvg,
        country: creator.user.country,
      },
      site: {
        siteName: creator.siteName,
        siteEnabled: creator.siteEnabled,
        siteThemePreset: creator.siteThemePreset,
        siteFontPreset: creator.siteFontPreset,
        siteLayout: creator.siteLayout,
        siteHero: creator.siteHero,
        siteHeroSub: creator.siteHeroSub,
        siteFooterText: creator.siteFooterText,
        siteSocial: social,
        siteShowAbout: creator.siteShowAbout,
        siteShowContact: creator.siteShowContact,
      },
      pages: creator.sitePages.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        content: p.content,
        showInNav: p.showInNav,
        order: p.order,
        published: p.published,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      ebooks,
      bundles,
    });
  } catch (err) {
    console.error("[creator-site.get]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
