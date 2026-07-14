"use client";

import { useEffect, useState, useCallback } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Globe,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  Check,
  Sparkles,
  Save,
  GripVertical,
  ExternalLink,
  Menu,
  Type,
  Layout as LayoutIcon,
} from "lucide-react";
import { THEMES, FONTS, LAYOUTS, THEME_LIST, FONT_LIST, LAYOUT_LIST } from "@/lib/site-themes";
import type { SiteConfig, SitePageItem, SiteSocial, ThemePreset, FontPreset, LayoutPreset } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SiteData {
  site: SiteConfig;
  creator: {
    slug: string;
    displayName: string;
    bio: string | null;
    tagline: string | null;
    bannerColor: string;
  };
  pages: SitePageItem[];
}

export function SiteTab() {
  const { setView, user } = useApp();
  const [data, setData] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editPage, setEditPage] = useState<SitePageItem | null>(null);
  const [pageDialogOpen, setPageDialogOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/creator/site");
    const d = await res.json();
    if (d.error) toast.error(d.error);
    else setData(d);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const update = (patch: Partial<SiteConfig>) => {
    if (!data) return;
    setData({ ...data, site: { ...data.site, ...patch } });
  };

  const save = async (patch?: Partial<SiteConfig>) => {
    if (!data) return;
    setSaving(true);
    const res = await fetch("/api/creator/site", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch ?? data.site),
    });
    const d = await res.json();
    setSaving(false);
    if (d.error) toast.error(d.error);
    else toast.success("Site mis à jour ✓");
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/60">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <h1 className="font-heading text-2xl font-600 text-foreground sm:text-3xl">Mon site</h1>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Votre site personnel, hébergé sur Krea. Personnalisable, avec votre nom, vos couleurs et vos pages.
              </p>
              {user?.creatorSlug && (
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">krea.com/{user.creatorSlug}</Badge>
                  <Badge className={data.site.siteEnabled ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}>
                    {data.site.siteEnabled ? "En ligne" : "Hors ligne"}
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setView({ name: "creator-site", slug: user!.creatorSlug! })}
              >
                <Eye className="mr-2 h-4 w-4" /> Aperçu
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Site status */}
        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-lg font-600 text-foreground">Statut du site</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {data.site.siteEnabled
                  ? "Votre site est visible publiquement."
                  : "Votre site est en mode brouillon. Activez-le pour le rendre public."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={data.site.siteEnabled}
                onCheckedChange={(checked) => {
                  update({ siteEnabled: checked });
                  save({ siteEnabled: checked });
                }}
              />
              <span className="text-sm font-500 text-foreground">{data.site.siteEnabled ? "Activé" : "Désactivé"}</span>
            </div>
          </div>
        </Card>

        {/* General settings */}
        <Card>
          <SectionTitle icon={Type} title="Identité & contenu" desc="Le nom et les textes principaux de votre site." />
          <div className="mt-5 grid gap-5">
            <Field label="Nom du site" hint="Affiché dans l'en-tête et l'onglet du navigateur.">
              <Input
                value={data.site.siteName ?? ""}
                onChange={(e) => update({ siteName: e.target.value })}
                placeholder={data.creator.displayName}
              />
            </Field>
            <Field label="Titre du hero" hint="Le grand titre en haut de la page d'accueil.">
              <Input
                value={data.site.siteHero ?? ""}
                onChange={(e) => update({ siteHero: e.target.value })}
                placeholder="Ex : Transformez votre ambition en entreprise rentable"
              />
            </Field>
            <Field label="Sous-titre du hero">
              <Textarea
                value={data.site.siteHeroSub ?? ""}
                onChange={(e) => update({ siteHeroSub: e.target.value })}
                rows={2}
                placeholder="Une phrase qui décrit ce que vous offrez."
              />
            </Field>
            <Field label="Texte du footer" hint="Copyright ou signature en bas de page.">
              <Input
                value={data.site.siteFooterText ?? ""}
                onChange={(e) => update({ siteFooterText: e.target.value })}
                placeholder={`© ${new Date().getFullYear()} ${data.creator.displayName}`}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <ToggleField
                label="Page « À propos »"
                desc="Afficher la page À propos dans le menu."
                checked={data.site.siteShowAbout}
                onChange={(v) => { update({ siteShowAbout: v }); save({ siteShowAbout: v }); }}
              />
              <ToggleField
                label="Page « Contact »"
                desc="Afficher la page Contact dans le menu."
                checked={data.site.siteShowContact}
                onChange={(v) => { update({ siteShowContact: v }); save({ siteShowContact: v }); }}
              />
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <Button onClick={() => save()} disabled={saving}>
              <Save className="mr-2 h-4 w-4" /> {saving ? "Sauvegarde…" : "Enregistrer"}
            </Button>
          </div>
        </Card>

        {/* Theme picker */}
        <Card>
          <SectionTitle icon={Sparkles} title="Thème de couleurs" desc="Choisissez l'ambiance visuelle de votre site." />
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {THEME_LIST.map((t) => (
              <button
                key={t.id}
                onClick={() => { update({ siteThemePreset: t.id }); save({ siteThemePreset: t.id }); }}
                className={cn(
                  "group flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all",
                  data.site.siteThemePreset === t.id
                    ? "border-primary shadow-md"
                    : "border-border hover:border-primary/40"
                )}
              >
                <span
                  className="flex h-12 w-full items-center justify-center rounded-lg"
                  style={{ background: t.primary }}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: t.accent }}>
                    {data.site.siteThemePreset === t.id && <Check className="h-3.5 w-3.5" style={{ color: t.accentFg }} />}
                  </span>
                </span>
                <span className="text-xs font-600 text-foreground">{t.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Font picker */}
        <Card>
          <SectionTitle icon={Type} title="Typographie" desc="Le style de police de votre site." />
          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {FONT_LIST.map((f) => (
              <button
                key={f.id}
                onClick={() => { update({ siteFontPreset: f.id }); save({ siteFontPreset: f.id }); }}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-xl border-2 p-4 transition-all",
                  data.site.siteFontPreset === f.id
                    ? "border-primary shadow-md"
                    : "border-border hover:border-primary/40"
                )}
              >
                <span className="text-lg font-700 text-foreground" style={{ fontFamily: f.heading }}>
                  Ag
                </span>
                <span className="text-xs font-600 text-foreground">{f.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Layout picker */}
        <Card>
          <SectionTitle icon={LayoutIcon} title="Mise en page" desc="La structure de votre page d'accueil." />
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {LAYOUT_LIST.map((l) => (
              <button
                key={l.id}
                onClick={() => { update({ siteLayout: l.id }); save({ siteLayout: l.id }); }}
                className={cn(
                  "flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all",
                  data.site.siteLayout === l.id
                    ? "border-primary shadow-md"
                    : "border-border hover:border-primary/40"
                )}
              >
                <LayoutPreview layout={l.id} active={data.site.siteLayout === l.id} />
                <span className="font-600 text-foreground">{l.label}</span>
                <span className="text-xs text-muted-foreground">{l.desc}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Social links */}
        <Card>
          <SectionTitle icon={Globe} title="Réseaux & contact" desc="Vos liens de contact, affichés sur la page Contact et le footer." />
          <SocialEditor social={data.site.siteSocial} onChange={(s) => update({ siteSocial: s })} onSave={() => save()} />
        </Card>

        {/* Pages management */}
        <Card>
          <div className="flex items-center justify-between">
            <SectionTitle icon={Menu} title="Pages personnalisées" desc="Ajoutez vos propres pages (à propos étendu, services, blog…)." />
            <Button
              size="sm"
              onClick={() => { setEditPage(null); setPageDialogOpen(true); }}
            >
              <Plus className="mr-1.5 h-4 w-4" /> Nouvelle page
            </Button>
          </div>
          <div className="mt-5">
            {data.pages.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border py-12 text-center">
                <Menu className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">Aucune page pour le moment.</p>
                <p className="text-xs text-muted-foreground">Créez une page pour ajouter du contenu à votre site.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.pages.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                  >
                    <GripVertical className="h-4 w-4 flex-shrink-0 text-muted-foreground/40" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-600 text-foreground">{p.title}</p>
                      <p className="truncate text-xs text-muted-foreground">/{p.slug}</p>
                    </div>
                    {!p.published && <Badge variant="outline" className="text-muted-foreground">Brouillon</Badge>}
                    {!p.showInNav && <Badge variant="outline" className="text-muted-foreground">Hors menu</Badge>}
                    <button
                      onClick={() => { setEditPage(p); setPageDialogOpen(true); }}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm(`Supprimer la page « ${p.title} » ?`)) return;
                        const res = await fetch(`/api/creator/site/pages/${p.id}`, { method: "DELETE" });
                        if (res.ok) { toast.success("Page supprimée"); load(); }
                        else toast.error("Erreur");
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Quick links */}
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => setView({ name: "creator-site", slug: user!.creatorSlug! })}>
            <ExternalLink className="mr-2 h-4 w-4" /> Voir mon site
          </Button>
          <Button variant="ghost" onClick={() => setView({ name: "dashboard" })}>
            Retour au dashboard
          </Button>
        </div>
      </div>

      <PageDialog
        open={pageDialogOpen}
        onOpenChange={setPageDialogOpen}
        page={editPage}
        onSaved={load}
      />
    </div>
  );
}

/* ─── Components ─── */
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card p-6 shadow-sm", className)}>
      {children}
    </section>
  );
}

function SectionTitle({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <h2 className="font-heading text-lg font-600 text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-sm font-600 text-foreground">{label}</Label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ToggleField({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3">
      <div>
        <p className="text-sm font-600 text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function LayoutPreview({ layout, active }: { layout: LayoutPreset; active: boolean }) {
  const bar = active ? "bg-primary" : "bg-muted-foreground/30";
  const accent = active ? "bg-accent" : "bg-muted-foreground/20";
  if (layout === "magazine") {
    return (
      <div className="flex h-14 w-full gap-1">
        <div className={cn("flex-1 rounded-sm", bar)} />
        <div className={cn("w-1/3 rounded-sm", accent)} />
      </div>
    );
  }
  if (layout === "boutique") {
    return (
      <div className="flex h-14 w-full flex-col items-center justify-center gap-1">
        <div className={cn("h-2 w-1/2 rounded-sm", bar)} />
        <div className={cn("h-2 w-1/3 rounded-full", accent)} />
      </div>
    );
  }
  return (
    <div className="flex h-14 w-full flex-col justify-center gap-1">
      <div className={cn("h-1.5 w-full rounded-sm", bar)} />
      <div className={cn("h-1.5 w-3/4 rounded-sm", bar)} />
      <div className={cn("h-1.5 w-1/2 rounded-sm", bar)} />
    </div>
  );
}

function SocialEditor({
  social,
  onChange,
  onSave,
}: {
  social: SiteSocial;
  onChange: (s: SiteSocial) => void;
  onSave: () => void;
}) {
  const fields: { key: keyof SiteSocial; label: string; placeholder: string }[] = [
    { key: "twitter", label: "Twitter / X", placeholder: "@username ou URL" },
    { key: "instagram", label: "Instagram", placeholder: "@username ou URL" },
    { key: "facebook", label: "Facebook", placeholder: "URL ou nom" },
    { key: "linkedin", label: "LinkedIn", placeholder: "URL ou nom" },
    { key: "youtube", label: "YouTube", placeholder: "@chaine ou URL" },
    { key: "tiktok", label: "TikTok", placeholder: "@username ou URL" },
    { key: "whatsapp", label: "WhatsApp", placeholder: "+221 77 123 45 67" },
    { key: "email", label: "Email", placeholder: "contact@email.com" },
  ];
  return (
    <div className="mt-5">
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key}>
            <Label className="text-xs font-600 text-muted-foreground">{f.label}</Label>
            <Input
              className="mt-1 h-9"
              value={social[f.key] ?? ""}
              onChange={(e) => onChange({ ...social, [f.key]: e.target.value || undefined })}
              placeholder={f.placeholder}
            />
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end">
        <Button size="sm" onClick={onSave}>
          <Save className="mr-2 h-4 w-4" /> Enregistrer les réseaux
        </Button>
      </div>
    </div>
  );
}

function PageDialog({
  open,
  onOpenChange,
  page,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  page: SitePageItem | null;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(page?.title ?? "");
  const [content, setContent] = useState(page?.content ?? "");
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [showInNav, setShowInNav] = useState(page?.showInNav ?? true);
  const [published, setPublished] = useState(page?.published ?? true);
  const [saving, setSaving] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setTitle(page?.title ?? "");
    setContent(page?.content ?? "");
    setSlug(page?.slug ?? "");
    setShowInNav(page?.showInNav ?? true);
    setPublished(page?.published ?? true);
  }, [page, open]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const save = async () => {
    if (!title.trim()) { toast.error("Le titre est requis"); return; }
    setSaving(true);
    if (page) {
      const res = await fetch(`/api/creator/site/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, slug, showInNav, published }),
      });
      const d = await res.json();
      setSaving(false);
      if (d.error) toast.error(d.error);
      else { toast.success("Page mise à jour ✓"); onOpenChange(false); onSaved(); }
    } else {
      const res = await fetch(`/api/creator/site/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, showInNav }),
      });
      const d = await res.json();
      setSaving(false);
      if (d.error) toast.error(d.error);
      else { toast.success("Page créée ✓"); onOpenChange(false); onSaved(); }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{page ? "Modifier la page" : "Nouvelle page"}</DialogTitle>
          <DialogDescription>
            {page
              ? "Modifiez le contenu de votre page. Le markdown est supporté (## titres, **gras**, listes)."
              : "Créez une page personnalisée sur votre site."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div>
            <Label className="text-sm font-600">Titre</Label>
            <Input className="mt-1.5" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex : Mon approche" />
          </div>
          {page && (
            <div>
              <Label className="text-sm font-600">Slug (URL)</Label>
              <Input className="mt-1.5 font-mono text-sm" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="mon-approche" />
              <p className="mt-1 text-xs text-muted-foreground">Apparaît dans l'URL : krea.com/{`{votre-slug}`}/{slug || "..."}</p>
            </div>
          )}
          <div>
            <Label className="text-sm font-600">Contenu (Markdown)</Label>
            <Textarea
              className="mt-1.5 min-h-[280px] font-mono text-sm"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={"## Mon titre\n\nMon contenu en **gras**.\n\n- Point 1\n- Point 2"}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <ToggleField label="Afficher dans le menu" desc="Visible dans la navigation." checked={showInNav} onChange={setShowInNav} />
            <ToggleField label="Publiée" desc="Visible publiquement." checked={published} onChange={setPublished} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {page ? "Enregistrer" : "Créer la page"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
