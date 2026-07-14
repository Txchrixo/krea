"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { EbookCardView } from "@/components/ebook-card";
import type { EbookCard } from "@/lib/types";

/* ───────────────────────── FEATURED EBOOKS ───────────────────────── */
export function FeaturedEbooksSection() {
  const { setView, t } = useApp();
  const [ebooks, setEbooks] = useState<EbookCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ebooks?limit=8&sort=popular")
      .then((r) => r.json())
      .then((d) => setEbooks(d.items || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="bg-primary py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl font-600 leading-tight text-primary-foreground sm:text-4xl">
              {t("featured.title")}
            </h2>
          </div>
          <Button
            variant="outline"
            className="hidden border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:inline-flex"
            onClick={() => setView({ name: "marketplace" })}
          >
            {t("featured.viewAll")}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-56 animate-pulse rounded-lg bg-primary-foreground/10" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-primary-foreground/20" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-primary-foreground/20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {ebooks.map((eb) => (
              <EbookCardView key={eb.id} ebook={eb} />
            ))}
          </div>
        )}
        <div className="mt-8 text-center sm:hidden">
          <Button
            variant="outline"
            className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            onClick={() => setView({ name: "marketplace" })}
          >
            {t("featured.viewAllMarketplace")}
          </Button>
        </div>
      </div>
    </section>
  );
}
