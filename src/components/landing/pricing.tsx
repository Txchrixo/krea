"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useApp } from "@/lib/store";
import type { TranslationKey } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "./section-heading";

/* ───────────────────────── PRICING ───────────────────────── */
interface Plan {
  name: TranslationKey;
  price: TranslationKey;
  period?: TranslationKey;
  tag: TranslationKey;
  commission: TranslationKey;
  features: TranslationKey[];
  cta: TranslationKey;
  highlighted: boolean;
}

export function PricingSection() {
  const { openAuth, setView, t } = useApp();
  const plans: Plan[] = [
    {
      name: "pricing.free.name",
      price: "pricing.free",
      tag: "pricing.free.tag",
      commission: "pricing.free.commission",
      features: [
        "pricing.free.feature1",
        "pricing.free.feature2",
        "pricing.free.feature3",
        "pricing.free.feature4",
        "pricing.free.feature5",
        "pricing.free.feature6",
      ],
      cta: "pricing.cta.start",
      highlighted: false,
    },
    {
      name: "pricing.pro.name",
      price: "pricing.pro.price",
      period: "pricing.month",
      tag: "pricing.pro.tag",
      commission: "pricing.pro.commission",
      features: [
        "pricing.pro.feature1",
        "pricing.pro.feature2",
        "pricing.pro.feature3",
        "pricing.pro.feature4",
        "pricing.pro.feature5",
        "pricing.pro.feature6",
        "pricing.pro.feature7",
      ],
      cta: "pricing.cta.pro",
      highlighted: true,
    },
    {
      name: "pricing.premium.name",
      price: "pricing.premium.price",
      period: "pricing.month",
      tag: "pricing.premium.tag",
      commission: "pricing.premium.commission",
      features: [
        "pricing.premium.feature1",
        "pricing.premium.feature2",
        "pricing.premium.feature3",
        "pricing.premium.feature4",
        "pricing.premium.feature5",
        "pricing.premium.feature6",
        "pricing.premium.feature7",
      ],
      cta: "pricing.cta.contact",
      highlighted: false,
    },
  ];
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t("pricing.eyebrow")}
          title={t("pricing.title")}
          subtitle={t("pricing.subtitle")}
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((p, i) => {
            const name = t(p.name);
            return (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative flex flex-col rounded-2xl border p-7 ${
                  p.highlighted
                    ? "border-primary bg-card shadow-xl shadow-primary/10 lg:-mt-4 lg:mb-4"
                    : "border-border bg-card"
                }`}
              >
                {p.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground shadow-md">
                      {t(p.tag)}
                    </Badge>
                  </div>
                )}
                {!p.highlighted && (
                  <span className="text-xs font-500 text-muted-foreground">{t(p.tag)}</span>
                )}
                <h3 className="mt-1 font-heading text-xl font-600 text-foreground">{name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-heading text-4xl font-600 text-foreground">{t(p.price)}</span>
                  {p.period && <span className="text-sm text-muted-foreground">{t(p.period)}</span>}
                </div>
                <p className="mt-1 text-sm font-500 text-primary">{t(p.commission)}</p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground/80">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      {t(f)}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`mt-6 ${
                    p.highlighted
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-background text-foreground border border-border hover:bg-muted"
                  }`}
                  variant={p.highlighted ? "default" : "outline"}
                  onClick={() =>
                    name === t("pricing.premium.name")
                      ? setView({ name: "pricing" })
                      : openAuth("register-creator")
                  }
                >
                  {t(p.cta)}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
