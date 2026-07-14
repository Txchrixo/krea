import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ ebookId: string }> }
) {
  try {
    const { ebookId: ebookParam } = await params;
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
    }
    const ebook = await db.ebook.findFirst({
      where: { OR: [{ id: ebookParam }, { slug: ebookParam }] },
      select: { id: true },
    });
    if (!ebook) {
      return NextResponse.json({ error: "Ebook introuvable." }, { status: 404 });
    }
    const license = await db.license.findFirst({
      where: { userId: session.id, ebookId: ebook.id },
    });
    if (!license) {
      return NextResponse.json(
        { error: "Licence introuvable." },
        { status: 403 }
      );
    }
    const body = await req.json();
    const { sessionId, pagesRead, durationSec } = body as {
      sessionId?: string;
      pagesRead?: number;
      durationSec?: number;
    };
    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId requis." },
        { status: 400 }
      );
    }
    await db.readerSession.update({
      where: { id: sessionId },
      data: {
        pagesRead: pagesRead ?? 0,
        durationSec: durationSec ?? 0,
        endedAt: new Date(),
      },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[reader.heartbeat]", err);
    return NextResponse.json(
      { error: "Erreur lors du heartbeat." },
      { status: 500 }
    );
  }
}
