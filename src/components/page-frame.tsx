"use client";

import { useState, useEffect, useMemo } from "react";
import type { EbookCard } from "@/lib/types";

/**
 * PageFrame — fixed vertical lines + scrolling African ebook covers in the side margins.
 * Lines align with max-w-6xl (1152px) edges. Covers scroll vertically in an infinite loop.
 * The frame is fixed (stays during scroll). The footer is opaque so covers never overlap it.
 *
 * Covers use real coverUrl images when available, with optimized loading:
 *  - loading="lazy" + decoding="async" to avoid blocking render
 *  - onError fallback to colored tile
 * Covers are 3/4 portrait (matching the hero book dimensions).
 */
export function PageFrame() {
  const [marginWidth, setMarginWidth] = useState(0);
  const [ebooks, setEbooks] = useState<EbookCard[]>([]);

  useEffect(() => {
    const update = () => {
      setMarginWidth(Math.max(0, (window.innerWidth - 1152) / 2));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    fetch("/api/ebooks?limit=50&sort=popular")
      .then((r) => r.json())
      .then((d) => setEbooks(d.items || []))
      .catch(() => {});
  }, []);

  if (marginWidth < 40) return null;

  // Cover dimensions: 3/4 portrait, fits within the margin width.
  const coverW = Math.max(40, Math.min(marginWidth - 10, 120));
  const coverH = Math.round(coverW * (4 / 3));

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 hidden lg:block"
      aria-hidden="true"
    >
      {/* Vertical lines — full viewport height */}
      <div
        className="absolute w-px bg-border"
        style={{ left: "calc(50% - 576px)", top: 0, bottom: 0 }}
      />
      <div
        className="absolute w-px bg-border"
        style={{ left: "calc(50% + 576px)", top: 0, bottom: 0 }}
      />

      {/* Left margin — covers scrolling up */}
      <CoverColumn side="left" ebooks={ebooks} coverW={coverW} coverH={coverH} direction="up" />

      {/* Right margin — covers scrolling down */}
      <CoverColumn side="right" ebooks={ebooks} coverW={coverW} coverH={coverH} direction="down" />
    </div>
  );
}

function CoverColumn({
  side,
  ebooks,
  coverW,
  coverH,
  direction,
}: {
  side: "left" | "right";
  ebooks: EbookCard[];
  coverW: number;
  coverH: number;
  direction: "up" | "down";
}) {
  const gap = 8;
  const itemH = coverH + gap;

  // Build cover list — enough to fill viewport + buffer. Duplicate the list for seamless loop.
  const covers = useMemo(() => {
    if (ebooks.length === 0) return [];
    const minCount = Math.ceil(window.innerHeight / itemH) + 2;
    const list: EbookCard[] = [];
    while (list.length < minCount) {
      list.push(...ebooks);
    }
    return list.slice(0, minCount);
  }, [ebooks, itemH]);

  if (covers.length === 0) return null;

  const animName = `krea-covers-${side}`;
  const fromY = direction === "up" ? 0 : -itemH;
  const toY = direction === "up" ? -itemH : 0;
  const duration = Math.max(8, itemH * 0.14);

  return (
    <div
      className="absolute top-0 bottom-0 overflow-hidden"
      style={{
        [side]: 0,
        width: "calc(50% - 576px)",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <style>{`
        @keyframes ${animName} {
          from { transform: translateY(${fromY}px); }
          to { transform: translateY(${toY}px); }
        }
      `}</style>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: `${gap}px`,
          paddingTop: `${gap}px`,
          animation: `${animName} ${duration}s linear infinite`,
          willChange: "transform",
        }}
      >
        {covers.map((eb, i) => (
          <CoverTile key={`${side}-${i}`} ebook={eb} width={coverW} height={coverH} />
        ))}
      </div>
    </div>
  );
}

function CoverTile({
  ebook,
  width,
  height,
}: {
  ebook: EbookCard;
  width: number;
  height: number;
}) {
  const [imgError, setImgError] = useState(false);
  const showImg = ebook.coverUrl && !imgError;

  return (
    <div
      className="relative overflow-hidden rounded-sm opacity-40"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        flexShrink: 0,
        background: ebook.coverColor,
        boxShadow: "0 2px 8px rgba(31,74,46,0.12)",
      }}
    >
      {/* spine highlight */}
      <div className="absolute left-0 top-0 h-full w-1 bg-black/15" />
      {showImg && (
        <img
          src={ebook.coverUrl}
          alt=""
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      )}
    </div>
  );
}
