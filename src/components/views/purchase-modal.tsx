"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PAYMENT_METHODS, formatFCFA } from "@/lib/format";
import type { EbookDetail } from "@/lib/types";
import {
  ShieldCheck,
  Smartphone,
  CreditCard,
  Loader2,
  Check,
  Lock,
  Fingerprint,
  PartyPopper,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type Step = "method" | "phone" | "processing" | "success";

export function PurchaseModal() {
  const { purchaseEbookId, closePurchase, setView, refreshUser, user } = useApp();
  const [ebook, setEbook] = useState<EbookDetail | null>(null);
  const [step, setStep] = useState<Step>("method");
  const [method, setMethod] = useState<string>("MTN");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ percentOff: number; discountedPrice: number } | null>(null);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    if (!purchaseEbookId) {
      setEbook(null);
      setStep("method");
      setPhone("");
      setCouponCode("");
      setAppliedCoupon(null);
      return;
    }
    setStep("method");
    fetch(`/api/ebooks/${purchaseEbookId}`)
      .then((r) => r.json())
      .then((d) => setEbook(d));
    setPhone(user?.phone ?? "");
    setCouponCode("");
    setAppliedCoupon(null);
  }, [purchaseEbookId, user]);

  const finalPrice = appliedCoupon ? appliedCoupon.discountedPrice : (ebook?.price ?? 0);

  async function validateCoupon() {
    if (!ebook || !couponCode.trim()) return;
    setValidating(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.toUpperCase(), ebookId: ebook.id }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon({ percentOff: data.percentOff, discountedPrice: data.discountedPrice });
        toast.success(`Coupon appliqué : -${data.percentOff}% 🎉`);
      } else {
        setAppliedCoupon(null);
        toast.error("Code invalide ou expiré");
      }
    } catch {
      toast.error("Validation impossible");
    } finally {
      setValidating(false);
    }
  }

  function removeCoupon() {
    setCouponCode("");
    setAppliedCoupon(null);
  }

  async function pay() {
    if (!ebook) return;
    if (!phone || phone.length < 6) {
      toast.error("Numéro de téléphone invalide");
      return;
    }
    setStep("processing");
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ebookId: ebook.id,
          paymentMethod: method,
          couponCode: appliedCoupon ? couponCode.toUpperCase() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Paiement échoué");
      // simulate mobile money confirmation delay
      await new Promise((r) => setTimeout(r, 2200));
      await refreshUser();
      setStep("success");
      toast.success("Paiement confirmé 🎉");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec du paiement");
      setStep("phone");
    } finally {
      setLoading(false);
    }
  }

  function finish() {
    const slug = ebook?.slug;
    closePurchase();
    if (slug) setView({ name: "reader", ebookId: slug });
  }

  return (
    <Dialog open={!!purchaseEbookId} onOpenChange={(o) => { if (!o) closePurchase(); }}>
      <DialogContent className="max-w-md overflow-hidden border-border bg-card p-0">
        <AnimatePresence mode="wait">
          {step === "method" && (
            <motion.div key="method" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DialogHeader className="px-6 pt-6">
                <DialogTitle className="flex items-center gap-2 font-heading text-xl">
                  <ShieldCheck className="h-5 w-5 text-primary" /> Paiement sécurisé
                </DialogTitle>
                <DialogDescription>Choisissez votre moyen de paiement</DialogDescription>
              </DialogHeader>

              {ebook && (
                <div className="mx-6 mt-4 flex items-center gap-3 rounded-xl border border-border bg-background/60 p-3">
                  <div className="h-14 w-10 flex-shrink-0 rounded" style={{ background: ebook.coverColor }} />
                  <div className="flex-1">
                    <p className="line-clamp-1 text-sm font-600 text-foreground">{ebook.title}</p>
                    <p className="text-xs text-muted-foreground">{ebook.creator.displayName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-heading text-lg font-600 text-foreground">{formatFCFA(ebook.price)}</p>
                    {ebook.compareAtPrice && (
                      <p className="text-xs text-muted-foreground line-through">{formatFCFA(ebook.compareAtPrice)}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2 px-6 py-5">
                {PAYMENT_METHODS.map((m) => {
                  const Icon = m.id === "CARD" ? CreditCard : Smartphone;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border p-3 transition-all ${
                        method === m.id
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-lg"
                        style={{ background: m.color, color: m.text }}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="flex-1 text-left text-sm font-500 text-foreground">{m.label}</span>
                      {method === m.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Coupon input */}
              <div className="px-6 pb-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-xl border border-primary/40 bg-primary/5 p-3">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-600 text-foreground">{couponCode.toUpperCase()}</p>
                        <p className="text-xs text-primary">-{appliedCoupon.percentOff}% appliqué</p>
                      </div>
                    </div>
                    <button onClick={removeCoupon} className="text-xs text-muted-foreground hover:text-destructive">Retirer</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Code promo"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="font-mono uppercase"
                      onKeyDown={(e) => { if (e.key === "Enter") validateCoupon(); }}
                    />
                    <Button variant="outline" size="sm" onClick={validateCoupon} disabled={validating || !couponCode.trim()}>
                      {validating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Appliquer"}
                    </Button>
                  </div>
                )}
              </div>

              <div className="border-t border-border bg-muted/40 px-6 py-4">
                {appliedCoupon ? (
                  <div className="mb-3 space-y-1 text-sm">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Sous-total</span>
                      <span className="line-through">{ebook ? formatFCFA(ebook.price) : " - "}</span>
                    </div>
                    <div className="flex items-center justify-between text-primary">
                      <span>Réduction (-{appliedCoupon.percentOff}%)</span>
                      <span>-{formatFCFA(ebook ? ebook.price - appliedCoupon.discountedPrice : 0)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-1">
                      <span className="font-600 text-foreground">Total à payer</span>
                      <span className="font-heading text-xl font-600 text-foreground">{formatFCFA(finalPrice)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total à payer</span>
                    <span className="font-heading text-xl font-600 text-foreground">
                      {ebook ? formatFCFA(ebook.price) : " - "}
                    </span>
                  </div>
                )}
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setStep("phone")}
                >
                  Continuer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="mt-2 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                  <Lock className="h-3 w-3" /> Transaction chiffrée · Aucune donnée bancaire stockée
                </p>
              </div>
            </motion.div>
          )}

          {step === "phone" && (
            <motion.div key="phone" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <DialogHeader className="px-6 pt-6">
                <DialogTitle className="font-heading text-xl">Numéro {PAYMENT_METHODS.find((m) => m.id === method)?.label}</DialogTitle>
                <DialogDescription>
                  Un code de confirmation vous sera envoyé sur ce numéro.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 px-6 py-5">
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Numéro de téléphone</Label>
                  <Input
                    id="phone"
                    placeholder="+237 6•• ••• •••"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-11"
                    autoFocus
                  />
                </div>

                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <p className="text-xs font-600 text-foreground">Récapitulatif</p>
                  <div className="mt-1.5 space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Ebook</span>
                      <span className="text-foreground">{ebook ? formatFCFA(finalPrice) : " - "}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-primary">
                        <span>Coupon (-{appliedCoupon.percentOff}%)</span>
                        <span>-{formatFCFA(ebook ? ebook.price - finalPrice : 0)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Frais de traitement</span>
                      <span className="text-foreground">{formatFCFA(0)}</span>
                    </div>
                    <div className="mt-1 flex justify-between border-t border-border pt-1.5">
                      <span className="font-600 text-foreground">Total</span>
                      <span className="font-heading font-600 text-foreground">{ebook ? formatFCFA(finalPrice) : " - "}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-accent/15 p-3 text-xs text-foreground">
                  <Fingerprint className="mb-1 h-4 w-4 text-primary" />
                  Chaque page de votre ebook portera votre nom et email. Le partage est interdit et traçable.
                </div>
              </div>

              <div className="flex gap-2 border-t border-border px-6 py-4">
                <Button variant="outline" className="flex-1" onClick={() => setStep("method")}>
                  Retour
                </Button>
                <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={pay}>
                  Payer {ebook ? formatFCFA(finalPrice) : ""}
                </Button>
              </div>
            </motion.div>
          )}

          {step === "processing" && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6 py-16 text-center">
              <div className="relative mx-auto h-20 w-20">
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Smartphone className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="mt-5 font-heading text-lg font-600 text-foreground">
                Confirmation en cours…
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Validez la notification {PAYMENT_METHODS.find((m) => m.id === method)?.label} sur votre téléphone.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                En attente de votre validation
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="px-6 py-10 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary"
              >
                <Check className="h-8 w-8 text-primary-foreground" strokeWidth={3} />
              </motion.div>
              <h3 className="mt-4 font-heading text-xl font-600 text-foreground">
                <PartyPopper className="mr-1 inline h-5 w-5 text-accent" />
                Paiement confirmé !
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Votre ebook a été ajouté à votre bibliothèque.
              </p>
              {ebook && (
                <div className="mt-4 rounded-xl border border-border bg-background/60 p-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-9 rounded" style={{ background: ebook.coverColor }} />
                    <div>
                      <p className="text-sm font-600 text-foreground">{ebook.title}</p>
                      <Badge className="mt-1 bg-primary/15 text-foreground hover:bg-primary/15">
                        <Fingerprint className="mr-1 h-3 w-3 text-primary" /> Licence personnelle active
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-5 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => { closePurchase(); setView({ name: "library" }); }}>
                  <BookOpen className="mr-1.5 h-4 w-4" /> Ma bibliothèque
                </Button>
                <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={finish}>
                  <Check className="mr-1.5 h-4 w-4" /> Lire maintenant
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
