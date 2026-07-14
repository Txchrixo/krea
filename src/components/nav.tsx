"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  Compass,
  LayoutDashboard,
  Library,
  BookOpen,
  Sparkles,
  LogOut,
  User as UserIcon,
  Wallet,
  ChevronRight,
  Settings,
  Ticket,
  Share2,
  Package,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatFCFA } from "@/lib/format";

const NAV_LINKS = [
  { key: "nav.explore" as const, view: { name: "marketplace" as const }, icon: Compass },
  { key: "nav.how" as const, view: { name: "how-it-works" as const }, icon: BookOpen },
  { key: "nav.pricing" as const, view: { name: "pricing" as const }, icon: Sparkles },
];

export function Nav({ floating = false }: { floating?: boolean }) {
  const { user, setView, openAuth, refreshUser, mobileNavOpen, setMobileNav, t } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    refreshUser();
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [refreshUser]);

  // Show a stable logged-out nav until mounted to avoid SSR hydration mismatch.
  const effectiveUser = mounted ? user : null;

  const go = (view: Parameters<typeof setView>[0]) => {
    setView(view);
    setMobileNav(false);
  };

  return (
    <header className={cn(
      "sticky top-0 z-40 w-full",
      floating
        ? scrolled
          ? "bg-background/70 backdrop-blur-xl"
          : "bg-transparent"
        : "bg-background/85 backdrop-blur-xl border-b border-border/60"
    )}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 transition-all duration-300 sm:px-8">
        {/* Left: logo */}
        <button
          onClick={() => go({ name: "landing" })}
          className="group rounded-lg transition-transform hover:scale-[1.02]"
        >
          <span className="font-heading text-2xl font-600 tracking-tight text-foreground">
            Krea
          </span>
        </button>

        {/* Center: nav links (desktop) */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <button
              key={link.key}
              onClick={() => go(link.view)}
              className="group relative rounded-md px-3 py-2 text-sm font-500 text-foreground/80 transition-colors hover:text-foreground"
            >
              {t(link.key)}
              <span className="absolute inset-x-3 -bottom-px h-px origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
            </button>
          ))}
        </nav>

        {/* Right: auth / actions */}
        <div className="flex items-center gap-2">
          {effectiveUser ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex text-foreground/80 hover:text-foreground"
                onClick={() => go({ name: "library" })}
              >
                <Library className="mr-1.5 h-4 w-4" />
                {t("nav.library")}
              </Button>
              {(effectiveUser.role === "CREATOR" || effectiveUser.role === "ADMIN") && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:inline-flex text-foreground/80 hover:text-foreground"
                  onClick={() => go({ name: "dashboard" })}
                >
                  <LayoutDashboard className="mr-1.5 h-4 w-4" />
                  {t("nav.dashboard")}
                </Button>
              )}
              <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full border border-border bg-card p-1 pr-3 transition-shadow hover:shadow-md">
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarFallback className="bg-primary/20 font-heading text-sm text-foreground">
                        {effectiveUser.name?.[0]?.toUpperCase() ?? effectiveUser.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm font-500 sm:inline">{effectiveUser.name?.split(" ")[0] ?? "Moi"}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="flex flex-col gap-0.5">
                    <span>{effectiveUser.name ?? effectiveUser.email}</span>
                    <span className="text-xs font-400 text-muted-foreground">{effectiveUser.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {effectiveUser.role === "CREATOR" && (
                    <>
                      <DropdownMenuItem onClick={() => go({ name: "dashboard" })}>
                        <LayoutDashboard className="mr-2 h-4 w-4" /> {t("nav.dashboard")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => go({ name: "editor" })}>
                        <BookOpen className="mr-2 h-4 w-4" /> {t("nav.createEbook")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => go({ name: "dashboard-payouts" })}>
                        <Wallet className="mr-2 h-4 w-4" /> {t("nav.withdraw")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => go({ name: "dashboard-coupons" })}>
                        <Ticket className="mr-2 h-4 w-4" /> {t("nav.coupons")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => go({ name: "dashboard-affiliates" })}>
                        <Share2 className="mr-2 h-4 w-4" /> {t("nav.affiliation")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => go({ name: "dashboard-bundles" })}>
                        <Package className="mr-2 h-4 w-4" /> {t("nav.bundles")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => go({ name: "dashboard-site" })}>
                        <Globe className="mr-2 h-4 w-4" /> {t("nav.site")}
                      </DropdownMenuItem>
                    </>
                  )}
                  {effectiveUser.role === "ADMIN" && (
                    <DropdownMenuItem onClick={() => go({ name: "admin" })}>
                      <Sparkles className="mr-2 h-4 w-4" /> {t("nav.admin")}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => go({ name: "library" })}>
                    <Library className="mr-2 h-4 w-4" /> {t("nav.library")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => go({ name: "profile" })}>
                    <Settings className="mr-2 h-4 w-4" /> {t("nav.profile")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {effectiveUser.role === "CREATOR" && effectiveUser.walletBalance != null && (
                    <div className="px-2 py-1.5">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{t("nav.wallet")}</span>
                        <Badge className="bg-primary/15 text-foreground hover:bg-primary/15">
                          {formatFCFA(effectiveUser.walletBalance)}
                        </Badge>
                      </div>
                    </div>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      await fetch("/api/auth/logout", { method: "POST" });
                      await refreshUser();
                      go({ name: "landing" });
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> {t("nav.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => openAuth("login")}
              >
                {t("nav.login")}
              </Button>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                onClick={() => openAuth("register-creator")}
              >
                {t("nav.becomeCreator")}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </>
          )}

          {/* Mobile menu */}
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNav}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-background">
              <SheetHeader>
                <SheetTitle>
                  <span className="font-heading text-2xl font-600 tracking-tight text-foreground">
                    Krea
                  </span>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.key}
                    onClick={() => go(link.view)}
                    className="flex items-center justify-between rounded-lg px-3 py-3 text-left text-foreground/90 transition-colors hover:bg-muted"
                  >
                    <span className="flex items-center gap-2">
                      <link.icon className="h-4 w-4 text-primary" />
                      {t(link.key)}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
                {effectiveUser ? (
                  <>
                    <button
                      onClick={() => go({ name: "library" })}
                      className="flex items-center justify-between rounded-lg px-3 py-3 text-left hover:bg-muted"
                    >
                      <span className="flex items-center gap-2">
                        <Library className="h-4 w-4 text-primary" />
                        {t("nav.library")}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                    {(effectiveUser.role === "CREATOR" || effectiveUser.role === "ADMIN") && (
                      <button
                        onClick={() => go({ name: "dashboard" })}
                        className="flex items-center justify-between rounded-lg px-3 py-3 text-left hover:bg-muted"
                      >
                        <span className="flex items-center gap-2">
                          <LayoutDashboard className="h-4 w-4 text-primary" />
                          {t("nav.dashboard")}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        await fetch("/api/auth/logout", { method: "POST" });
                        await refreshUser();
                        go({ name: "landing" });
                        setMobileNav(false);
                      }}
                      className="flex items-center gap-2 rounded-lg px-3 py-3 text-left text-destructive hover:bg-destructive/5"
                    >
                      <LogOut className="h-4 w-4" /> {t("nav.logout")}
                    </button>
                  </>
                ) : (
                  <div className="mt-4 flex flex-col gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        openAuth("login");
                        setMobileNav(false);
                      }}
                    >
                      <UserIcon className="mr-1.5 h-4 w-4" /> {t("nav.login")}
                    </Button>
                    <Button
                      onClick={() => {
                        openAuth("register-creator");
                        setMobileNav(false);
                      }}
                    >
                      {t("nav.becomeCreator")}
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
