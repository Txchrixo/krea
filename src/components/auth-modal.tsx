"use client";

import { useState } from "react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  Globe,
  Sparkles,
  BookOpen,
  ShoppingBag,
  Loader2,
  Check,
} from "lucide-react";
import { CATEGORIES } from "@/lib/format";

export function AuthModal() {
  const { authModalOpen, authMode, closeAuth, refreshUser, setView } = useApp();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"login" | "register" | "register-creator">(
    authMode
  );

  // sync tab with authMode when modal opens
  useState(() => setTab(authMode));

  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    country: "CM",
    role: "CREATOR" as "BUYER" | "CREATOR",
  });

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === "login") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Connexion échouée");
        await refreshUser();
        toast.success(`Bienvenue, ${data.user?.name ?? data.user?.email} 👋`);
        closeAuth();
      } else {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Inscription échouée");
        await refreshUser();
        toast.success("Compte créé avec succès 🎉");
        closeAuth();
        if (form.role === "CREATOR") {
          setView({ name: "dashboard" });
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  function quickLogin(email: string, pw: string) {
    setForm((f) => ({ ...f, email, password: pw }));
    setTab("login");
  }

  return (
    <Dialog
      open={authModalOpen}
      onOpenChange={(o) => {
        if (!o) closeAuth();
      }}
    >
      <DialogContent className="max-w-md overflow-hidden border-border bg-card p-0">
        <div className="relative">
          {/* decorative top banner */}
          <div className="h-20 bg-gradient-to-r from-primary via-primary to-accent/80" />
          <div className="absolute inset-x-0 -bottom-px flex justify-center">
            <div className="rounded-full border border-border bg-card px-4 py-1 text-xs font-500 text-muted-foreground shadow-sm">
              {tab === "login" ? "Bon retour 👋" : tab === "register-creator" ? "Lance ta librairie" : "Rejoins Krea"}
            </div>
          </div>
        </div>

        <DialogHeader className="px-6 pt-8">
          <DialogTitle className="text-center font-heading text-2xl">
            {tab === "login"
              ? "Connexion"
              : tab === "register-creator"
              ? "Devenir créateur"
              : "Créer un compte"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {tab === "login"
              ? "Accédez à votre bibliothèque et vos ventes."
              : tab === "register-creator"
              ? "Créez, vendez et protégez vos ebooks en quelques minutes."
              : "Achetez et lisez des ebooks protégés."}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6">
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Lecteur</TabsTrigger>
              <TabsTrigger value="register-creator">Créateur</TabsTrigger>
            </TabsList>

            {[("login" as const), ("register" as const), ("register-creator" as const)].map(
              (mode) => (
                <TabsContent key={mode} value={mode} className="mt-4">
                  <form onSubmit={submit} className="space-y-3">
                    {mode !== "login" && (
                      <div className="space-y-1.5">
                        <Label htmlFor="name">Nom complet</Label>
                        <div className="relative">
                          <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="name"
                            required
                            placeholder="Aïcha Diallo"
                            value={form.name}
                            onChange={(e) => set("name", e.target.value)}
                            className="pl-9"
                          />
                        </div>
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          required
                          placeholder="vous@exemple.com"
                          value={form.email}
                          onChange={(e) => set("email", e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="password">Mot de passe</Label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          required
                          minLength={6}
                          placeholder="••••••••"
                          value={form.password}
                          onChange={(e) => set("password", e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    {mode !== "login" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="phone">Téléphone</Label>
                          <div className="relative">
                            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="phone"
                              placeholder="+237 6•• ••• •••"
                              value={form.phone}
                              onChange={(e) => set("phone", e.target.value)}
                              className="pl-9"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="country">Pays</Label>
                          <div className="relative">
                            <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <select
                              id="country"
                              value={form.country}
                              onChange={(e) => set("country", e.target.value)}
                              className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                              <option value="CM">Cameroun</option>
                              <option value="SN">Sénégal</option>
                              <option value="CI">Côte d'Ivoire</option>
                              <option value="NG">Nigeria</option>
                              <option value="ML">Mali</option>
                              <option value="BF">Burkina Faso</option>
                              <option value="FR">France</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {mode === "register-creator" && (
                      <input type="hidden" value="CREATOR" onChange={() => set("role", "CREATOR")} />
                    )}
                    {mode === "register" && (
                      <input type="hidden" value="BUYER" onChange={() => set("role", "BUYER")} />
                    )}

                    {mode === "register-creator" && (
                      <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-600 text-foreground">
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                          Ce que vous obtenez
                        </div>
                        <ul className="space-y-1 text-xs text-muted-foreground">
                          <li className="flex items-center gap-1.5">
                            <Check className="h-3 w-3 text-primary" /> Page de librairie personnalisée
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check className="h-3 w-3 text-primary" /> Editeur d'ebook intégré
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check className="h-3 w-3 text-primary" /> Paiement Mobile Money
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check className="h-3 w-3 text-primary" /> Watermark anti-piratage
                          </li>
                        </ul>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {mode === "login" ? "Se connecter" : "Créer mon compte"}
                    </Button>
                  </form>

                  {mode === "login" && (
                    <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/40 p-3">
                      <p className="mb-2 text-center text-xs font-500 text-muted-foreground">
                        Comptes de démonstration
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="justify-start text-xs"
                          onClick={() => quickLogin("aicha@krea.africa", "creator123")}
                        >
                          <BookOpen className="mr-1 h-3 w-3 text-primary" /> Créateur
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="justify-start text-xs"
                          onClick={() => quickLogin("buyer1@krea.africa", "buyer123")}
                        >
                          <ShoppingBag className="mr-1 h-3 w-3 text-primary" /> Lecteur
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-1.5 w-full justify-center text-xs"
                        onClick={() => quickLogin("admin@krea.africa", "admin123")}
                      >
                        <Sparkles className="mr-1 h-3 w-3" /> Admin
                      </Button>
                    </div>
                  )}
                </TabsContent>
              )
            )}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
