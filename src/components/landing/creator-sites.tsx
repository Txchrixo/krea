"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Globe,
  Sparkles,
  Check,
  ArrowRight,
  Menu,
  Star,
  Palette,
  Type,
  MousePointerClick,
} from "lucide-react";
import { THEMES, THEME_LIST, FONTS } from "@/lib/site-themes";
import type { ThemePreset } from "@/lib/types";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const PREVIEW_BOOKS = [
  { title: "Les Clés du Marketing WhatsApp", color: "#1F4A2E", price: "5 000 F" },
  { title: "Entreprendre au Féminin", color: "#8B3A2F", price: "7 500 F" },
  { title: "Discipline de Fer", color: "#0F4C5C", price: "6 000 F" },
  { title: "Cuisine Rapide pour Mamans", color: "#C9482B", price: "4 500 F" },
];

export function CreatorSitesSection() {
  const { setView, openAuth, t } = useApp();
  const [activeTheme, setActiveTheme] = useState<ThemePreset>("terre");
  const [activeFont, setActiveFont] = useState<"playfair" | "poppins" | "merienda">("playfair");
  const theme = THEMES[activeTheme];
  const font = FONTS[activeFont];

  return (
    <section className="relative overflow-hidden bg-[#FBF5E3] py-20 sm:py-28">
      {/* ambient blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-3xl font-700 leading-tight text-foreground sm:text-5xl">
            Votre propre site web.
            <br />
            <span className="text-primary">Pas juste une page.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Un site à votre nom, vos couleurs, vos textes. Prêt en deux minutes.
          </p>
        </div>

        {/* Interactive preview */}
        <div className="mt-14">
          {/* Controls */}
          <div className="mx-auto mb-6 flex max-w-fit flex-wrap items-center justify-center gap-3 rounded-2xl border border-border bg-card/80 p-3 shadow-sm backdrop-blur">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              <span className="text-xs font-600 uppercase tracking-wide text-muted-foreground">Thème</span>
            </div>
            <div className="flex gap-1.5">
              {THEME_LIST.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTheme(t.id)}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-all hover:scale-110",
                    activeTheme === t.id ? "border-foreground scale-110 shadow-md" : "border-border"
                  )}
                  style={{ background: t.primary }}
                  title={t.label}
                  aria-label={t.label}
                >
                  {activeTheme === t.id && (
                    <Check className="mx-auto h-4 w-4" style={{ color: t.accent }} />
                  )}
                </button>
              ))}
            </div>
            <div className="hidden h-6 w-px bg-border sm:block" />
            <div className="hidden items-center gap-2 sm:flex">
              <Type className="h-4 w-4 text-primary" />
              <span className="text-xs font-600 uppercase tracking-wide text-muted-foreground">Typo</span>
            </div>
            <div className="hidden gap-1.5 sm:flex">
              {(["merienda", "playfair", "poppins"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFont(f)}
                  className={cn(
                    "flex h-8 items-center justify-center rounded-lg border-2 px-3 text-xs font-700 transition-all",
                    activeFont === f ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                  )}
                  style={{ fontFamily: FONTS[f].heading }}
                >
                  Ag
                </button>
              ))}
            </div>
          </div>

          {/* Browser mockup : fixed 1080×620 with scrollable site inside */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto w-full max-w-[1080px] overflow-hidden rounded-2xl border border-border bg-card"
          >
            {/* Browser bar : compact */}
            <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-3 py-1.5">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              </div>
              <div className="mx-auto flex items-center gap-1.5 rounded-md bg-background px-2.5 py-0.5 text-[10px] text-muted-foreground">
                <Globe className="h-2.5 w-2.5" />
                <span className="font-mono">krea.com/aicha-diallo</span>
              </div>
            </div>

            {/* Scrollable site preview : fills remaining height to total 620px */}
            <div
              className="relative h-[587px] overflow-y-auto"
              style={{
                backgroundColor: theme.bg,
                color: theme.foreground,
                fontFamily: font.body,
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTheme + activeFont}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* ── Masthead : magazine colophon style ── */}
                  <div
                    className="sticky top-0 z-20 border-b backdrop-blur-md"
                    style={{ borderColor: theme.border, backgroundColor: theme.surface + "f2" }}
                  >
                    <div className="flex items-center justify-between px-6 py-2.5">
                      <div className="flex items-baseline gap-3">
                        <span
                          className="text-base font-700 tracking-tight"
                          style={{ color: theme.foreground, fontFamily: font.heading }}
                        >
                          Aïcha Diallo
                        </span>
                        <span className="hidden text-[9px] uppercase tracking-[0.2em] sm:inline" style={{ color: theme.muted }}>
                          Écrit depuis Dakar
                        </span>
                      </div>
                      <div className="hidden items-center gap-4 text-[10px] font-500 md:flex" style={{ color: theme.muted }}>
                        <span style={{ color: theme.foreground }} className="border-b border-current pb-0.5">Accueil</span>
                        <span>Bibliothèque</span>
                        <span>À propos</span>
                        <span>Contact</span>
                      </div>
                      <span className="text-[9px] uppercase tracking-[0.15em]" style={{ color: theme.muted }}>
                        Vol. 03
                      </span>
                    </div>
                  </div>

                  {/* ── Hero : editorial, asymmetric, bleeding headline ── */}
                  <div className="relative overflow-hidden">
                    <div className="grid grid-cols-12 gap-0">
                      {/* Left: massive headline column */}
                      <div className="col-span-12 px-6 pt-10 pb-6 sm:col-span-8 sm:px-10 sm:pt-14 sm:pb-8">
                        <div className="flex items-center gap-3">
                          <span className="font-heading text-3xl font-700 leading-none" style={{ color: theme.muted, opacity: 0.5 }}>
                            №
                          </span>
                          <span className="text-[10px] uppercase tracking-[0.25em]" style={{ color: theme.muted }}>
                            Édition 2025 · Entrepreneuriat
                          </span>
                        </div>
                        <motion.h3
                          key={activeTheme + "-h"}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 text-[2.1rem] font-700 leading-[0.98] tracking-tight sm:text-5xl"
                          style={{ color: theme.foreground, fontFamily: font.heading }}
                        >
                          Transformez<br />
                          votre ambition<br />
                          en <span style={{ fontStyle: "italic", color: theme.primary }}>entreprise</span><br />
                          rentable.
                        </motion.h3>
                        <div className="mt-6 flex items-center gap-4">
                          <span
                            className="text-[11px] font-600 uppercase tracking-[0.15em]"
                            style={{ color: theme.primary }}
                          >
                            Lire les œuvres
                          </span>
                          <span className="h-px flex-1" style={{ background: theme.border }} />
                          <span className="text-[10px]" style={{ color: theme.muted }}>03 titres</span>
                        </div>
                      </div>
                      {/* Right: single rotated book with annotation */}
                      <div className="relative col-span-12 flex items-center justify-center px-6 pb-8 sm:col-span-4 sm:px-4 sm:pb-0">
                        <motion.div
                          initial={{ opacity: 0, rotate: 6, y: 16 }}
                          animate={{ opacity: 1, rotate: 4, y: 0 }}
                          transition={{ delay: 0.12 }}
                          className="relative"
                        >
                          <div
                            className="flex aspect-[3/4] w-32 flex-col justify-between rounded-sm p-3 shadow-2xl sm:w-36"
                            style={{ background: "#1F4A2E" }}
                          >
                            <div>
                              <div className="h-0.5 w-6" style={{ background: "rgba(255,255,255,0.4)" }} />
                              <p className="mt-2 text-[8px] uppercase tracking-wider text-white/50">Vol. 01</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-700 leading-tight text-white" style={{ fontFamily: font.heading }}>
                                Les Clés du<br />Marketing<br />WhatsApp
                              </p>
                              <p className="mt-1.5 text-[7px] uppercase tracking-wider text-white/50">Aïcha Diallo</p>
                            </div>
                          </div>
                          {/* handwritten annotation */}
                          <span
                            className="absolute -bottom-7 -left-4 rotate-[-4deg] text-[11px] italic"
                            style={{ color: theme.muted, fontFamily: font.heading }}
                          >
                            le plus lu ↗
                          </span>
                        </motion.div>
                      </div>
                    </div>
                    {/* thin rule with metadata */}
                    <div
                      className="flex items-center justify-between border-t border-b px-6 py-1.5 text-[9px] uppercase tracking-[0.2em] sm:px-10"
                      style={{ borderColor: theme.border, color: theme.muted }}
                    >
                      <span>Dakar · Sénégal</span>
                      <span className="hidden sm:inline">Coach · Conférencière · Auteure</span>
                      <span>Établi 2018</span>
                    </div>
                  </div>

                  {/* ── Index of works : editorial list, not a card grid ── */}
                  <div className="px-6 py-8 sm:px-10 sm:py-10">
                    <div className="mb-6 flex items-baseline justify-between">
                      <h4
                        className="text-xl font-700 tracking-tight sm:text-2xl"
                        style={{ color: theme.foreground, fontFamily: font.heading }}
                      >
                        Les œuvres
                      </h4>
                      <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: theme.muted }}>
                        Index
                      </span>
                    </div>
                    <div className="divide-y" style={{ borderColor: theme.border }}>
                      {PREVIEW_BOOKS.map((b, i) => (
                        <motion.div
                          key={b.title + activeTheme}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.07 }}
                          className="group flex cursor-pointer items-center gap-4 py-3.5 transition-colors hover:bg-black/[0.02]"
                        >
                          {/* numeral */}
                          <span
                            className="w-8 flex-shrink-0 font-heading text-lg font-700 tabular-nums"
                            style={{ color: theme.muted, opacity: 0.6 }}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          {/* mini cover */}
                          <div
                            className="h-12 w-9 flex-shrink-0 rounded-sm shadow-sm"
                            style={{ background: b.color }}
                          />
                          {/* title + desc */}
                          <div className="min-w-0 flex-1">
                            <p
                              className="truncate text-sm font-700 sm:text-base"
                              style={{ color: theme.foreground, fontFamily: font.heading }}
                            >
                              {b.title}
                            </p>
                            <p className="truncate text-[10px]" style={{ color: theme.muted }}>
                              {i === 0 ? "Guide pratique · 84 pages" : i === 1 ? "Manuel · 120 pages" : i === 2 ? "Méthode · 96 pages" : "Recueil · 64 pages"}
                            </p>
                          </div>
                          {/* rating */}
                          <span className="hidden items-center gap-1 text-[10px] sm:flex" style={{ color: theme.muted }}>
                            <Star className="h-2.5 w-2.5 fill-current" style={{ color: theme.accent }} />
                            5.0
                          </span>
                          {/* price */}
                          <span
                            className="flex-shrink-0 text-sm font-700 tabular-nums"
                            style={{ color: theme.primary, fontFamily: font.heading }}
                          >
                            {b.price}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* ── Pull quote : oversized mark, asymmetric ── */}
                  <div className="relative overflow-hidden px-6 py-12 sm:px-10" style={{ backgroundColor: theme.bgAlt }}>
                    <span
                      className="pointer-events-none absolute -top-4 left-3 font-heading text-[100px] leading-none"
                      style={{ color: theme.foreground, opacity: 0.08 }}
                    >
                      “
                    </span>
                    <div className="relative max-w-2xl">
                      <p
                        className="text-lg font-500 leading-snug sm:text-2xl"
                        style={{ color: theme.foreground, fontFamily: font.heading }}
                      >
                        Les femmes africaines n'ont pas besoin de permission pour entreprendre. Elles ont besoin de méthodes qui fonctionnent <span style={{ fontStyle: "italic" }}>ici</span>.
                      </p>
                      <div className="mt-4 flex items-center gap-3">
                        <span className="h-px w-8" style={{ background: theme.primary }} />
                        <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: theme.primary }}>
                          Aïcha Diallo
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── Colophon / about : signed, editorial ── */}
                  <div className="grid grid-cols-12 gap-6 px-6 py-10 sm:px-10">
                    <div className="col-span-12 sm:col-span-4">
                      <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: theme.muted }}>
                        Colophon
                      </span>
                      <p className="mt-2 text-[11px] leading-relaxed" style={{ color: theme.muted }}>
                        Coach en entrepreneuriat féminin. 7 ans d'accompagnement de plus de 300 femmes à Dakar, Abidjan et Douala.
                      </p>
                    </div>
                    <div className="col-span-12 sm:col-span-8">
                      <p
                        className="text-base leading-relaxed sm:text-lg"
                        style={{ color: theme.foreground, fontFamily: font.heading }}
                      >
                        Mes ebooks distillent les méthodes éprouvées sur le terrain. Pas de théorie importée, que des systèmes concrets, testés par des entrepreneuses qui vivent de leur business.
                      </p>
                      {/* signature */}
                      <p
                        className="mt-4 text-2xl italic"
                        style={{ color: theme.primary, fontFamily: font.heading }}
                      >
                        Aïcha
                      </p>
                    </div>
                  </div>

                  {/* ── Footer : minimal colophon line ── */}
                  <div
                    className="border-t px-6 py-5 sm:px-10"
                    style={{ borderColor: theme.border, backgroundColor: theme.surface }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[9px] uppercase tracking-[0.2em]" style={{ color: theme.muted }}>
                      <span>© MMXXV · Aïcha Diallo</span>
                      <div className="hidden gap-4 sm:flex">
                        <span>Instagram</span>
                        <span>WhatsApp</span>
                        <span>Email</span>
                      </div>
                      <span className="flex items-center gap-1 normal-case tracking-normal">
                        <Sparkles className="h-2.5 w-2.5" /> Propulsé par Krea
                      </span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Scroll hint */}
          <div className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
            <MousePointerClick className="h-3.5 w-3.5" />
            <span>Survolez et scrollez dans le preview · changez les couleurs et typos en direct</span>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            className="bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
            onClick={() => openAuth("register-creator")}
          >
            Créer mon site d'auteur
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => setView({ name: "creator-site", slug: "aicha-diallo" })}
          >
            <Star className="mr-2 h-4 w-4 fill-accent text-accent" />
            Voir un exemple
          </Button>
        </div>
      </div>
    </section>
  );
}
