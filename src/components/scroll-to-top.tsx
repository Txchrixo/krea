"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-30 mx-auto max-w-6xl px-5 sm:px-8">
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="pointer-events-auto ml-auto flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg transition-colors hover:border-primary hover:text-primary"
            aria-label="Retour en haut"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        </div>
      )}
    </AnimatePresence>
  );
}
