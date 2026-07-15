"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EbookCover } from "@/components/ebook-cover";
import {
  Star,
  ShieldCheck,
  Fingerprint,
  Smartphone,
  BookOpen,
  Check,
  ArrowLeft,
  ShoppingBag,
  Library,
  Play,
  Globe,
  Lock,
  Eye,
  Clock,
  TrendingUp,
  ChevronRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import { formatFCFA, formatNumber, formatDate, timeAgo } from "@/lib/format";
import type { EbookDetail } from "@/lib/types";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { ReviewForm } from "./review-form";
import { EbookCardView } from "@/components/ebook-card";
import { ShareButtons } from "@/components/share-buttons";
import type { EbookCard } from "@/lib/types";

export function EbookDetailView() {
  const { view, setView, user, openAuth, openPurchase } = useApp();
  const ebookId = view.name === "ebook" ? view.ebookId : "";
  const [ebook, setEbook] = useState<EbookDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ebookId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch(`/api/ebooks/${ebookId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) toast.error(d.error);
        else setEbook(d);
      })
      .finally(() => setLoading(false));
  }, [ebookId]);

  function reload() {
    if (!ebookId) return;
    fetch(`/api/ebooks/${ebookId}`)
      .then((r) => r.json())
      .then((d) => { if (!d.error) setEbook(d); });
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ebook) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground">Ebook introuvable.</p>
        <Button onClick={() => setView({ name: "marketplace" })}>Retour à la marketplace</Button>
      </div>
    );
  }

  const discount = ebook.compareAtPrice
    ? Math.round(((ebook.compareAtPrice - ebook.price) / ebook.compareAtPrice) * 100)
    : 0;

  const handleBuy = () => {
    if (!user) {
      openAuth("login");
      return;
    }
    openPurchase(ebook.slug);
  };

  const handleRead = () => setView({ name: "reader", ebookId: ebook.slug });

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <button
          onClick={() => setView({ name: "marketplace" })}
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Marketplace
        </button>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left: cover + buy box */}
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
                  creatorName={ebook.creator.displayName}
                  coverUrl={ebook.coverUrl}
                  coverColor={ebook.coverColor}
                  size="xl"
                />
                {discount > 0 && (
                  <Badge className="absolute -right-2 -top-2 bg-destructive text-white shadow-md">
                    -{discount}%
                  </Badge>
                )}
              </motion.div>

              {/* Price + buy */}
              <div className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-baseline gap-2">
                  <span className="font-heading text-3xl font-600 text-foreground">{formatFCFA(ebook.price)}</span>
                  {ebook.compareAtPrice && (
                    <span className="text-sm text-muted-foreground line-through">{formatFCFA(ebook.compareAtPrice)}</span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">Paiement unique · accès à vie</p>

                {ebook.owned ? (
                  <Button size="lg" className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleRead}>
                    <Play className="mr-2 h-4 w-4" /> Lire maintenant
                  </Button>
                ) : (
                  <Button size="lg" className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleBuy}>
                    <ShoppingBag className="mr-2 h-4 w-4" /> Acheter cet ebook
                  </Button>
                )}

                <div className="mt-4 space-y-2 border-t border-border pt-4">
                  <TrustRow icon={ShieldCheck} text="Watermark personnel sur chaque page" />
                  <TrustRow icon={Smartphone} text="MTN · Orange · Wave · Carte" />
                  <TrustRow icon={Library} text="Lecture dans votre bibliothèque Krea" />
                  <TrustRow icon={Fingerprint} text={`Limite : ${ebook.deviceLimit} appareils`} />
                </div>
              </div>

              {/* quick stats */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <Stat icon={BookOpen} value={ebook.pageCount} label="pages" />
                <Stat icon={TrendingUp} value={ebook.salesCount} label="ventes" />
                <Stat icon={Star} value={ebook.ratingAvg.toFixed(1)} label={`${ebook.ratingCount} avis`} />
              </div>
            </div>
          </div>

          {/* Right: content */}
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-primary/30 text-primary">{ebook.category}</Badge>
              {ebook.isBestseller && (
                <Badge className="bg-accent text-accent-foreground">
                  <TrendingUp className="mr-1 h-3 w-3" /> Best-seller
                </Badge>
              )}
              <Badge variant="outline" className="text-muted-foreground">
                <Globe className="mr-1 h-3 w-3" /> {ebook.language === "fr" ? "Français" : ebook.language}
              </Badge>
            </div>

            <h1 className="mt-3 font-heading text-3xl font-600 leading-tight text-foreground sm:text-4xl">
              {ebook.title}
            </h1>
            {ebook.subtitle && <p className="mt-2 text-lg text-muted-foreground">{ebook.subtitle}</p>}

            {/* creator */}
            <button
              onClick={() => setView({ name: "creator-store", slug: ebook.creator.slug })}
              className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-shadow hover:shadow-md"
            >
              <Avatar className="h-10 w-10 border border-border">
                <AvatarFallback className="bg-primary/15 font-heading text-primary">
                  {ebook.creator.displayName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="flex items-center gap-1 text-sm font-600 text-foreground">
                  {ebook.creator.displayName}
                  {ebook.creator.verified && (
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-primary" fill="currentColor">
                      <path d="M6.2 11.2L3 8l1.4-1.4 1.8 1.8L10.6 4 12 5.4z" />
                    </svg>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">Créateur vérifié · Voir la librairie</p>
              </div>
              <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </button>

            {/* Share buttons */}
            <ShareButtons title={ebook.title} slug={ebook.slug} className="mt-4" />

            {/* Tabs */}
            <Tabs defaultValue="about" className="mt-6">
              <TabsList className="bg-muted">
                <TabsTrigger value="about">Description</TabsTrigger>
                <TabsTrigger value="chapters">Sommaire ({ebook.chapters.length})</TabsTrigger>
                <TabsTrigger value="reviews">Avis ({ebook.ratingCount})</TabsTrigger>
                <TabsTrigger value="protection">Protection</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-5">
                <div className="prose prose-sm max-w-none text-foreground/80">
                  <p className="whitespace-pre-line leading-relaxed">{ebook.description}</p>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Meta label="Pages" value={String(ebook.pageCount)} icon={BookOpen} />
                  <Meta label="Mots" value={formatNumber(ebook.wordCount)} icon={BookOpen} />
                  <Meta label="Langue" value={ebook.language === "fr" ? "Français" : ebook.language} icon={Globe} />
                  <Meta label="Publié" value={ebook.publishedAt ? formatDate(ebook.publishedAt) : " - "} icon={Clock} />
                </div>
              </TabsContent>

              <TabsContent value="chapters" className="mt-5">
                <div className="space-y-2">
                  {ebook.chapters.map((ch, i) => (
                    <div
                      key={ch.id}
                      className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
                    >
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-600 text-primary">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-600 text-foreground">{ch.title}</p>
                        <p className="text-xs text-muted-foreground">{ch.wordCount} mots</p>
                      </div>
                      {!ebook.owned && <Lock className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-5">
                {ebook.owned && (
                  <ReviewForm ebookId={ebook.id} onSubmitted={reload} />
                )}
                {ebook.reviews.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border py-10 text-center">
                    <Star className="mx-auto h-8 w-8 text-muted-foreground/30" />
                    <p className="mt-2 text-sm text-muted-foreground">Aucun avis pour le moment.</p>
                    {ebook.owned && <p className="mt-1 text-xs text-muted-foreground">Soyez le premier à noter cet ebook.</p>}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ebook.reviews.map((r) => (
                      <div key={r.id} className="rounded-xl border border-border bg-card p-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/15 text-xs font-600 text-primary">
                              {(r.user.name ?? "A")[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-600 text-foreground">{r.user.name ?? "Anonyme"}</p>
                            <p className="text-[11px] text-muted-foreground">{timeAgo(r.createdAt)}</p>
                          </div>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, j) => (
                              <Star key={j} className={j < r.rating ? "h-3.5 w-3.5 fill-accent text-accent" : "h-3.5 w-3.5 text-muted-foreground/30"} />
                            ))}
                          </div>
                        </div>
                        {r.comment && <p className="mt-2 text-sm text-foreground/80">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="protection" className="mt-5">
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <h3 className="font-heading text-lg font-600 text-foreground">Comment votre achat est protégé</h3>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <ProtectionItem icon={Fingerprint} title="Watermark social" desc="Votre nom, email et téléphone sont incrustés sur chaque page. Partager = vous dénoncer." />
                    <ProtectionItem icon={Lock} title="Aplatissement" desc="Les pages sont transformées en images. Le watermark ne peut pas être effacé sans détruire le texte." />
                    <ProtectionItem icon={Eye} title="Stéganographie" desc="Un watermark invisible est caché dans les métadonnées et les micro-espaces du texte." />
                    <ProtectionItem icon={Smartphone} title="Limite d'appareils" desc={`Accès limité à ${ebook.deviceLimit} appareils. Le partage de compte est détecté.`} />
                  </div>
                  <div className="mt-4 rounded-lg bg-accent/15 p-3 text-sm text-foreground">
                    <strong>Bon à savoir :</strong> en achetant, vous acceptez une licence personnelle. Toute diffusion, revente ou partage est interdite et peut entraîner la suspension de votre compte.
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Related ebooks */}
      <RelatedEbooks slug={ebook.slug} category={ebook.category} />
    </div>
  );
}

function TrustRow({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-foreground/80">
      <Icon className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
      {text}
    </div>
  );
}

function Stat({ icon: Icon, value, label }: { icon: any; value: any; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-center">
      <Icon className="mx-auto h-4 w-4 text-primary" />
      <p className="mt-1 font-heading text-base font-600 text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

function Meta({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-600 text-foreground">{value}</p>
    </div>
  );
}

function ProtectionItem({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/50 p-4">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-2 font-heading text-sm font-600 text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}

function RelatedEbooks({ slug, category }: { slug: string; category: string }) {
  const [items, setItems] = useState<EbookCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/ebooks/${slug}/related`)
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading || items.length === 0) return null;

  return (
    <div className="mt-16 bg-accent py-12 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-foreground" />
          <h2 className="font-heading text-2xl font-600 text-foreground">
            Vous aimerez aussi
          </h2>
          <Badge variant="outline" className="border-foreground/20 text-foreground/70">{category}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {items.slice(0, 6).map((eb, i) => (
            <motion.div
              key={eb.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.06, 0.4) }}
            >
              <EbookCardView ebook={eb} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
