// Krea — Ebook mappers (DB rows → frontend types)
import type {
  EbookCard,
  EbookDetail,
  LicenseItem,
} from "@/lib/types";
import type { Prisma } from "@prisma/client";

type EbookWithCreator = Prisma.EbookGetPayload<{
  include: {
    creator: {
      include: { user: true };
    };
  };
}>;

export function toEbookCard(e: EbookWithCreator): EbookCard {
  return {
    id: e.id,
    slug: e.slug,
    title: e.title,
    subtitle: e.subtitle,
    coverUrl: e.coverUrl,
    coverColor: e.coverColor,
    price: e.price,
    compareAtPrice: e.compareAtPrice,
    currency: e.currency,
    category: e.category,
    ratingAvg: e.ratingAvg,
    ratingCount: e.ratingCount,
    salesCount: e.salesCount,
    pageCount: e.pageCount,
    isBestseller: e.isBestseller,
    featured: e.featured,
    creator: {
      slug: e.creator.slug,
      displayName: e.creator.displayName,
      avatarUrl: e.creator.avatarUrl,
      verified: e.creator.verified,
    },
  };
}

type EbookDetailPayload = Prisma.EbookGetPayload<{
  include: {
    creator: { include: { user: true } };
    chapters: { select: { id: true; title: true; order: true; wordCount: true } };
    reviews: { include: { user: { select: { name: true; avatarUrl: true } } } };
  };
}>;

export function toEbookDetail(
  e: EbookDetailPayload,
  owned: boolean
): EbookDetail {
  return {
    ...toEbookCard(e as unknown as EbookWithCreator),
    description: e.description,
    language: e.language,
    wordCount: e.wordCount,
    allowDownload: e.allowDownload,
    watermarkMode: e.watermarkMode,
    deviceLimit: e.deviceLimit,
    publishedAt: e.publishedAt ? e.publishedAt.toISOString() : null,
    chapters: e.chapters
      .map((c) => ({
        id: c.id,
        title: c.title,
        order: c.order,
        wordCount: c.wordCount,
      }))
      .sort((a, b) => a.order - b.order),
    reviews: e.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
      user: { name: r.user.name, avatarUrl: r.user.avatarUrl },
    })),
    owned,
  };
}

type LicenseWithEbook = Prisma.LicenseGetPayload<{
  include: {
    ebook: {
      select: {
        id: true;
        slug: true;
        title: true;
        coverUrl: true;
        coverColor: true;
        pageCount: true;
        creator: { select: { displayName: true } };
      };
    };
  };
}>;

export function toLicenseItem(l: LicenseWithEbook): LicenseItem {
  return {
    id: l.id,
    ebookId: l.ebookId,
    progress: l.progress,
    lastReadAt: l.lastReadAt ? l.lastReadAt.toISOString() : null,
    status: l.status,
    ebook: {
      id: l.ebook.id,
      slug: l.ebook.slug,
      title: l.ebook.title,
      coverUrl: l.ebook.coverUrl,
      coverColor: l.ebook.coverColor,
      pageCount: l.ebook.pageCount,
      creator: { displayName: l.ebook.creator.displayName },
    },
  };
}
