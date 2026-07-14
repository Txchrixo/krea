import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { genRef } from "@/lib/format";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bundle = await db.bundle.findFirst({
      where: { OR: [{ id }, { slug: id }], status: "PUBLISHED" },
      include: {
        creator: { select: { slug: true, displayName: true, avatarUrl: true, verified: true } },
        items: {
          include: {
            ebook: {
              select: {
                id: true, slug: true, title: true, subtitle: true, coverUrl: true,
                coverColor: true, price: true, category: true, ratingAvg: true,
                ratingCount: true, salesCount: true, pageCount: true,
              },
            },
          },
        },
      },
    });
    if (!bundle) {
      return NextResponse.json({ error: "Bundle introuvable." }, { status: 404 });
    }
    return NextResponse.json({
      bundle: {
        id: bundle.id,
        title: bundle.title,
        slug: bundle.slug,
        description: bundle.description,
        price: bundle.price,
        originalTotal: bundle.originalTotal,
        discountPct: bundle.discountPct,
        coverColor: bundle.coverColor,
        creator: bundle.creator,
        ebooks: bundle.items.map((it) => it.ebook),
        createdAt: bundle.createdAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("[bundles.get]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

// Purchase a bundle — creates a license for each ebook in the bundle
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
    const body = await req.json();
    const { paymentMethod } = body as { paymentMethod?: string };
    if (!paymentMethod) {
      return NextResponse.json({ error: "Méthode de paiement requise." }, { status: 400 });
    }

    const bundle = await db.bundle.findFirst({
      where: { OR: [{ id }, { slug: id }], status: "PUBLISHED" },
      include: { creator: true, items: { include: { ebook: true } } },
    });
    if (!bundle) {
      return NextResponse.json({ error: "Bundle introuvable." }, { status: 404 });
    }

    const amount = bundle.price;
    const creatorEarning = Math.round(amount * (1 - bundle.creator.commissionRate / 100));
    const platformFee = amount - creatorEarning;
    const ref = genRef("KRE");

    // Create one order per ebook in the bundle
    const licenses = [];
    for (const item of bundle.items) {
      const ebook = item.ebook;
      // Check if user already owns this ebook
      const existing = await db.license.findFirst({
        where: { userId: session.id, ebookId: ebook.id },
      });
      if (existing) {
        licenses.push({ ebookId: ebook.id, existing: true, licenseId: existing.id });
        continue;
      }

      const order = await db.order.create({
        data: {
          ref: `${ref}-${ebook.slug.slice(0, 4)}`,
          buyerId: session.id,
          ebookId: ebook.id,
          amount: Math.round(amount / bundle.items.length), // proportional
          platformFee: Math.round(platformFee / bundle.items.length),
          creatorEarning: Math.round(creatorEarning / bundle.items.length),
          paymentMethod,
          paymentStatus: "PAID",
          fulfillment: "DELIVERED",
          country: session.country || null,
        },
      });

      const license = await db.license.create({
        data: {
          userId: session.id,
          ebookId: ebook.id,
          orderId: order.id,
          accessType: "PERPETUAL",
          deviceLimit: ebook.deviceLimit,
          status: "ACTIVE",
        },
      });

      // Increment counters
      await db.ebook.update({
        where: { id: ebook.id },
        data: { salesCount: { increment: 1 } },
      });

      licenses.push({ ebookId: ebook.id, licenseId: license.id });
    }

    // Update creator wallet (once for the full bundle amount)
    await db.creator.update({
      where: { id: bundle.creator.id },
      data: {
        totalSales: { increment: bundle.items.length },
        totalRevenue: { increment: creatorEarning },
        walletBalance: { increment: creatorEarning },
      },
    });

    // Platform stats
    await db.platformStats.upsert({
      where: { id: "singleton" },
      update: { totalRevenue: { increment: amount } },
      create: { id: "singleton", totalRevenue: amount },
    });

    return NextResponse.json({ ok: true, ref, licenses, amount });
  } catch (err) {
    console.error("[bundles.purchase]", err);
    return NextResponse.json({ error: "Erreur lors de l'achat." }, { status: 500 });
  }
}
