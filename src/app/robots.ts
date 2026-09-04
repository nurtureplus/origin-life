import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // None of these have anything to index, and a crawler following them
      // burns crawl budget on per-user pages it can never see signed out.
      disallow: ["/admin", "/api", "/account", "/checkout", "/order"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
