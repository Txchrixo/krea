"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  Package,
  Loader2,
  Check,
  Layers,
  TrendingDown,
  BookOpen,
  Trash2,
} from "lucide-react";
import type { BundleItem, EbookCard } from "@/lib/types";
import { formatFCFA } from "@/lib/format";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const COVER_COLORS = ["#1F4A2E", "#5DBE8A", "#C8553D", "#697E6E", "#FFD86B", "#2E5C8A"];

export function BundlesTab() {
  const { setView, user, openAuth, openPurchase } = useApp();
  const [bundles, setBundles] = useState<BundleItem[]>([]);
  const [ebooks, setEbooks] = useState<EbookCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  async function load() {
    setLoading(true);
    const slug = user?.creatorSlug;
    if (!slug) {
      setLoading(false);
      return;
    }
    const [b, e] = await Promise.all([
      fetch(`/api/bundles?creatorSlug=${slug}`).then((r) => r.json()),
      fetch("/api/creator/ebooks").then((r) => r.json()),
    ]);
    setBundles(b.items || []);
    setEbooks(e.items || []);
    setLoading(false);
  }

  useEffect(() => {
    const slug = user?.creatorSlug;
    if (!slug) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }
    Promise.all([
      fetch(`/api/bundles?creatorSlug=${slug}`).then((r) => r.json()),
      fetch("/api/creator/ebooks").then((r) => r.json()),
    ])
      .then(([b, e]) => {
        setBundles(b.items || []);
        setEbooks(e.items || []);
      })
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="bg-background">
      <div className="border-b border-border bg-card/60">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <button
            onClick={() => setView({ name: "dashboard" })}
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </button>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="flex items-center gap-2 font-heading text-2xl font-600 text-foreground">
                <Package className="h-6 w-6 text-primary" /> Mes bundles
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Regroupez plusieurs ebooks et vendez-les à un prix réduit. Plus de valeur pour vos clients, plus de ventes pour vous.
              </p>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Nouveau bundle
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Info banner */}
        <Card className="mb-6 overflow-hidden border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15">
              <Layers className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-heading text-base font-600 text-foreground">Pourquoi créer un bundle ?</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Les bundles augmentent votre panier moyen. Au lieu de vendre 1 ebook à 5 000 F, vendez 3 ebooks à 12 000 F. Vos clients économisent, vous gagnez plus.
              </p>
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : bundles.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Package className="h-7 w-7 text-primary" />
            </div>
            <p className="mt-3 font-heading text-lg text-foreground">Aucun bundle pour le moment</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Créez votre premier bundle en sélectionnant au moins 2 de vos ebooks et en fixant un prix réduit.
            </p>
            <Button className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Créer un bundle
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {bundles.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.06, 0.3) }}
              >
                <Card className="overflow-hidden p-0">
                  <div className="flex flex-col gap-4 p-5 sm:flex-row">
                    {/* Bundle visual */}
                    <div className="relative flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: b.coverColor }}>
                      <Layers className="h-10 w-10 text-white/80" />
                      <Badge className="absolute -right-2 -top-2 bg-accent text-accent-foreground shadow-md">
                        -{b.discountPct}%
                      </Badge>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-heading text-lg font-600 text-foreground">{b.title}</h3>
                          <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{b.description}</p>
                        </div>
                      </div>

                      {/* Ebooks in bundle */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {b.ebooks.map((eb) => (
                          <Badge key={eb.id} variant="outline" className="text-[10px] text-foreground/70">
                            <BookOpen className="mr-1 h-2.5 w-2.5" /> {eb.title.length > 30 ? eb.title.slice(0, 30) + "…" : eb.title}
                          </Badge>
                        ))}
                      </div>

                      {/* Pricing */}
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex items-baseline gap-2">
                          <span className="font-heading text-xl font-600 text-foreground">{formatFCFA(b.price)}</span>
                          <span className="text-sm text-muted-foreground line-through">{formatFCFA(b.originalTotal)}</span>
                        </div>
                        <Badge className="bg-primary/15 text-foreground">
                          <TrendingDown className="mr-1 h-3 w-3 text-primary" />
                          Économie de {formatFCFA(b.originalTotal - b.price)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <CreateBundleDialog open={open} onOpenChange={setOpen} ebooks={ebooks} onCreated={load} />
    </div>
  );
}

function CreateBundleDialog({
  open,
  onOpenChange,
  ebooks,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  ebooks: EbookCard[];
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [selectedEbooks, setSelectedEbooks] = useState<string[]>([]);
  const [coverColor, setCoverColor] = useState(COVER_COLORS[0]);
  const [loading, setLoading] = useState(false);

  const selectedEbookObjects = ebooks.filter((e) => selectedEbooks.includes(e.id));
  const originalTotal = selectedEbookObjects.reduce((s, e) => s + e.price, 0);
  const bundlePrice = parseInt(price || "0", 10);
  const savings = originalTotal - bundlePrice;
  const discountPct = originalTotal > 0 ? Math.round((savings / originalTotal) * 100) : 0;

  function toggleEbook(id: string) {
    setSelectedEbooks((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  }

  async function submit() {
    if (!title.trim()) { toast.error("Titre requis"); return; }
    if (!description.trim()) { toast.error("Description requise"); return; }
    if (selectedEbooks.length < 2) { toast.error("Sélectionnez au moins 2 ebooks"); return; }
    if (bundlePrice <= 0) { toast.error("Prix invalide"); return; }
    if (bundlePrice >= originalTotal) { toast.error("Le prix du bundle doit être inférieur au prix total"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/bundles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price: bundlePrice,
          ebookIds: selectedEbooks,
          coverColor,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Bundle créé 🎉");
      setTitle(""); setDescription(""); setPrice(""); setSelectedEbooks([]); setCoverColor(COVER_COLORS[0]);
      onOpenChange(false);
      onCreated();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Échec");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading text-xl">
            <Package className="h-5 w-5 text-primary" /> Créer un bundle
          </DialogTitle>
          <DialogDescription>Regroupez plusieurs ebooks et offrez une réduction.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="btitle">Titre du bundle</Label>
            <Input id="btitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Pack Business Africain" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bdesc">Description</Label>
            <Textarea id="bdesc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez ce que contient ce bundle et pourquoi vos clients devraient l'acheter…" className="min-h-[80px]" />
          </div>

          {/* Ebook selection */}
          <div className="space-y-1.5">
            <Label>Sélectionnez vos ebooks ({selectedEbooks.length} sélectionnés)</Label>
            <div className="max-h-48 space-y-1.5 overflow-y-auto rounded-lg border border-border p-2 scroll-krea">
              {ebooks.filter((e) => e.status === "PUBLISHED").map((eb) => (
                <label
                  key={eb.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors",
                    selectedEbooks.includes(eb.id) ? "bg-primary/10" : "hover:bg-muted"
                  )}
                >
                  <Checkbox
                    checked={selectedEbooks.includes(eb.id)}
                    onCheckedChange={() => toggleEbook(eb.id)}
                  />
                  <div className="h-8 w-6 flex-shrink-0 rounded" style={{ background: eb.coverColor }} />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-500 text-foreground">{eb.title}</p>
                  </div>
                  <span className="flex-shrink-0 text-xs text-muted-foreground">{formatFCFA(eb.price)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="bprice">Prix du bundle (FCFA)</Label>
              <Input id="bprice" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="12000" />
            </div>
            <div className="space-y-1.5">
              <Label>Couleur</Label>
              <div className="flex gap-1.5">
                {COVER_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCoverColor(c)}
                    className={cn("h-8 w-8 rounded-full border-2 transition-transform hover:scale-110", coverColor === c ? "border-foreground" : "border-transparent")}
                    style={{ background: c }}
                  >
                    {coverColor === c && <Check className="mx-auto h-3.5 w-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live pricing preview */}
          {selectedEbooks.length >= 2 && bundlePrice > 0 && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Valeur totale</span>
                <span className="font-500 text-foreground">{formatFCFA(originalTotal)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Prix du bundle</span>
                <span className="font-heading text-lg font-600 text-foreground">{formatFCFA(bundlePrice)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between border-t border-border pt-1 text-sm">
                <span className="text-primary">Économie client</span>
                <span className="font-600 text-primary">{formatFCFA(savings)} (-{discountPct}%)</span>
              </div>
            </div>
          )}

          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading} onClick={submit}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Créer le bundle
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
