import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
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
  openGraph: {
    title: "The Black Veil — Manchester, 1926",
    description: "Cassandra Castello disappeared after the 1924 masquerade. Two years later, the invitations returned.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
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
