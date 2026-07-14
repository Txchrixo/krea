"use client";

import { motion } from "framer-motion";
import { Fingerprint, Lock, Eye, Smartphone } from "lucide-react";
import { useApp } from "@/lib/store";
import type { TranslationKey } from "@/lib/i18n";
import type { LucideIcon } from "lucide-react";

/* ───────────────────────── PROTECTION ───────────────────────── */
interface Layer {
  icon: LucideIcon;
  title: TranslationKey;
  desc: TranslationKey;
}

export function ProtectionSection() {
  const { t } = useApp();
  const layers: Layer[] = [
    { icon: Fingerprint, title: "protection.f1.title", desc: "protection.f1.desc" },
    { icon: Lock, title: "protection.f2.title", desc: "protection.f2.desc" },
    { icon: Eye, title: "protection.f3.title", desc: "protection.f3.desc" },
    { icon: Smartphone, title: "protection.f4.title", desc: "protection.f4.desc" },
  ];
  return (
    <section
      className="relative overflow-hidden bg-[#1F4A2E] py-20 sm:py-28"
      style={{ color: "#FBF5E3" }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2
              className="font-heading text-3xl font-600 leading-tight sm:text-4xl"
              style={{ color: "#FBF5E3" }}
            >
              {t("protection.title")}
            </h2>
            <p className="mt-4 text-base" style={{ color: "rgba(251,245,227,0.7)" }}>
              {t("protection.desc")}
            </p>
            <div className="mt-6 rounded-xl border border-primary/30 bg-primary/10 p-4">
              <p className="font-heading text-sm" style={{ color: "#FBF5E3" }}>
                {t("protection.quote.pre")}
                <span className="text-accent">{t("protection.quote.user")}</span>
                {t("protection.quote.post")}
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {layers.map((l, i) => (
              <motion.div
                key={l.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl border border-primary/20 bg-white/5 p-5 backdrop-blur-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                  <l.icon className="h-5 w-5 text-primary" />
                </div>
                <h3
                  className="mt-3 font-heading text-base font-600"
                  style={{ color: "#FBF5E3" }}
                >
                  {t(l.title)}
                </h3>
                <p className="mt-1 text-sm" style={{ color: "rgba(251,245,227,0.65)" }}>
                  {t(l.desc)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
