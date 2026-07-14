"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Share2,
  MessageCircle,
  Facebook,
  Twitter,
  Link2,
  Check,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ShareButtonsProps {
  title: string;
  slug: string;
  className?: string;
  variant?: "compact" | "full";
}

export function ShareButtons({ title, slug, className, variant = "full" }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  // Build the share URL (client-side only to avoid SSR mismatch)
  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/?ebook=${slug}`
    : "";
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const shareOptions = [
    {
      label: "WhatsApp",
      icon: MessageCircle,
      color: "#25D366",
      onClick: () => {
        window.open(`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, "_blank");
      },
    },
    {
      label: "Facebook",
      icon: Facebook,
      color: "#1877F2",
      onClick: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank");
      },
    },
    {
      label: "Twitter / X",
      icon: Twitter,
      color: "#000000",
      onClick: () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, "_blank");
      },
    },
    {
      label: "Telegram",
      icon: Share2,
      color: "#0088cc",
      onClick: () => {
        window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`, "_blank");
      },
    },
  ];

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Lien copié 📋");
    setTimeout(() => setCopied(false), 2000);
  }

  if (variant === "compact") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={className}>
            <Share2 className="mr-1.5 h-3.5 w-3.5" /> Partager
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {shareOptions.map((opt) => (
            <DropdownMenuItem key={opt.label} onClick={opt.onClick}>
              <opt.icon className="mr-2 h-4 w-4" style={{ color: opt.color }} />
              {opt.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem onClick={copyLink}>
            {copied ? <Check className="mr-2 h-4 w-4 text-primary" /> : <Link2 className="mr-2 h-4 w-4" />}
            {copied ? "Copié !" : "Copier le lien"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="flex items-center gap-1.5 text-sm font-500 text-muted-foreground">
        <Share2 className="h-4 w-4" /> Partager :
      </span>
      {shareOptions.map((opt) => (
        <button
          key={opt.label}
          onClick={opt.onClick}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition-all hover:scale-110 hover:border-primary/40"
          aria-label={`Partager sur ${opt.label}`}
          title={opt.label}
        >
          <opt.icon className="h-4 w-4" style={{ color: opt.color }} />
        </button>
      ))}
      <button
        onClick={copyLink}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border transition-all hover:scale-110",
          copied ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40"
        )}
        aria-label="Copier le lien"
        title="Copier le lien"
      >
        {copied ? <Check className="h-4 w-4 text-primary" /> : <Link2 className="h-4 w-4 text-foreground/70" />}
      </button>
    </div>
  );
}
