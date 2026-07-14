import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, ebookId } = body as { code?: string; ebookId?: string };
    if (!code || !ebookId) {
      return NextResponse.json(
        { error: "code et ebookId requis." },
        { status: 400 }
      );
    }
    const coupon = await db.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (
      !coupon ||
      !coupon.active ||
      coupon.redeemed >= coupon.maxRedemptions ||
      (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) ||
      (coupon.ebookId && coupon.ebookId !== ebookId)
    ) {
      return NextResponse.json({ valid: false });
    }
    const ebook = await db.ebook.findUnique({ where: { id: ebookId } });
    if (!ebook) {
      return NextResponse.json({ valid: false });
    }
    const discountedPrice = Math.round(
      ebook.price * (1 - coupon.percentOff / 100)
    );
    return NextResponse.json({
      valid: true,
      percentOff: coupon.percentOff,
      discountedPrice,
    });
  } catch (err) {
    console.error("[coupons.validate]", err);
    return NextResponse.json(
      { error: "Erreur lors de la validation." },
      { status: 500 }
    );
  }
}
