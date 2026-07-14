"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EbookCover } from "@/components/ebook-cover";
import {
  BookOpen,
  Play,
  Library as LibraryIcon,
  Loader2,
  Search,
  BookMarked,
  Clock,
  CheckCircle2,
  Compass,
  Heart,
  ShoppingCart,
} from "lucide-react";
import type { LicenseItem, EbookCard } from "@/lib/types";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { timeAgo, formatFCFA } from "@/lib/format";
import { ReadingStats } from "./reading-stats";
import { EbookCardView } from "@/components/ebook-card";

export function LibraryView() {
  const { setView, openPurchase } = useApp();
  const [items, setItems] = useState<LicenseItem[]>([]);
  const [wishlist, setWishlist] = useState<EbookCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/library").then((r) => r.json()),
      fetch("/api/wishlist").then((r) => r.json()),
    ])
      .then(([lib, wish]) => {
        setItems(lib.items || []);
        setWishlist(wish.items || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((i) =>
    i.ebook.title.toLowerCase().includes(q.toLowerCase())
  );

  const reading = filtered.filter((i) => i.progress > 0 && i.progress < 100);
  const finished = filtered.filter((i) => i.progress >= 100);
  const notStarted = filtered.filter((i) => i.progress === 0);

  return (
    <div className="bg-background">
      <div className="relative overflow-hidden border-b border-border bg-card/60">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-0 h-60 w-60 rounded-full bg-primary/15 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <Badge className="border-primary/30 bg-primary/10 text-foreground hover:bg-primary/10">
            <LibraryIcon className="mr-1.5 h-3.5 w-3.5 text-primary" /> Ma bibliothèque
          </Badge>
          <h1 className="mt-3 font-heading text-3xl font-600 text-foreground sm:text-4xl">
            Vos ebooks, partout, en sécurité
          </h1>
          <p className="mt-2 text-muted-foreground">
            {items.length} ebook{items.length > 1 ? "s" : ""} dans votre bibliothèque protégée.
          </p>

          <div className="relative mt-5 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans votre bibliothèque…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 font-heading text-lg text-foreground">Votre bibliothèque est vide</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Explorez la marketplace et achetez votre premier ebook. La lecture se fera ici, en toute sécurité.
            </p>
            <Button className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setView({ name: "marketplace" })}>
              <Compass className="mr-2 h-4 w-4" /> Explorer la marketplace
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            <ReadingStats />
            <div className="h-px bg-border" />
            {reading.length > 0 && (
              <LibrarySection
                title="En cours de lecture"
                icon={BookMarked}
                items={reading}
                onRead={(slug) => setView({ name: "reader", ebookId: slug })}
              />
            )}
            {notStarted.length > 0 && (
              <LibrarySection
                title="Pas encore commencé"
                icon={BookOpen}
                items={notStarted}
                onRead={(slug) => setView({ name: "reader", ebookId: slug })}
              />
            )}
            {finished.length > 0 && (
              <LibrarySection
                title="Terminés"
                icon={CheckCircle2}
                items={finished}
                onRead={(slug) => setView({ name: "reader", ebookId: slug })}
              />
            )}
            {/* Wishlist section */}
            {wishlist.length > 0 && (
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-destructive" />
                  <h2 className="font-heading text-xl font-600 text-foreground">Mes favoris</h2>
                  <Badge variant="outline" className="text-muted-foreground">{wishlist.length}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                  {wishlist.map((eb, i) => (
                    <motion.div
                      key={eb.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.05, 0.4) }}
                    >
                      <EbookCardView ebook={eb} wishlisted onWishlistToggle={() => {
                        setWishlist((prev) => prev.filter((w) => w.id !== eb.id));
                      }} />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function LibrarySection({
  title,
  icon: Icon,
  items,
  onRead,
}: {
  title: string;
  icon: any;
  items: LicenseItem[];
  onRead: (slug: string) => void;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="font-heading text-xl font-600 text-foreground">{title}</h2>
        <Badge variant="outline" className="text-muted-foreground">{items.length}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.05, 0.4) }}
            className="group"
          >
            <div className="relative">
              <EbookCover
                title={item.ebook.title}
                creatorName={item.ebook.creator.displayName}
                coverUrl={null}
                coverColor={item.ebook.coverColor}
                size="md"
              />
              <button
                onClick={() => onRead(item.ebook.slug)}
                className="absolute inset-0 flex items-center justify-center rounded-lg bg-foreground/40 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <span className="inline-flex items-center gap-1.5 rounded-full bg-background/95 px-4 py-2 text-sm font-600 text-foreground shadow-lg">
                  <Play className="h-4 w-4 text-primary" fill="currentColor" /> Lire
                </span>
              </button>
            </div>
            <div className="mt-3">
              <h3 className="line-clamp-1 font-heading text-sm font-600 text-foreground">{item.ebook.title}</h3>
              <p className="text-xs text-muted-foreground">{item.ebook.creator.displayName}</p>
              <div className="mt-2">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{item.progress}%</span>
                  {item.lastReadAt && (
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-3 w-3" /> {timeAgo(item.lastReadAt)}
                    </span>
                  )}
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
