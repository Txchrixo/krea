import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { genRef } from "@/lib/format";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "CREATOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }
    const creator = await db.creator.findUnique({
      where: { slug: session.creatorSlug! },
    });
    if (!creator) {
      return NextResponse.json(
        { error: "Créateur introuvable." },
        { status: 404 }
      );
    }
    const orders = await db.order.findMany({
      where: { ebook: { creatorId: creator.id } },
      include: {
        buyer: { select: { name: true } },
        ebook: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return NextResponse.json({
      items: orders.map((o) => ({
        id: o.id,
        ref: o.ref,
        buyerName: o.buyer.name || "Client",
        ebookTitle: o.ebook.title,
        amount: o.amount,
        creatorEarning: o.creatorEarning,
        paymentMethod: o.paymentMethod,
        createdAt: o.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("[orders.list]", err);
    return NextResponse.json(
      { error: "Erreur lors du chargement." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
    }
    const body = await req.json();
    const { ebookId, paymentMethod, affiliateCode, couponCode } = body as {
      ebookId?: string;
      paymentMethod?: string;
      affiliateCode?: string;
      couponCode?: string;
    };
    if (!ebookId || !paymentMethod) {
      return NextResponse.json(
        { error: "Ebook et méthode de paiement requis." },
        { status: 400 }
      );
    }
    const ebook = await db.ebook.findUnique({
      where: { id: ebookId },
      include: { creator: true },
    });
    if (!ebook || ebook.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Ebook non disponible." },
        { status: 400 }
      );
    }

    // prevent double purchase
    const existing = await db.license.findFirst({
      where: { userId: session.id, ebookId: ebook.id },
    });
    if (existing) {
      return NextResponse.json(
        {
          error: "Vous possédez déjà cet ebook.",
          existing: true,
          licenseId: existing.id,
        },
        { status: 409 }
      );
    }

    // coupon validation
    let discount = 0;
    let appliedCouponId: string | null = null;
    if (couponCode) {
      const coupon = await db.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });
      if (
        coupon &&
        coupon.active &&
        coupon.redeemed < coupon.maxRedemptions &&
        (!coupon.expiresAt || coupon.expiresAt.getTime() > Date.now()) &&
        (!coupon.ebookId || coupon.ebookId === ebook.id) &&
        coupon.creatorId === ebook.creator.id
      ) {
        discount = Math.round((ebook.price * coupon.percentOff) / 100);
        appliedCouponId = coupon.id;
      }
    }

    const amount = Math.max(0, ebook.price - discount);
    const creatorEarning = Math.round(
      amount * (1 - ebook.creator.commissionRate / 100)
    );
    const platformFee = amount - creatorEarning;
    const ref = genRef("KRE");

    const order = await db.order.create({
      data: {
        ref,
        buyerId: session.id,
        ebookId: ebook.id,
        amount,
        platformFee,
        creatorEarning,
        paymentMethod,
        paymentStatus: "PAID",
        fulfillment: "DELIVERED",
        country: session.country || ebook.creator.country || null,
        affiliateCode: affiliateCode || null,
      },
    });

    // increment coupon redemption
    if (appliedCouponId) {
      await db.coupon.update({
        where: { id: appliedCouponId },
        data: { redeemed: { increment: 1 } },
      });
    }

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

    // increment counters
    await db.ebook.update({
      where: { id: ebook.id },
      data: { salesCount: { increment: 1 } },
    });
    await db.creator.update({
      where: { id: ebook.creator.id },
      data: {
        totalSales: { increment: 1 },
        totalRevenue: { increment: creatorEarning },
        walletBalance: { increment: creatorEarning },
      },
    });

    // platform stats
    await db.platformStats.upsert({
      where: { id: "singleton" },
      update: {
        totalRevenue: { increment: amount },
      },
      create: {
        id: "singleton",
        totalRevenue: amount,
      },
    });

    // affiliate conversion tracking
    if (affiliateCode) {
      const aff = await db.affiliateLink.findUnique({
        where: { code: affiliateCode.toUpperCase() },
      });
      if (aff && aff.creatorId === ebook.creator.id) {
        await db.affiliateLink.update({
          where: { id: aff.id },
          data: { conversions: { increment: 1 } },
        });
      }
    }

    return NextResponse.json({ order, license });
  } catch (err) {
    console.error("[orders.create]", err);
    return NextResponse.json(
      { error: "Erreur lors du paiement." },
      { status: 500 }
    );
  }
}
