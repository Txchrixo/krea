"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check as CheckIcon, ChevronsUpDown, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
  ShieldCheck,
  BookOpen,
  Wallet,
  BookOpenCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "register";

const COUNTRIES = [
  { code: "CM", label: "Cameroun", labelEn: "Cameroon", dial: "+237", flag: "🇨🇲" },
  { code: "SN", label: "Sénégal", labelEn: "Senegal", dial: "+221", flag: "🇸🇳" },
  { code: "CI", label: "Côte d'Ivoire", labelEn: "Ivory Coast", dial: "+225", flag: "🇨🇮" },
  { code: "NG", label: "Nigeria", labelEn: "Nigeria", dial: "+234", flag: "🇳🇬" },
  { code: "ML", label: "Mali", labelEn: "Mali", dial: "+223", flag: "🇲🇱" },
  { code: "BF", label: "Burkina Faso", labelEn: "Burkina Faso", dial: "+226", flag: "🇧🇫" },
  { code: "FR", label: "France", labelEn: "France", dial: "+33", flag: "🇫🇷" },
  { code: "BE", label: "Belgique", labelEn: "Belgium", dial: "+32", flag: "🇧🇪" },
  { code: "CA", label: "Canada", labelEn: "Canada", dial: "+1", flag: "🇨🇦" },
  { code: "CD", label: "RD Congo", labelEn: "DR Congo", dial: "+243", flag: "🇨🇩" },
  { code: "CG", label: "Congo", labelEn: "Congo", dial: "+242", flag: "🇨🇬" },
  { code: "GA", label: "Gabon", labelEn: "Gabon", dial: "+241", flag: "🇬🇦" },
  { code: "TG", label: "Togo", labelEn: "Togo", dial: "+228", flag: "🇹🇬" },
  { code: "BJ", label: "Bénin", labelEn: "Benin", dial: "+229", flag: "🇧🇯" },
  { code: "NE", label: "Niger", labelEn: "Niger", dial: "+227", flag: "🇳🇪" },
  { code: "MA", label: "Maroc", labelEn: "Morocco", dial: "+212", flag: "🇲🇦" },
  { code: "DZ", label: "Algérie", labelEn: "Algeria", dial: "+213", flag: "🇩🇿" },
  { code: "TN", label: "Tunisie", labelEn: "Tunisia", dial: "+216", flag: "🇹🇳" },
] as const;

export function AuthView() {
  const { view, setView, refreshUser, lang, setLang, t } = useApp();
  const [mode, setMode] = useState<AuthMode>(
    view.name === "auth" && view.mode === "register" ? "register" : "login"
  );
  const [role, setRole] = useState<"BUYER" | "CREATOR">("BUYER");
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    country: "CM",
  });

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  // load saved lang from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("krea-lang");
      if (saved === "en" || saved === "fr") setLang(saved);
    }
  }, [setLang]);

  const countryLabel = (code: string) => {
    const c = COUNTRIES.find((c) => c.code === code);
    return lang === "en" ? c?.labelEn : c?.label;
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode !== "login" && !acceptedTerms) {
      toast.error(t("auth.toast.terms"));
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || t("auth.toast.invalid"));
        await refreshUser();
        toast.success(`${t("auth.toast.welcome")}, ${data.user?.name ?? data.user?.email} 👋`);
        setView({ name: "landing" });
      } else {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, role }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || t("auth.toast.error"));
        await refreshUser();
        toast.success(t("auth.toast.created"));
        setView(role === "CREATOR" ? { name: "dashboard" } : { name: "landing" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("auth.toast.error"));
    } finally {
      setLoading(false);
    }
  }

  function quickLogin(email: string, pw: string) {
    setForm((f) => ({ ...f, email, password: pw }));
    setMode("login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left — brand / visual panel with real photo */}
      <div className="relative hidden w-1/2 overflow-hidden bg-[#1F4A2E] lg:block">
        <img
          src="https://sfile.chatglm.cn/images-ppt/66a6160a65c6.jpg"
          alt="Entrepreneuse africaine"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F4A2E] via-[#1F4A2E]/70 to-[#1F4A2E]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1F4A2E]/60 to-transparent" />

        <div className="relative z-10 flex h-full flex-col justify-between p-12 xl:p-16">
          {/* logo */}
          <div className="flex items-center justify-between">
            <button onClick={() => setView({ name: "landing" })}>
              <span className="font-heading text-3xl font-600 text-[#FBF5E3]">Krea</span>
            </button>
          </div>

          {/* tagline */}
          <div className="max-w-md">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-heading text-3xl font-500 leading-snug text-[#FBF5E3] xl:text-4xl"
            >
              {t("auth.tagline")}
              <br />
              <span className="text-primary">Krea</span> {t("auth.tagline2")}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-4 text-[#FBF5E3]/70"
            >
              {t("auth.subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-2"
            >
              {[
                { icon: ShieldCheck, key: "auth.feature.watermark" as const },
                { icon: Wallet, key: "auth.feature.mobile" as const },
                { icon: BookOpenCheck, key: "auth.feature.reader" as const },
              ].map((f) => (
                <span
                  key={f.key}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#FBF5E3]/15 bg-[#FBF5E3]/5 px-3 py-1.5 text-xs font-500 text-[#FBF5E3]/80 backdrop-blur-sm"
                >
                  <f.icon className="h-3.5 w-3.5 text-primary" />
                  {t(f.key)}
                </span>
              ))}
            </motion.div>
          </div>

          {/* footer */}
          <p className="text-xs text-[#FBF5E3]/40">
            © {new Date().getFullYear()} Krea. {t("auth.footer")}
          </p>
        </div>

        <div className="absolute right-0 top-0 z-20 h-full w-8 bg-gradient-to-l from-black/20 to-transparent" />
      </div>

      {/* Right — form panel */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* mobile logo + lang */}
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <button onClick={() => setView({ name: "landing" })}>
              <span className="font-heading text-2xl font-600 tracking-tight text-foreground">
                Krea
              </span>
            </button>
          </div>

          {/* back button */}
          <button
            onClick={() => setView({ name: "landing" })}
            className="mb-8 hidden items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground lg:inline-flex"
          >
            <ArrowLeft className="h-4 w-4" /> {t("auth.back")}
          </button>

          {/* heading */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <h1 className="font-heading text-3xl font-600 text-foreground">
                {mode === "login" ? t("auth.login.title") : t("auth.register.title")}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {mode === "login" ? t("auth.login.desc") : t("auth.register.desc")}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* form */}
          <form onSubmit={submit} className="mt-8 space-y-4">
            {/* Role toggle — only on register, above name field */}
            {mode === "register" && (
              <div className="relative flex h-10 w-full items-stretch overflow-hidden rounded-md border border-border bg-muted/50">
                <motion.div
                  className="absolute top-0 z-0 h-full w-1/2 rounded-md bg-card shadow-sm"
                  animate={{ left: role === "BUYER" ? "0%" : "50%" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
                <button
                  type="button"
                  onClick={() => setRole("BUYER")}
                  className={cn(
                    "relative z-10 flex flex-1 items-center justify-center gap-2 text-sm font-600 transition-colors duration-200",
                    role === "BUYER" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <BookOpenCheck className="h-4 w-4" />
                  {t("auth.role.reader")}
                </button>
                <button
                  type="button"
                  onClick={() => setRole("CREATOR")}
                  className={cn(
                    "relative z-10 flex flex-1 items-center justify-center gap-2 text-sm font-600 transition-colors duration-200",
                    role === "CREATOR" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <BookOpen className="h-4 w-4" />
                  {t("auth.role.creator")}
                </button>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {mode !== "login" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-500 text-muted-foreground">
                      {t("auth.field.name")}
                    </Label>
                    <div className="relative">
                      <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="name"
                        required
                        placeholder={t("auth.field.name.placeholder")}
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                        className="h-10 border-border bg-card pl-10 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-500 text-muted-foreground">
                    {t("auth.field.email")}
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder={t("auth.field.email.placeholder")}
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      className="h-10 border-border bg-card pl-10 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-500 text-muted-foreground">
                    {t("auth.field.password")}
                  </Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      className="h-10 border-border bg-card pl-10 pr-10 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={showPassword ? t("auth.password.hide") : t("auth.password.show")}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {mode !== "login" && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="country" className="text-xs font-500 text-muted-foreground">
                        {t("auth.field.country")}
                      </Label>
                      <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            role="combobox"
                            aria-expanded={countryOpen}
                            aria-controls="country-listbox"
                            className="flex h-10 w-full items-center justify-between gap-2 rounded-md border border-border bg-card px-3 text-sm transition-all hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                          >
                            {form.country ? (
                              <span className="flex items-center gap-2">
                                <span className="text-base">{COUNTRIES.find((c) => c.code === form.country)?.flag}</span>
                                <span className="text-foreground">{countryLabel(form.country)}</span>
                              </span>
                            ) : (
                              <span className="text-muted-foreground">{t("auth.field.country.placeholder")}</span>
                            )}
                            <ChevronsUpDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[var(--radix-popover-trigger-width)] p-0" align="start">
                          <Command>
                            <CommandInput placeholder={t("auth.search.placeholder")} />
                            <CommandList>
                              <CommandEmpty>{t("auth.search.empty")}</CommandEmpty>
                              <CommandGroup>
                                {COUNTRIES.map((c) => (
                                  <CommandItem
                                    key={c.code}
                                    value={`${c.label} ${c.labelEn} ${c.code}`}
                                    onSelect={() => {
                                      set("country", c.code);
                                      setCountryOpen(false);
                                    }}
                                    className="gap-2"
                                  >
                                    <span className="text-base">{c.flag}</span>
                                    <span className="flex-1">{lang === "en" ? c.labelEn : c.label}</span>
                                    {form.country === c.code && (
                                      <CheckIcon className="h-4 w-4 text-primary" />
                                    )}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs font-500 text-muted-foreground">
                        {t("auth.field.phone")}
                      </Label>
                      <div className="flex h-10 w-full items-stretch overflow-hidden rounded-md border border-border bg-card transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                        <span className="inline-flex flex-shrink-0 items-center border-r border-border bg-muted px-3 text-sm font-500 text-muted-foreground">
                          {COUNTRIES.find((c) => c.code === form.country)?.dial}
                        </span>
                        <Input
                          id="phone"
                          placeholder={t("auth.field.phone.placeholder")}
                          value={form.phone}
                          onChange={(e) => set("phone", e.target.value)}
                          className="h-full flex-1 border-0 bg-transparent px-3.5 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {mode !== "login" && (
              <label className="flex cursor-pointer items-center gap-2.5 pt-1">
                <div className="flex-shrink-0">
                  <Checkbox
                    checked={acceptedTerms}
                    onCheckedChange={(v) => setAcceptedTerms(!!v)}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {t("auth.terms")}{" "}
                  <button type="button" className="font-600 text-primary hover:underline">
                    {t("auth.terms.cgu")}
                  </button>{" "}
                  {t("auth.terms.and")}{" "}
                  <button type="button" className="font-600 text-primary hover:underline">
                    {t("auth.terms.privacy")}
                  </button>
                  {" "}{t("auth.terms.of")}
                </span>
              </label>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="group h-10 w-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/30"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {mode === "login" ? t("auth.button.login") : t("auth.button.register")}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>

          {/* mode switcher */}
          <div className="mt-6 flex items-center justify-center gap-1 text-sm">
            {mode === "login" ? (
              <>
                <span className="text-muted-foreground">{t("auth.switch.noaccount")}</span>
                <button
                  onClick={() => setMode("register")}
                  className="font-600 text-primary transition-colors hover:text-primary/80"
                >
                  {t("auth.switch.create")}
                </button>
              </>
            ) : (
              <>
                <span className="text-muted-foreground">{t("auth.switch.hasaccount")}</span>
                <button
                  onClick={() => setMode("login")}
                  className="font-600 text-primary transition-colors hover:text-primary/80"
                >
                  {t("auth.switch.login")}
                </button>
              </>
            )}
          </div>

          {/* demo accounts */}
          {mode === "login" && (
            <div className="mt-8 flex items-center justify-center gap-1 text-sm">
              <span className="text-muted-foreground">{t("auth.demo")} :</span>
              <button
                type="button"
                onClick={() => quickLogin("aicha@krea.africa", "creator123")}
                className="font-600 text-primary transition-colors hover:text-primary/80"
              >
                {t("auth.role.creator")}
              </button>
              <span className="text-muted-foreground/40">·</span>
              <button
                type="button"
                onClick={() => quickLogin("buyer1@krea.africa", "buyer123")}
                className="font-600 text-primary transition-colors hover:text-primary/80"
              >
                {t("auth.role.reader")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

