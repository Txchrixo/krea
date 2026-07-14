import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Register a click on an affiliate link, then redirect to the target.
// Usage: /api/affiliates/click?code=ABC123
export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code");
    const ebookSlug = req.nextUrl.searchParams.get("ebook");
    if (!code) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    const aff = await db.affiliateLink.findUnique({
      where: { code: code.toUpperCase() },
      include: { ebook: true },
    });
    if (!aff) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    // increment click count
    await db.affiliateLink.update({
      where: { id: aff.id },
      data: { clicks: { increment: 1 } },
    });
    // redirect target: specific ebook page, or creator store, or home
    let target = "/";
    if (aff.ebookId && aff.ebook) {
      target = `/?store=${aff.ebook.slug}`;
    } else {
      const creator = await db.creator.findUnique({
        where: { id: aff.creatorId },
        select: { slug: true },
      });
      if (creator) target = `/?store=${creator.slug}`;
    }
    return NextResponse.redirect(new URL(target, req.url));
  } catch (err) {
    console.error("[affiliates.click]", err);
    return NextResponse.redirect(new URL("/", req.url));
  }
}
