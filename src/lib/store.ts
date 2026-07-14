"use client";

import { create } from "zustand";
import type { SessionUser, View } from "./types";
import type { Lang } from "./i18n";
import { translations, type TranslationKey } from "./i18n";

interface AppState {
  // view router
  view: View;
  history: View[];
  setView: (v: View) => void;
  goBack: () => void;

  // session
  user: SessionUser | null;
  loadingUser: boolean;
  setUser: (u: SessionUser | null) => void;
  setLoadingUser: (b: boolean) => void;
  refreshUser: () => Promise<void>;

  // auth modal
  authModalOpen: boolean;
  authMode: "login" | "register" | "register-creator";
  openAuth: (mode?: "login" | "register" | "register-creator") => void;
  closeAuth: () => void;

  // purchase modal
  purchaseEbookId: string | null;
  openPurchase: (ebookId: string) => void;
  closePurchase: () => void;

  // mobile nav
  mobileNavOpen: boolean;
  setMobileNav: (b: boolean) => void;

  // toast/sonner handled separately

  // language
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

export const useApp = create<AppState>((set, get) => ({
  view: { name: "landing" },
  history: [],
  setView: (v) => {
    const prev = get().view;
    set({ view: v, history: [...get().history, prev].slice(-20) });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  },
  goBack: () => {
    const h = [...get().history];
    const prev = h.pop();
    if (prev) set({ view: prev, history: h });
    else set({ view: { name: "landing" } });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  },

  user: null,
  loadingUser: true,
  setUser: (u) => set({ user: u }),
  setLoadingUser: (b) => set({ loadingUser: b }),
  refreshUser: async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user ?? null, loadingUser: false });
      } else {
        set({ user: null, loadingUser: false });
      }
    } catch {
      set({ user: null, loadingUser: false });
    }
  },

  authModalOpen: false,
  authMode: "login" as "login" | "register" | "register-creator",
  openAuth: (mode = "login") => {
    // Navigate to the dedicated auth page instead of opening a modal
    set({ authMode: mode });
    get().setView({ name: "auth", mode });
  },
  closeAuth: () => set({ authModalOpen: false }),

  purchaseEbookId: null,
  openPurchase: (ebookId) => set({ purchaseEbookId: ebookId }),
  closePurchase: () => set({ purchaseEbookId: null }),

  mobileNavOpen: false,
  setMobileNav: (b) => set({ mobileNavOpen: b }),

  lang: "fr" as Lang,
  setLang: (l) => {
    set({ lang: l });
    if (typeof window !== "undefined") localStorage.setItem("krea-lang", l);
  },
  t: (key) => translations[get().lang][key] || key,
}));
