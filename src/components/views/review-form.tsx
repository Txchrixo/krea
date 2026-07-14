"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Loader2, MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ReviewForm({ ebookId, onSubmitted }: { ebookId: string; onSubmitted: () => void }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function submit() {
    if (rating < 1) { toast.error("Choisissez une note (1 à 5 étoiles)"); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/ebooks/${ebookId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Merci pour votre avis ! ⭐");
      setRating(0); setComment(""); setOpen(false);
      onSubmitted();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Échec");
    } finally {
      setLoading(false);
    }
  }

  const labels = ["", "Décevant", "Passable", "Correct", "Bien", "Excellent"];
  const active = hover || rating;

  if (!open) {
    return (
      <div className="mb-5 rounded-xl border border-primary/30 bg-primary/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-heading text-sm font-600 text-foreground">Vous possédez cet ebook</p>
            <p className="text-xs text-muted-foreground">Partagez votre avis pour aider les autres acheteurs.</p>
          </div>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setOpen(true)}>
            <MessageSquarePlus className="mr-1 h-4 w-4" /> Laisser un avis
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mb-5 overflow-hidden rounded-xl border border-primary/30 bg-card p-5"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-heading text-base font-600 text-foreground">Votre avis</h3>
        <button onClick={() => setOpen(false)} className="text-xs text-muted-foreground hover:text-foreground">Annuler</button>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label>Note</Label>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(n)}
                  className="rounded p-0.5 transition-transform hover:scale-110"
                  aria-label={`${n} étoiles`}
                >
                  <Star
                    className={cn(
                      "h-7 w-7 transition-colors",
                      n <= active ? "fill-accent text-accent" : "fill-muted text-muted-foreground/40"
                    )}
                  />
                </button>
              ))}
            </div>
            {active > 0 && (
              <span className="text-sm font-500 text-foreground">{labels[active]}</span>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="comment">Commentaire (optionnel)</Label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Qu'avez-vous pensé de cet ebook ? Était-il utile, clair, complet ?"
            className="min-h-[90px]"
            maxLength={500}
          />
          <p className="text-[11px] text-muted-foreground">{comment.length}/500</p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Annuler</Button>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading} onClick={submit}>
            {loading && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />}
            Publier mon avis
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
