import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "CREATOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }
    // Admins without creator profile get empty data
    if (session.role === "ADMIN" && !session.creatorSlug) {
      return NextResponse.json({
        totalReaders: 0,
        totalReadingMinutes: 0,
        avgCompletionRate: 0,
        topChapters: [],
        readerEngagement: [],
        recentReaders: [],
      });
    }

    const creator = await db.creator.findUnique({
      where: { slug: session.creatorSlug! },
      include: { ebooks: { select: { id: true, title: true, chapters: { select: { id: true, title: true, order: true } } } } },
    });
    if (!creator) {
      return NextResponse.json({ error: "Créateur introuvable." }, { status: 404 });
    }

    const ebookIds = creator.ebooks.map((e) => e.id);

    // Get all reading sessions for this creator's ebooks
    const sessions = await db.readerSession.findMany({
      where: { ebookId: { in: ebookIds } },
      include: {
        user: { select: { name: true, email: true, country: true } },
        ebook: { select: { title: true } },
      },
      orderBy: { startedAt: "desc" },
    });

    const totalReaders = new Set(sessions.map((s) => s.userId)).size;
    const totalReadingMinutes = Math.round(
      sessions.reduce((s, r) => s + (r.durationSec || 0), 0) / 60
    );

    // License completion rates
    const licenses = await db.license.findMany({
      where: { ebookId: { in: ebookIds } },
      select: { progress: true, ebookId: true },
    });
    const avgCompletionRate =
      licenses.length > 0
        ? Math.round(licenses.reduce((s, l) => s + l.progress, 0) / licenses.length)
        : 0;

    // Top chapters by reading time (approximate: sessions per chapter via license progress)
    // Since we don't track per-chapter reading, we'll show top ebooks by session count
    const ebookSessionCounts: Record<string, { title: string; count: number; minutes: number }> = {};
    for (const s of sessions) {
      const key = s.ebookId;
      if (!ebookSessionCounts[key]) {
        ebookSessionCounts[key] = { title: s.ebook.title, count: 0, minutes: 0 };
      }
      ebookSessionCounts[key].count++;
      ebookSessionCounts[key].minutes += Math.round((s.durationSec || 0) / 60);
    }
    const topChapters = Object.entries(ebookSessionCounts)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Reader engagement: sessions per day (last 14 days)
    const now = new Date();
    const engagement: { date: string; readers: number; minutes: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const daySessions = sessions.filter(
        (s) => s.startedAt >= dayStart && s.startedAt < dayEnd
      );
      engagement.push({
        date: dayStart.toISOString().slice(5, 10),
        readers: new Set(daySessions.map((s) => s.userId)).size,
        minutes: Math.round(daySessions.reduce((s, r) => s + (r.durationSec || 0), 0) / 60),
      });
    }

    // Recent readers (last 10 unique)
    const recentReadersMap = new Map<string, { name: string; email: string; country: string; ebookTitle: string; date: string }>();
    for (const s of sessions) {
      if (!recentReadersMap.has(s.userId) && recentReadersMap.size < 10) {
        recentReadersMap.set(s.userId, {
          name: s.user.name || "Lecteur",
          email: s.user.email,
          country: s.user.country || "—",
          ebookTitle: s.ebook.title,
          date: s.startedAt.toISOString(),
        });
      }
    }

    return NextResponse.json({
      totalReaders,
      totalReadingMinutes,
      avgCompletionRate,
      topChapters,
      readerEngagement: engagement,
      recentReaders: Array.from(recentReadersMap.values()),
    });
  } catch (err) {
    console.error("[creator.insights]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
