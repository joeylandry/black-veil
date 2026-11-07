import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import "./globals.css";

const sans = localFont({ src: "./fonts/geist-latin.woff2", variable: "--font-sans", display: "swap" });
const mono = localFont({ src: "./fonts/geist-mono-latin.woff2", variable: "--font-mono", display: "swap" });
const display = localFont({ src: "./fonts/bodoni-moda-display-600.ttf", variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000",
  ),
  title: { default: "File 245 · The Black Toad", template: "%s · File 245" },
  description: "Impounded 1926. Unsealed 2026. The file on what happened beneath 245 Summer Street.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "File 245 · The Black Toad",
    description: "Impounded 1926. Unsealed 2026. Look before you leap.",
    siteName: "File 245",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#0b0d0a", colorScheme: "dark" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
