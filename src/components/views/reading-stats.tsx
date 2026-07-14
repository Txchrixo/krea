"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  BookMarked,
  Trophy,
  Award,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ReadingStatsData {
  totalEbooks: number;
  finished: number;
  inProgress: number;
  totalPages: number;
  totalReadingMinutes: number;
  streak: number;
  achievements: {
    id: string;
    label: string;
    icon: string;
    unlocked: boolean;
    progress?: number;
    total?: number;
  }[];
  recentSessions: {
    ebookId: string;
    title: string;
    coverColor: string;
    creator: string;
    pagesRead: number;
    durationSec: number;
    date: string;
  }[];
}

const ICONS: Record<string, any> = {
  book: BookOpen,
  books: BookMarked,
  check: CheckCircle2,
  trophy: Trophy,
  pages: BookOpen,
  flame: Flame,
  clock: Clock,
};

interface ReadingGoalsData {
  monthly: { minutes: number; pages: number; days: number };
  allTime: { minutes: number; pages: number };
  goals: { id: string; label: string; target: number; current: number; unit: string; progress: number; completed: boolean }[];
}

export function ReadingStats() {
  const [stats, setStats] = useState<ReadingStatsData | null>(null);
  const [goals, setGoals] = useState<ReadingGoalsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/reader/stats").then((r) => r.json()),
      fetch("/api/reader/goals").then((r) => r.json()),
    ])
      .then(([s, g]) => {
        if (s.stats) setStats(s.stats);
        if (g.goals) setGoals(g);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) return null;

  const unlockedCount = stats.achievements.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={BookOpen} label="Ebooks" value={String(stats.totalEbooks)} color="#5DBE8A" />
        <StatCard icon={CheckCircle2} label="Terminés" value={String(stats.finished)} color="#FFD86B" />
        <StatCard icon={TrendingUp} label="Pages lues" value={String(stats.totalPages)} color="#C8553D" />
        <StatCard icon={Flame} label="Jours de suite" value={String(stats.streak)} color="#1F4A2E" />
      </div>

      {/* Achievements */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="flex items-center gap-2 font-heading text-lg font-600 text-foreground">
              <Award className="h-5 w-5 text-accent" /> Vos achievements
            </h3>
            <p className="text-xs text-muted-foreground">{unlockedCount}/{stats.achievements.length} débloqués</p>
          </div>
          <Badge className="bg-accent/30 text-foreground">
            {Math.round((unlockedCount / stats.achievements.length) * 100)}%
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
          {stats.achievements.map((a, i) => {
            const Icon = ICONS[a.icon] || Award;
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "relative flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all",
                  a.unlocked
                    ? "border-primary/40 bg-primary/5"
                    : "border-border bg-muted/30 opacity-60"
                )}
              >
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  a.unlocked ? "bg-primary/15" : "bg-muted"
                )}>
                  <Icon className={cn("h-5 w-5", a.unlocked ? "text-primary" : "text-muted-foreground/50")} />
                </div>
                <p className="text-[10px] font-600 leading-tight text-foreground">{a.label}</p>
                {!a.unlocked && a.progress != null && a.total && (
                  <p className="text-[9px] text-muted-foreground">{a.progress}/{a.total}</p>
                )}
                {a.unlocked && (
                  <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                    <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Monthly reading goals */}
      {goals && goals.goals.length > 0 && (
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-2 font-heading text-lg font-600 text-foreground">
                <TrendingUp className="h-5 w-5 text-primary" /> Objectifs du mois
              </h3>
              <p className="text-xs text-muted-foreground">
                {goals.goals.filter((g) => g.completed).length}/{goals.goals.length} atteints · {goals.monthly.days} jours, {goals.monthly.minutes} min, {goals.monthly.pages} pages
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {goals.goals.map((g, i) => (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={cn(
                  "rounded-xl border p-3 transition-all",
                  g.completed ? "border-primary/40 bg-primary/5" : "border-border bg-background/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {g.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted" />
                    )}
                    <span className={cn("text-sm font-500", g.completed ? "text-foreground" : "text-foreground/70")}>
                      {g.label}
                    </span>
                  </div>
                  <span className={cn("text-xs font-600", g.completed ? "text-primary" : "text-muted-foreground")}>
                    {Math.min(g.current, g.target)}/{g.target} {g.unit}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className={cn("h-full rounded-full", g.completed ? "bg-primary" : "bg-accent")}
                    initial={{ width: 0 }}
                    animate={{ width: `${g.progress}%` }}
                    transition={{ duration: 0.6, delay: i * 0.06 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent reading activity */}
      {stats.recentSessions.length > 0 && (
        <Card className="p-5">
          <h3 className="mb-4 flex items-center gap-2 font-heading text-lg font-600 text-foreground">
            <Clock className="h-5 w-5 text-primary" /> Activité récente
          </h3>
          <div className="space-y-2">
            {stats.recentSessions.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 rounded-lg bg-background/60 px-3 py-2"
              >
                <div className="h-10 w-7 flex-shrink-0 rounded" style={{ background: s.coverColor }} />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-500 text-foreground">{s.title}</p>
                  <p className="text-[11px] text-muted-foreground">{s.creator}</p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-3 text-xs text-muted-foreground">
                  {s.pagesRead > 0 && (
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" /> {s.pagesRead}p
                    </span>
                  )}
                  {s.durationSec > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {Math.round(s.durationSec / 60)}min
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: color + "22" }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <div>
        <p className="font-heading text-2xl font-600 text-foreground leading-none">{value}</p>
        <p className="text-[11px] text-muted-foreground">{label}</p>
      </div>
    </Card>
  );
}
