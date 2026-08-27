import { ReactNode, Suspense } from "react";
import Providers from "../components/providers/providers";
import "./globals.css";
import type { Metadata } from "next";
import ServiceWorkerRegistration from "@/components/core/service-worker-registration";
import Script from "next/script";
import { MetaPixel } from "@/components/integrations/meta-pixel";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MM Laptop Center | Laptop Store Pakistan",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "MM Laptop Center – Shop premium laptops, gaming gear and accessories",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MM Laptop Center",
  },
  icons: {
    icon: [
      { url: "/favicon.png?v=20260731", sizes: "48x48", type: "image/png" },
      {
        url: "/icons/icon-192x192.png?v=20260731",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    shortcut: [{ url: "/favicon.png?v=20260731", type: "image/png" }],
    apple: [
      {
        url: "/icons/icon-192x192.png?v=20260731",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  },
  verification: {
    google:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
      "google-site-verification-placeholder",
    other: {
      "msvalidate.01":
        process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ||
        "bing-site-verification-placeholder",
    },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          type="image/png"
          sizes="48x48"
          href="/favicon.png?v=20260731"
        />
        <link
          rel="apple-touch-icon"
          sizes="192x192"
          href="/icons/icon-192x192.png?v=20260731"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MM Laptop Center" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#d8a928" />
        <meta
          name="description"
          content="MM Laptop Center – Shop premium laptops, gaming gear and accessories"
        />
      </head>
      <body suppressHydrationWarning>
        <Script
          id="performance-measure-guard"
          strategy="beforeInteractive"
          src="/performance-measure-guard.js"
        />
        <Suspense fallback={null}>
          <MetaPixel />
        </Suspense>
        <Providers>{children}</Providers>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
