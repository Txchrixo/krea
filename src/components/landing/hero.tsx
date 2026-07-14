"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Wallet,
  Smartphone,
  TrendingUp,
  Lock,
  Fingerprint,
  Globe,
  Bookmark,
  Settings,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BookData {
  id: string;
  src: string;
  title: string;
  author: string;
  chapter: string;
  price: string;
  method: string;
  methodLogo: string;
  time: string;
}

const BOOKS: BookData[] = [
  {
    id: "1",
    src: "https://sfile.chatglm.cn/images-ppt/9a8baf13a5d5.jpg",
    title: "What Lies in the Deep",
    author: "Author Name",
    chapter: "Chapter 3 of 7",
    price: "+5,000 F",
    method: "MTN MoMo",
    methodLogo: "https://sfile.chatglm.cn/images-ppt/00f22f15b671.svg",
    time: "2 min ago",
  },
  {
    id: "2",
    src: "https://sfile.chatglm.cn/images-ppt/f919827a6141.jpg",
    title: "Learn Basic Design Vol.1",
    author: "Henrietta Mitchell",
    chapter: "Chapter 5 of 12",
    price: "+3,500 F",
    method: "Orange Money",
    methodLogo: "https://sfile.chatglm.cn/images-ppt/9b83ee7d8fa7.png",
    time: "8 min ago",
  },
  {
    id: "3",
    src: "https://sfile.chatglm.cn/images-ppt/8d3ae52cbe3d.jpg",
    title: "Patterns in Circulation",
    author: "Nina Sylvanus",
    chapter: "Chapter 1 of 5",
    price: "+7,500 F",
    method: "Wave",
    methodLogo: "https://sfile.chatglm.cn/images-ppt/90f56ebdbd7a.png",
    time: "15 min ago",
  },
];

// Fixed positions around the reader mockup
type Slot = { x: string; y: string; z: number; scale: number; rotate: number; opacity: number };

// Slot 0 = top-left (the "active" position, shows in reader)
// Slot 1 = right side
// Slot 2 = bottom-left
const POSITION_SLOTS: Slot[] = [
  { x: "-22%", y: "60px",  z: 25, scale: 0.9,  rotate: -3,  opacity: 1 },
  { x: "78%",  y: "80px",  z: 18, scale: 0.68, rotate: 8,   opacity: 0.9 },
  { x: "-32%", y: "340px", z: 22, scale: 0.7,  rotate: -5,  opacity: 0.9 },
];

// Each book has a "slot index" — when you click a book, it swaps to slot 0 (top-left)
// and the book that was at slot 0 goes to the clicked book's old slot
function getSlotsForBooks(activeId: string): Record<string, Slot> {
  const result: Record<string, Slot> = {};
  BOOKS.forEach((book) => {
    if (book.id === activeId) {
      result[book.id] = POSITION_SLOTS[0]; // active → top-left
    } else {
      // non-active books get slots 1 and 2, keeping their relative order
      const nonActive = BOOKS.filter((b) => b.id !== activeId);
      const idx = nonActive.findIndex((b) => b.id === book.id);
      result[book.id] = POSITION_SLOTS[idx + 1];
    }
  });
  return result;
}

/* ───────────────────────── HERO ───────────────────────── */
export function HeroSection() {
  const { setView, openAuth, t } = useApp();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yScroll = useTransform(scrollYProgress, [0, 1], [0, -60]);

  const [activeBook, setActiveBook] = useState<BookData>(BOOKS[0]);
  const slots = getSlotsForBooks(activeBook.id);

  // Auto-rotate books every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBook((current) => {
        const idx = BOOKS.findIndex((b) => b.id === current.id);
        return BOOKS[(idx + 1) % BOOKS.length];
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={ref} className="relative grain overflow-hidden">
      {/* Giant engraved "Krea" watermark — editorial, awards-style */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-0 -translate-y-1/2 select-none text-center font-heading font-700 leading-none tracking-tighter"
        style={{
          fontSize: "clamp(14rem, 42vw, 34rem)",
          color: "var(--foreground)",
          opacity: 0.04,
          letterSpacing: "-0.06em",
          whiteSpace: "nowrap",
        }}
      >
        Krea
      </span>
      {/* subtle texture stroke through the wordmark */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-0 -translate-y-1/2 select-none text-center font-heading font-700 leading-none tracking-tighter"
        style={{
          fontSize: "clamp(14rem, 42vw, 34rem)",
          color: "transparent",
          WebkitTextStroke: "1px var(--foreground)",
          opacity: 0.06,
          letterSpacing: "-0.06em",
          whiteSpace: "nowrap",
        }}
      >
        Krea
      </span>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-4 sm:px-6 sm:pt-8 lg:px-8 lg:pb-24">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          {/* Left: copy */}
          <div className="lg:col-span-7">

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="mt-5 font-heading text-4xl font-600 leading-[1.05] tracking-tight text-foreground text-balance sm:text-5xl lg:text-6xl"
            >
              {t("hero.title1")}{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-primary">{t("hero.title2")}</span>
                <svg className="absolute -bottom-1 left-0 h-3 w-full text-accent" viewBox="0 0 200 12" preserveAspectRatio="none" fill="none">
                  <motion.path d="M2 9C40 3 80 3 120 6S180 9 198 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.7 }} />
                </svg>
              </span>{" "}
              {t("hero.title3")}
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mt-5 max-w-xl text-lg text-muted-foreground text-pretty">
              {t("hero.desc")}
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }} className="mt-7 flex flex-wrap items-center gap-3">
              <Button size="lg" className="group bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90" onClick={() => openAuth("register")}>
                {t("hero.cta.launch")}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline" className="border-border bg-background/50 backdrop-blur" onClick={() => setView({ name: "marketplace" })}>
                <BookOpen className="mr-2 h-4 w-4" />
                {t("hero.cta.explore")}
              </Button>
            </motion.div>
          </div>

          {/* Right: interactive book stack + reader mockup — centered when wrapped */}
          <div className="relative flex justify-center pl-8 lg:col-span-5 lg:justify-end lg:pl-0">
            <motion.div
              style={{ y: yScroll }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative mx-auto h-[520px] w-full max-w-sm"
            >
              {/* Book covers — swap positions on click */}
              {BOOKS.map((book, i) => (
                <BookCover
                  key={book.id}
                  book={book}
                  slot={slots[book.id]}
                  isActive={book.id === activeBook.id}
                  onClick={() => setActiveBook(book)}
                  delay={0.4 + i * 0.1}
                />
              ))}

              {/* Reader mockup — shows active book */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="absolute bottom-0 left-1/2 z-35 w-80 -translate-x-1/2"
              >
                <div className="overflow-hidden rounded-2xl border-2 border-border bg-card shadow-2xl">
                  {/* Status bar */}
                  <div className="flex items-center justify-between border-b border-border bg-muted/40 px-3 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-destructive/70" />
                      <div className="h-2 w-2 rounded-full bg-accent/70" />
                      <div className="h-2 w-2 rounded-full bg-primary/70" />
                    </div>
                    <span className="text-[9px] font-500 text-muted-foreground">Krea Reader</span>
                    <div className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5">
                      <Lock className="h-2.5 w-2.5 text-primary" />
                      <span className="text-[8px] font-500 text-primary">DRM</span>
                    </div>
                  </div>

                  {/* Book header */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeBook.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="flex items-center gap-2.5 border-b border-border p-3"
                    >
                      <div className="h-12 w-9 flex-shrink-0 overflow-hidden rounded shadow-sm">
                        <img src={activeBook.src} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-600 text-foreground">{activeBook.title}</p>
                        <p className="truncate text-[10px] text-muted-foreground">{activeBook.author} · {activeBook.chapter}</p>
                      </div>
                      <button className="text-muted-foreground transition-colors hover:text-primary">
                        <Bookmark className="h-3.5 w-3.5" />
                      </button>
                      <button className="text-muted-foreground transition-colors hover:text-primary">
                        <Settings className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
                  </AnimatePresence>

                  {/* Reading content */}
                  <div className="space-y-1.5 p-3">
                    <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" />
                      <span>2:34</span>
                      <span className="mx-1">·</span>
                      <span>{activeBook.chapter}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="h-1.5 w-full rounded bg-foreground/15" />
                      <div className="h-1.5 w-4/5 rounded bg-foreground/10" />
                      <div className="h-1.5 w-full rounded bg-foreground/15" />
                      <div className="h-1.5 w-3/5 rounded bg-foreground/10" />
                    </div>
                    <div className="rounded bg-accent/30 px-1 py-0.5">
                      <div className="h-1.5 w-full rounded bg-accent/50" />
                    </div>
                    <div className="space-y-1 pt-0.5">
                      <div className="h-1.5 w-4/5 rounded bg-foreground/10" />
                      <div className="h-1.5 w-3/5 rounded bg-foreground/10" />
                    </div>
                  </div>

                  {/* Watermark + progress */}
                  <div className="border-t border-border p-2.5">
                    <div className="flex items-center gap-1.5 rounded-md bg-accent/15 px-2 py-1 text-[9px] text-foreground">
                      <Fingerprint className="h-3 w-3 flex-shrink-0 text-primary" />
                      <span className="truncate">{t("hero.boughtBy")} aïcha@krea · #KRE-9F2A</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                        <motion.div className="h-full rounded-full bg-primary" initial={{ width: 0 }} animate={{ width: "67%" }} transition={{ duration: 1.5, delay: 1 }} />
                      </div>
                      <span className="text-[9px] font-500 text-muted-foreground">67%</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Sale notification — payment logo fully circular */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeBook.id}
                  initial={{ opacity: 0, x: 20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.9 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute -right-2 bottom-48 z-40 rounded-xl border border-border bg-card px-3 py-2 shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border border-border bg-white">
                      <img src={activeBook.methodLogo} alt={activeBook.method} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <p className="text-[10px] font-600 text-primary">{activeBook.price}</p>
                      <p className="text-[8px] text-muted-foreground">{activeBook.method} · {activeBook.time}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── INTERACTIVE BOOK COVER ───────────────────────── */
function BookCover({
  book,
  slot,
  isActive,
  onClick,
  delay = 0,
}: {
  book: BookData;
  slot: Slot;
  isActive: boolean;
  onClick: () => void;
  delay?: number;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-50, 50], [8, -8]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-50, 50], [-8, 8]), { stiffness: 200, damping: 20 });

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!isActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - rect.left - rect.width / 2;
    const cy = e.clientY - rect.top - rect.height / 2;
    mouseX.set((cx / rect.width) * 50);
    mouseY.set((cy / rect.height) * 50);
  }

  function onMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay }}
      style={{ perspective: 800 }}
      className="absolute left-0 top-0"
    >
      <motion.div
        animate={{
          x: slot.x,
          y: slot.y,
          scale: slot.scale,
          rotate: slot.rotate,
          zIndex: slot.z,
          opacity: slot.opacity,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
      >
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: parseFloat(book.id) * 0.5 }}
        >
          <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
            className="group relative h-60 w-44 cursor-pointer overflow-hidden rounded-lg shadow-2xl"
          >
            <img
              src={book.src}
              alt={book.title}
              className={cn(
                "h-full w-full object-cover transition-all duration-500 group-hover:scale-105",
                isActive ? "" : "grayscale-[20%] brightness-90"
              )}
            />
            {/* spine */}
            <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-r from-black/40 to-transparent" />
            {/* glossy hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            {/* active ring */}
            <div className={cn(
              "absolute inset-0 rounded-lg border-2 transition-all duration-300",
              isActive ? "border-primary opacity-100" : "border-transparent opacity-0 group-hover:opacity-60 group-hover:border-primary/40"
            )} />
            {/* hover tooltip */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <p className="text-[10px] font-600 text-white">{book.title}</p>
              <p className="text-[8px] text-white/60">{book.author}</p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function FloatingBook({ color, title, author, accent }: { color: string; title: string; author: string; accent?: boolean }) {
  return (
    <div className="h-60 rounded-lg p-3" style={{ background: color }}>
      <div className="flex h-full flex-col justify-between">
        <div className="flex justify-end">
          <div className="h-5 w-5 rounded-full bg-white/25" />
        </div>
        <div>
          <p className="font-heading text-sm font-600 leading-tight text-white">{title}</p>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-white/60">{author}</p>
          {accent && <div className="mt-2 h-1 w-10 rounded-full bg-accent" />}
        </div>
      </div>
    </div>
  );
}
