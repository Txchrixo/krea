// Shared types for Krea

export type Role = "BUYER" | "CREATOR" | "ADMIN";

export type View =
  | { name: "landing" }
  | { name: "marketplace"; category?: string; q?: string }
  | { name: "ebook"; ebookId: string }
  | { name: "creator-store"; slug: string }
  | { name: "creator-site"; slug: string; page?: string; bookSlug?: string }
  | { name: "library" }
  | { name: "reader"; ebookId: string }
  | { name: "dashboard" }
  | { name: "dashboard-ebooks" }
  | { name: "dashboard-sales" }
  | { name: "dashboard-payouts" }
  | { name: "dashboard-analytics" }
  | { name: "dashboard-coupons" }
  | { name: "dashboard-affiliates" }
  | { name: "dashboard-bundles" }
  | { name: "dashboard-site" }
  | { name: "editor"; ebookId?: string }
  | { name: "pricing" }
  | { name: "admin" }
  | { name: "how-it-works" }
  | { name: "profile" }
  | { name: "auth"; mode?: "login" | "register" | "register-creator" };

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  avatarUrl?: string | null;
  phone?: string | null;
  country?: string | null;
  creatorSlug?: string | null;
  creatorPlan?: string | null;
  walletBalance?: number;
}

export interface EbookCard {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  coverUrl: string;
  coverColor: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  category: string;
  ratingAvg: number;
  ratingCount: number;
  salesCount: number;
  pageCount: number;
  isBestseller: boolean;
  featured: boolean;
  creator: {
    slug: string;
    displayName: string;
    avatarUrl: string | null;
    verified: boolean;
  };
}

export interface EbookDetail extends EbookCard {
  description: string;
  language: string;
  wordCount: number;
  allowDownload: boolean;
  watermarkMode: string;
  deviceLimit: number;
  publishedAt: string | null;
  chapters: { id: string; title: string; order: number; wordCount: number }[];
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    user: { name: string | null; avatarUrl: string | null };
  }[];
  owned: boolean;
}

export interface LicenseItem {
  id: string;
  ebookId: string;
  progress: number;
  lastReadAt: string | null;
  status: string;
  ebook: {
    id: string;
    slug: string;
    title: string;
    coverUrl: string;
    coverColor: string;
    pageCount: number;
    creator: { displayName: string };
  };
}

export interface ChapterContent {
  id: string;
  title: string;
  content: string;
  order: number;
  wordCount: number;
}

export interface ReaderData {
  ebook: {
    id: string;
    title: string;
    subtitle: string | null;
    coverUrl: string;
    coverColor: string;
    creator: { displayName: string; slug: string };
  };
  chapters: ChapterContent[];
  license: {
    id: string;
    progress: number;
    deviceLimit: number;
    devicesUsed: string;
  };
  watermark: {
    buyerName: string;
    buyerEmail: string;
    orderRef: string;
    date: string;
  };
}

export interface DashboardStats {
  totalRevenue: number;
  totalSales: number;
  walletBalance: number;
  totalEbooks: number;
  publishedEbooks: number;
  ratingAvg: number;
  conversionRate: number;
  monthlyData: { month: string; revenue: number; sales: number }[];
  topEbooks: {
    id: string;
    title: string;
    coverUrl: string;
    coverColor: string;
    sales: number;
    revenue: number;
    rating: number;
  }[];
  recentOrders: {
    id: string;
    ref: string;
    buyerName: string;
    ebookTitle: string;
    amount: number;
    creatorEarning: number;
    paymentMethod: string;
    createdAt: string;
  }[];
  geographicData?: { code: string; label: string; count: number }[];
  paymentMethodData?: { method: string; count: number }[];
}

export interface PayoutItem {
  id: string;
  ref: string;
  amount: number;
  fee: number;
  method: string;
  status: string;
  createdAt: string;
}

export interface CouponItem {
  id: string;
  code: string;
  percentOff: number;
  ebookId: string | null;
  maxRedemptions: number;
  redeemed: number;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
  ebook?: { title: string } | null;
}

export interface CreatorProfile {
  id: string;
  slug: string;
  displayName: string;
  bio: string | null;
  tagline: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bannerColor: string;
  plan: string;
  commissionRate: number;
  verified: boolean;
  country: string | null;
  phone: string | null;
  email: string;
  name: string | null;
}

export interface AffiliateItem {
  id: string;
  code: string;
  commission: number;
  clicks: number;
  conversions: number;
  ebook?: { title: string } | null;
  createdAt: string;
}

export interface BundleItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  originalTotal: number;
  discountPct: number;
  coverColor: string;
  ebookCount: number;
  ebooks: EbookCard[];
  creator: {
    slug: string;
    displayName: string;
    avatarUrl: string | null;
    verified: boolean;
  };
  createdAt: string;
}

// ── Creator site ────────────────────────────────────────────────────
export type ThemePreset = "foret" | "ocean" | "terre" | "nuit" | "soleil" | "minimal";
export type FontPreset = "merienda" | "playfair" | "poppins" | "serif";
export type LayoutPreset = "magazine" | "boutique" | "editorial";

export interface SiteSocial {
  twitter?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  whatsapp?: string;
  email?: string;
}

export interface SitePageItem {
  id: string;
  slug: string;
  title: string;
  content: string;
  showInNav: boolean;
  order: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SiteConfig {
  siteName: string | null;
  siteEnabled: boolean;
  siteThemePreset: ThemePreset;
  siteFontPreset: FontPreset;
  siteLayout: LayoutPreset;
  siteHero: string | null;
  siteHeroSub: string | null;
  siteFooterText: string | null;
  siteSocial: SiteSocial;
  siteShowAbout: boolean;
  siteShowContact: boolean;
}

/** Full public site payload returned by /api/creators/[slug]/site */
export interface CreatorSiteData {
  creator: {
    slug: string;
    displayName: string;
    bio: string | null;
    tagline: string | null;
    avatarUrl: string | null;
    bannerUrl: string | null;
    bannerColor: string;
    verified: boolean;
    totalEbooks: number;
    totalSales: number;
    ratingAvg: number;
    country: string | null;
  };
  site: SiteConfig;
  pages: SitePageItem[];
  ebooks: EbookCard[];
  bundles: BundleItem[];
}
