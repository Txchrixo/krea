"use client";

import { cn } from "@/lib/utils";

interface EbookCoverProps {
  title: string;
  subtitle?: string | null;
  creatorName?: string;
  coverUrl?: string | null;
  coverColor: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showCreator?: boolean;
}

const SIZES = {
  sm: { h: "h-40", title: "text-sm", sub: "text-[10px]", creator: "text-[9px]" },
  md: { h: "h-56", title: "text-base", sub: "text-xs", creator: "text-[10px]" },
  lg: { h: "h-72", title: "text-xl", sub: "text-sm", creator: "text-xs" },
  xl: { h: "h-96", title: "text-3xl", sub: "text-base", creator: "text-sm" },
};

// Deterministic decorative pattern from title
function pattern(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % 4;
}

export function EbookCover({
  title,
  subtitle,
  creatorName,
  coverUrl,
  coverColor,
  className,
  size = "md",
  showCreator = true,
}: EbookCoverProps) {
  const s = SIZES[size];

  if (coverUrl) {
    return (
      <div className={cn("relative overflow-hidden rounded-lg shadow-[0_8px_24px_-12px_rgba(31,74,46,0.35)]", s.h, className)}>
        <img
          src={coverUrl}
          alt={title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        {/* spine effect */}
        <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-r from-black/30 to-transparent" />
      </div>
    );
  }

  const p = pattern(title);
  // lighter tint of coverColor
  const tint = coverColor;

  return (
    <div
      className={cn(
        "relative flex flex-col justify-between overflow-hidden rounded-lg p-4 shadow-[0_8px_24px_-12px_rgba(31,74,46,0.35)]",
        s.h,
        className
      )}
      style={{ background: tint }}
    >
      {/* decorative overlay */}
      <svg
        className="absolute inset-0 h-full w-full opacity-25"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {p === 0 && (
          <>
            <circle cx="85" cy="15" r="22" fill="rgba(255,255,255,0.4)" />
            <circle cx="10" cy="90" r="30" fill="rgba(255,255,255,0.2)" />
          </>
        )}
        {p === 1 && (
          <g stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" fill="none">
            <path d="M0 70 Q 25 50 50 70 T 100 70" />
            <path d="M0 80 Q 25 60 50 80 T 100 80" />
            <path d="M0 90 Q 25 70 50 90 T 100 90" />
          </g>
        )}
        {p === 2 && (
          <g fill="rgba(255,255,255,0.18)">
            <rect x="0" y="0" width="100" height="8" />
            <rect x="0" y="92" width="100" height="8" />
            <rect x="0" y="44" width="100" height="2" />
          </g>
        )}
        {p === 3 && (
          <g stroke="rgba(255,255,255,0.3)" strokeWidth="0.4">
            <line x1="0" y1="0" x2="100" y2="100" />
            <line x1="100" y1="0" x2="0" y2="100" />
            <line x1="50" y1="0" x2="50" y2="100" />
          </g>
        )}
      </svg>

      {/* spine highlight */}
      <div className="absolute left-0 top-0 h-full w-1.5 bg-black/15" />

      <div className="relative z-10 flex-1 flex flex-col justify-end">
        <h3
          className={cn(
            "font-heading font-600 leading-tight text-white drop-shadow-sm",
            s.title
          )}
          style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
        >
          {title}
        </h3>
        {subtitle && (
          <p
            className={cn("mt-1 font-400 text-white/80", s.sub)}
            style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
          >
            {subtitle}
          </p>
        )}
        {showCreator && creatorName && (
          <p className={cn("mt-2 font-500 uppercase tracking-wider text-white/70", s.creator)}>
            {creatorName}
          </p>
        )}
      </div>
    </div>
  );
}
