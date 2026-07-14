"use client";

import { useEffect, useState, useCallback } from "react";
import { useApp } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EbookCardView } from "@/components/ebook-card";
import { CATEGORIES } from "@/lib/format";
import { Search, SlidersHorizontal, Sparkles, BookOpen, Loader2, X, Heart, Filter, ChevronDown } from "lucide-react";
import type { EbookCard } from "@/lib/types";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function MarketplaceView() {
  const { view } = useApp();
  const initialCategory = view.name === "marketplace" ? view.category : undefined;
  const initialQ = view.name === "marketplace" ? view.q : undefined;

  const [ebooks, setEbooks] = useState<EbookCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategoryState] = useState<string | undefined>(initialCategory);
  const [q, setQState] = useState(initialQ ?? "");
  const [sort, setSortState] = useState("popular");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [priceRange, setPriceRange] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const pageSize = 12;

  const setCategory = (c?: string) => { setCategoryState(c); setPage(1); };
  const setQ = (v: string) => { setQState(v); setPage(1); };
  const setSort = (v: string) => { setSortState(v); setPage(1); };
  const setPriceRangeAndPage = (v: string) => { setPriceRange(v); setPage(1); };

  // load wishlist ids
  useEffect(() => {
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((d) => setWishlistIds(new Set(d.ids || [])));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      limit: String(pageSize),
      page: String(page),
      sort,
    });
    if (category) params.set("category", category);
    if (q) params.set("q", q);
    // price range
    const ranges: Record<string, [number, number]> = {
      "0-2500": [0, 2500],
      "2500-5000": [2500, 5000],
      "5000-10000": [5000, 10000],
      "10000+": [10000, 1000000],
    };
    if (priceRange !== "all" && ranges[priceRange]) {
      params.set("minPrice", String(ranges[priceRange][0]));
      params.set("maxPrice", String(ranges[priceRange][1]));
    }
    const res = await fetch(`/api/ebooks?${params}`);
    const data = await res.json();
    setEbooks(data.items || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [category, q, sort, page, priceRange]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="bg-background">
      {/* Header band */}
      <div className="relative overflow-hidden border-b border-border bg-card/60">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-0 h-60 w-60 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute right-0 top-10 h-60 w-60 rounded-full bg-accent/15 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="font-heading text-3xl font-600 text-foreground sm:text-4xl">
            Le savoir qui se vend en Afrique
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Des ebooks de créateurs vérifiés. Paiement Mobile Money, lecture protégée, watermark personnel.
          </p>

          {/* Search */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un ebook, un sujet, un créateur…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="h-11 pl-10 pr-10"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              className={cn("h-11 px-4", priceRange !== "all" && "border-primary text-primary")}
              onClick={() => setShowFilters((s) => !s)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtres
              {priceRange !== "all" && <Badge className="ml-1.5 bg-primary text-primary-foreground">1</Badge>}
              <ChevronDown className={cn("ml-1 h-4 w-4 transition-transform", showFilters && "rotate-180")} />
            </Button>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="!h-11 w-full sm:w-48">
                <SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Plus populaires</SelectItem>
                <SelectItem value="new">Plus récents</SelectItem>
                <SelectItem value="rating">Mieux notés</SelectItem>
                <SelectItem value="price_asc">Prix croissant</SelectItem>
                <SelectItem value="price_desc">Prix décroissant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price range filter panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden rounded-md border border-border bg-card p-4"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-600 text-foreground">Fourchette de prix :</span>
                {[
                  { id: "all", label: "Tous les prix" },
                  { id: "0-2500", label: "Moins de 2 500 F" },
                  { id: "2500-5000", label: "2 500 – 5 000 F" },
                  { id: "5000-10000", label: "5 000 – 10 000 F" },
                  { id: "10000+", label: "Plus de 10 000 F" },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setPriceRangeAndPage(r.id)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-500 transition-all",
                      priceRange === r.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground/70 hover:border-primary/50"
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Category chips */}
      <div className="sticky top-14 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3 scroll-krea sm:px-6 lg:px-8">
          <CategoryChip active={!category} onClick={() => setCategory(undefined)} label="Tout" icon={Sparkles} />
          {CATEGORIES.map((c) => (
            <CategoryChip
              key={c.id}
              active={category === c.id}
              onClick={() => setCategory(category === c.id ? undefined : c.id)}
              label={c.label.split(" & ")[0].split(" personnel")[0]}
            />
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {loading ? "Chargement…" : `${total} ebook${total > 1 ? "s" : ""} trouvé${total > 1 ? "s" : ""}`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-56 animate-pulse rounded-lg bg-muted" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : ebooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 font-heading text-lg text-foreground">Aucun ebook trouvé</p>
            <p className="mt-1 text-sm text-muted-foreground">Essayez une autre recherche ou catégorie.</p>
            <Button variant="outline" className="mt-4" onClick={() => { setQ(""); setCategory(undefined); setSort("popular"); }}>
              Réinitialiser les filtres
            </Button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4"
          >
            {ebooks.map((eb, i) => (
              <motion.div
                key={eb.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.4) }}
              >
                <EbookCardView ebook={eb} wishlisted={wishlistIds.has(eb.id)} onWishlistToggle={(id) => {
                  setWishlistIds((prev) => {
                    const next = new Set(prev);
                    if (next.has(id)) next.delete(id);
                    else next.add(id);
                    return next;
                  });
                }} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Précédent
            </Button>
            {Array.from({ length: totalPages }).slice(0, 6).map((_, i) => (
              <Button
                key={i}
                variant={page === i + 1 ? "default" : "outline"}
                size="sm"
                className={page === i + 1 ? "bg-primary text-primary-foreground" : ""}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              Suivant
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryChip({ active, onClick, label, icon: Icon }: { active: boolean; onClick: () => void; label: string; icon?: any }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-500 transition-all",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-background text-foreground/70 hover:border-primary/50 hover:text-foreground"
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}
