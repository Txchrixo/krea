"use client";

import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export function LangSwitcher({ variant = "light" }: { variant?: "light" | "dark" }) {
  const { lang, setLang } = useApp();

  const base = "flex items-center gap-0.5 rounded-full p-0.5";
  const containerClass =
    variant === "dark"
      ? "border border-[#FBF5E3]/15 bg-[#FBF5E3]/5 backdrop-blur-sm"
      : "border border-border bg-muted/50";

  const activeClass =
    variant === "dark"
      ? "bg-[#FBF5E3] text-[#1F4A2E]"
      : "bg-card text-foreground shadow-sm";

  const inactiveClass =
    variant === "dark"
      ? "text-[#FBF5E3]/60 hover:text-[#FBF5E3]"
      : "text-muted-foreground hover:text-foreground";

  return (
    <div className={cn(base, containerClass)}>
      <button
        onClick={() => setLang("fr")}
        className={cn(
          "rounded-full px-2.5 py-0.5 text-xs font-600 transition-all",
          lang === "fr" ? activeClass : inactiveClass
        )}
      >
        FR
      </button>
      <button
        onClick={() => setLang("en")}
        className={cn(
          "rounded-full px-2.5 py-0.5 text-xs font-600 transition-all",
          lang === "en" ? activeClass : inactiveClass
        )}
      >
        EN
      </button>
    </div>
  );
}
