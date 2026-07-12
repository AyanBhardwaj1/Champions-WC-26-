import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter, SiteHeader } from "../components/site-shell";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: { default: "Champions (WC 26)", template: "%s · Champions (WC 26)" },
  description: "Spin through every World Cup era, draft an all-time XI and chase a perfect 8–0 at World Cup 2026.",
  applicationName: "Champions (WC 26)",
  openGraph: {
    title: "Champions (WC 26)",
    description: "Build the XI. Chase the 8–0.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Champions WC 26 — chase the perfect 8–0" }],
  },
  twitter: { card: "summary_large_image", title: "Champions (WC 26)", description: "Build the XI. Chase the 8–0.", images: ["/og.png"] },
  icons: { icon: "/icon" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${geist.variable} ${mono.variable}`}><SiteHeader />{children}<SiteFooter /></body></html>;
}
