"use client";

import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Check, Sparkles, ArrowRight, ShieldCheck, Wallet, BookOpen, Globe, Users } from "lucide-react";
import { formatFCFA } from "@/lib/format";
import { motion } from "framer-motion";

const PLANS = [
  {
    name: "Découverte",
    price: 0,
    period: "Gratuit pour toujours",
    tag: "Pour tester",
    commission: "25% de commission",
    color: "#697E6E",
    features: [
      "Jusqu'à 3 ebooks publiés",
      "Page de librairie standard (krea.com/votre-nom)",
      "Lecteur sécurisé avec watermark",
      "Paiement Mobile Money (MTN, Orange, Wave)",
      "Wallet & retraits dès 10 000 F",
      "Statistiques de base",
      "Watermark social",
    ],
    excluded: ["Coupons & codes promo", "Affiliation", "Analytics avancés", "Support prioritaire"],
    cta: "Commencer gratuitement",
  },
  {
    name: "Pro",
    price: 7500,
    period: "par mois",
    tag: "Le plus populaire",
    commission: "15% de commission",
    color: "#5DBE8A",
    features: [
      "Ebooks illimités",
      "Page de vente personnalisée",
      "Coupons & codes promo illimités",
      "Affiliation automatique (20% aux affiliés)",
      "Analytics avancés & exports",
      "Retrait prioritaire (24h)",
      "Tous les modes de watermark",
      "Support sous 24h",
    ],
    excluded: ["Domaine personnalisé", "Marque blanche"],
    cta: "Passer Pro",
    highlighted: true,
  },
  {
    name: "Premium",
    price: 25000,
    period: "par mois",
    tag: "Pros & maisons d'édition",
    commission: "8% de commission",
    color: "#C8553D",
    features: [
      "Tout le plan Pro inclus",
      "Domaine personnalisé (votre-site.com)",
      "Email marketing intégré",
      "Mise en avant mensuelle sur la marketplace",
      "Comptes équipe & assistants (5 sièges)",
      "Marque blanche complète",
      "API & webhooks",
      "Support prioritaire dédié",
    ],
    excluded: [],
    cta: "Contacter l'équipe",
  },
];

const FAQ = [
  { q: "Comment fonctionne la commission ?", a: "Sur chaque vente, Krea prélève un pourcentage (25%, 15% ou 8% selon votre plan). Le reste arrive instantanément dans votre wallet. Vous retirez quand vous voulez, dès 10 000 F." },
  { q: "Puis-je changer de plan à tout moment ?", a: "Oui. Vous pouvez upgrader ou downgrader à tout moment. Le changement s'applique au cycle de facturation suivant." },
  { q: "Quels moyens de paiement sont supportés ?", a: "MTN Mobile Money, Orange Money, Wave, et carte bancaire (Visa/Mastercard) via Paystack. Les retraits se font sur Mobile Money ou virement bancaire." },
  { q: "L'ebook est-il vraiment protégé ?", a: "Aucune protection n'est absolue. Mais Krea combine watermark social (nom + email visibles), aplatissement des pages (image), stéganographie invisible et limite d'appareils. Partager votre ebook devient risqué, pas votre business." },
  { q: "Y a-t-il des frais cachés ?", a: "Non. Vous voyez la commission, les frais de retrait (2%, min 200 F) et le prix de votre abonnement. Pas de frais d'installation, pas de frais par ebook." },
  { q: "Puis-je vendre autre chose que des ebooks ?", a: "Pour l'instant Krea est focalisé sur les ebooks. Les formations vidéo et l'audio arriveront en 2026." },
];

export function PricingView() {
  const { openAuth } = useApp();
  return (
    <div className="bg-background">
      <div className="relative overflow-hidden border-b border-border bg-card/60">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-0 h-60 w-60 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute right-0 top-10 h-60 w-60 rounded-full bg-accent/15 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-600 leading-tight text-foreground sm:text-5xl">
            Payez quand vous gagnez
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Commencez gratuitement. Montez en gamme quand vos ventes décollent. La commission baisse à chaque palier.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {PLANS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={`relative flex h-full flex-col p-7 ${p.highlighted ? "border-primary shadow-xl shadow-primary/10 lg:-mt-4" : ""}`}>
                {p.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground shadow-md">{p.tag}</Badge>
                  </div>
                )}
                {!p.highlighted && <span className="text-xs font-500 text-muted-foreground">{p.tag}</span>}
                <h3 className="mt-1 font-heading text-2xl font-600 text-foreground">{p.name}</h3>
                <div className="mt-3">
                  <span className="font-heading text-4xl font-600 text-foreground">
                    {p.price === 0 ? "Gratuit" : formatFCFA(p.price)}
                  </span>
                  <span className="ml-1 text-sm text-muted-foreground">{p.price > 0 && "/ mois"}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{p.period}</p>
                <p className="mt-3 rounded-md py-1.5 text-center text-sm font-600 text-primary" style={{ background: p.color + "22" }}>
                  {p.commission}
                </p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground/80">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                  {p.excluded.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground/50 line-through">
                      <span className="mt-0.5 h-4 w-4 flex-shrink-0 text-center">×</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`mt-6 ${p.highlighted ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-border bg-background text-foreground hover:bg-muted"}`}
                  variant={p.highlighted ? "default" : "outline"}
                  onClick={() => openAuth("register-creator")}
                >
                  {p.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* comparison strip */}
        <div className="mt-16">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ShieldCheck, title: "Protection incluse", desc: "Watermark social, aplatissement, stéganographie : sur tous les plans." },
              { icon: Wallet, title: "Wallet temps réel", desc: "Vos ventes tombent instantanément. Retrait dès 10 000 F en 24h." },
              { icon: BookOpen, title: "Éditeur intégré", desc: "Écrivez chapitre par chapitre, sans logiciel externe." },
              { icon: Globe, title: "Mobile Money", desc: "MTN, Orange, Wave. FCFA sans conversion." },
            ].map((f) => (
              <Card key={f.title} className="p-5">
                <f.icon className="h-6 w-6 text-primary" />
                <h4 className="mt-2 font-heading text-sm font-600">{f.title}</h4>
                <p className="mt-1 text-xs text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <h2 className="text-center font-heading text-3xl font-600 text-foreground">Questions fréquentes</h2>
          <div className="mx-auto mt-8 max-w-3xl space-y-3">
            {FAQ.map((item) => (
              <details key={item.q} className="group rounded-xl border border-border bg-card p-4">
                <summary className="flex cursor-pointer items-center justify-between font-heading text-base font-600 text-foreground">
                  {item.q}
                  <span className="ml-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => openAuth("register-creator")}>
            Créer ma librairie gratuitement
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">Aucune carte requise · Première vente possible aujourd'hui</p>
        </div>
      </div>
    </div>
  );
}
