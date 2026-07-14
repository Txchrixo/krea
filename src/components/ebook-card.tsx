"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { EbookCover } from "./ebook-cover";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, ShoppingBag, Heart } from "lucide-react";
import { formatFCFA, formatCompact } from "@/lib/format";
import type { EbookCard } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface EbookCardViewProps {
  ebook: EbookCard;
  className?: string;
  showBadge?: boolean;
  wishlisted?: boolean;
  onWishlistToggle?: (id: string) => void;
}

export function EbookCardView({ ebook, className, showBadge = true, wishlisted: initialWishlisted, onWishlistToggle }: EbookCardViewProps) {
  const { setView, user, openAuth } = useApp();
  const [wishlisted, setWishlisted] = useState(!!initialWishlisted);
  const [toggling, setToggling] = useState(false);
  const discount = ebook.compareAtPrice
    ? Math.round(((ebook.compareAtPrice - ebook.price) / ebook.compareAtPrice) * 100)
    : 0;

  async function toggleWishlist(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (!user) {
      openAuth("login");
      return;
    }
    if (toggling) return;
    setToggling(true);
    try {
      const res = await fetch(`/api/wishlist/${ebook.id}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setWishlisted(data.wishlisted);
      onWishlistToggle?.(ebook.id);
      toast.success(data.wishlisted ? "Ajouté à vos favoris ♥" : "Retiré de vos favoris");
    } catch {
      toast.error("Action impossible");
    } finally {
      setToggling(false);
    }
  }

  return (
    <div
      onClick={() => setView({ name: "ebook", ebookId: ebook.slug })}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") setView({ name: "ebook", ebookId: ebook.slug }); }}
      className={cn(
        "group flex cursor-pointer flex-col text-left transition-transform duration-300 hover:-translate-y-1",
        className
      )}
    >
      <div className="relative">
        <EbookCover
          title={ebook.title}
          subtitle={ebook.subtitle}
          creatorName={ebook.creator.displayName}
          coverUrl={ebook.coverUrl}
          coverColor={ebook.coverColor}
          size="md"
        />
        {showBadge && (ebook.isBestseller || ebook.featured || discount > 0) && (
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {ebook.isBestseller && (
              <Badge className="bg-accent text-accent-foreground shadow-sm hover:bg-accent">
                <TrendingUp className="mr-1 h-3 w-3" /> Best-seller
              </Badge>
            )}
            {discount > 0 && (
              <Badge className="bg-destructive text-white shadow-sm hover:bg-destructive">
                -{discount}%
              </Badge>
            )}
          </div>
        )}
        {/* wishlist heart */}
        <button
          onClick={toggleWishlist}
          aria-label="Ajouter aux favoris"
          className={cn(
            "absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-all",
            wishlisted
              ? "bg-destructive text-white shadow-md"
              : "bg-background/70 text-foreground/70 opacity-0 group-hover:opacity-100 hover:bg-background hover:text-destructive"
          )}
        >
          <Heart className={cn("h-4 w-4", wishlisted && "fill-current")} />
        </button>
        {/* hover overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center rounded-lg bg-gradient-to-t from-foreground/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-background/95 px-3 py-1.5 text-xs font-600 text-foreground shadow-md">
            <ShoppingBag className="h-3.5 w-3.5 text-primary" /> Voir l'ebook
          </span>
        </div>
      </div>

      <div className="mt-3 flex-1">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="font-500 text-foreground/70">{ebook.creator.displayName}</span>
          {ebook.creator.verified && (
            <svg viewBox="0 0 16 16" className="h-3 w-3 text-primary" fill="currentColor" aria-label="vérifié">
              <path d="M6.2 11.2L3 8l1.4-1.4 1.8 1.8L10.6 4 12 5.4z" />
              <path d="M8 0L9.8 1.5 12 1.2l.3 2.2 2 .8-.8 2 .8 2-2 .8-.3 2.2-2.2-.3L8 16l-1.8-1.5-2.2.3-.3-2.2-2-.8.8-2-.8-2 2-.8.3-2.2L6.2 1.5z" opacity="0" />
            </svg>
          )}
        </div>
        <h3
          className="mt-0.5 truncate font-heading text-sm font-600 leading-snug text-foreground"
          title={ebook.title}
        >
          {ebook.title}
        </h3>
        <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-0.5">
            <Star className="h-3 w-3 fill-accent text-accent" />
            <span className="font-500 text-foreground/80">{ebook.ratingAvg.toFixed(1)}</span>
            <span>({ebook.ratingCount})</span>
          </span>
          <span className="h-3 w-px bg-border" />
          <span>{formatCompact(ebook.salesCount)} ventes</span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="font-heading text-base font-600 text-foreground">
            {formatFCFA(ebook.price)}
          </span>
          {ebook.compareAtPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatFCFA(ebook.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
