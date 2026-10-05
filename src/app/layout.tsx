import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { eventConfig } from "@/config/event";
import { SiteHeader } from "@/components/site-header";

const sans = localFont({
  src: "./fonts/geist-latin.woff2",
  variable: "--font-sans",
  display: "swap",
});

const mono = localFont({
  src: "./fonts/geist-mono-latin.woff2",
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000",
  ),
  title: {
    default: "The Black Veil — Manchester, 1926",
    template: "%s — The Black Veil",
  },
  description:
    "An invitation, a vanished proprietress, and the surviving Manchester records of The Black Veil, 1921–1926.",
  // What a guest sees when the link is texted or emailed: an invitation first, the mystery second.
  openGraph: {
    title: "You’re invited: The Black Veil",
    description: `A 1920s murder mystery masquerade. Friday, October 23, 8 PM, Manchester, N.H. Masks and Prohibition-era formal. Kindly reply by ${eventConfig.rsvpDeadlineShort}.`,
    siteName: "The Black Veil",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "You’re invited: The Black Veil",
    description: `A 1920s murder mystery masquerade. Friday, October 23, Manchester, N.H. Kindly reply by ${eventConfig.rsvpDeadlineShort}.`,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <div className="site-shell">
          <SiteHeader />
          <main id="main-content">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
