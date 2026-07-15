import type { Metadata } from "next";
import { Merienda, Nunito } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Suspense } from "react";
import { KREA_LOADER_SVG, KREA_LOADER_CSS } from "./krea-loader-svg";

const merienda = Merienda({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Krea : Créez, vendez et protégez vos ebooks",
  description:
    "Krea est la librairie digitale personnalisée et protégée pour créateurs africains. Créez vos ebooks, vendez-les via Mobile Money, et faites lire vos clients dans une bibliothèque sécurisée.",
  keywords: ["Krea", "ebook", "Afrique", "Mobile Money", "Selar alternative", "lecture protégée", "créateurs", "CFA"],
  authors: [{ name: "Krea" }],
  icons: { icon: "/logo.svg" },
  openGraph: {
    title: "Krea : La librairie digitale des créateurs africains",
    description: "Créez, vendez et protégez vos ebooks sur une seule plateforme.",
    siteName: "Krea",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Unblock CSS: convert render-blocking stylesheet links to preload. */}
        <script dangerouslySetInnerHTML={{ __html: UNBLOCK_CSS }} />
        {/* Loader animation styles : in <head> so they apply before paint. */}
        <style dangerouslySetInnerHTML={{ __html: KREA_LOADER_CSS }} />
      </head>
      <body
        className={`${merienda.variable} ${nunito.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        {/*
          Boot loader : injected as raw HTML string (not a React component).
          This ensures the SVG + animation is in the HTML stream
          BEFORE React hydrates, so the animation starts on first paint.
        */}
        <div
          id="boot-loader"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FBF5E3",
          }}
          dangerouslySetInnerHTML={{ __html: KREA_LOADER_SVG }}
        />
        {/* While boot-loader is visible, lock scroll so the page isn't scrollable behind it.
            The lock is removed by AppShell when booted = true. */}
        <style dangerouslySetInnerHTML={{ __html: `
          body:has(#boot-loader) { overflow: hidden !important; }
        `}} />
        <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
          {children}
        </Suspense>
        <Toaster />
        <SonnerToaster
          richColors
          position="top-center"
          toastOptions={{
            style: {
              marginTop: "0px",
            },
          }}
          style={{
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
      </body>
    </html>
  );
}

/**
 * Minimal script: converts existing + future <link rel="stylesheet"> to non-blocking preload.
 * This is the only inline script : keeps layout.tsx clean.
 */
const UNBLOCK_CSS = `
document.documentElement.style.backgroundColor='#FBF5E3';
function u(l){if(l.rel!=='stylesheet')return;l.rel='preload';l.as='style';l.onload=function(){l.rel='stylesheet'}}
document.querySelectorAll('link[rel="stylesheet"]').forEach(u);
new MutationObserver(function(m){m.forEach(function(x){x.addedNodes.forEach(function(n){if(n.tagName==='LINK'&&n.rel==='stylesheet')u(n)})})}).observe(document.documentElement,{childList:true,subtree:true});
`;
