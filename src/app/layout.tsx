import type { Metadata } from "next";
import { centuryGothic, notoSans } from "./fonts";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { organizationJsonLd, webSiteJsonLd } from "@/lib/structured-data";
import "./globals.css";

export const metadata: Metadata = {
  // Everything relative below (canonicals, OG images) resolves against this.
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Nurturing Body, Mind & Soul`,
    // Pages set a bare title; the suffix is applied here so it can't drift.
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Nurturing Body, Mind & Soul`,
    description: SITE_DESCRIPTION,
    url: "/",
    images: [{ url: "/brand/logo-color.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Nurturing Body, Mind & Soul`,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${centuryGothic.variable} ${notoSans.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        {/* Site-wide identity graph. Page-level types (Product, Article) point
            back at these by @id instead of repeating the publisher block. */}
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={webSiteJsonLd()} />
        {children}
      </body>
    </html>
  );
}
