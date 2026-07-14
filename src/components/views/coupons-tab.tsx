"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Ticket,
  Copy,
  Check,
  Loader2,
  Trash2,
  Calendar,
  TrendingUp,
  Gift,
  Sparkles,
} from "lucide-react";
import type { CouponItem, EbookCard } from "@/lib/types";
import { formatFCFA, formatDate } from "@/lib/format";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function CouponsTab() {
  const { setView } = useApp();
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [ebooks, setEbooks] = useState<EbookCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [c, e] = await Promise.all([
      fetch("/api/coupons").then((r) => r.json()),
      fetch("/api/creator/ebooks").then((r) => r.json()),
    ]);
    setCoupons(c.items || []);
    setEbooks(e.items || []);
    setLoading(false);
  }

  useEffect(() => {
    Promise.all([
      fetch("/api/coupons").then((r) => r.json()),
      fetch("/api/creator/ebooks").then((r) => r.json()),
    ])
      .then(([c, e]) => {
        setCoupons(c.items || []);
        setEbooks(e.items || []);
      })
      .finally(() => setLoading(false));
  }, []);

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    toast.success("Code copié 📋");
    setTimeout(() => setCopied(null), 2000);
  }

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
                <Ticket className="h-6 w-6 text-primary" /> Codes promo
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Créez des coupons de réduction pour vos ebooks. Partagez-les sur WhatsApp, Instagram, Facebook.
              </p>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Nouveau coupon
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats strip */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniStat icon={Ticket} label="Coupons actifs" value={String(coupons.filter((c) => c.active).length)} />
          <MiniStat icon={Gift} label="Utilisations" value={String(coupons.reduce((s, c) => s + (c.redeemed || 0), 0))} />
          <MiniStat icon={TrendingUp} label="Taux d'usage" value={`${coupons.length ? Math.round((coupons.reduce((s, c) => s + (c.redeemed || 0), 0) / coupons.reduce((s, c) => s + (c.maxRedemptions || 1), 0)) * 100) : 0}%`} />
          <MiniStat icon={Sparkles} label="Remise moy." value={`${coupons.length ? Math.round(coupons.reduce((s, c) => s + (c.percentOff || 0), 0) / coupons.length) : 0}%`} />
        </div>

        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Ticket className="h-7 w-7 text-primary" />
            </div>
            <p className="mt-3 font-heading text-lg text-foreground">Aucun coupon pour le moment</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Créez votre premier code promo pour booster vos ventes. Ex : <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-600">WELCOME10</code> pour -10%.
            </p>
            <Button className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Créer un coupon
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {coupons.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.3) }}
              >
                <Card className="overflow-hidden p-0">
                  <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                    {/* Coupon ticket visual */}
                    <div className="relative flex flex-shrink-0 items-center gap-3">
                      <div className="relative flex h-16 w-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary/40 bg-primary/5">
                        <span className="font-heading text-lg font-700 text-primary">{c.percentOff}%</span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">de réduction</span>
                        {/* ticket notches */}
                        <div className="absolute -left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-background" />
                        <div className="absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-background" />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <code className="rounded-md bg-foreground px-2 py-0.5 font-mono text-sm font-600 text-background">{c.code}</code>
                        <button
                          onClick={() => copyCode(c.code)}
                          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label="Copier"
                        >
                          {copied === c.code ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                        {!c.active && <Badge variant="outline" className="text-muted-foreground">Inactif</Badge>}
                        {c.expiresAt && new Date(c.expiresAt) < new Date() && (
                          <Badge variant="outline" className="text-destructive">Expiré</Badge>
                        )}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>{c.ebook ? `📚 ${c.ebook.title}` : "Tous les ebooks"}</span>
                        <span className="flex items-center gap-1">
                          <Check className="h-3 w-3 text-primary" /> {c.redeemed}/{c.maxRedemptions} utilisés
                        </span>
                        {c.expiresAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> Expire le {formatDate(c.expiresAt)}
                          </span>
                        )}
                      </div>
                      {/* usage bar */}
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${(c.redeemed / c.maxRedemptions) * 100}%` }}
                          transition={{ duration: 0.6, delay: i * 0.05 }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <Badge className={c.active ? "bg-primary/15 text-foreground" : "bg-muted text-muted-foreground"}>
                        {c.active ? "Actif" : "Inactif"}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">Créé {formatDate(c.createdAt)}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <CreateCouponDialog open={open} onOpenChange={setOpen} ebooks={ebooks} onCreated={load} />
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="font-heading text-lg font-600 text-foreground leading-none">{value}</p>
        <p className="text-[11px] text-muted-foreground">{label}</p>
      </div>
    </Card>
  );
}

function CreateCouponDialog({
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
  const [code, setCode] = useState("");
  const [percentOff, setPercentOff] = useState("10");
  const [ebookId, setEbookId] = useState("all");
  const [maxRedemptions, setMaxRedemptions] = useState("100");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);

  function randomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let s = "";
    for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
    setCode(s);
  }

  async function submit() {
    if (!code.trim()) { toast.error("Code requis"); return; }
    const pct = parseInt(percentOff, 10);
    if (!pct || pct < 1 || pct > 90) { toast.error("Pourcentage entre 1 et 90"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.toUpperCase(),
          percentOff: pct,
          ebookId: ebookId === "all" ? null : ebookId,
          maxRedemptions: parseInt(maxRedemptions, 10) || 100,
          expiresAt: expiresAt || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Coupon créé 🎉");
      setCode(""); setPercentOff("10"); setEbookId("all"); setMaxRedemptions("100"); setExpiresAt("");
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
            <Gift className="h-5 w-5 text-primary" /> Nouveau coupon
          </DialogTitle>
          <DialogDescription>Offrez une réduction à votre audience.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Code promo</Label>
            <div className="flex gap-2">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                placeholder="WELCOME10"
                className="font-mono uppercase"
                maxLength={20}
              />
              <Button variant="outline" size="icon" onClick={randomCode} title="Générer aléatoire">
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">Lettres et chiffres, sans espaces.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Réduction (%)</Label>
              <Input type="number" min={1} max={90} value={percentOff} onChange={(e) => setPercentOff(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Max. utilisations</Label>
              <Input type="number" min={1} value={maxRedemptions} onChange={(e) => setMaxRedemptions(e.target.value)} />
            </div>
          </div>

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
            <Label>Date d'expiration (optionnel)</Label>
            <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </div>

          {/* live preview */}
          <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 text-center">
            <p className="font-heading text-2xl font-700 text-primary">{percentOff || 0}%</p>
            <p className="text-xs text-muted-foreground">de réduction avec le code</p>
            <code className="mt-1 inline-block rounded bg-foreground px-2 py-0.5 font-mono text-sm font-600 text-background">
              {code || "VOTRE CODE"}
            </code>
          </div>

          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading} onClick={submit}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Créer le coupon
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
