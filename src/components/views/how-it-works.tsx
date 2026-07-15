"use client";

import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Users,
  PenLine,
  Smartphone,
  Wallet,
  ShieldCheck,
  BookOpen,
  TrendingUp,
  Fingerprint,
  Lock,
  Eye,
  Check,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

const STEPS = [
  { n: 1, icon: Users, title: "Créez votre compte créateur", desc: "Inscription gratuite en 1 minute. Vous obtenez immédiatement votre page de librairie : krea.com/votre-nom.", details: ["Profil personnalisable", "Sous-domaine gratuit", "Photo de profil + bannière"] },
  { n: 2, icon: PenLine, title: "Écrivez ou importez votre ebook", desc: "Utilisez l'éditeur intégré pour écrire chapitre par chapitre. Ou importez votre texte existant.", details: ["Éditeur Markdown enrichi", "Couverture générée", "Aperçu en temps réel"] },
  { n: 3, icon: ShieldCheck, title: "Choisissez vos options de protection", desc: "Watermark social, aplatissement, stéganographie, limite d'appareils. Vous décidez du niveau.", details: ["Watermark personnalisé", "Limite d'appareils", "Lecteur web sécurisé"] },
  { n: 4, icon: Smartphone, title: "Partagez votre page de vente", desc: "Un lien unique, optimisé pour le mobile 3G. Partagez-le sur WhatsApp, Facebook, Instagram.", details: ["Page optimisée mobile", "Lien court", "Partage WhatsApp"] },
  { n: 5, icon: Wallet, title: "Encaissez par Mobile Money", desc: "Vos clients paient par MTN, Orange, Wave ou carte. L'argent tombe dans votre wallet Krea.", details: ["4 moyens de paiement", "Wallet temps réel", "Commission transparente"] },
  { n: 6, icon: TrendingUp, title: "Retirez et mesurez", desc: "Retirez vos gains dès 10 000 F. Suivez vos ventes, vos lecteurs, vos meilleurs ebooks.", details: ["Retrait 24h", "Analytics détaillés", "Export comptable"] },
];

const COMPARISON = [
  { feature: "Lecteur sécurisé intégré", krea: true, selar: false, gumroad: false },
  { feature: "Watermark social sur chaque page", krea: true, selar: false, gumroad: false },
  { feature: "Paiement Mobile Money (MTN, Orange, Wave)", krea: true, selar: true, gumroad: false },
  { feature: "Éditeur d'ebook intégré", krea: true, selar: false, gumroad: false },
  { feature: "Wallet & retraits en FCFA", krea: true, selar: false, gumroad: false },
  { feature: "Page de librairie personnalisée", krea: true, selar: true, gumroad: true },
  { feature: "Affiliation automatique", krea: true, selar: true, gumroad: false },
  { feature: "Limite d'appareils anti-partage", krea: true, selar: false, gumroad: false },
  { feature: "Support en français", krea: true, selar: true, gumroad: false },
];

export function HowItWorksView() {
  const { openAuth, setView } = useApp();
  return (
    <div className="bg-background">
      <div className="relative overflow-hidden border-b border-border bg-card/60">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-0 h-60 w-60 rounded-full bg-primary/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-600 leading-tight text-foreground sm:text-5xl">
            De l'idée à la vente en 6 étapes
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Krea est pensé pour que vous passiez moins de temps sur la technique et plus de temps à créer.
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative">
          <div className="absolute left-7 top-0 h-full w-px bg-border lg:left-1/2" />
          <div className="space-y-8">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className={`relative flex gap-6 ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"}`}
              >
                <div className="relative z-10 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background font-heading text-lg font-600 text-primary shadow-sm">
                  {s.n}
                </div>
                <Card className="flex-1 p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <s.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-heading text-lg font-600 text-foreground">{s.title}</h3>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {s.details.map((d) => (
                      <li key={d} className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">
                        <Check className="h-3 w-3" /> {d}
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div className="bg-card/40 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-600 text-foreground">La différence Krea</h2>
            <p className="mt-2 text-muted-foreground">Tout en une plateforme. Pas de PDF téléchargeable nu, pas de retrait en 5 jours.</p>
          </div>
          <Card className="mt-8 overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="p-4 text-left font-500 text-muted-foreground">Fonctionnalité</th>
                  <th className="p-4 text-center font-heading text-base font-600 text-primary">Krea</th>
                  <th className="p-4 text-center font-500 text-muted-foreground">Selar</th>
                  <th className="p-4 text-center font-500 text-muted-foreground">Gumroad</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.feature} className="border-b border-border/50">
                    <td className="p-4 text-foreground/80">{row.feature}</td>
                    <td className="p-4 text-center">
                      {row.krea ? <Check className="mx-auto h-5 w-5 text-primary" /> : <span className="text-muted-foreground/30"> - </span>}
                    </td>
                    <td className="p-4 text-center">
                      {row.selar ? <Check className="mx-auto h-5 w-5 text-foreground/40" /> : <span className="text-muted-foreground/30"> - </span>}
                    </td>
                    <td className="p-4 text-center">
                      {row.gumroad ? <Check className="mx-auto h-5 w-5 text-foreground/40" /> : <span className="text-muted-foreground/30"> - </span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-[#1F4A2E] px-6 py-12 text-center" style={{ color: "#FBF5E3" }}>
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-primary/30 blur-3xl" />
          </div>
          <div className="relative">
            <h2 className="font-heading text-3xl font-600 sm:text-4xl" style={{ color: "#FBF5E3" }}>Prêt à lancer votre librairie ?</h2>
            <p className="mx-auto mt-3 max-w-md" style={{ color: "rgba(251,245,227,0.75)" }}>
              Inscription gratuite. Première vente possible aujourd'hui. Aucune compétence technique requise.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => openAuth("register-creator")}>
                Créer ma librairie <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-primary/40 bg-transparent hover:bg-primary/10" style={{ color: "#FBF5E3" }} onClick={() => setView({ name: "marketplace" })}>
                Explorer la marketplace
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
