"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";

/* ───────────────────────── FINAL CTA ───────────────────────── */
export function FinalCTA() {
  const { openAuth, t } = useApp();
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          className="relative overflow-hidden rounded-3xl px-6 py-16 text-center sm:py-20"
          style={{ color: "#FBF5E3" }}
        >
          {/* Background image */}
          <img
            src="/cta-bg.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Green overlay */}
          <div className="absolute inset-0 bg-[#1F4A2E]/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1F4A2E]/70 via-[#1F4A2E]/20 to-[#1F4A2E]/40" />

          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
            <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
          </div>
          <div className="relative">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-heading text-3xl font-600 leading-tight sm:text-5xl text-balance"
              style={{ color: "#FBF5E3" }}
            >
              {t("cta.title1")}
              <br />
              {t("cta.title2")}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mx-auto mt-4 max-w-xl text-base"
              style={{ color: "rgba(251,245,227,0.75)" }}
            >
              {t("cta.desc")}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-8 flex flex-wrap justify-center gap-3"
            >
              <Button
                size="lg"
                className="bg-accent text-accent-foreground shadow-lg hover:bg-accent/90"
                onClick={() => openAuth("register-creator")}
              >
                {t("cta.button1")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary/40 bg-transparent hover:bg-primary/10"
                style={{ color: "#FBF5E3" }}
                onClick={() => useApp.getState().setView({ name: "marketplace" })}
              >
                {t("cta.button2")}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
