"use client";

import { motion } from "framer-motion";
import { BookOpen, Users, Wallet, Star } from "lucide-react";
import { useApp } from "@/lib/store";
import type { TranslationKey } from "@/lib/i18n";
import type { LucideIcon } from "lucide-react";

/* ───────────────────────── STATS BAR ───────────────────────── */
export function StatsBar() {
  const { t } = useApp();
  const stats: { value: string; label: TranslationKey; icon: LucideIcon }[] = [
    { value: "12 400+", label: "stats.ebooks", icon: BookOpen },
    { value: "3 200+", label: "stats.creators", icon: Users },
    { value: "184 M", label: "stats.revenue", icon: Wallet },
    { value: "97%", label: "stats.satisfaction", icon: Star },
  ];
  return (
    <section className="border-b border-border bg-background py-12">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-card">
              <s.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-heading text-2xl font-600 text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground">{t(s.label)}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
