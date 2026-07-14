"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useApp } from "@/lib/store";
import type { TranslationKey } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";
import { useState } from "react";
import { cn } from "@/lib/utils";

/* ───────────────────────── HOW IT WORKS ─────────────────────────
   Editorial process timeline — 4 steps as a vertical/horizontal
   sequence with big numerals, connecting line, and hover-reveal.
   Awards-style, not a generic "icon + title + desc" grid. */

interface Step {
  n: string;
  title: TranslationKey;
  desc: TranslationKey;
  detail: TranslationKey;
  accent: string;
}

export function HowItWorksSection() {
  const { openAuth, t } = useApp();
  const [active, setActive] = useState<number | null>(null);

  const steps: Step[] = [
    {
      n: "01",
      title: "how.step1.title",
      desc: "how.step1.desc",
      detail: "how.step1.detail" as TranslationKey,
      accent: "#5DBE8A",
    },
    {
      n: "02",
      title: "how.step2.title",
      desc: "how.step2.desc",
      detail: "how.step2.detail" as TranslationKey,
      accent: "#FFD86B",
    },
    {
      n: "03",
      title: "how.step3.title",
      desc: "how.step3.desc",
      detail: "how.step3.detail" as TranslationKey,
      accent: "#C8553D",
    },
    {
      n: "04",
      title: "how.step4.title",
      desc: "how.step4.desc",
      detail: "how.step4.detail" as TranslationKey,
      accent: "#0F4C5C",
    },
  ];

  return (
    <section className="bg-card/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t("how.eyebrow")}
          title={t("how.title")}
          subtitle={t("how.subtitle")}
        />

        {/* Editorial timeline */}
        <div className="relative mt-16">
          {/* Horizontal connecting line (desktop) — drawn progressively */}
          <div className="absolute left-0 right-0 top-[2.75rem] hidden h-px bg-border lg:block" />
          <motion.div
            className="absolute left-0 top-[2.75rem] hidden h-px lg:block"
            style={{ background: "var(--primary)" }}
            initial={{ width: "0%" }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
          />

          <div className="grid gap-8 lg:grid-cols-4">
            {steps.map((s, i) => {
              const isActive = active === i;
              return (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  className="group relative cursor-default"
                >
                  {/* Node on the line */}
                  <div className="relative mb-6 flex justify-center lg:mb-0">
                    <motion.div
                      animate={{ scale: isActive ? 1.15 : 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="relative z-10 flex h-[2.75rem] w-[2.75rem] items-center justify-center rounded-full border-2 bg-background"
                      style={{
                        borderColor: isActive ? s.accent : "var(--border)",
                      }}
                    >
                      <span
                        className="font-heading text-sm font-700 tabular-nums"
                        style={{ color: isActive ? s.accent : "var(--foreground)" }}
                      >
                        {s.n}
                      </span>
                      {/* pulse ring on hover */}
                      {isActive && (
                        <motion.span
                          layoutId="step-pulse"
                          className="absolute inset-0 rounded-full border-2"
                          style={{ borderColor: s.accent }}
                          initial={{ scale: 1, opacity: 0.6 }}
                          animate={{ scale: 1.6, opacity: 0 }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                        />
                      )}
                    </motion.div>
                  </div>

                  {/* Content block */}
                  <div
                    className={cn(
                      "rounded-xl border bg-card p-5 transition-all duration-300",
                      isActive ? "border-transparent shadow-xl" : "border-border"
                    )}
                    style={isActive ? { boxShadow: `0 16px 40px -16px ${s.accent}66` } : undefined}
                  >
                    {/* tag */}
                    <div className="flex items-center gap-2">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: s.accent }}
                      />
                      <span
                        className="text-[10px] font-700 uppercase tracking-[0.18em]"
                        style={{ color: s.accent }}
                      >
                        Étape {s.n}
                      </span>
                    </div>

                    <h3 className="mt-2.5 font-heading text-base font-700 leading-tight text-foreground">
                      {t(s.title)}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">
                      {t(s.desc)}
                    </p>

                    {/* Reveal detail on hover */}
                    <motion.div
                      initial={false}
                      animate={{
                        height: isActive ? "auto" : 0,
                        opacity: isActive ? 1 : 0,
                      }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 border-t border-border pt-3">
                        <p className="text-xs italic leading-relaxed text-foreground/70">
                          {t(s.detail)}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="mt-14 text-center">
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => openAuth("register-creator")}
          >
            {t("how.cta")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
