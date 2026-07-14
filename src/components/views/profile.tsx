"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  User as UserIcon,
  Save,
  Loader2,
  ShieldCheck,
  Globe,
  Phone,
  Mail,
  Sparkles,
  Store,
  Check,
  Link2,
  Copy,
  TrendingUp,
  Wallet,
  BookOpen,
} from "lucide-react";
import { formatFCFA } from "@/lib/format";
import { toast } from "sonner";
import { motion } from "framer-motion";
import type { CreatorProfile } from "@/lib/types";

export function ProfileView() {
  const { setView, user, refreshUser } = useApp();
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("CM");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [tagline, setTagline] = useState("");
  const [bannerColor, setBannerColor] = useState("#1F4A2E");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/creator/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) {
          setProfile(d.profile);
          setName(d.profile.name ?? "");
          setPhone(d.profile.phone ?? "");
          setCountry(d.profile.country ?? "CM");
          if (d.profile.creator) {
            setDisplayName(d.profile.creator.displayName ?? "");
            setBio(d.profile.creator.bio ?? "");
            setTagline(d.profile.creator.tagline ?? "");
            setBannerColor(d.profile.creator.bannerColor ?? "#1F4A2E");
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/creator/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          country,
          creator: profile?.creator ? { displayName, bio, tagline, bannerColor } : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await refreshUser();
      toast.success("Profil mis à jour ✓");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Échec");
    } finally {
      setSaving(false);
    }
  }

  function copyStoreUrl() {
    if (!profile?.creator?.slug) return;
    const url = `${window.location.origin}/?store=${profile.creator.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Lien de votre librairie copié 📋");
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  const isCreator = !!profile.creator;

  return (
    <div className="bg-background">
      {/* Banner */}
      <div className="relative h-40 overflow-hidden bg-[#1F4A2E] sm:h-52">
        <div className="absolute inset-0">
          <div className="absolute -left-20 top-0 h-60 w-60 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-60 w-60 rounded-full bg-accent/20 blur-3xl" />
        </div>
        <button
          onClick={() => setView({ name: "landing" })}
          className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1.5 text-sm text-white backdrop-blur hover:bg-black/30"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Profile header */}
        <div className="-mt-14 flex flex-col items-start gap-4 sm:flex-row sm:items-end">
          <Avatar className="h-28 w-28 border-4 border-background shadow-xl">
            <AvatarFallback className="bg-primary text-4xl font-heading text-primary-foreground">
              {(displayName || name || profile.email)[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 pb-2">
            <h1 className="font-heading text-2xl font-600 text-foreground">{displayName || name || profile.email}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {profile.email}</span>
              {profile.creator?.verified && (
                <Badge className="bg-primary/15 text-foreground hover:bg-primary/15">
                  <ShieldCheck className="mr-1 h-3 w-3 text-primary" /> Vérifié
                </Badge>
              )}
              {isCreator && (
                <Badge className="bg-accent/30 text-foreground">
                  <Sparkles className="mr-1 h-3 w-3" /> Plan {profile.creator.plan}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Quick stats for creators */}
        {isCreator && profile.creator && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatBox icon={BookOpen} label="Ebooks" value={String(profile.creator.totalSales > 0 ? "—" : "0")} />
            <StatBox icon={TrendingUp} label="Ventes" value={String(profile.creator.totalSales)} />
            <StatBox icon={Wallet} label="Revenus" value={formatFCFA(profile.creator.totalRevenue)} />
            <StatBox icon={Wallet} label="Solde" value={formatFCFA(profile.creator.walletBalance)} />
          </div>
        )}

        {/* Store link */}
        {isCreator && profile.creator && (
          <Card className="mt-6 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Store className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-600 text-foreground">Votre librairie publique</p>
                <p className="text-xs text-muted-foreground">krea.com/{profile.creator.slug}</p>
              </div>
              <Button variant="outline" size="sm" onClick={copyStoreUrl}>
                {copied ? <Check className="mr-1 h-3.5 w-3.5 text-primary" /> : <Copy className="mr-1 h-3.5 w-3.5" />}
                {copied ? "Copié" : "Copier le lien"}
              </Button>
            </div>
          </Card>
        )}

        {/* Edit form */}
        <Card className="mt-6 p-6">
          <h2 className="mb-5 flex items-center gap-2 font-heading text-lg font-600 text-foreground">
            <UserIcon className="h-5 w-5 text-primary" /> Informations personnelles
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nom complet</Label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="pl-9" placeholder="Votre nom" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" value={profile.email} disabled className="pl-9 bg-muted/50" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Téléphone</Label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-9" placeholder="+237 6•• ••• •••" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="country">Pays</Label>
              <div className="relative">
                <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="CM">Cameroun</option>
                  <option value="SN">Sénégal</option>
                  <option value="CI">Côte d'Ivoire</option>
                  <option value="NG">Nigeria</option>
                  <option value="ML">Mali</option>
                  <option value="BF">Burkina Faso</option>
                  <option value="FR">France</option>
                  <option value="BE">Belgique</option>
                  <option value="CA">Canada</option>
                </select>
              </div>
            </div>
          </div>

          {isCreator && (
            <>
              <div className="my-5 border-t border-border" />
              <h3 className="mb-3 font-heading text-base font-600 text-foreground">Profil créateur</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="displayName">Nom de la librairie</Label>
                  <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Aïcha Diallo" />
                  <p className="text-[11px] text-muted-foreground">Affiché sur votre page de librairie et vos ebooks.</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Présentez-vous en quelques lignes. Votre expertise, votre histoire, ce que vous enseignez…"
                    className="min-h-[100px]"
                  />
                  <p className="text-[11px] text-muted-foreground">{bio.length}/500 caractères</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tagline">Slogan / Tagline</Label>
                  <Input
                    id="tagline"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Ex: Transformez votre savoir en business digital"
                    maxLength={100}
                  />
                  <p className="text-[11px] text-muted-foreground">Affiché en grand sur votre page de librairie.</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Couleur de la bannière</Label>
                  <div className="flex flex-wrap gap-2">
                    {["#1F4A2E", "#5DBE8A", "#C8553D", "#697E6E", "#FFD86B", "#2E5C8A", "#8B5A3C"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setBannerColor(c)}
                        className={`h-9 w-9 rounded-full border-2 transition-transform hover:scale-110 ${bannerColor === c ? "border-foreground" : "border-transparent"}`}
                        style={{ background: c }}
                      >
                        {bannerColor === c && <Check className="mx-auto h-4 w-4 text-white" />}
                      </button>
                    ))}
                  </div>
                  {/* Live preview */}
                  <div className="mt-2 overflow-hidden rounded-lg" style={{ background: bannerColor }}>
                    <div className="p-4 text-white">
                      <p className="font-heading text-sm font-600">{displayName || "Votre nom"}</p>
                      <p className="text-xs opacity-80">{tagline || "Votre slogan apparaîtra ici"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="mt-6 flex justify-end">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Enregistrer
            </Button>
          </div>
        </Card>

        {/* Plan card with upgrade */}
        {isCreator && profile.creator && (
          <PlanUpgradeCard
            currentPlan={profile.creator.plan}
            commissionRate={profile.creator.commissionRate}
            onUpgraded={() => {
              fetch("/api/creator/profile")
                .then((r) => r.json())
                .then((d) => { if (d.profile) setProfile(d.profile); });
            }}
          />
        )}

        <div className="h-8" />
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card className="p-4">
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-1.5 font-heading text-lg font-600 text-foreground leading-none">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </Card>
  );
}

const PLAN_INFO: Record<string, { label: string; price: string; rate: number; features: string[] }> = {
  FREE: { label: "Découverte", price: "Gratuit", rate: 25, features: ["3 ebooks max", "Watermark social", "Statistiques de base"] },
  PRO: { label: "Pro", price: "7 500 F/mois", rate: 15, features: ["Ebooks illimités", "Coupons & affiliation", "Analytics avancés", "Retrait prioritaire"] },
  PREMIUM: { label: "Premium", price: "25 000 F/mois", rate: 8, features: ["Tout Pro inclus", "Domaine personnalisé", "Email marketing", "Marque blanche", "Support prioritaire"] },
};

function PlanUpgradeCard({
  currentPlan,
  commissionRate,
  onUpgraded,
}: {
  currentPlan: string;
  commissionRate: number;
  onUpgraded: () => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  async function upgrade(plan: string) {
    setLoading(plan);
    try {
      const res = await fetch("/api/creator/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Plan ${PLAN_INFO[plan]?.label} activé 🎉`);
      onUpgraded();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Échec");
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card className="mt-6 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 font-heading text-lg font-600 text-foreground">
            <Sparkles className="h-5 w-5 text-accent" /> Votre abonnement
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Plan actuel : <strong>{PLAN_INFO[currentPlan]?.label ?? currentPlan}</strong> · Commission plateforme {commissionRate}%
          </p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {Object.entries(PLAN_INFO).map(([key, info]) => {
          const isCurrent = key === currentPlan;
          const isUpgrade = PLAN_INFO[key].rate < commissionRate;
          return (
            <div
              key={key}
              className={`relative rounded-xl border p-4 transition-all ${
                isCurrent
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background/50 hover:border-primary/40"
              }`}
            >
              {isCurrent && (
                <Badge className="absolute -top-2 right-3 bg-primary text-primary-foreground">
                  Actuel
                </Badge>
              )}
              <p className="font-heading text-base font-600 text-foreground">{info.label}</p>
              <p className="mt-0.5 text-sm font-500 text-primary">{info.price}</p>
              <p className="mt-1 text-xs text-muted-foreground">Commission {info.rate}%</p>
              <ul className="mt-3 space-y-1">
                {info.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-[11px] text-foreground/70">
                    <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              {!isCurrent && (
                <Button
                  size="sm"
                  className={`mt-3 w-full ${isUpgrade ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-background border border-border text-foreground hover:bg-muted"}`}
                  variant={isUpgrade ? "default" : "outline"}
                  disabled={loading !== null}
                  onClick={() => upgrade(key)}
                >
                  {loading === key && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />}
                  {isUpgrade ? "Améliorer" : "Revenir à ce plan"}
                </Button>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-3 rounded-lg bg-accent/15 p-2.5 text-center text-[11px] text-muted-foreground">
        💡 Baisser votre commission augmente vos revenus sur chaque vente. Le changement est immédiat.
      </p>
    </Card>
  );
}
