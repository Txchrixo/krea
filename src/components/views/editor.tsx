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
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Save,
  Eye,
  Send,
  Loader2,
  BookOpen,
  PenLine,
  Sparkles,
  ShieldCheck,
  Image as ImageIcon,
  Check,
  ChevronDown,
} from "lucide-react";
import { CATEGORIES, formatFCFA, slugify } from "@/lib/format";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Chapter {
  id?: string;
  title: string;
  content: string;
  order: number;
  wordCount: number;
}

const COVER_COLORS = ["#1F4A2E", "#5DBE8A", "#C8553D", "#697E6E", "#FFD86B", "#2E5C8A", "#8B5A3C"];

export function EditorView() {
  const { view, setView } = useApp();
  const ebookId = view.name === "editor" ? view.ebookId : undefined;
  const isEdit = !!ebookId;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("5000");
  const [compareAt, setCompareAt] = useState("");
  const [category, setCategory] = useState("Savoir");
  const [coverColor, setCoverColor] = useState(COVER_COLORS[0]);
  const [language, setLanguage] = useState("fr");
  const [deviceLimit, setDeviceLimit] = useState("3");
  const [watermarkMode, setWatermarkMode] = useState("SOCIAL");
  const [allowDownload, setAllowDownload] = useState(true);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapter, setActiveChapter] = useState(0);
  const [status, setStatus] = useState("DRAFT");

  useEffect(() => {
    if (!ebookId) return;
    fetch(`/api/ebooks/${ebookId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) return;
        setTitle(d.title || "");
        setSubtitle(d.subtitle || "");
        setDescription(d.description || "");
        setPrice(String(d.price || ""));
        setCompareAt(d.compareAtPrice ? String(d.compareAtPrice) : "");
        setCategory(d.category || "Savoir");
        setCoverColor(d.coverColor || COVER_COLORS[0]);
        setLanguage(d.language || "fr");
        setDeviceLimit(String(d.deviceLimit || 3));
        setWatermarkMode(d.watermarkMode || "SOCIAL");
        setAllowDownload(d.allowDownload !== false);
        setStatus(d.status || "DRAFT");
      })
      .finally(() => setLoading(false));
    fetch(`/api/ebooks/${ebookId}/chapters`)
      .then((r) => r.json())
      .then((d) => {
        if (d.items?.length) {
          setChapters(d.items);
        }
      });
  }, [ebookId]);

  function addChapter() {
    setChapters((c) => [...c, { title: `Chapitre ${c.length + 1}`, content: "", order: c.length, wordCount: 0 }]);
    setActiveChapter(chapters.length);
  }

  function updateChapter(idx: number, patch: Partial<Chapter>) {
    setChapters((c) => c.map((ch, i) => i === idx ? { ...ch, ...patch, wordCount: patch.content !== undefined ? patch.content.trim().split(/\s+/).filter(Boolean).length : ch.wordCount } : ch));
  }

  function deleteChapter(idx: number) {
    setChapters((c) => c.filter((_, i) => i !== idx).map((ch, i) => ({ ...ch, order: i })));
    setActiveChapter(0);
  }

  async function save(publish = false) {
    if (!title.trim()) { toast.error("Le titre est requis"); return; }
    if (!description.trim()) { toast.error("La description est requise"); return; }
    if (chapters.length === 0) { toast.error("Ajoutez au moins un chapitre"); return; }
    setSaving(true);
    try {
      let id = ebookId;
      const body = {
        title, subtitle, description,
        price: parseInt(price || "0", 10),
        compareAtPrice: compareAt ? parseInt(compareAt, 10) : null,
        category, coverColor, language,
        deviceLimit: parseInt(deviceLimit, 10),
        watermarkMode, allowDownload,
        status: publish ? "PUBLISHED" : "DRAFT",
      };
      if (id) {
        const res = await fetch(`/api/ebooks/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.error);
      } else {
        const res = await fetch("/api/ebooks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, slug: slugify(title) + "-" + Math.random().toString(36).slice(2, 6) }),
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.error);
        id = d.id;
      }

      // Save chapters: for simplicity, delete+recreate is not needed; use PATCH/POST per chapter
      // We'll do a simple sync: for each chapter with id PATCH, for those without POST
      for (const ch of chapters) {
        if (ch.id) {
          await fetch(`/api/chapters/${ch.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: ch.title, content: ch.content, order: ch.order }),
          });
        } else {
          await fetch(`/api/ebooks/${id}/chapters`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: ch.title, content: ch.content, order: ch.order }),
          });
        }
      }

      toast.success(publish ? "Ebook publié 🎉" : "Brouillon enregistré");
      if (publish) {
        setView({ name: "dashboard-ebooks" });
      } else if (!ebookId && id) {
        setView({ name: "editor", ebookId: id });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Échec de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const wordCount = chapters.reduce((s, c) => s + c.wordCount, 0);

  return (
    <div className="bg-background">
      <div className="border-b border-border bg-card/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setView({ name: "dashboard-ebooks" })}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-heading text-xl font-600 text-foreground">
                {isEdit ? "Éditer l'ebook" : "Nouvel ebook"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {chapters.length} chapitre{chapters.length > 1 ? "s" : ""} · {wordCount} mots
                <Badge variant="outline" className="ml-2 text-muted-foreground">
                  {status === "PUBLISHED" ? "Publié" : "Brouillon"}
                </Badge>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => save(false)} disabled={saving}>
              {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
              Enregistrer
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => save(true)} disabled={saving}>
              <Send className="mr-1 h-4 w-4" /> Publier
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-12 lg:px-8">
        {/* Left: chapters sidebar */}
        <div className="lg:col-span-3">
          <Card className="p-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <h3 className="font-heading text-sm font-600">Chapitres</h3>
              <Button size="sm" variant="ghost" className="h-7 px-2" onClick={addChapter}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="space-y-1">
              {chapters.map((ch, i) => (
                <button
                  key={i}
                  onClick={() => setActiveChapter(i)}
                  className={cn(
                    "group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors",
                    i === activeChapter ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  )}
                >
                  <GripVertical className="h-3.5 w-3.5 cursor-grab text-muted-foreground/50" />
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-600">
                    {i + 1}
                  </span>
                  <span className="line-clamp-1 flex-1">{ch.title || "Sans titre"}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); deleteChapter(i); }}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </span>
                </button>
              ))}
              {chapters.length === 0 && (
                <div className="rounded-lg border border-dashed border-border py-6 text-center">
                  <BookOpen className="mx-auto h-6 w-6 text-muted-foreground/40" />
                  <p className="mt-1 text-xs text-muted-foreground">Aucun chapitre</p>
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" className="mt-2 w-full" onClick={addChapter}>
              <Plus className="mr-1 h-3.5 w-3.5" /> Ajouter un chapitre
            </Button>
          </Card>
        </div>

        {/* Middle: chapter editor */}
        <div className="lg:col-span-6">
          {chapters[activeChapter] ? (
            <Card className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="font-heading text-sm font-600 text-muted-foreground">Chapitre {activeChapter + 1}</span>
                <Badge variant="outline" className="text-muted-foreground">
                  {chapters[activeChapter].wordCount} mots
                </Badge>
              </div>
              <Input
                value={chapters[activeChapter].title}
                onChange={(e) => updateChapter(activeChapter, { title: e.target.value })}
                placeholder="Titre du chapitre"
                className="mb-3 h-11 font-heading text-lg"
              />
              <Textarea
                value={chapters[activeChapter].content}
                onChange={(e) => updateChapter(activeChapter, { content: e.target.value })}
                placeholder="Écrivez votre contenu en Markdown. Utilisez ## pour les titres, ** pour le gras, - pour les listes, > pour les citations…"
                className="min-h-[420px] resize-y font-mono text-sm leading-relaxed"
              />
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <PenLine className="h-3.5 w-3.5" />
                Markdown supporté · {chapters[activeChapter].content.length} caractères
              </div>
            </Card>
          ) : (
            <Card className="flex h-full min-h-[400px] flex-col items-center justify-center p-10 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 font-heading text-lg text-foreground">Commencez à écrire</p>
              <p className="mt-1 text-sm text-muted-foreground">Ajoutez votre premier chapitre pour commencer votre ebook.</p>
              <Button className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90" onClick={addChapter}>
                <Plus className="mr-1 h-4 w-4" /> Ajouter un chapitre
              </Button>
            </Card>
          )}
        </div>

        {/* Right: settings */}
        <div className="lg:col-span-3">
          <Card className="p-4">
            <h3 className="mb-3 font-heading text-sm font-600">Informations</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Titre</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre de l'ebook" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Sous-titre</Label>
                <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Optionnel" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez votre ebook…" className="min-h-[80px] text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Prix (FCFA)</Label>
                  <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Prix barré</Label>
                  <Input type="number" value={compareAt} onChange={(e) => setCompareAt(e.target.value)} placeholder=" - " />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Catégorie</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="mt-4 p-4">
            <h3 className="mb-3 font-heading text-sm font-600">Couverture</h3>
            <div className="mb-3 overflow-hidden rounded-lg">
              <div className="flex h-32 flex-col justify-between p-3" style={{ background: coverColor }}>
                <div className="flex justify-end"><div className="h-4 w-4 rounded-full bg-white/25" /></div>
                <div>
                  <p className="font-heading text-sm font-600 leading-tight text-white">{title || "Titre de l'ebook"}</p>
                  <p className="text-[10px] text-white/70">{subtitle || "Sous-titre"}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {COVER_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCoverColor(c)}
                  className={cn("h-7 w-7 rounded-full border-2 transition-transform hover:scale-110", coverColor === c ? "border-foreground" : "border-transparent")}
                  style={{ background: c }}
                >
                  {coverColor === c && <Check className="mx-auto h-3.5 w-3.5 text-white" />}
                </button>
              ))}
            </div>
          </Card>

          <Card className="mt-4 p-4">
            <h3 className="mb-3 flex items-center gap-1.5 font-heading text-sm font-600">
              <ShieldCheck className="h-4 w-4 text-primary" /> Protection
            </h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Mode de watermark</Label>
                <Select value={watermarkMode} onValueChange={setWatermarkMode}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SOCIAL">Social (nom + email visibles)</SelectItem>
                    <SelectItem value="FLATTEN">Aplati (image + watermark)</SelectItem>
                    <SelectItem value="STEGA">Stéganographie (invisible)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Limite d'appareils</Label>
                <Select value={deviceLimit} onValueChange={setDeviceLimit}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 appareil</SelectItem>
                    <SelectItem value="2">2 appareils</SelectItem>
                    <SelectItem value="3">3 appareils</SelectItem>
                    <SelectItem value="5">5 appareils</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={allowDownload}
                  onChange={(e) => setAllowDownload(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                Autoriser le téléchargement PDF (watermarké)
              </label>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
