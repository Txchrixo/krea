"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  List,
  X,
  Fingerprint,
  ShieldCheck,
  Lock,
  Type,
  Sun,
  Moon,
  Maximize2,
  Loader2,
  BookOpen,
  Settings,
  Bookmark,
  BookmarkCheck,
  Trash2,
  Clock,
  Highlighter,
  StickyNote,
} from "lucide-react";
import type { ReaderData } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ReaderView() {
  const { view, setView } = useApp();
  const ebookId = view.name === "reader" ? view.ebookId : "";
  const [data, setData] = useState<ReaderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chapterIdx, setChapterIdx] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState<"light" | "sepia" | "dark">("sepia");
  const [progress, setProgress] = useState(0);
  const [bookmarks, setBookmarks] = useState<{ id: string; chapterIdx: number; label: string; note: string | null }[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [readingTime, setReadingTime] = useState(0); // seconds in current session
  const [highlights, setHighlights] = useState<{ id: string; chapterIdx: number; text: string; note: string | null; color: string }[]>([]);
  const [showHighlights, setShowHighlights] = useState(false);
  const [showHighlightBtn, setShowHighlightBtn] = useState(false);
  const [highlightBtnPos, setHighlightBtnPos] = useState({ x: 0, y: 0 });
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ebookId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    fetch(`/api/reader/${ebookId}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Accès refusé");
        return d;
      })
      .then((d) => {
        setData(d);
        setProgress(d.license?.progress || 0);
        if (d.sessionId) sessionIdRef.current = d.sessionId;
        // jump to chapter based on progress
        const total = d.chapters.length;
        if (total > 0 && d.license?.progress > 0) {
          const idx = Math.min(total - 1, Math.floor((d.license.progress / 100) * total));
          setChapterIdx(idx);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [ebookId]);

  const saveProgress = useCallback(
    (p: number) => {
      if (!data || !ebookId) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        try {
          await fetch(`/api/reader/${ebookId}/progress`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ progress: Math.round(p) }),
          });
        } catch {}
      }, 1500);
    },
    [data, ebookId]
  );

  const goChapter = (idx: number) => {
    if (!data) return;
    const next = Math.max(0, Math.min(data.chapters.length - 1, idx));
    setChapterIdx(next);
    const p = ((next + 1) / data.chapters.length) * 100;
    setProgress(p);
    saveProgress(p);
    setTocOpen(false);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // keyboard navigation: arrow left/right to change chapters
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!data) return;
      if (e.key === "ArrowLeft" && chapterIdx > 0) {
        goChapter(chapterIdx - 1);
      } else if (e.key === "ArrowRight" && chapterIdx < data.chapters.length - 1) {
        goChapter(chapterIdx + 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [data, chapterIdx]);

  // load bookmarks for this ebook
  useEffect(() => {
    if (!data) return;
    fetch(`/api/bookmarks?ebookId=${data.ebook.id}`)
      .then((r) => r.json())
      .then((d) => setBookmarks(d.items || []));
  }, [data]);

  // reading time tracker: increment every second, send heartbeat every 30s
  useEffect(() => {
    if (!data) return;
    const tick = setInterval(() => {
      setReadingTime((t) => t + 1);
    }, 1000);
    const heartbeat = setInterval(async () => {
      if (!sessionIdRef.current || !ebookId) return;
      try {
        await fetch(`/api/reader/${ebookId}/heartbeat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            pagesRead: 0,
            durationSec: 30,
          }),
        });
      } catch {}
    }, 30000);
    heartbeatRef.current = heartbeat;
    return () => {
      clearInterval(tick);
      clearInterval(heartbeat);
    };
  }, [data, ebookId]);

  async function toggleBookmark() {
    if (!data) return;
    const existing = bookmarks.find((b) => b.chapterIdx === chapterIdx);
    if (existing) {
      // remove
      await fetch(`/api/bookmarks/${existing.id}`, { method: "DELETE" });
      setBookmarks((prev) => prev.filter((b) => b.id !== existing.id));
      toast.success("Marque-page supprimé");
    } else {
      // add
      const ch = data.chapters[chapterIdx];
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ebookId: data.ebook.id,
          chapterIdx,
          label: ch?.title || `Chapitre ${chapterIdx + 1}`,
        }),
      });
      const d = await res.json();
      if (d.id) {
        setBookmarks((prev) => [...prev, { id: d.id, chapterIdx, label: ch?.title || `Chapitre ${chapterIdx + 1}`, note: null }]);
        toast.success("Marque-page ajouté 🔖");
      }
    }
  }

  async function deleteBookmark(id: string) {
    await fetch(`/api/bookmarks/${id}`, { method: "DELETE" });
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }

  // load highlights for this ebook
  useEffect(() => {
    if (!data) return;
    fetch(`/api/highlights?ebookId=${data.ebook.id}`)
      .then((r) => r.json())
      .then((d) => setHighlights(d.items || []));
  }, [data]);

  // detect text selection in the article
  useEffect(() => {
    function handleSelection() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !articleRef.current) {
        setShowHighlightBtn(false);
        return;
      }
      const range = sel.getRangeAt(0);
      // check if selection is within the article
      if (!articleRef.current.contains(range.commonAncestorContainer)) {
        setShowHighlightBtn(false);
        return;
      }
      const rect = range.getBoundingClientRect();
      setHighlightBtnPos({ x: rect.left + rect.width / 2, y: rect.top - 10 });
      setShowHighlightBtn(true);
    }
    document.addEventListener("selectionchange", handleSelection);
    return () => document.removeEventListener("selectionchange", handleSelection);
  }, [chapterIdx]);

  async function createHighlight(color: string = "yellow") {
    if (!data) return;
    const sel = window.getSelection();
    const text = sel?.toString().trim();
    if (!text) return;
    try {
      const res = await fetch("/api/highlights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ebookId: data.ebook.id,
          chapterIdx,
          text,
          color,
        }),
      });
      const d = await res.json();
      if (d.id) {
        setHighlights((prev) => [...prev, { id: d.id, chapterIdx, text, note: null, color }]);
        toast.success("Surlignage sauvegardé ✏️");
      }
    } catch {
      toast.error("Impossible de sauvegarder");
    }
    sel?.removeAllRanges();
    setShowHighlightBtn(false);
  }

  async function deleteHighlight(id: string) {
    await fetch(`/api/highlights/${id}`, { method: "DELETE" });
    setHighlights((prev) => prev.filter((h) => h.id !== id));
  }

  // apply highlights inline by modifying the HTML string before render
  // (no DOM manipulation needed — highlights are baked into the HTML)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Ouverture du lecteur sécurisé…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <Lock className="mx-auto h-8 w-8 text-destructive" />
          <p className="mt-2 font-heading text-lg text-foreground">Accès refusé</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Vous devez acheter cet ebook pour le lire dans le lecteur protégé Krea.
          </p>
          <Button className="mt-4" onClick={() => setView({ name: "marketplace" })}>
            Retour à la marketplace
          </Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const chapter = data.chapters[chapterIdx];
  const themeBg = theme === "light" ? "#FBF5E3" : theme === "dark" ? "#122818" : "#F3ECD4";
  const themeFg = theme === "dark" ? "#FBF5E3" : "#1F4A2E";
  const themeMuted = theme === "dark" ? "rgba(251,245,227,0.6)" : "#697E6E";

  return (
    <div className="min-h-screen" style={{ background: themeBg, color: themeFg }}>
      {/* Reader top bar */}
      <header className="sticky top-0 z-30 border-b backdrop-blur-md" style={{ borderColor: "rgba(31,74,46,0.1)", background: themeBg + "cc" }}>
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-2 px-4">
          <Button variant="ghost" size="icon" onClick={() => setView({ name: "library" })}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setTocOpen(true)}>
            <List className="h-4 w-4" />
          </Button>
          <div className="flex-1 truncate text-center">
            <p className="truncate text-sm font-600">{data.ebook.title}</p>
            <div className="flex items-center justify-center gap-2 text-[10px]" style={{ color: themeMuted }}>
              <span>{data.ebook.creator.displayName}</span>
              {readingTime > 0 && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    {Math.floor(readingTime / 60)}:{String(readingTime % 60).padStart(2, "0")}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* font size */}
          <div className="hidden items-center gap-1 sm:flex">
            <Button variant="ghost" size="icon" onClick={() => setFontSize((s) => Math.max(14, s - 2))}>
              <span className="text-xs">A-</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setFontSize((s) => Math.min(26, s + 2))}>
              <span className="text-sm">A+</span>
            </Button>
          </div>

          {/* theme */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme((t) => (t === "light" ? "sepia" : t === "sepia" ? "dark" : "light"))}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* bookmark */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleBookmark}
            title="Marquer ce chapitre"
          >
            {bookmarks.some((b) => b.chapterIdx === chapterIdx) ? (
              <BookmarkCheck className="h-4 w-4 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>

          {/* bookmarks list */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowBookmarks(true)}
            title="Mes marque-pages"
            className="relative"
          >
            <List className="h-4 w-4" />
            {bookmarks.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-600 text-primary-foreground">
                {bookmarks.length}
              </span>
            )}
          </Button>

          {/* highlights list */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHighlights(true)}
            title="Mes surlignages"
            className="relative"
          >
            <StickyNote className="h-4 w-4" />
            {highlights.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-600 text-accent-foreground">
                {highlights.length}
              </span>
            )}
          </Button>
        </div>

        {/* progress bar */}
        <div className="h-0.5 w-full" style={{ background: "rgba(31,74,46,0.1)" }}>
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </header>

      {/* Reader body */}
      <div className="reader-protected mx-auto max-w-3xl px-5 py-10 sm:px-8">
        {/* Floating highlight toolbar */}
        <AnimatePresence>
          {showHighlightBtn && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 10 }}
              className="fixed z-40 flex items-center gap-1.5 rounded-xl border border-border bg-card p-1.5 shadow-xl"
              style={{ left: highlightBtnPos.x, top: highlightBtnPos.y, transform: "translate(-50%, -100%)" }}
            >
              <span className="px-1 text-[10px] font-600 text-muted-foreground">Surligner</span>
              {[
                { color: "yellow", bg: "rgba(255,216,107,0.6)" },
                { color: "green", bg: "rgba(93,190,138,0.4)" },
                { color: "blue", bg: "rgba(46,92,138,0.3)" },
                { color: "pink", bg: "rgba(200,85,61,0.25)" },
              ].map((c) => (
                <button
                  key={c.color}
                  onClick={() => createHighlight(c.color)}
                  className="h-7 w-7 rounded-full border border-border transition-transform hover:scale-110"
                  style={{ background: c.bg }}
                  title={`Surligner en ${c.color}`}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <article ref={articleRef} className="prose prose-lg max-w-none" style={{ fontSize, color: themeFg }}>
          <p className="mb-1 text-sm font-600 uppercase tracking-wider" style={{ color: themeMuted }}>
            Chapitre {chapterIdx + 1} sur {data.chapters.length}
          </p>
          <h1 className="font-heading mb-6 text-3xl font-600 leading-tight" style={{ color: themeFg }}>
            {chapter.title}
          </h1>
          <div
            className="leading-relaxed"
            style={{ color: themeFg }}
            dangerouslySetInnerHTML={{ __html: applyHighlightsToHtml(renderMarkdown(chapter.content), highlights.filter((h) => h.chapterIdx === chapterIdx)) }}
          />
        </article>

        {/* Watermark banner — visible reminder */}
        <div
          className="mt-10 flex items-center gap-2 rounded-lg border border-dashed p-3 text-xs"
          style={{ borderColor: "rgba(31,74,46,0.2)", background: "rgba(255,216,107,0.1)" }}
        >
          <Fingerprint className="h-4 w-4 flex-shrink-0 text-primary" />
          <span style={{ color: themeFg }}>
            Licence personnelle · <strong>{data.watermark.buyerName || data.watermark.buyerEmail}</strong>
            {" · "}Commande {data.watermark.orderRef}
            {" · "}{data.watermark.date}
          </span>
        </div>

        {/* Chapter nav */}
        <div className="mt-8 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            disabled={chapterIdx === 0}
            onClick={() => goChapter(chapterIdx - 1)}
            className="border-border"
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Précédent
          </Button>
          <span className="text-xs" style={{ color: themeMuted }}>
            {Math.round(progress)}% lu
          </span>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={chapterIdx === data.chapters.length - 1}
            onClick={() => goChapter(chapterIdx + 1)}
          >
            Suivant <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Floating watermark (subtle, persistent) */}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-20 rotate-[-4deg] select-none rounded-md px-2 py-1 text-[10px] opacity-30"
        style={{ color: themeFg, border: `1px solid ${themeMuted}` }}
      >
        {data.watermark.buyerEmail} · {data.watermark.orderRef}
      </div>

      {/* TOC drawer */}
      <AnimatePresence>
        {tocOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setTocOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 z-50 h-full w-80 overflow-y-auto border-r border-border bg-card p-5 scroll-krea"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-heading text-lg font-600">Sommaire</h3>
                <Button variant="ghost" size="icon" onClick={() => setTocOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-primary/10 p-2 text-xs">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Contenu protégé · {data.license.deviceLimit} appareils</span>
              </div>
              <div className="space-y-1">
                {data.chapters.map((ch, i) => (
                  <button
                    key={ch.id}
                    onClick={() => goChapter(i)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                      i === chapterIdx ? "bg-primary/10 font-600 text-primary" : "hover:bg-muted"
                    )}
                  >
                    <span
                      className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-600"
                      style={{
                        background: i === chapterIdx ? "var(--primary)" : "rgba(31,74,46,0.08)",
                        color: i === chapterIdx ? "var(--primary-foreground)" : "var(--foreground)",
                      }}
                    >
                      {i + 1}
                    </span>
                    <span className="flex-1 line-clamp-2">{ch.title}</span>
                    {i < chapterIdx && (
                      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 flex-shrink-0 text-primary" fill="currentColor">
                        <path d="M6.2 11.2L3 8l1.4-1.4 1.8 1.8L10.6 4 12 5.4z" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Bookmarks drawer */}
      <AnimatePresence>
        {showBookmarks && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setShowBookmarks(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 z-50 h-full w-80 overflow-y-auto border-l border-border bg-card p-5 scroll-krea"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-heading text-lg font-600">
                  <Bookmark className="h-5 w-5 text-primary" /> Marque-pages
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setShowBookmarks(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {bookmarks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border py-10 text-center">
                  <Bookmark className="mx-auto h-8 w-8 text-muted-foreground/30" />
                  <p className="mt-2 text-sm text-muted-foreground">Aucun marque-page</p>
                  <p className="mt-1 text-xs text-muted-foreground">Cliquez sur l'icône marque-page pour sauvegarder un chapitre.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {bookmarks.map((b) => (
                    <div
                      key={b.id}
                      className="group flex items-center gap-3 rounded-lg border border-border bg-background/60 p-3"
                    >
                      <button
                        onClick={() => { goChapter(b.chapterIdx); setShowBookmarks(false); }}
                        className="flex flex-1 items-center gap-3 text-left"
                      >
                        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-600 text-primary">
                          {b.chapterIdx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="line-clamp-1 text-sm font-500 text-foreground">{b.label}</p>
                          <p className="text-[10px] text-muted-foreground">Chapitre {b.chapterIdx + 1}</p>
                        </div>
                      </button>
                      <button
                        onClick={() => deleteBookmark(b.id)}
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Highlights drawer */}
      <AnimatePresence>
        {showHighlights && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setShowHighlights(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 z-50 h-full w-80 overflow-y-auto border-l border-border bg-card p-5 scroll-krea"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-heading text-lg font-600">
                  <Highlighter className="h-5 w-5 text-accent" /> Surlignages
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setShowHighlights(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {highlights.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border py-10 text-center">
                  <Highlighter className="mx-auto h-8 w-8 text-muted-foreground/30" />
                  <p className="mt-2 text-sm text-muted-foreground">Aucun surlignage</p>
                  <p className="mt-1 text-xs text-muted-foreground">Sélectionnez du texte dans le lecteur, puis cliquez sur "Surligner".</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {highlights.map((h) => {
                    const colorMap: Record<string, string> = {
                      yellow: "rgba(255,216,107,0.2)",
                      green: "rgba(93,190,138,0.15)",
                      blue: "rgba(46,92,138,0.12)",
                      pink: "rgba(200,85,61,0.1)",
                    };
                    const dotMap: Record<string, string> = {
                      yellow: "#FFD86B",
                      green: "#5DBE8A",
                      blue: "#2E5C8A",
                      pink: "#C8553D",
                    };
                    const bg = colorMap[h.color] || colorMap.yellow;
                    const dot = dotMap[h.color] || dotMap.yellow;
                    return (
                    <div
                      key={h.id}
                      className="group rounded-lg border border-border bg-background/60 p-3"
                    >
                      <div className="flex items-start gap-2">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-600" style={{ background: bg, color: dot }}>
                          {h.chapterIdx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="rounded px-2 py-1 text-xs italic leading-relaxed text-foreground" style={{ background: bg }}>
                            "{h.text.length > 150 ? h.text.slice(0, 150) + "…" : h.text}"
                          </p>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full" style={{ background: dot }} />
                            <p className="text-[10px] text-muted-foreground">Chapitre {h.chapterIdx + 1}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteHighlight(h.id)}
                          className="opacity-0 transition-opacity group-hover:opacity-100"
                          aria-label="Supprimer"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </button>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Apply highlights to rendered HTML by wrapping matching text in <mark> tags
function applyHighlightsToHtml(html: string, highlights: { id: string; text: string; color: string }[]): string {
  if (!highlights || highlights.length === 0) return html;
  const colorMap: Record<string, string> = {
    yellow: "rgba(255,216,107,0.4)",
    green: "rgba(93,190,138,0.35)",
    blue: "rgba(46,92,138,0.25)",
    pink: "rgba(200,85,61,0.2)",
  };
  let result = html;
  for (const hl of highlights) {
    if (!hl.text || hl.text.length < 3) continue;
    const escaped = hl.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "g");
    const bgColor = colorMap[hl.color] || colorMap.yellow;
    result = result.replace(/>([^<]+)</g, (match, text) => {
      return ">" + text.replace(regex, `<mark class="krea-highlight" style="background:${bgColor};padding:1px 2px;border-radius:2px;cursor:pointer;" title="Surlignage sauvegardé">$1</mark>`) + "<";
    });
  }
  return result;
}

// Minimal, safe markdown renderer (headings, bold, lists, quotes, paragraphs)
function renderMarkdown(md: string): string {
  let html = md
    // escape
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // headings
  html = html.replace(/^### (.+)$/gm, '<h3 class="font-heading text-xl font-600 mt-6 mb-2">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="font-heading text-2xl font-600 mt-8 mb-3">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="font-heading text-3xl font-600 mt-8 mb-3">$1</h1>');

  // blockquotes
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote class="border-l-4 border-primary pl-4 italic my-4 opacity-80">$1</blockquote>');

  // bold / italic / inline code
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/`([^`]+)`/g, '<code class="rounded bg-black/10 px-1.5 py-0.5 text-sm">$1</code>');

  // lists
  html = html.replace(/(?:^|\n)((?:- .+\n?)+)/g, (m, list) => {
    const items = list.trim().split("\n").map((l: string) => l.replace(/^- /, "").trim()).map((t: string) => `<li>${t}</li>`).join("");
    return `\n<ul class="list-disc pl-6 my-3 space-y-1">${items}</ul>`;
  });
  html = html.replace(/(?:^|\n)((?:\d+\. .+\n?)+)/g, (m, list) => {
    const items = list.trim().split("\n").map((l: string) => l.replace(/^\d+\. /, "").trim()).map((t: string) => `<li>${t}</li>`).join("");
    return `\n<ol class="list-decimal pl-6 my-3 space-y-1">${items}</ol>`;
  });

  // paragraphs (lines not already wrapped)
  html = html
    .split(/\n\n+/)
    .map((block) => {
      if (block.startsWith("<")) return block;
      return `<p class="my-3">${block.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("\n");

  return html;
}
