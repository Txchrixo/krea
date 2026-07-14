import type { Metadata } from "next";
import { Merienda, Nunito } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

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
  title: "Krea — Créez, vendez et protégez vos ebooks",
  description:
    "Krea est la librairie digitale personnalisée et protégée pour créateurs africains. Créez vos ebooks, vendez-les via Mobile Money, et faites lire vos clients dans une bibliothèque sécurisée.",
  keywords: [
    "Krea",
    "ebook",
    "Afrique",
    "Mobile Money",
    "Selar alternative",
    "lecture protégée",
    "créateurs",
    "CFA",
  ],
  authors: [{ name: "Krea" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Krea — La librairie digitale des créateurs africains",
    description:
      "Créez, vendez et protégez vos ebooks sur une seule plateforme.",
    siteName: "Krea",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${merienda.variable} ${nunito.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        {children}
        <Toaster />
        <SonnerToaster richColors position="top-center" />
      </body>
    </html>
  );
}
