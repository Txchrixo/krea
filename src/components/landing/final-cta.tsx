"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";

/* ───────────────────────── FINAL CTA ─────────────────────────
   Full-bleed section that stretches from the pricing grid to the footer.
   Interactive parallax background + animated headline reveal. */
export function FinalCTA() {
  const { openAuth, t } = useApp();
  const ref = useRef<HTMLElement>(null);

  // Parallax on scroll: background moves slower than content
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const blob1X = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const blob2X = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#1F4A2E]">
      {/* ── Background image with parallax + Ken Burns animation ── */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 scale-125">
        <motion.img
          src="/cta-bg.jpg"
          alt=""
          className="h-full w-full object-cover opacity-60"
          animate={{
            scale: [1, 1.08, 1],
            x: ["0%", "-2%", "0%"],
            y: ["0%", "-1%", "0%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* ── Gradient overlays ── */}
      <motion.div
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 bg-gradient-to-b from-[#1F4A2E]/60 via-[#1F4A2E]/50 to-[#1F4A2E]/70"
      />

      {/* ── Animated blobs ── */}
      <motion.div
        style={{ x: blob1X }}
        className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-accent/15 blur-3xl"
      />
      <motion.div
        style={{ x: blob2X }}
        className="pointer-events-none absolute -right-32 bottom-1/4 h-[28rem] w-[28rem] rounded-full bg-primary/20 blur-3xl"
      />

      {/* ── Engraved giant "Krea" watermark ── */}
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.08 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-center font-heading font-700 leading-none tracking-tighter text-[#FBF5E3]"
        style={{ fontSize: "clamp(8rem, 22vw, 18rem)" }}
      >
        Krea
      </motion.span>

      {/* ── Content with parallax ── */}
      <motion.div
        style={{ y: textY }}
        className="relative mx-auto max-w-3xl px-4 py-28 text-center sm:py-36"
      >
        {/* Headline : word-by-word reveal */}
        <h2 className="font-heading text-4xl font-700 leading-[1.05] text-[#FBF5E3] sm:text-6xl">
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="block"
          >
            {t("cta.title1")}
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="block italic text-accent"
          >
            {t("cta.title2")}
          </motion.span>
        </h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mx-auto mt-6 max-w-xl text-lg text-[#FBF5E3]/70"
        >
          {t("cta.desc")}
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.45 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <Button
            size="lg"
            className="group bg-accent text-accent-foreground shadow-xl transition-all hover:shadow-2xl hover:scale-[1.03]"
            onClick={() => openAuth("register-creator")}
          >
            {t("cta.button1")}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-[#FBF5E3]/30 bg-transparent text-[#FBF5E3] backdrop-blur-sm transition-all hover:bg-[#FBF5E3]/10 hover:text-[#FBF5E3]"
            onClick={() => useApp.getState().setView({ name: "marketplace" })}
          >
            {t("cta.button2")}
          </Button>
        </motion.div>

        {/* trust line */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-xs uppercase tracking-[0.2em] text-[#FBF5E3]/40"
        >
          Gratuit · Sans engagement · Mobile Money
        </motion.p>
      </motion.div>

      {/* ── Bottom fade into footer ── */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-[#FBF5E3]/10" />
    </section>
  );
}
