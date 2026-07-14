"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EbookCardView } from "@/components/ebook-card";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, ShieldCheck, Star, BookOpen, Users, Globe, Loader2, MapPin, Package, Layers, TrendingDown } from "lucide-react";
import type { EbookCard, BundleItem } from "@/lib/types";
import { motion } from "framer-motion";
import { formatFCFA } from "@/lib/format";

interface CreatorInfo {
  displayName: string;
  bio: string | null;
  tagline: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bannerColor: string;
  plan: string;
  verified: boolean;
  totalEbooks: number;
  totalSales: number;
  ratingAvg: number;
  country: string | null;
}

export function CreatorStoreView() {
  const { view, setView } = useApp();
  const slug = view.name === "creator-store" ? view.slug : "";
  const [creator, setCreator] = useState<CreatorInfo | null>(null);
  const [ebooks, setEbooks] = useState<EbookCard[]>([]);
  const [bundles, setBundles] = useState<BundleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/creators/${slug}`).then((r) => r.json()),
      fetch(`/api/ebooks?creatorSlug=${slug}&limit=50`).then((r) => r.json()),
      fetch(`/api/bundles?creatorSlug=${slug}`).then((r) => r.json()),
    ])
      .then(([c, e, b]) => {
        if (c.creator) setCreator(c.creator);
        setEbooks(e.items || []);
        setBundles(b.items || []);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!creator) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground">Créateur introuvable.</p>
        <Button onClick={() => setView({ name: "marketplace" })}>Retour à la marketplace</Button>
      </div>
    );
  }

  return (
    <div className="bg-background">
      {/* Banner */}
      <div className="relative h-48 overflow-hidden sm:h-64" style={{ background: creator.bannerColor || "#1F4A2E" }}>
        <div className="absolute inset-0">
          <div className="absolute -left-20 top-0 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-60 w-60 rounded-full bg-white/5 blur-3xl" />
        </div>
        {creator.tagline && (
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <p className="text-center font-heading text-lg font-500 text-white/90 sm:text-2xl" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
              {creator.tagline}
            </p>
          </div>
        )}
        <button
          onClick={() => setView({ name: "marketplace" })}
          className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1.5 text-sm text-white backdrop-blur hover:bg-black/30"
        >
          <ArrowLeft className="h-4 w-4" /> Marketplace
        </button>
      </div>

      {/* Profile header */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:gap-6">
          <Avatar className="h-32 w-32 flex-shrink-0 border-4 border-background shadow-xl">
            <AvatarFallback className="text-4xl font-heading text-white" style={{ background: creator.bannerColor || "#1F4A2E" }}>
              {(creator.displayName || "?")[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 sm:pb-1">
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-3xl font-600 text-foreground">{creator.displayName}</h1>
              {creator.verified && (
                <svg viewBox="0 0 24 24" className="h-6 w-6 text-primary" fill="currentColor">
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
                </svg>
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <Badge className="bg-primary/15 text-foreground hover:bg-primary/15">
                <ShieldCheck className="mr-1 h-3 w-3 text-primary" /> Créateur {creator.plan}
              </Badge>
              <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {creator.totalEbooks} ebooks</span>
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {creator.totalSales} ventes</span>
              <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-accent text-accent" /> {creator.ratingAvg.toFixed(1)}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Afrique</span>
            </div>
          </div>
          <div className="sm:pb-1">
            <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
              Suivre
            </Button>
          </div>
        </div>

        {creator.bio && (
          <p className="mt-6 max-w-2xl text-muted-foreground">{creator.bio}</p>
        )}

        {/* Bundles */}
        {bundles.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 flex items-center gap-2 font-heading text-xl font-600 text-foreground">
              <Package className="h-5 w-5 text-primary" /> Packs & bundles
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {bundles.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.06, 0.3) }}
                >
                  <Card className="overflow-hidden p-0">
                    <div className="flex items-stretch">
                      <div className="flex w-20 flex-shrink-0 items-center justify-center" style={{ background: b.coverColor }}>
                        <Layers className="h-8 w-8 text-white/80" />
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-heading text-sm font-600 text-foreground">{b.title}</h3>
                          <Badge className="bg-accent text-accent-foreground">-{b.discountPct}%</Badge>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{b.description}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {(b.ebooks ?? []).slice(0, 3).map((eb) => (
                            <Badge key={eb.id} variant="outline" className="h-5 text-[9px] text-foreground/60">
                              {eb.title.length > 20 ? eb.title.slice(0, 20) + "…" : eb.title}
                            </Badge>
                          ))}
                          {(b.ebooks ?? []).length > 3 && <Badge variant="outline" className="h-5 text-[9px] text-muted-foreground">+{(b.ebooks ?? []).length - 3}</Badge>}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-heading text-base font-600 text-foreground">{formatFCFA(b.price)}</span>
                            <span className="text-[10px] text-muted-foreground line-through">{formatFCFA(b.originalTotal)}</span>
                          </div>
                          <Button
                            size="sm"
                            className="h-7 bg-primary text-xs text-primary-foreground hover:bg-primary/90"
                            onClick={() => { /* TODO: bundle purchase modal */ toast.success("Bundle ajouté !"); }}
                          >
                            <TrendingDown className="mr-1 h-3 w-3" /> Acheter
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Ebooks */}
        <div className="mt-8 pb-16">
          <h2 className="mb-4 font-heading text-xl font-600 text-foreground">Tous les ebooks</h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {ebooks.map((eb, i) => (
              <motion.div key={eb.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.05, 0.4) }}>
                <EbookCardView ebook={eb} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
