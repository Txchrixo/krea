import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCreator } from "@/lib/auth";
import type { SiteSocial } from "@/lib/types";

export async function GET() {
  try {
    const session = await requireCreator();
    if (!session || !session.creatorSlug) {
      return NextResponse.json({ error: "Créateur requis." }, { status: 403 });
    }
    const creator = await db.creator.findUnique({
      where: { slug: session.creatorSlug },
      include: {
        sitePages: { orderBy: { order: "asc" } },
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
    return NextResponse.json({
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
      creator: {
        slug: creator.slug,
        displayName: creator.displayName,
        bio: creator.bio,
        tagline: creator.tagline,
        avatarUrl: creator.avatarUrl,
        bannerUrl: creator.bannerUrl,
        bannerColor: creator.bannerColor,
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
    });
  } catch (err) {
    console.error("[site.get]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireCreator();
    if (!session || !session.creatorSlug) {
      return NextResponse.json({ error: "Créateur requis." }, { status: 403 });
    }
    const body = await req.json();
    const {
      siteName,
      siteEnabled,
      siteThemePreset,
      siteFontPreset,
      siteLayout,
      siteHero,
      siteHeroSub,
      siteFooterText,
      siteSocial,
      siteShowAbout,
      siteShowContact,
    } = body as {
      siteName?: string;
      siteEnabled?: boolean;
      siteThemePreset?: string;
      siteFontPreset?: string;
      siteLayout?: string;
      siteHero?: string;
      siteHeroSub?: string;
      siteFooterText?: string;
      siteSocial?: SiteSocial;
      siteShowAbout?: boolean;
      siteShowContact?: boolean;
    };

    const data: Record<string, unknown> = {};
    if (typeof siteName === "string") data.siteName = siteName.trim() || null;
    if (typeof siteEnabled === "boolean") data.siteEnabled = siteEnabled;
    if (typeof siteThemePreset === "string") data.siteThemePreset = siteThemePreset;
    if (typeof siteFontPreset === "string") data.siteFontPreset = siteFontPreset;
    if (typeof siteLayout === "string") data.siteLayout = siteLayout;
    if (typeof siteHero === "string") data.siteHero = siteHero.trim() || null;
    if (typeof siteHeroSub === "string") data.siteHeroSub = siteHeroSub.trim() || null;
    if (typeof siteFooterText === "string") data.siteFooterText = siteFooterText.trim() || null;
    if (siteSocial && typeof siteSocial === "object") data.siteSocial = JSON.stringify(siteSocial);
    if (typeof siteShowAbout === "boolean") data.siteShowAbout = siteShowAbout;
    if (typeof siteShowContact === "boolean") data.siteShowContact = siteShowContact;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Rien à mettre à jour." }, { status: 400 });
    }

    await db.creator.update({ where: { slug: session.creatorSlug }, data });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[site.patch]", err);
    return NextResponse.json({ error: "Erreur lors de la mise à jour." }, { status: 500 });
  }
}
