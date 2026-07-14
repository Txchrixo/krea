"use client";

import { useApp } from "@/lib/store";
import { Mail, MessageCircle, Instagram, Twitter, Send, ShieldCheck, BookOpen, Wallet, Sparkles } from "lucide-react";
import { LangSwitcher } from "./lang-switcher";

export function Footer() {
  const { setView, openAuth, t } = useApp();

  return (
    <footer className="relative z-50 mt-auto border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <span className="font-heading text-2xl font-600 tracking-tight text-foreground">
              Krea
            </span>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              {t("footer.tagline")}
            </p>
            <div className="mt-5 flex gap-2">
              {[
                { icon: Mail, label: "Email" },
                { icon: MessageCircle, label: "WhatsApp" },
                { icon: Instagram, label: "Instagram" },
                { icon: Twitter, label: "Twitter" },
                { icon: Send, label: "Telegram" },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground/70 transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-heading text-sm font-600 text-foreground">{t("footer.explore")}</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><button onClick={() => setView({ name: "marketplace" })} className="hover:text-primary">{t("footer.marketplace")}</button></li>
              <li><button onClick={() => setView({ name: "marketplace", category: "Business" })} className="hover:text-primary">Business</button></li>
              <li><button onClick={() => setView({ name: "marketplace", category: "Spiritual" })} className="hover:text-primary">{t("footer.spirituality")}</button></li>
              <li><button onClick={() => setView({ name: "marketplace", category: "DevPerso" })} className="hover:text-primary">{t("footer.devPerso")}</button></li>
              <li><button onClick={() => setView({ name: "marketplace", category: "Cuisine" })} className="hover:text-primary">{t("footer.cuisine")}</button></li>
            </ul>
          </div>

          {/* Creators */}
          <div>
            <h4 className="font-heading text-sm font-600 text-foreground">{t("footer.creators")}</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><button onClick={() => openAuth("register")} className="hover:text-primary">{t("nav.becomeCreator")}</button></li>
              <li><button onClick={() => setView({ name: "pricing" })} className="hover:text-primary">{t("footer.pricing")}</button></li>
              <li><button onClick={() => setView({ name: "how-it-works" })} className="hover:text-primary">{t("footer.howItWorks")}</button></li>
              <li><button onClick={() => setView({ name: "editor" })} className="hover:text-primary">{t("footer.editor")}</button></li>
              <li><button onClick={() => setView({ name: "dashboard" })} className="hover:text-primary">{t("nav.dashboard")}</button></li>
            </ul>
          </div>

          {/* Trust */}
          <div>
            <h4 className="font-heading text-sm font-600 text-foreground">{t("footer.trust")}</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> {t("footer.watermark")}</li>
              <li className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 text-primary" /> {t("footer.reader")}</li>
              <li className="flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5 text-primary" /> {t("footer.wallet")}</li>
              <li className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-primary" /> {t("footer.mobile")}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Krea. {t("footer.rights")}</p>
          <div className="flex items-center gap-4">
            <button className="hover:text-primary">{t("footer.terms")}</button>
            <button className="hover:text-primary">{t("footer.privacy")}</button>
            <button className="hover:text-primary">DMCA</button>
            <LangSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}
