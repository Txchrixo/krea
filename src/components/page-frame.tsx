"use client";

/**
 * PageFrame — two fixed vertical lines that delimit the max-w-6xl (1152px) content frame.
 * Visible on lg+ screens where there is enough side margin.
 */
export function PageFrame() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 hidden lg:block"
      aria-hidden="true"
    >
      {/* Left vertical line */}
      <div
        className="absolute top-0 bottom-0 w-px bg-border"
        style={{ left: "calc(50% - 576px)" }}
      />
      {/* Right vertical line */}
      <div
        className="absolute top-0 bottom-0 w-px bg-border"
        style={{ left: "calc(50% + 576px)" }}
      />
    </div>
  );
}
