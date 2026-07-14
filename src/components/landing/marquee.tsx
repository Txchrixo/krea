"use client";

import { Sparkles } from "lucide-react";
import { useApp } from "@/lib/store";
import type { TranslationKey } from "@/lib/i18n";

/* ───────────────────────── MARQUEE ───────────────────────── */
export function MarqueeSection() {
  const { t } = useApp();
  const items: TranslationKey[] = [
    "marquee.mobile",
    "marquee.orange",
    "marquee.wave",
    "marquee.mtn",
    "marquee.watermark",
    "marquee.secured",
    "marquee.wallet",
    "marquee.marketplace",
    "marquee.pages",
    "marquee.affiliation",
    "marquee.withdrawals",
    "marquee.editor",
  ];
  const doubled = [...items, ...items];
  return (
    <section className="border-y border-border bg-card/50 py-5">
      <div className="relative overflow-hidden">
        <div className="flex w-max animate-marquee gap-8">
          {doubled.map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-2 whitespace-nowrap text-sm font-500 text-foreground/60"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary/60" />
              {t(item)}
            </span>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-card/80 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-card/80 to-transparent" />
      </div>
    </section>
  );
}
