import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
    }
    // Get this month's reading sessions
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const sessions = await db.readerSession.findMany({
      where: { userId: session.id, startedAt: { gte: monthStart } },
      select: { durationSec: true, pagesRead: true, startedAt: true },
    });

    const monthlyMinutes = Math.round(sessions.reduce((s, r) => s + (r.durationSec || 0), 0) / 60);
    const monthlyPages = sessions.reduce((s, r) => s + (r.pagesRead || 0), 0);
    const readingDays = new Set(sessions.map((s) => s.startedAt.toISOString().slice(0, 10))).size;

    // Get all-time stats
    const allSessions = await db.readerSession.findMany({
      where: { userId: session.id },
      select: { durationSec: true, pagesRead: true },
    });
    const allTimeMinutes = Math.round(allSessions.reduce((s, r) => s + (r.durationSec || 0), 0) / 60);
    const allTimePages = allSessions.reduce((s, r) => s + (r.pagesRead || 0), 0);

    // Goals (monthly)
    const goals = [
      { id: "read-3-days", label: "Lire 3 jours ce mois", target: 3, current: readingDays, unit: "jours" },
      { id: "read-7-days", label: "Lire 7 jours ce mois", target: 7, current: readingDays, unit: "jours" },
      { id: "30-minutes", label: "30 min de lecture ce mois", target: 30, current: monthlyMinutes, unit: "min" },
      { id: "60-minutes", label: "1h de lecture ce mois", target: 60, current: monthlyMinutes, unit: "min" },
      { id: "50-pages", label: "50 pages ce mois", target: 50, current: monthlyPages, unit: "pages" },
      { id: "100-pages", label: "100 pages ce mois", target: 100, current: monthlyPages, unit: "pages" },
    ].map((g) => ({
      ...g,
      progress: Math.min(100, Math.round((g.current / g.target) * 100)),
      completed: g.current >= g.target,
    }));

    return NextResponse.json({
      monthly: { minutes: monthlyMinutes, pages: monthlyPages, days: readingDays },
      allTime: { minutes: allTimeMinutes, pages: allTimePages },
      goals,
    });
  } catch (err) {
    console.error("[reader.goals]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
