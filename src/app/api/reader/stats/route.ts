import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
    }
    // Gather all licenses + reader sessions for the user
    const licenses = await db.license.findMany({
      where: { userId: session.id },
      include: {
        ebook: { select: { id: true, title: true, coverColor: true, creator: { select: { displayName: true } } } },
      },
    });
    const sessions = await db.readerSession.findMany({
      where: { userId: session.id },
      select: { id: true, durationSec: true, pagesRead: true, startedAt: true, endedAt: true, ebookId: true },
    });

    const totalEbooks = licenses.length;
    const finished = licenses.filter((l) => l.progress >= 100).length;
    const inProgress = licenses.filter((l) => l.progress > 0 && l.progress < 100).length;
    const totalPages = sessions.reduce((s, r) => s + (r.pagesRead || 0), 0);
    const totalDurationSec = sessions.reduce((s, r) => s + (r.durationSec || 0), 0);
    const totalReadingMinutes = Math.round(totalDurationSec / 60);

    // reading streak: consecutive days with at least one session
    const days = new Set(
      sessions.map((s) => new Date(s.startedAt).toISOString().slice(0, 10))
    );
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      if (days.has(key)) streak++;
      else if (i > 0) break; // allow today to be empty
    }

    // achievements
    const achievements: { id: string; label: string; icon: string; unlocked: boolean; progress?: number; total?: number }[] = [
      { id: "first-book", label: "Premier achat", icon: "book", unlocked: totalEbooks >= 1 },
      { id: "reader-5", label: "Lecteur assidu (5 ebooks)", icon: "books", unlocked: totalEbooks >= 5, progress: Math.min(totalEbooks, 5), total: 5 },
      { id: "finish-1", label: "Premier ebook terminé", icon: "check", unlocked: finished >= 1 },
      { id: "finish-5", label: "Marathonien (5 terminés)", icon: "trophy", unlocked: finished >= 5, progress: Math.min(finished, 5), total: 5 },
      { id: "pages-100", label: "100 pages lues", icon: "pages", unlocked: totalPages >= 100, progress: Math.min(totalPages, 100), total: 100 },
      { id: "pages-500", label: "500 pages lues", icon: "pages", unlocked: totalPages >= 500, progress: Math.min(totalPages, 500), total: 500 },
      { id: "streak-3", label: "3 jours de suite", icon: "flame", unlocked: streak >= 3, progress: Math.min(streak, 3), total: 3 },
      { id: "streak-7", label: "7 jours de suite", icon: "flame", unlocked: streak >= 7, progress: Math.min(streak, 7), total: 7 },
      { id: "minutes-60", label: "1h de lecture", icon: "clock", unlocked: totalReadingMinutes >= 60, progress: Math.min(totalReadingMinutes, 60), total: 60 },
      { id: "minutes-300", label: "5h de lecture", icon: "clock", unlocked: totalReadingMinutes >= 300, progress: Math.min(totalReadingMinutes, 300), total: 300 },
    ];

    // recently read (last 5 sessions)
    const recentSessions = sessions
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, 5)
      .map((s) => {
        const lic = licenses.find((l) => l.ebookId === s.ebookId);
        return {
          ebookId: s.ebookId,
          title: lic?.ebook.title ?? "Ebook",
          coverColor: lic?.ebook.coverColor ?? "#1F4A2E",
          creator: lic?.ebook.creator.displayName ?? "",
          pagesRead: s.pagesRead,
          durationSec: s.durationSec,
          date: s.startedAt.toISOString(),
        };
      });

    return NextResponse.json({
      stats: {
        totalEbooks,
        finished,
        inProgress,
        totalPages,
        totalReadingMinutes,
        streak,
        achievements,
        recentSessions,
      },
    });
  } catch (err) {
    console.error("[reader.stats]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
