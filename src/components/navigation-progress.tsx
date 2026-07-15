"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Navigation progress bar : thin animated bar at the top of the page.
 * Triggered by any fetch request (intercepted globally).
 * Discreet, professional, non-blocking. Similar to NProgress.
 *
 * Usage: just render <NavigationProgress /> once in AppShell.
 */

// ── Global fetch interceptor ──────────────────────────────────────
let activeRequests = 0;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

if (typeof window !== "undefined" && !(window as any).__fetchIntercepted) {
  const originalFetch = window.fetch;
  (window as any).__fetchIntercepted = true;
  window.fetch = function (...args: Parameters<typeof fetch>) {
    activeRequests++;
    notify();
    return originalFetch.apply(this, args).finally(() => {
      activeRequests = Math.max(0, activeRequests - 1);
      notify();
    });
  };
}

// ── Component ─────────────────────────────────────────────────────
export function NavigationProgress() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear helpers
  const clearTimers = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    const onChange = () => {
      if (activeRequests > 0) {
        // Request started : show bar and animate to 90%
        clearTimers();
        setVisible(true);
        setProgress(30);
        intervalRef.current = setInterval(() => {
          setProgress((p) => (p < 90 ? p + Math.random() * 8 : p));
        }, 300);
      } else {
        // All requests done : fill to 100% then hide
        clearTimers();
        setProgress(100);
        timeoutRef.current = setTimeout(() => {
          setVisible(false);
          setProgress(0);
        }, 400);
      }
    };

    listeners.add(onChange);

    return () => {
      listeners.delete(onChange);
      clearTimers();
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        zIndex: 9998,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          background: "linear-gradient(90deg, #5DBE8A, #1F4A2E)",
          borderRadius: "0 2px 2px 0",
          transition: "width 0.3s ease, opacity 0.4s ease",
          opacity: progress > 0 ? 1 : 0,
          boxShadow: "0 0 8px rgba(93, 190, 138, 0.4)",
        }}
      />
    </div>
  );
}
