"use client";

import { motion } from "framer-motion";
import { useApp } from "@/lib/store";
import type { TranslationKey } from "@/lib/i18n";

/* ───────────────────────── STATS BAR ───────────────────────── */
export function StatsBar() {
  const { t } = useApp();
  const stats: { value: string; label: TranslationKey }[] = [
    { value: "12 400+", label: "stats.ebooks" },
    { value: "3 200+", label: "stats.creators" },
    { value: "184 M", label: "stats.revenue" },
    { value: "97%", label: "stats.satisfaction" },
  ];
  return (
    <section className="border-b border-border bg-background py-12">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-evenly gap-6 px-4 sm:px-6 lg:px-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="flex flex-col"
          >
            <div className="font-heading text-2xl font-600 text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground">{t(s.label)}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
