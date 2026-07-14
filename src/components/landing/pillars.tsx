"use client";

import { motion } from "framer-motion";
import { useApp } from "@/lib/store";
import type { TranslationKey } from "@/lib/i18n";
import { SectionHeading } from "./section-heading";
import { useState } from "react";
import { cn } from "@/lib/utils";

/* ───────────────────────── 3 PILLARS ─────────────────────────
   Editorial framed cards — big numeral, clean content, hover glow. */

interface Pillar {
  num: string;
  tag: TranslationKey;
  title: TranslationKey;
  desc: TranslationKey;
  points: TranslationKey[];
  accent: string;
}

export function PillarsSection() {
  const { t } = useApp();
  const pillars: Pillar[] = [
    {
      num: "01",
      tag: "pillars.1.tag",
      title: "pillars.1.title",
      desc: "pillars.1.desc",
      points: ["pillars.1.point1", "pillars.1.point2", "pillars.1.point3", "pillars.1.point4"],
      accent: "#5DBE8A",
    },
    {
      num: "02",
      tag: "pillars.2.tag",
      title: "pillars.2.title",
      desc: "pillars.2.desc",
      points: ["pillars.2.point1", "pillars.2.point2", "pillars.2.point3", "pillars.2.point4"],
      accent: "#FFD86B",
    },
    {
      num: "03",
      tag: "pillars.3.tag",
      title: "pillars.3.title",
      desc: "pillars.3.desc",
      points: ["pillars.3.point1", "pillars.3.point2", "pillars.3.point3", "pillars.3.point4"],
      accent: "#C8553D",
    },
  ];

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t("pillars.eyebrow")}
          title={t("pillars.title")}
          subtitle={t("pillars.subtitle")}
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {pillars.map((p, i) => (
            <PillarFrame key={p.num} pillar={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PillarFrame({ pillar, index }: { pillar: Pillar; index: number }) {
  const { t } = useApp();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: index * 0.12 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300",
        hovered ? "border-transparent shadow-2xl" : "border-border"
      )}
      style={hovered ? { boxShadow: `0 20px 60px -20px ${pillar.accent}55` } : undefined}
    >
      {/* Top zone with giant numeral */}
      <div
        className="relative flex h-44 items-center justify-center overflow-hidden border-b border-border"
        style={{ backgroundColor: pillar.accent + "0d" }}
      >
        {/* Giant numeral — engraved, shifts on hover */}
        <span
          className="pointer-events-none absolute select-none font-heading font-700 leading-none transition-transform duration-500"
          style={{
            fontSize: "11rem",
            color: pillar.accent,
            opacity: hovered ? 0.14 : 0.08,
            transform: hovered ? "translateY(-6px) scale(1.04)" : "translateY(0) scale(1)",
            letterSpacing: "-0.05em",
          }}
        >
          {pillar.num}
        </span>
        {/* corner tag */}
        <span
          className="absolute left-4 top-4 text-[10px] font-700 uppercase tracking-[0.2em]"
          style={{ color: pillar.accent }}
        >
          {t(pillar.tag)}
        </span>
      </div>

      {/* Bottom: content */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-heading text-lg font-700 leading-tight text-foreground">
          {t(pillar.title)}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          {t(pillar.desc)}
        </p>
      </div>
    </motion.article>
  );
}
