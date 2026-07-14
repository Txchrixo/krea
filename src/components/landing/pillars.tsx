"use client";

import { motion } from "framer-motion";
import { useApp } from "@/lib/store";
import type { TranslationKey } from "@/lib/i18n";
import { SectionHeading } from "./section-heading";
import { useState } from "react";
import { cn } from "@/lib/utils";

/* ───────────────────────── 3 PILLARS ─────────────────────────
   Editorial "frames" — each pillar is a designed object, not a card.
   Big numeral, custom mini-illustration, asymmetric layout. Awards-style. */

interface Pillar {
  num: string;
  tag: TranslationKey;
  title: TranslationKey;
  desc: TranslationKey;
  points: TranslationKey[];
  accent: string;
  illustration: "editor" | "wallet" | "shield";
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
      illustration: "editor",
    },
    {
      num: "02",
      tag: "pillars.2.tag",
      title: "pillars.2.title",
      desc: "pillars.2.desc",
      points: ["pillars.2.point1", "pillars.2.point2", "pillars.2.point3", "pillars.2.point4"],
      accent: "#FFD86B",
      illustration: "wallet",
    },
    {
      num: "03",
      tag: "pillars.3.tag",
      title: "pillars.3.title",
      desc: "pillars.3.desc",
      points: ["pillars.3.point1", "pillars.3.point2", "pillars.3.point3", "pillars.3.point4"],
      accent: "#C8553D",
      illustration: "shield",
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
      {/* Top: illustration zone with big numeral */}
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
        {/* Custom mini-illustration */}
        <div className="relative z-10 h-full w-full flex items-center justify-center">
          <Illustration type={pillar.illustration} accent={pillar.accent} hovered={hovered} />
        </div>
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

/* ── Custom illustrations — each pillar has its own mini-scene ── */
function Illustration({
  type,
  accent,
  hovered,
}: {
  type: "editor" | "wallet" | "shield";
  accent: string;
  hovered: boolean;
}) {
  if (type === "editor") {
    // Editor: a document with lines + a cursor
    return (
      <div className="relative h-24 w-20">
        <motion.div
          animate={{ y: hovered ? -4 : 0, rotate: hovered ? -2 : -1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="absolute inset-0 rounded-md border bg-card shadow-md"
          style={{ borderColor: accent + "44" }}
        >
          {/* lines */}
          <div className="space-y-1.5 p-3">
            <div className="h-1.5 w-8 rounded-full" style={{ background: accent, opacity: 0.7 }} />
            <div className="h-1 w-full rounded-full bg-foreground/15" />
            <div className="h-1 w-4/5 rounded-full bg-foreground/15" />
            <div className="h-1 w-3/4 rounded-full bg-foreground/15" />
            <div className="h-1 w-full rounded-full bg-foreground/15" />
            <div className="h-1 w-2/3 rounded-full bg-foreground/15" />
            {/* cursor */}
            <motion.div
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="h-2 w-0.5"
              style={{ background: accent }}
            />
          </div>
        </motion.div>
        {/* pen mark */}
        <motion.div
          animate={{ rotate: hovered ? 12 : 8, x: hovered ? 2 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="absolute -right-3 -top-3 h-12 w-1.5 rounded-full"
          style={{ background: accent, transformOrigin: "bottom" }}
        />
      </div>
    );
  }

  if (type === "wallet") {
    // Wallet: a leather wallet with bills fanning out + coin
    return (
      <div className="relative h-24 w-28">
        {/* Bills fanning out from the wallet */}
        <motion.div
          animate={{ rotate: hovered ? -10 : -6, y: hovered ? -8 : -2 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="absolute left-2 top-0 h-14 w-16 rounded-sm border shadow-sm"
          style={{ borderColor: accent + "66", background: "var(--card)", transformOrigin: "bottom right" }}
        >
          <div className="flex h-full flex-col items-center justify-center">
            <span className="font-heading text-[11px] font-700" style={{ color: accent }}>5K</span>
          </div>
        </motion.div>
        <motion.div
          animate={{ rotate: hovered ? -3 : -1, y: hovered ? -4 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="absolute left-4 top-1 h-14 w-16 rounded-sm border shadow-sm"
          style={{ borderColor: accent + "88", background: "var(--card)", transformOrigin: "bottom right" }}
        >
          <div className="flex h-full flex-col items-center justify-center">
            <span className="font-heading text-[11px] font-700" style={{ color: accent }}>2K</span>
          </div>
        </motion.div>

        {/* The wallet itself — folded leather shape */}
        <motion.div
          animate={{ y: hovered ? -2 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="absolute bottom-0 left-0 h-12 w-24 overflow-hidden rounded-md border-2 shadow-lg"
          style={{ borderColor: accent, background: accent + "1a" }}
        >
          {/* wallet fold line */}
          <div className="absolute inset-x-0 top-1/2 h-px" style={{ background: accent, opacity: 0.3 }} />
          {/* wallet clasp */}
          <div className="absolute right-1 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full border" style={{ borderColor: accent, background: "var(--card)" }}>
            <span className="text-[7px] font-700" style={{ color: accent }}>F</span>
          </div>
          {/* wallet label */}
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[8px] font-700 uppercase tracking-widest" style={{ color: accent, opacity: 0.7 }}>
            Krea
          </span>
        </motion.div>

        {/* Coin dropping in */}
        <motion.div
          animate={{
            y: hovered ? -14 : -6,
            rotate: hovered ? 180 : 0,
          }}
          transition={{ type: "spring", stiffness: 180, damping: 16 }}
          className="absolute right-1 top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 shadow-md"
          style={{ borderColor: accent, background: "var(--card)" }}
        >
          <span className="text-[9px] font-700" style={{ color: accent }}>₣</span>
        </motion.div>
      </div>
    );
  }

  // shield
  return (
    <div className="relative h-24 w-20">
      <motion.div
        animate={{ y: hovered ? -4 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className="absolute left-1/2 top-1/2 h-20 w-16 -translate-x-1/2 -translate-y-1/2"
      >
        <svg viewBox="0 0 64 80" className="h-full w-full" fill="none">
          <path
            d="M32 4 L56 14 V40 C56 56 44 68 32 74 C20 68 8 56 8 40 V14 Z"
            fill={accent + "14"}
            stroke={accent}
            strokeWidth="2"
          />
          {/* watermark lines inside shield */}
          <path
            d="M32 4 L56 14 V40 C56 56 44 68 32 74 C20 68 8 56 8 40 V14 Z"
            fill="none"
            stroke={accent}
            strokeWidth="0.5"
            opacity="0.3"
          />
          {/* name lines (watermark text) */}
          <line x1="18" y1="30" x2="46" y2="30" stroke={accent} strokeWidth="1.5" opacity="0.5" />
          <line x1="18" y1="36" x2="38" y2="36" stroke={accent} strokeWidth="1" opacity="0.4" />
          <line x1="18" y1="42" x2="42" y2="42" stroke={accent} strokeWidth="1" opacity="0.4" />
          {/* check mark */}
          <motion.path
            d="M24 52 L30 58 L42 44"
            stroke={accent}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6 }}
          />
        </svg>
      </motion.div>
      {/* floating dots around shield */}
      <motion.span
        animate={{ y: hovered ? -6 : 0, opacity: hovered ? 1 : 0.5 }}
        className="absolute left-2 top-6 h-1.5 w-1.5 rounded-full"
        style={{ background: accent }}
      />
      <motion.span
        animate={{ y: hovered ? 4 : 0, opacity: hovered ? 1 : 0.5 }}
        className="absolute right-3 bottom-8 h-1 w-1 rounded-full"
        style={{ background: accent }}
      />
    </div>
  );
}
