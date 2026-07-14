"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
  Share2,
  Copy,
  Check,
  Loader2,
  Link2,
  MousePointerClick,
  Target,
  Percent,
  Users,
  Sparkles,
} from "lucide-react";
import type { AffiliateItem, EbookCard } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function AffiliateTab() {
  const { setView } = useApp();
  const [items, setItems] = useState<AffiliateItem[]>([]);
  const [ebooks, setEbooks] = useState<EbookCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [a, e] = await Promise.all([
      fetch("/api/creator/affiliates").then((r) => r.json()),
      fetch("/api/creator/ebooks").then((r) => r.json()),
    ]);
    setItems(a.items || []);
    setEbooks(e.items || []);
    setLoading(false);
  }

  useEffect(() => {
    Promise.all([
      fetch("/api/creator/affiliates").then((r) => r.json()),
      fetch("/api/creator/ebooks").then((r) => r.json()),
    ])
      .then(([a, e]) => {
        setItems(a.items || []);
        setEbooks(e.items || []);
      })
      .finally(() => setLoading(false));
  }, []);

  function copyLink(code: string) {
    const url = `${window.location.origin}/api/affiliates/click?code=${code}`;
    navigator.clipboard.writeText(url);
    setCopied(code);
    toast.success("Lien d'affiliation copié 📋");
    setTimeout(() => setCopied(null), 2000);
  }

  const totalClicks = items.reduce((s, a) => s + a.clicks, 0);
  const totalConv = items.reduce((s, a) => s + a.conversions, 0);
  const convRate = totalClicks > 0 ? ((totalConv / totalClicks) * 100).toFixed(1) : "0.0";

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
                <Share2 className="h-6 w-6 text-primary" /> Affiliation
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Vos ambassadeurs partagent vos ebooks et touchent une commission. Vous gagnez des ventes sans effort.
              </p>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Nouveau lien
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* How it works banner */}
        <Card className="mb-6 overflow-hidden border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading text-base font-600 text-foreground">Comment fonctionne l'affiliation Krea ?</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Partagez un lien unique. Quand quelqu'un achète via ce lien, l'affilié touche sa commission. Vous gardez le reste (moins la commission plateforme).
              </p>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <StatCard icon={MousePointerClick} label="Clics totaux" value={String(totalClicks)} color="#5DBE8A" />
          <StatCard icon={Target} label="Conversions" value={String(totalConv)} color="#FFD86B" />
          <StatCard icon={Percent} label="Taux de conv." value={`${convRate}%`} color="#C8553D" />
        </div>

        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Link2 className="h-7 w-7 text-primary" />
            </div>
            <p className="mt-3 font-heading text-lg text-foreground">Aucun lien d'affiliation</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Créez un lien d'affiliation pour qu'un ambassadeur puisse promouvoir vos ebooks contre une commission.
            </p>
            <Button className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Créer un lien
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {items.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.3) }}
              >
                <Card className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-accent/20">
                      <Users className="h-6 w-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <code className="rounded-md bg-foreground px-2 py-0.5 font-mono text-sm font-600 text-background">{a.code}</code>
                        <button
                          onClick={() => copyLink(a.code)}
                          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label="Copier le lien"
                        >
                          {copied === a.code ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>{a.ebook ? `📚 ${a.ebook.title}` : "Tous les ebooks"}</span>
                        <span className="flex items-center gap-1">
                          <Percent className="h-3 w-3 text-primary" /> {a.commission}% à l'affilié
                        </span>
                        <span>Créé le {formatDate(a.createdAt)}</span>
                      </div>
                      {/* mini stats */}
                      <div className="mt-3 flex gap-4">
                        <div>
                          <p className="font-heading text-lg font-600 text-foreground leading-none">{a.clicks}</p>
                          <p className="text-[10px] text-muted-foreground">clics</p>
                        </div>
                        <div className="h-8 w-px bg-border" />
                        <div>
                          <p className="font-heading text-lg font-600 text-foreground leading-none">{a.conversions}</p>
                          <p className="text-[10px] text-muted-foreground">ventes</p>
                        </div>
                        <div className="h-8 w-px bg-border" />
                        <div>
                          <p className="font-heading text-lg font-600 text-primary leading-none">
                            {a.clicks > 0 ? ((a.conversions / a.clicks) * 100).toFixed(0) : 0}%
                          </p>
                          <p className="text-[10px] text-muted-foreground">conv.</p>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => copyLink(a.code)}>
                      <Link2 className="mr-1.5 h-3.5 w-3.5" /> Copier le lien
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <CreateAffiliateDialog open={open} onOpenChange={setOpen} ebooks={ebooks} onCreated={load} />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: color + "22" }}>
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div>
        <p className="font-heading text-lg font-600 text-foreground leading-none">{value}</p>
        <p className="text-[11px] text-muted-foreground">{label}</p>
      </div>
    </Card>
  );
}

function CreateAffiliateDialog({
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
  const [ebookId, setEbookId] = useState("all");
  const [commission, setCommission] = useState("20");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch("/api/creator/affiliates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ebookId: ebookId === "all" ? null : ebookId,
          commission: parseInt(commission, 10),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Lien d'affiliation créé 🎉");
      setEbookId("all"); setCommission("20");
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading text-xl">
            <Share2 className="h-5 w-5 text-primary" /> Nouveau lien d'affiliation
          </DialogTitle>
          <DialogDescription>Un ambassadeur partagera ce lien et touchera une commission sur chaque vente.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Ebook concerné</Label>
            <Select value={ebookId} onValueChange={setEbookId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous mes ebooks</SelectItem>
                {ebooks.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Commission affilié (%)</Label>
            <Input type="number" min={5} max={50} value={commission} onChange={(e) => setCommission(e.target.value)} />
            <p className="text-[11px] text-muted-foreground">Entre 5% et 50%. Le reste vous revient (moins la commission plateforme).</p>
          </div>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-foreground">
            <strong>Exemple :</strong> Ebook à 10 000 F, affilié 20% → affilié touche 2 000 F, vous touchez le reste (moins commission plateforme).
          </div>
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading} onClick={submit}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Créer le lien
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
