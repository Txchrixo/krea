// Formatting helpers for Krea

export function formatFCFA(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(amount) + " F";
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(n);
}

export function formatCompact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".0", "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(".0", "") + "k";
  return String(n);
}

export function timeAgo(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "à l'instant";
  const min = Math.floor(sec / 60);
  if (min < 60) return `il y a ${min} min`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `il y a ${hr} h`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `il y a ${day} j`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `il y a ${mo} mois`;
  return `il y a ${Math.floor(mo / 12)} an(s)`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export const CATEGORIES = [
  { id: "Savoir", label: "Savoir & Savoir-faire", icon: "book" },
  { id: "Business", label: "Business & Argent", icon: "trend" },
  { id: "Spiritual", label: "Spiritualité", icon: "sparkle" },
  { id: "DevPerso", label: "Développement personnel", icon: "growth" },
  { id: "Cuisine", label: "Cuisine & Recettes", icon: "utensils" },
  { id: "Romance", label: "Romance & Fiction", icon: "heart" },
  { id: "Tech", label: "Tech & Digital", icon: "code" },
] as const;

export const PAYMENT_METHODS = [
  { id: "MTN", label: "MTN Mobile Money", color: "#FFCC00", text: "#1F1F1F" },
  { id: "ORANGE", label: "Orange Money", color: "#FF7900", text: "#fff" },
  { id: "WAVE", label: "Wave", color: "#1DC8FF", text: "#fff" },
  { id: "CARD", label: "Carte bancaire", color: "#1F4A2E", text: "#fff" },
] as const;

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function genRef(prefix: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${s}`;
}
