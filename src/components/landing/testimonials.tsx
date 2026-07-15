"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { useApp } from "@/lib/store";
import type { TranslationKey } from "@/lib/i18n";
import { SectionHeading } from "./section-heading";

/* ───────────────────────── TESTIMONIALS ───────────────────────── */
interface Testimonial {
  name: TranslationKey;
  role: TranslationKey;
  photo: string;
  text: TranslationKey;
  rating: number;
}

export function TestimonialsSection() {
  const { t } = useApp();
  const testimonials: Testimonial[] = [
    {
      name: "testimonial.1.name",
      role: "testimonial.1.role",
      photo: "https://sfile.chatglm.cn/images-ppt/07247c601755.jpg",
      text: "testimonial.1.text",
      rating: 5,
    },
    {
      name: "testimonial.2.name",
      role: "testimonial.2.role",
      photo: "https://sfile.chatglm.cn/images-ppt/c6d285083e39.jpg",
      text: "testimonial.2.text",
      rating: 5,
    },
    {
      name: "testimonial.3.name",
      role: "testimonial.3.role",
      photo: "https://sfile.chatglm.cn/images-ppt/76e81d24e2e1.jpg",
      text: "testimonial.3.text",
      rating: 5,
    },
    {
      name: "testimonial.4.name",
      role: "testimonial.4.role",
      photo: "https://sfile.chatglm.cn/images-ppt/a9370e5f76e8.jpg",
      text: "testimonial.4.text",
      rating: 4,
    },
  ];
  return (
    <section className="bg-card/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t("testimonials.eyebrow")}
          title={t("testimonials.title")}
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((tm, i) => {
            const name = t(tm.name);
            return (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col rounded-2xl border border-border bg-card p-6"
              >
                <Quote className="h-7 w-7 text-accent" />
                <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground/80 text-pretty">
                  &ldquo;{t(tm.text)}&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className={
                        j < tm.rating
                          ? "h-3.5 w-3.5 fill-accent text-accent"
                          : "h-3.5 w-3.5 text-muted-foreground/30"
                      }
                    />
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2.5 border-t border-border pt-3">
                  <div className="h-9 w-9 overflow-hidden rounded-full">
                    <img
                      src={tm.photo}
                      alt={name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-600 text-foreground">{name}</p>
                    <p className="text-[11px] text-muted-foreground">{t(tm.role)}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
