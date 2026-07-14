"use client";

import { useEffect, useState, useMemo } from "react";
import { useApp } from "@/lib/store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EbookCover } from "@/components/ebook-cover";
import { EbookCardView } from "@/components/ebook-card";
import { ShareButtons } from "@/components/share-buttons";
import {
  Star,
  ShoppingBag,
  Play,
  BookOpen,
  TrendingUp,
  Globe,
  Lock,
  ShieldCheck,
  ArrowLeft,
  Menu,
  X,
  ExternalLink,
  Mail,
  MessageCircle,
  Check,
  Loader2,
  Sparkles,
  Library,
  ChevronRight,
} from "lucide-react";
import { formatFCFA, formatNumber } from "@/lib/format";
import type { CreatorSiteData, SiteSocial } from "@/lib/types";
import { THEMES, FONTS, themeStyle, fontStyle } from "@/lib/site-themes";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CreatorSiteView() {
  const { view, setView, user, openPurchase } = useApp();
  const slug = view.name === "creator-site" ? view.slug : "";
  const page = view.name === "creator-site" ? view.page : undefined;
  const bookSlug = view.name === "creator-site" ? view.bookSlug : undefined;

  const [data, setData] = useState<CreatorSiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    if (!slug) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch(`/api/creators/${slug}/site`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) toast.error(d.error);
        else setData(d);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Build nav items
  const navItems = useMemo(() => {
    if (!data) return [];
    const items: { label: string; page: string }[] = [
      { label: "Accueil", page: "home" },
      { label: "Bibliothèque", page: "books" },
    ];
    if (data.site.siteShowAbout) items.push({ label: "À propos", page: "about" });
    if (data.site.siteShowContact) items.push({ label: "Contact", page: "contact" });
    data.pages.filter((p) => p.showInNav).forEach((p) => items.push({ label: p.title, page: p.slug }));
    return items;
  }, [data]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FBF5E3]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1F4A2E]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FBF5E3] px-4 text-center">
        <p className="font-heading text-xl text-[#1F4A2E]">Site introuvable</p>
        <Button onClick={() => setView({ name: "marketplace" })} variant="outline">
          Retour à la marketplace
        </Button>
      </div>
    );
  }

  const theme = THEMES[data.site.siteThemePreset] ?? THEMES.foret;
  const font = FONTS[data.site.siteFontPreset] ?? FONTS.merienda;
  const siteName = data.site.siteName || data.creator.displayName;
  const currentPage = bookSlug ? "book" : page ?? "home";

  const fontHref = font.href;
  const go = (p: string) => {
    setView({ name: "creator-site", slug, page: p });
    setMobileNav(false);
  };
  const goBook = (bookSlug: string) => {
    setView({ name: "creator-site", slug, bookSlug });
  };
  const goHome = () => {
    setView({ name: "creator-site", slug });
    setMobileNav(false);
  };

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ ...themeStyle(data.site.siteThemePreset), ...fontStyle(data.site.siteFontPreset) }}
    >
      {fontHref && <link rel="stylesheet" href={fontHref} />}
      <style>{`
        [data-site-shell] { --tw-prose-body: var(--site-fg); --tw-prose-headings: var(--site-fg); }
        [data-site-shell] .site-heading { font-family: var(--site-heading-font); }
        [data-site-shell] .site-body { font-family: var(--site-body-font); }
      `}</style>

      {/* ── Site header (creator-controlled, not Krea's) ── */}
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-xl"
        style={{ borderColor: theme.border, backgroundColor: theme.surface + "ee" }}
        data-site-shell
      >
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <button onClick={goHome} className="group flex items-center gap-2.5">
            <Avatar className="h-9 w-9 border" style={{ borderColor: theme.border }}>
              <AvatarFallback
                className="site-heading font-700"
                style={{ background: theme.primary, color: theme.primaryFg }}
              >
                {data.creator.displayName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <p className="site-heading text-base font-700 leading-tight" style={{ color: theme.foreground }}>
                {siteName}
              </p>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: theme.muted }}>
                {data.creator.verified ? "Auteur vérifié" : "Auteur"}
              </p>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => go(item.page)}
                className="rounded-md px-3 py-2 text-sm font-500 transition-colors"
                style={{
                  color: currentPage === item.page ? theme.primary : theme.muted,
                  backgroundColor: currentPage === item.page ? theme.bgAlt : "transparent",
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile toggle */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-md md:hidden"
            onClick={() => setMobileNav((s) => !s)}
            aria-label="Menu"
          >
            {mobileNav ? <X className="h-5 w-5" style={{ color: theme.foreground }} /> : <Menu className="h-5 w-5" style={{ color: theme.foreground }} />}
          </button>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {mobileNav && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t md:hidden"
              style={{ borderColor: theme.border, backgroundColor: theme.surface }}
            >
              <div className="flex flex-col gap-1 px-4 py-3">
                {navItems.map((item) => (
                  <button
                    key={item.page}
                    onClick={() => go(item.page)}
                    className="rounded-md px-3 py-2.5 text-left text-sm font-500"
                    style={{
                      color: currentPage === item.page ? theme.primary : theme.foreground,
                      backgroundColor: currentPage === item.page ? theme.bgAlt : "transparent",
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* ── Page content ── */}
      <main className="flex-1">
        {bookSlug ? (
          <SiteBookDetail
            data={data}
            bookSlug={bookSlug}
            onBack={() => go("books")}
            onBuy={() => {
              if (!user) {
                useApp.getState().openAuth("login");
                return;
              }
              openPurchase(bookSlug);
            }}
            onRead={(id) => setView({ name: "reader", ebookId: id })}
            owned={false}
          />
        ) : currentPage === "home" ? (
          <SiteHome data={data} onGoBook={goBook} onGoBooks={() => go("books")} />
        ) : currentPage === "books" ? (
          <SiteBooks data={data} onGoBook={goBook} />
        ) : currentPage === "about" ? (
          <SiteAbout data={data} />
        ) : currentPage === "contact" ? (
          <SiteContact data={data} />
        ) : (
          <SiteCustomPage data={data} pageSlug={currentPage} />
        )}
      </main>

      {/* ── Site footer (creator-controlled) ── */}
      <SiteFooter data={data} navItems={navItems} onNav={go} onHome={goHome} />
    </div>
  );
}

/* ════════════════════════ HOME ════════════════════════ */
function SiteHome({
  data,
  onGoBook,
  onGoBooks,
}: {
  data: CreatorSiteData;
  onGoBook: (slug: string) => void;
  onGoBooks: () => void;
}) {
  const theme = THEMES[data.site.siteThemePreset] ?? THEMES.foret;
  const layout = data.site.siteLayout;
  const hero = data.site.siteHero || data.creator.tagline || `Bienvenue sur ${data.site.siteName || data.creator.displayName}`;
  const heroSub = data.site.siteHeroSub || data.creator.bio;
  const featured = data.ebooks.slice(0, layout === "editorial" ? 8 : 6);

  return (
    <div className="site-body">
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ background: data.creator.bannerColor }}
      >
        <div className="absolute inset-0" style={{ background: theme.heroOverlay }} />
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
          {layout === "editorial" ? (
            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="site-heading text-4xl font-700 leading-[1.05] text-white sm:text-6xl lg:text-7xl"
                style={{ textShadow: "0 2px 20px rgba(0,0,0,0.25)" }}
              >
                {hero}
              </motion.h1>
              {heroSub && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mx-auto mt-6 max-w-2xl text-lg text-white/85 sm:text-xl"
                >
                  {heroSub}
                </motion.p>
              )}
            </div>
          ) : layout === "boutique" ? (
            <div className="mx-auto max-w-3xl text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="site-heading text-3xl font-700 leading-tight text-white sm:text-5xl"
              >
                {hero}
              </motion.h1>
              {heroSub && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mx-auto mt-4 max-w-xl text-base text-white/85 sm:text-lg"
                >
                  {heroSub}
                </motion.p>
              )}
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Button
                  size="lg"
                  className="shadow-lg"
                  style={{ background: theme.accent, color: theme.accentFg }}
                  onClick={onGoBooks}
                >
                  <BookOpen className="mr-2 h-4 w-4" /> Voir mes ebooks
                </Button>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm text-white backdrop-blur">
                  <Star className="h-3.5 w-3.5 fill-current text-yellow-300" />
                  {data.creator.ratingAvg.toFixed(1)} · {data.creator.totalSales} ventes
                </span>
              </div>
            </div>
          ) : (
            /* magazine */
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="site-heading text-4xl font-700 leading-[1.1] text-white sm:text-5xl"
                >
                  {hero}
                </motion.h1>
                {heroSub && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mt-5 max-w-lg text-lg text-white/85"
                  >
                    {heroSub}
                  </motion.p>
                )}
                <div className="mt-7 flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    className="shadow-lg"
                    style={{ background: theme.accent, color: theme.accentFg }}
                    onClick={onGoBooks}
                  >
                    <BookOpen className="mr-2 h-4 w-4" /> Explorer mes ebooks
                  </Button>
                </div>
                <div className="mt-6 flex items-center gap-4 text-sm text-white/80">
                  <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> {data.creator.totalEbooks} ebooks</span>
                  <span className="flex items-center gap-1.5"><TrendingUp className="h-4 w-4" /> {data.creator.totalSales} ventes</span>
                  {data.creator.verified && (
                    <span className="flex items-center gap-1.5"><Check className="h-4 w-4" /> Vérifié</span>
                  )}
                </div>
              </div>
              {featured[0] && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 }}
                  className="hidden justify-self-end lg:block"
                >
                  <button onClick={() => onGoBook(featured[0].slug)} className="group block">
                    <div className="w-64 -rotate-3 transition-transform group-hover:rotate-0">
                      <EbookCover
                        title={featured[0].title}
                        subtitle={featured[0].subtitle}
                        creatorName={data.creator.displayName}
                        coverUrl={featured[0].coverUrl}
                        coverColor={featured[0].coverColor}
                        size="xl"
                      />
                    </div>
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Featured ebooks */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-600 uppercase tracking-wider" style={{ color: theme.primary }}>
                Mes publications
              </p>
              <h2 className="site-heading mt-1 text-2xl font-700 sm:text-3xl" style={{ color: theme.foreground }}>
                {layout === "editorial" ? "Les derniers titres" : "En vedette"}
              </h2>
            </div>
            <button
              onClick={onGoBooks}
              className="inline-flex items-center gap-1 text-sm font-600"
              style={{ color: theme.primary }}
            >
              Tout voir <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          {layout === "editorial" ? (
            <div className="divide-y" style={{ borderColor: theme.border }}>
              {featured.map((eb) => (
                <button
                  key={eb.id}
                  onClick={() => onGoBook(eb.slug)}
                  className="group flex w-full items-center gap-5 py-5 text-left transition-transform hover:translate-x-1"
                >
                  <div className="w-16 flex-shrink-0">
                    <EbookCover title={eb.title} coverUrl={eb.coverUrl} coverColor={eb.coverColor} size="sm" showCreator={false} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="site-heading truncate text-lg font-700" style={{ color: theme.foreground }}>
                      {eb.title}
                    </h3>
                    {eb.subtitle && <p className="truncate text-sm" style={{ color: theme.muted }}>{eb.subtitle}</p>}
                    <div className="mt-1 flex items-center gap-3 text-xs" style={{ color: theme.muted }}>
                      <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-current" style={{ color: theme.accent }} />{eb.ratingAvg.toFixed(1)}</span>
                      <span>{formatNumber(eb.salesCount)} ventes</span>
                      <span className="font-600" style={{ color: theme.primary }}>{formatFCFA(eb.price)}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100" style={{ color: theme.primary }} />
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {featured.map((eb) => (
                <SiteEbookCard key={eb.id} eb={eb} theme={theme} onClick={() => onGoBook(eb.slug)} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Bundles */}
      {data.bundles.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
          <h2 className="site-heading mb-6 text-2xl font-700" style={{ color: theme.foreground }}>Packs & bundles</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.bundles.slice(0, 2).map((b) => (
              <div
                key={b.id}
                className="overflow-hidden rounded-2xl border"
                style={{ borderColor: theme.border, backgroundColor: theme.surface }}
              >
                <div className="flex items-stretch">
                  <div className="flex w-20 flex-shrink-0 items-center justify-center" style={{ background: b.coverColor }}>
                    <Library className="h-8 w-8 text-white/80" />
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="site-heading text-sm font-700" style={{ color: theme.foreground }}>{b.title}</h3>
                      <Badge style={{ background: theme.accent, color: theme.accentFg }}>-{b.discountPct}%</Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs" style={{ color: theme.muted }}>{b.description}</p>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="site-heading text-base font-700" style={{ color: theme.foreground }}>{formatFCFA(b.price)}</span>
                      <span className="text-[10px] line-through" style={{ color: theme.muted }}>{formatFCFA(b.originalTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* About teaser */}
      {data.site.siteShowAbout && data.creator.bio && (
        <section className="border-t py-16" style={{ borderColor: theme.border, backgroundColor: theme.bgAlt }}>
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 sm:flex-row sm:items-start sm:px-6">
            <Avatar className="h-24 w-24 border-4 flex-shrink-0" style={{ borderColor: theme.surface }}>
              <AvatarFallback className="site-heading text-3xl font-700" style={{ background: data.creator.bannerColor, color: "#fff" }}>
                {data.creator.displayName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h2 className="site-heading text-2xl font-700" style={{ color: theme.foreground }}>
                {data.creator.displayName}
              </h2>
              {data.creator.tagline && <p className="mt-1 text-sm font-500" style={{ color: theme.primary }}>{data.creator.tagline}</p>}
              <p className="mt-3 max-w-2xl leading-relaxed" style={{ color: theme.muted }}>
                {data.creator.bio}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

/* ════════════════════════ BOOKS LIST ════════════════════════ */
function SiteBooks({ data, onGoBook }: { data: CreatorSiteData; onGoBook: (slug: string) => void }) {
  const theme = THEMES[data.site.siteThemePreset] ?? THEMES.foret;
  return (
    <div className="site-body mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <p className="text-xs font-600 uppercase tracking-wider" style={{ color: theme.primary }}>Bibliothèque</p>
      <h1 className="site-heading mt-1 text-3xl font-700 sm:text-4xl" style={{ color: theme.foreground }}>
        Tous mes ebooks
      </h1>
      <p className="mt-2 text-sm" style={{ color: theme.muted }}>
        {data.creator.totalEbooks} titre{data.creator.totalEbooks > 1 ? "s" : ""} · {data.creator.totalSales} ventes au total
      </p>

      {data.ebooks.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed py-20 text-center" style={{ borderColor: theme.border }}>
          <BookOpen className="mx-auto h-10 w-10 opacity-30" style={{ color: theme.muted }} />
          <p className="mt-3" style={{ color: theme.muted }}>Aucun ebook publié pour le moment.</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {data.ebooks.map((eb) => (
            <SiteEbookCard key={eb.id} eb={eb} theme={theme} onClick={() => onGoBook(eb.slug)} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════ BOOK DETAIL ════════════════════════ */
function SiteBookDetail({
  data,
  bookSlug,
  onBack,
  onBuy,
  onRead,
  owned,
}: {
  data: CreatorSiteData;
  bookSlug: string;
  onBack: () => void;
  onBuy: () => void;
  onRead: (id: string) => void;
  owned: boolean;
}) {
  const theme = THEMES[data.site.siteThemePreset] ?? THEMES.foret;
  const ebook = data.ebooks.find((e) => e.slug === bookSlug);
  if (!ebook) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p style={{ color: theme.muted }}>Ebook introuvable.</p>
        <Button onClick={onBack} variant="outline" className="mt-4">Retour</Button>
      </div>
    );
  }
  const discount = ebook.compareAtPrice
    ? Math.round(((ebook.compareAtPrice - ebook.price) / ebook.compareAtPrice) * 100)
    : 0;

  return (
    <div className="site-body">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <button
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-500"
          style={{ color: theme.muted }}
        >
          <ArrowLeft className="h-4 w-4" /> Bibliothèque
        </button>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Cover + buy */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                <EbookCover
                  title={ebook.title}
                  subtitle={ebook.subtitle}
                  creatorName={data.creator.displayName}
                  coverUrl={ebook.coverUrl}
                  coverColor={ebook.coverColor}
                  size="xl"
                />
                {discount > 0 && (
                  <Badge className="absolute -right-2 -top-2 shadow-md" style={{ background: "#dc2626", color: "#fff" }}>
                    -{discount}%
                  </Badge>
                )}
              </motion.div>

              <div
                className="mt-5 rounded-2xl border p-5"
                style={{ borderColor: theme.border, backgroundColor: theme.surface }}
              >
                <div className="flex items-baseline gap-2">
                  <span className="site-heading text-3xl font-700" style={{ color: theme.foreground }}>
                    {formatFCFA(ebook.price)}
                  </span>
                  {ebook.compareAtPrice && (
                    <span className="text-sm line-through" style={{ color: theme.muted }}>
                      {formatFCFA(ebook.compareAtPrice)}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs" style={{ color: theme.muted }}>Paiement unique · accès à vie</p>

                {owned ? (
                  <Button
                    size="lg"
                    className="mt-4 w-full"
                    style={{ background: theme.primary, color: theme.primaryFg }}
                    onClick={() => onRead(ebook.slug)}
                  >
                    <Play className="mr-2 h-4 w-4" /> Lire maintenant
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="mt-4 w-full"
                    style={{ background: theme.primary, color: theme.primaryFg }}
                    onClick={onBuy}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" /> Acheter cet ebook
                  </Button>
                )}

                <div className="mt-4 space-y-2 border-t pt-4" style={{ borderColor: theme.border }}>
                  <TrustRow icon={ShieldCheck} text="Watermark personnel" color={theme.primary} muted={theme.muted} />
                  <TrustRow icon={Lock} text={`Lecture protégée · ${3} appareils`} color={theme.primary} muted={theme.muted} />
                  <TrustRow icon={Globe} text={ebook.category} color={theme.primary} muted={theme.muted} />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" style={{ borderColor: theme.primary, color: theme.primary }}>
                {ebook.category}
              </Badge>
              {ebook.isBestseller && (
                <Badge style={{ background: theme.accent, color: theme.accentFg }}>
                  <TrendingUp className="mr-1 h-3 w-3" /> Best-seller
                </Badge>
              )}
            </div>

            <h1 className="site-heading mt-3 text-3xl font-700 leading-tight sm:text-4xl" style={{ color: theme.foreground }}>
              {ebook.title}
            </h1>
            {ebook.subtitle && <p className="mt-2 text-lg" style={{ color: theme.muted }}>{ebook.subtitle}</p>}

            <div className="mt-3 flex items-center gap-3 text-sm" style={{ color: theme.muted }}>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-current" style={{ color: theme.accent }} />
                <span className="font-600" style={{ color: theme.foreground }}>{ebook.ratingAvg.toFixed(1)}</span>
                <span>({ebook.ratingCount})</span>
              </span>
              <span>·</span>
              <span>{formatNumber(ebook.salesCount)} ventes</span>
              <span>·</span>
              <span>{ebook.pageCount} pages</span>
            </div>

            <ShareButtons title={ebook.title} slug={ebook.slug} className="mt-4" />

            <div className="mt-6 rounded-2xl border p-6" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
              <p className="whitespace-pre-line leading-relaxed" style={{ color: theme.foreground }}>
                {ebook.description}
              </p>
            </div>

            {/* Author card */}
            <div
              className="mt-6 flex items-center gap-3 rounded-2xl border p-4"
              style={{ borderColor: theme.border, backgroundColor: theme.bgAlt }}
            >
              <Avatar className="h-12 w-12 border" style={{ borderColor: theme.border }}>
                <AvatarFallback className="site-heading font-700" style={{ background: data.creator.bannerColor, color: "#fff" }}>
                  {data.creator.displayName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="site-heading font-700" style={{ color: theme.foreground }}>
                  {data.creator.displayName}
                  {data.creator.verified && <Check className="ml-1 inline h-4 w-4" style={{ color: theme.primary }} />}
                </p>
                <p className="text-xs" style={{ color: theme.muted }}>{data.creator.tagline || "Auteur sur Krea"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════ ABOUT ════════════════════════ */
function SiteAbout({ data }: { data: CreatorSiteData }) {
  const theme = THEMES[data.site.siteThemePreset] ?? THEMES.foret;
  return (
    <div className="site-body">
      <section className="relative overflow-hidden py-16" style={{ background: data.creator.bannerColor }}>
        <div className="absolute inset-0" style={{ background: theme.heroOverlay }} />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Avatar className="mx-auto h-28 w-28 border-4" style={{ borderColor: "rgba(255,255,255,0.3)" }}>
            <AvatarFallback className="site-heading text-4xl font-700 text-white" style={{ background: "rgba(0,0,0,0.2)" }}>
              {data.creator.displayName[0]}
            </AvatarFallback>
          </Avatar>
          <h1 className="site-heading mt-5 text-3xl font-700 text-white sm:text-4xl">{data.creator.displayName}</h1>
          {data.creator.tagline && <p className="mt-2 text-lg text-white/85">{data.creator.tagline}</p>}
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {data.creator.totalEbooks} ebooks</span>
            <span className="flex items-center gap-1"><TrendingUp className="h-4 w-4" /> {data.creator.totalSales} ventes</span>
            <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-current text-yellow-300" /> {data.creator.ratingAvg.toFixed(1)}</span>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {data.creator.bio ? (
          <p className="whitespace-pre-line text-lg leading-relaxed" style={{ color: theme.foreground }}>
            {data.creator.bio}
          </p>
        ) : (
          <p style={{ color: theme.muted }}>Aucune biographie pour le moment.</p>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════ CONTACT ════════════════════════ */
function SiteContact({ data }: { data: CreatorSiteData }) {
  const theme = THEMES[data.site.siteThemePreset] ?? THEMES.foret;
  const social = data.site.siteSocial;
  const entries = Object.entries(social).filter(([, v]) => v);
  return (
    <div className="site-body mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-600 uppercase tracking-wider" style={{ color: theme.primary }}>Contact</p>
      <h1 className="site-heading mt-1 text-3xl font-700 sm:text-4xl" style={{ color: theme.foreground }}>
        Restons en contact
      </h1>
      <p className="mt-2" style={{ color: theme.muted }}>
        Suivez-moi sur vos réseaux préférés ou écrivez-moi directement.
      </p>

      {entries.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed py-16 text-center" style={{ borderColor: theme.border }}>
          <Mail className="mx-auto h-10 w-10 opacity-30" style={{ color: theme.muted }} />
          <p className="mt-3" style={{ color: theme.muted }}>Aucun moyen de contact configuré.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {entries.map(([key, val]) => (
            <SocialLink key={key} network={key} value={val} theme={theme} />
          ))}
        </div>
      )}
    </div>
  );
}

function SocialLink({
  network,
  value,
  theme,
}: {
  network: string;
  value: string;
  theme: (typeof THEMES)[keyof typeof THEMES];
}) {
  const icons: Record<string, React.ElementType> = {
    twitter: Globe,
    instagram: Globe,
    facebook: Globe,
    linkedin: Globe,
    youtube: Globe,
    tiktok: Globe,
    whatsapp: MessageCircle,
    email: Mail,
  };
  const Icon = icons[network] ?? ExternalLink;
  const href =
    network === "email"
      ? `mailto:${value}`
      : network === "whatsapp"
      ? `https://wa.me/${value.replace(/[^\d]/g, "")}`
      : value.startsWith("http")
      ? value
      : `https://${value}`;
  const labels: Record<string, string> = {
    twitter: "Twitter / X",
    instagram: "Instagram",
    facebook: "Facebook",
    linkedin: "LinkedIn",
    youtube: "YouTube",
    tiktok: "TikTok",
    whatsapp: "WhatsApp",
    email: "Email",
  };
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-xl border p-4 transition-all hover:-translate-y-0.5"
      style={{ borderColor: theme.border, backgroundColor: theme.surface }}
    >
      <span
        className="flex h-10 w-10 items-center justify-center rounded-full"
        style={{ background: theme.bgAlt, color: theme.primary }}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-600 uppercase tracking-wide" style={{ color: theme.muted }}>
          {labels[network] ?? network}
        </p>
        <p className="truncate font-500" style={{ color: theme.foreground }}>{value}</p>
      </div>
      <ExternalLink className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-60" style={{ color: theme.muted }} />
    </a>
  );
}

/* ════════════════════════ CUSTOM PAGE ════════════════════════ */
function SiteCustomPage({ data, pageSlug }: { data: CreatorSiteData; pageSlug: string }) {
  const theme = THEMES[data.site.siteThemePreset] ?? THEMES.foret;
  const page = data.pages.find((p) => p.slug === pageSlug);
  if (!page) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p style={{ color: theme.muted }}>Page introuvable.</p>
      </div>
    );
  }
  return (
    <div className="site-body mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="site-heading text-3xl font-700 sm:text-4xl" style={{ color: theme.foreground }}>{page.title}</h1>
      <div className="mt-6 space-y-4 leading-relaxed">
        <Markdown content={page.content} theme={theme} />
      </div>
    </div>
  );
}

/* ════════════════════════ FOOTER ════════════════════════ */
function SiteFooter({
  data,
  navItems,
  onNav,
  onHome,
}: {
  data: CreatorSiteData;
  navItems: { label: string; page: string }[];
  onNav: (p: string) => void;
  onHome: () => void;
}) {
  const theme = THEMES[data.site.siteThemePreset] ?? THEMES.foret;
  const social = data.site.siteSocial;
  const footerText = data.site.siteFooterText || `© ${new Date().getFullYear()} ${data.site.siteName || data.creator.displayName}`;
  const socialEntries = Object.entries(social).filter(([, v]) => v);

  return (
    <footer
      className="border-t"
      style={{ borderColor: theme.border, backgroundColor: theme.bgAlt }}
    >
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <button onClick={onHome} className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="site-heading text-sm font-700" style={{ background: theme.primary, color: theme.primaryFg }}>
                  {data.creator.displayName[0]}
                </AvatarFallback>
              </Avatar>
              <span className="site-heading font-700" style={{ color: theme.foreground }}>
                {data.site.siteName || data.creator.displayName}
              </span>
            </button>
            {data.creator.tagline && (
              <p className="mt-2 text-sm" style={{ color: theme.muted }}>{data.creator.tagline}</p>
            )}
          </div>

          {/* Nav */}
          <div>
            <p className="mb-3 text-xs font-600 uppercase tracking-wider" style={{ color: theme.muted }}>Navigation</p>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.page}>
                  <button
                    onClick={() => onNav(item.page)}
                    className="text-sm font-500 transition-colors hover:underline"
                    style={{ color: theme.foreground }}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <p className="mb-3 text-xs font-600 uppercase tracking-wider" style={{ color: theme.muted }}>Suivez-moi</p>
            {socialEntries.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {socialEntries.map(([key, val]) => {
                  const href =
                    key === "email"
                      ? `mailto:${val}`
                      : key === "whatsapp"
                      ? `https://wa.me/${val.replace(/[^\d]/g, "")}`
                      : val.startsWith("http")
                      ? val
                      : `https://${val}`;
                  return (
                    <a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-full border text-xs font-600 capitalize transition-all hover:-translate-y-0.5"
                      style={{ borderColor: theme.border, color: theme.foreground, backgroundColor: theme.surface }}
                      title={key}
                    >
                      {key[0].toUpperCase()}
                    </a>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm" style={{ color: theme.muted }}>—</p>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row" style={{ borderColor: theme.border }}>
          <p className="text-xs" style={{ color: theme.muted }}>{footerText}</p>
          <button
            onClick={() => useApp.getState().setView({ name: "landing" })}
            className="inline-flex items-center gap-1.5 text-xs font-500 transition-opacity hover:opacity-70"
            style={{ color: theme.muted }}
          >
            <Sparkles className="h-3 w-3" /> Propulsé par Krea
          </button>
        </div>
      </div>
    </footer>
  );
}

/* ════════════════════════ Shared small components ════════════════════════ */
function SiteEbookCard({
  eb,
  theme,
  onClick,
}: {
  eb: CreatorSiteData["ebooks"][number];
  theme: (typeof THEMES)[keyof typeof THEMES];
  onClick: () => void;
}) {
  const discount = eb.compareAtPrice
    ? Math.round(((eb.compareAtPrice - eb.price) / eb.compareAtPrice) * 100)
    : 0;
  return (
    <button onClick={onClick} className="group flex cursor-pointer flex-col text-left">
      <div className="relative">
        <EbookCover
          title={eb.title}
          subtitle={eb.subtitle}
          creatorName={undefined}
          coverUrl={eb.coverUrl}
          coverColor={eb.coverColor}
          size="md"
          showCreator={false}
        />
        {discount > 0 && (
          <Badge className="absolute left-2 top-2 shadow-sm" style={{ background: "#dc2626", color: "#fff" }}>
            -{discount}%
          </Badge>
        )}
      </div>
      <h3 className="site-heading mt-3 truncate text-sm font-700" style={{ color: theme.foreground }} title={eb.title}>
        {eb.title}
      </h3>
      <div className="mt-1 flex items-center gap-2 text-xs" style={{ color: theme.muted }}>
        <span className="flex items-center gap-0.5">
          <Star className="h-3 w-3 fill-current" style={{ color: theme.accent }} />
          <span className="font-600" style={{ color: theme.foreground }}>{eb.ratingAvg.toFixed(1)}</span>
        </span>
        <span>·</span>
        <span>{formatNumber(eb.salesCount)} ventes</span>
      </div>
      <p className="site-heading mt-1 text-base font-700" style={{ color: theme.primary }}>
        {formatFCFA(eb.price)}
      </p>
    </button>
  );
}

function TrustRow({
  icon: Icon,
  text,
  color,
  muted,
}: {
  icon: React.ElementType;
  text: string;
  color: string;
  muted: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <Icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color }} />
      <span style={{ color: muted }}>{text}</span>
    </div>
  );
}

/* ── Minimal markdown renderer (headings, bold, lists, paragraphs) ── */
function Markdown({
  content,
  theme,
}: {
  content: string;
  theme: (typeof THEMES)[keyof typeof THEMES];
}) {
  const blocks = content.split(/\n\n+/);
  return (
    <>
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={i} className="site-heading text-lg font-700" style={{ color: theme.foreground }}>
              {inline(trimmed.slice(4))}
            </h3>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={i} className="site-heading text-xl font-700 sm:text-2xl" style={{ color: theme.foreground }}>
              {inline(trimmed.slice(3))}
            </h2>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h1 key={i} className="site-heading text-2xl font-700 sm:text-3xl" style={{ color: theme.foreground }}>
              {inline(trimmed.slice(2))}
            </h1>
          );
        }
        if (/^\d+\.\s/.test(trimmed) || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const items = trimmed.split("\n").map((l) => l.replace(/^(\d+\.\s|[-*]\s)/, ""));
          const ordered = /^\d+\./.test(trimmed);
          const Tag = ordered ? "ol" : "ul";
          return (
            <Tag key={i} className={cn("space-y-1.5 pl-5", ordered ? "list-decimal" : "list-disc")} style={{ color: theme.foreground }}>
              {items.map((it, j) => (
                <li key={j}>{inline(it)}</li>
              ))}
            </Tag>
          );
        }
        return (
          <p key={i} style={{ color: theme.foreground }}>
            {inline(trimmed)}
          </p>
        );
      })}
    </>
  );
  function inline(text: string): React.ReactNode {
    // bold **text**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, k) =>
      p.startsWith("**") && p.endsWith("**") ? (
        <strong key={k} className="font-700">{p.slice(2, -2)}</strong>
      ) : (
        <span key={k}>{p}</span>
      )
    );
  }
}
