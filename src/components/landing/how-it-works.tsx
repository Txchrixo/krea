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
   Editorial step sequence : typographic, clean, with subtle 3D depth
   via CSS perspective. No custom SVG illustrations, no gimmicks. */

interface Step {
  n: string;
  title: TranslationKey;
  desc: TranslationKey;
  detail: TranslationKey;
  accent: string;
}

export function HowItWorksSection() {
  const { openAuth, t } = useApp();
  const [active, setActive] = useState<number | null>(0);

  const steps: Step[] = [
    { n: "01", title: "how.step1.title", desc: "how.step1.desc", detail: "how.step1.detail" as TranslationKey, accent: "#5DBE8A" },
    { n: "02", title: "how.step2.title", desc: "how.step2.desc", detail: "how.step2.detail" as TranslationKey, accent: "#FFD86B" },
    { n: "03", title: "how.step3.title", desc: "how.step3.desc", detail: "how.step3.detail" as TranslationKey, accent: "#C8553D" },
    { n: "04", title: "how.step4.title", desc: "how.step4.desc", detail: "how.step4.detail" as TranslationKey, accent: "#0F4C5C" },
  ];

  return (
    <section className="bg-card/40 py-20 sm:py-28" style={{ perspective: "1000px" }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t("how.eyebrow")}
          title={t("how.title")}
          subtitle={t("how.subtitle")}
        />

        {/* Step sequence : book-shaped cards with 3D depth */}
        <div
          className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          style={{ transformStyle: "preserve-3d" }}
        >
          {steps.map((s, i) => {
            const isActive = active === i;
            return (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                onMouseEnter={() => setActive(i)}
                style={{
                  transformStyle: "preserve-3d",
                  rotateX: isActive ? -6 : 0,
                  rotateY: isActive ? -8 : 0,
                  transition: "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
                  zIndex: isActive ? 10 : 1,
                }}
                className="group relative cursor-default"
              >
                <div
                  className="relative mx-auto flex w-full max-w-[240px] flex-col overflow-hidden rounded-r-lg rounded-l-sm border bg-card shadow-md transition-shadow duration-300"
                  style={{
                    aspectRatio: "3 / 4",
                    boxShadow: isActive
                      ? `0 25px 60px -20px ${s.accent}aa, 0 10px 20px -10px rgba(0,0,0,0.15)`
                      : `0 4px 12px -4px rgba(31,74,46,0.15)`,
                    borderColor: isActive ? "transparent" : "var(--border)",
                  }}
                >
                  {/* Book spine : left edge with gradient + binding lines */}
                  <div
                    className="absolute left-0 top-0 h-full w-3"
                    style={{
                      background: `linear-gradient(to right, ${s.accent}, ${s.accent}cc)`,
                      opacity: isActive ? 1 : 0.4,
                    }}
                  >
                    {/* binding notches */}
                    <div className="absolute left-1 top-1/4 h-px w-2 bg-black/20" />
                    <div className="absolute left-1 top-1/2 h-px w-2 bg-black/20" />
                    <div className="absolute left-1 top-3/4 h-px w-2 bg-black/20" />
                  </div>

                  {/* Content : offset right to leave room for spine */}
                  <div className="flex h-full flex-col p-5 pl-7">
                    {/* Numeral + accent dot */}
                    <div className="flex items-start justify-between">
                      <span
                        className="font-heading text-5xl font-700 leading-none tracking-tighter tabular-nums transition-opacity duration-300"
                        style={{ color: s.accent, opacity: isActive ? 1 : 0.3 }}
                      >
                        {s.n}
                      </span>
                      <span
                        className="mt-2 h-2 w-2 rounded-full transition-all duration-300"
                        style={{
                          background: s.accent,
                          opacity: isActive ? 1 : 0.3,
                          transform: isActive ? "scale(1.5)" : "scale(1)",
                        }}
                      />
                    </div>

                    {/* Divider */}
                    <div
                      className="my-3 h-px transition-all duration-300"
                      style={{
                        background: isActive ? s.accent : "var(--border)",
                        opacity: isActive ? 0.5 : 1,
                      }}
                    />

                    {/* Title */}
                    <h3 className="font-heading text-sm font-700 leading-tight text-foreground">
                      {t(s.title)}
                    </h3>

                    {/* Description */}
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground text-pretty">
                      {t(s.desc)}
                    </p>

                    {/* Detail : bottom, fades in on hover (desktop), always visible (mobile) */}
                    <div className="mt-auto pt-3">
                      <p
                        className={cn(
                          "text-[11px] italic leading-relaxed transition-opacity duration-300",
                          isActive ? "opacity-100" : "opacity-50 md:opacity-0"
                        )}
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {t(s.detail)}
                      </p>
                    </div>
                  </div>

                  {/* Page edge : right side subtle line for book thickness effect */}
                  <div
                    className="absolute right-0 top-2 bottom-2 w-px"
                    style={{ background: isActive ? s.accent + "30" : "var(--border)" }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 text-center"
        >
          <Button
            size="lg"
            className="group bg-primary text-primary-foreground shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
            onClick={() => openAuth("register-creator")}
          >
            {t("how.cta")}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
