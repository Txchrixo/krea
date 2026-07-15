// Creator site theme presets : shared by public site view + editor
import type { ThemePreset, FontPreset, LayoutPreset } from "./types";

export interface ThemeTokens {
  /** key used to scope CSS vars */
  id: ThemePreset;
  label: string;
  swatch: string; // representative color for picker
  bg: string;
  bgAlt: string;
  surface: string;
  foreground: string;
  muted: string;
  primary: string;
  primaryFg: string;
  accent: string;
  accentFg: string;
  border: string;
  heroOverlay: string; // gradient overlay color for hero
}

export const THEMES: Record<ThemePreset, ThemeTokens> = {
  foret: {
    id: "foret",
    label: "Forêt",
    swatch: "#1F4A2E",
    bg: "#FBF5E3",
    bgAlt: "#F5EFD7",
    surface: "#FFFFFF",
    foreground: "#1F4A2E",
    muted: "#697E6E",
    primary: "#1F4A2E",
    primaryFg: "#FBF5E3",
    accent: "#FFD86B",
    accentFg: "#1F4A2E",
    border: "#CBD8CE",
    heroOverlay: "linear-gradient(135deg, rgba(31,74,46,0.92), rgba(31,74,46,0.78))",
  },
  ocean: {
    id: "ocean",
    label: "Océan",
    swatch: "#0F4C5C",
    bg: "#F7FBFC",
    bgAlt: "#EAF4F7",
    surface: "#FFFFFF",
    foreground: "#0F2A33",
    muted: "#5A7780",
    primary: "#0F4C5C",
    primaryFg: "#F7FBFC",
    accent: "#FFB703",
    accentFg: "#0F2A33",
    border: "#C9DDE3",
    heroOverlay: "linear-gradient(135deg, rgba(15,76,92,0.92), rgba(15,76,92,0.80))",
  },
  terre: {
    id: "terre",
    label: "Terre",
    swatch: "#8B3A2F",
    bg: "#FBF3EA",
    bgAlt: "#F5E8D6",
    surface: "#FFFFFF",
    foreground: "#3A1E16",
    muted: "#8A6B5E",
    primary: "#8B3A2F",
    primaryFg: "#FBF3EA",
    accent: "#E9B44C",
    accentFg: "#3A1E16",
    border: "#E0CFB8",
    heroOverlay: "linear-gradient(135deg, rgba(139,58,47,0.92), rgba(139,58,47,0.78))",
  },
  nuit: {
    id: "nuit",
    label: "Nuit",
    swatch: "#1A1A2E",
    bg: "#F4F4F8",
    bgAlt: "#E8E8EE",
    surface: "#FFFFFF",
    foreground: "#1A1A2E",
    muted: "#6B6B7B",
    primary: "#1A1A2E",
    primaryFg: "#F4F4F8",
    accent: "#E94560",
    accentFg: "#FFFFFF",
    border: "#D0D0DA",
    heroOverlay: "linear-gradient(135deg, rgba(26,26,46,0.94), rgba(26,26,46,0.82))",
  },
  soleil: {
    id: "soleil",
    label: "Soleil",
    swatch: "#C9482B",
    bg: "#FFF8F0",
    bgAlt: "#FCECDB",
    surface: "#FFFFFF",
    foreground: "#3A1F12",
    muted: "#8A6450",
    primary: "#C9482B",
    primaryFg: "#FFF8F0",
    accent: "#F4A261",
    accentFg: "#3A1F12",
    border: "#E8CDB5",
    heroOverlay: "linear-gradient(135deg, rgba(201,72,43,0.92), rgba(244,162,97,0.82))",
  },
  minimal: {
    id: "minimal",
    label: "Minimal",
    swatch: "#18181B",
    bg: "#FFFFFF",
    bgAlt: "#F4F4F5",
    surface: "#FFFFFF",
    foreground: "#18181B",
    muted: "#71717A",
    primary: "#18181B",
    primaryFg: "#FFFFFF",
    accent: "#F59E0B",
    accentFg: "#18181B",
    border: "#E4E4E7",
    heroOverlay: "linear-gradient(135deg, rgba(24,24,27,0.94), rgba(24,24,27,0.82))",
  },
};

export interface FontTokens {
  id: FontPreset;
  label: string;
  heading: string;
  body: string;
  /** google fonts link href, or null if system */
  href: string | null;
  headingWeight: number;
}

export const FONTS: Record<FontPreset, FontTokens> = {
  merienda: {
    id: "merienda",
    label: "Merienda + Nunito",
    heading: "'Merienda', cursive",
    body: "'Nunito', system-ui, sans-serif",
    href: "https://fonts.googleapis.com/css2?family=Merienda:wght@600;700&family=Nunito:wght@400;500;600;700&display=swap",
    headingWeight: 700,
  },
  playfair: {
    id: "playfair",
    label: "Playfair + Inter",
    heading: "'Playfair Display', Georgia, serif",
    body: "'Inter', system-ui, sans-serif",
    href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap",
    headingWeight: 700,
  },
  poppins: {
    id: "poppins",
    label: "Poppins + Lato",
    heading: "'Poppins', system-ui, sans-serif",
    body: "'Lato', system-ui, sans-serif",
    href: "https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Lato:wght@400;700&display=swap",
    headingWeight: 700,
  },
  serif: {
    id: "serif",
    label: "Garamond (système)",
    heading: "Garamond, 'Times New Roman', serif",
    body: "Georgia, 'Times New Roman', serif",
    href: null,
    headingWeight: 700,
  },
};

export interface LayoutTokens {
  id: LayoutPreset;
  label: string;
  desc: string;
}

export const LAYOUTS: Record<LayoutPreset, LayoutTokens> = {
  magazine: {
    id: "magazine",
    label: "Magazine",
    desc: "Hero large + grille de livres en vedette",
  },
  boutique: {
    id: "boutique",
    label: "Boutique",
    desc: "Hero centré + cartes mises en avant",
  },
  editorial: {
    id: "editorial",
    label: "Éditorial",
    desc: "Typographie XL + liste de livres",
  },
};

export const THEME_LIST = Object.values(THEMES);
export const FONT_LIST = Object.values(FONTS);
export const LAYOUT_LIST = Object.values(LAYOUTS);

/** Inline style object to apply a theme to a wrapper element via CSS vars */
export function themeStyle(theme: ThemePreset): React.CSSProperties {
  const t = THEMES[theme];
  return {
    ["--site-bg" as any]: t.bg,
    ["--site-bg-alt" as any]: t.bgAlt,
    ["--site-surface" as any]: t.surface,
    ["--site-fg" as any]: t.foreground,
    ["--site-muted" as any]: t.muted,
    ["--site-primary" as any]: t.primary,
    ["--site-primary-fg" as any]: t.primaryFg,
    ["--site-accent" as any]: t.accent,
    ["--site-accent-fg" as any]: t.accentFg,
    ["--site-border" as any]: t.border,
    ["--site-hero-overlay" as any]: t.heroOverlay,
    backgroundColor: t.bg,
    color: t.foreground,
  } as React.CSSProperties;
}

export function fontStyle(font: FontPreset): React.CSSProperties {
  const f = FONTS[font];
  return {
    fontFamily: f.body,
    ["--site-heading-font" as any]: f.heading,
    ["--site-body-font" as any]: f.body,
  } as React.CSSProperties;
}
