import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
    }
    const user = await db.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        country: true,
        avatarUrl: true,
        role: true,
        creator: true,
      },
    });
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }
    return NextResponse.json({
      profile: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        country: user.country,
        avatarUrl: user.avatarUrl,
        role: user.role,
        creator: user.creator
          ? {
              id: user.creator.id,
              slug: user.creator.slug,
              displayName: user.creator.displayName,
              bio: user.creator.bio,
              avatarUrl: user.creator.avatarUrl,
              bannerUrl: user.creator.bannerUrl,
              plan: user.creator.plan,
              commissionRate: user.creator.commissionRate,
              verified: user.creator.verified,
              totalSales: user.creator.totalSales,
              totalRevenue: user.creator.totalRevenue,
              walletBalance: user.creator.walletBalance,
            }
          : null,
      },
    });
  } catch (err) {
    console.error("[profile.get]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
    }
    const body = await req.json();
    const { name, phone, country, avatarUrl, creator } = body as {
      name?: string;
      phone?: string;
      country?: string;
      avatarUrl?: string;
      creator?: {
        displayName?: string;
        bio?: string;
        tagline?: string;
        avatarUrl?: string;
        bannerUrl?: string;
        bannerColor?: string;
      };
    };

    const data: any = {};
    if (typeof name === "string") data.name = name;
    if (typeof phone === "string") data.phone = phone || null;
    if (typeof country === "string") data.country = country || null;
    if (typeof avatarUrl === "string") data.avatarUrl = avatarUrl || null;

    await db.user.update({ where: { id: session.id }, data });

    if (creator && session.creatorSlug) {
      const cdata: any = {};
      if (typeof creator.displayName === "string") cdata.displayName = creator.displayName;
      if (typeof creator.bio === "string") cdata.bio = creator.bio || null;
      if (typeof creator.tagline === "string") cdata.tagline = creator.tagline || null;
      if (typeof creator.avatarUrl === "string") cdata.avatarUrl = creator.avatarUrl || null;
      if (typeof creator.bannerUrl === "string") cdata.bannerUrl = creator.bannerUrl || null;
      if (typeof creator.bannerColor === "string") cdata.bannerColor = creator.bannerColor;
      if (Object.keys(cdata).length > 0) {
        await db.creator.update({ where: { slug: session.creatorSlug }, data: cdata });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[profile.patch]", err);
    return NextResponse.json({ error: "Erreur lors de la mise à jour." }, { status: 500 });
  }
}
