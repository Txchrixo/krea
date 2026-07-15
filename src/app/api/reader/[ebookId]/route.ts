import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ebookId: string }> }
) {
  try {
    const { ebookId: ebookParam } = await params;
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
    }
    // Resolve ebook by id or slug
    const ebook = await db.ebook.findFirst({
      where: { OR: [{ id: ebookParam }, { slug: ebookParam }] },
      include: { creator: true },
    });
    if (!ebook) {
      return NextResponse.json({ error: "Ebook introuvable." }, { status: 404 });
    }
    const realEbookId = ebook.id;
    const license = await db.license.findFirst({
      where: { userId: session.id, ebookId: realEbookId, status: "ACTIVE" },
      include: {
        order: true,
      },
    });
    if (!license) {
      return NextResponse.json(
        { error: "Licence introuvable." },
        { status: 403 }
      );
    }
    const chapters = await db.chapter.findMany({
      where: { ebookId: realEbookId },
      orderBy: { order: "asc" },
    });

    // device fingerprint
    const deviceFp =
      req.headers.get("x-device-fp") ||
      req.headers.get("x-device-fingerprint") ||
      "web";

    // register a reader session
    const sessionRow = await db.readerSession.create({
      data: {
        licenseId: license.id,
        userId: session.id,
        ebookId: realEbookId,
        deviceFp,
        ip: req.headers.get("x-forwarded-for") || null,
      },
    });

    const buyer = await db.user.findUnique({
      where: { id: session.id },
      select: { name: true, email: true },
    });

    return NextResponse.json({
      sessionId: sessionRow.id,
      ebook: {
        id: ebook.id,
        title: ebook.title,
        subtitle: ebook.subtitle,
        coverUrl: ebook.coverUrl,
        coverColor: ebook.coverColor,
        creator: {
          displayName: ebook.creator.displayName,
          slug: ebook.creator.slug,
        },
      },
      chapters: chapters.map((c) => ({
        id: c.id,
        title: c.title,
        content: c.content,
        order: c.order,
        wordCount: c.wordCount,
      })),
      license: {
        id: license.id,
        progress: license.progress,
        deviceLimit: license.deviceLimit,
        devicesUsed: license.devicesUsed,
      },
      watermark: {
        buyerName: buyer?.name || "Client",
        buyerEmail: buyer?.email || "",
        orderRef: license.order?.ref || " - ",
        date: license.createdAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("[reader.get]", err);
    return NextResponse.json(
      { error: "Erreur lors de l'ouverture du lecteur." },
      { status: 500 }
    );
  }
}
