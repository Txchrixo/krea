"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { Nav } from "./nav";
import { AuthModal } from "./auth-modal";
import { Footer } from "./footer";
import { LandingPage } from "./views/landing";
import { MarketplaceView } from "./views/marketplace";
import { EbookDetailView } from "./views/ebook-detail";
import { LibraryView } from "./views/library";
import { ReaderView } from "./views/reader";
import { DashboardView } from "./views/dashboard";
import { EditorView } from "./views/editor";
import { PricingView } from "./views/pricing";
import { HowItWorksView } from "./views/how-it-works";
import { AdminView } from "./views/admin";
import { CreatorStoreView } from "./views/creator-store";
import { PurchaseModal } from "./views/purchase-modal";
import { ProfileView } from "./views/profile";
import { CouponsTab } from "./views/coupons-tab";
import { AffiliateTab } from "./views/affiliate-tab";
import { BundlesTab } from "./views/bundles-tab";
import { SiteTab } from "./views/site-tab";
import { CreatorSiteView } from "./views/creator-site";
import { AuthView } from "./views/auth-view";
import { ScrollToTop } from "./scroll-to-top";
import { PageFrame } from "./page-frame";

export function AppShell() {
  const { view, user, loadingUser, openAuth } = useApp();
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    useApp.getState().refreshUser().finally(() => setBooted(true));
  }, []);

  const requiresAuth =
    view.name === "library" ||
    view.name === "reader" ||
    view.name === "dashboard" ||
    view.name === "dashboard-ebooks" ||
    view.name === "dashboard-sales" ||
    view.name === "dashboard-payouts" ||
    view.name === "dashboard-analytics" ||
    view.name === "dashboard-coupons" ||
    view.name === "dashboard-affiliates" ||
    view.name === "dashboard-bundles" ||
    view.name === "dashboard-site" ||
    view.name === "editor" ||
    view.name === "admin" ||
    view.name === "profile";

  const requiresCreator =
    view.name === "dashboard" ||
    view.name === "dashboard-ebooks" ||
    view.name === "dashboard-sales" ||
    view.name === "dashboard-payouts" ||
    view.name === "dashboard-analytics" ||
    view.name === "dashboard-coupons" ||
    view.name === "dashboard-affiliates" ||
    view.name === "dashboard-bundles" ||
    view.name === "dashboard-site" ||
    view.name === "editor";

  // Auth gating
  useEffect(() => {
    if (booted && requiresAuth && !user) {
      openAuth("login");
    }
    if (booted && requiresCreator && user && user.role !== "CREATOR" && user.role !== "ADMIN") {
      openAuth("register-creator");
    }
  }, [booted, requiresAuth, requiresCreator, user, openAuth]);

  // Creator site is a full-screen experience (its own header/footer), so it hides Krea chrome
  const showChrome =
    view.name !== "reader" &&
    view.name !== "auth" &&
    view.name !== "creator-site";
  const isLanding = view.name === "landing";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {showChrome && <Nav floating={isLanding} />}
      {showChrome && <PageFrame />}
      <main className="flex-1">
        {!booted ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Chargement de Krea…</p>
            </div>
          </div>
        ) : (
          <ViewRouter />
        )}
      </main>
      {showChrome && <Footer />}
      {showChrome && <ScrollToTop />}
      <PurchaseModal />
    </div>
  );
}

function ViewRouter() {
  const { view, user } = useApp();

  // gate protected views
  if (
    (view.name === "library" || view.name === "reader" || view.name === "profile") &&
    !user
  ) {
    return <Placeholder msg="Veuillez vous connecter pour accéder à cette page." />;
  }
  if (
    (view.name === "dashboard" ||
      view.name === "dashboard-ebooks" ||
      view.name === "dashboard-sales" ||
      view.name === "dashboard-payouts" ||
      view.name === "dashboard-analytics" ||
      view.name === "dashboard-coupons" ||
      view.name === "dashboard-affiliates" ||
      view.name === "dashboard-bundles" ||
      view.name === "dashboard-site" ||
      view.name === "editor") &&
    (!user || (user.role !== "CREATOR" && user.role !== "ADMIN"))
  ) {
    return (
      <Placeholder msg="Devenez créateur pour accéder au dashboard et à l'éditeur d'ebooks." />
    );
  }
  if (view.name === "admin" && (!user || user.role !== "ADMIN")) {
    return <Placeholder msg="Accès réservé aux administrateurs." />;
  }

  switch (view.name) {
    case "landing":
      return <LandingPage />;
    case "marketplace":
      return <MarketplaceView />;
    case "ebook":
      return <EbookDetailView />;
    case "creator-store":
      return <CreatorStoreView />;
    case "library":
      return <LibraryView />;
    case "reader":
      return <ReaderView />;
    case "dashboard":
    case "dashboard-ebooks":
    case "dashboard-sales":
    case "dashboard-payouts":
    case "dashboard-analytics":
      return <DashboardView />;
    case "dashboard-coupons":
      return <CouponsTab />;
    case "dashboard-affiliates":
      return <AffiliateTab />;
    case "dashboard-bundles":
      return <BundlesTab />;
    case "dashboard-site":
      return <SiteTab />;
    case "creator-site":
      return <CreatorSiteView />;
    case "editor":
      return <EditorView />;
    case "pricing":
      return <PricingView />;
    case "how-it-works":
      return <HowItWorksView />;
    case "admin":
      return <AdminView />;
    case "profile":
      return <ProfileView />;
    case "auth":
      return <AuthView />;
    default:
      return <LandingPage />;
  }
}

function Placeholder({ msg }: { msg: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-foreground">{msg}</p>
      </div>
    </div>
  );
}
