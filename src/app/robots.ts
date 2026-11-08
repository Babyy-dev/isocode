import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/** Catalogue and car pages are public; account, staff and API routes are not for search engines. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/account", "/admin", "/leads", "/book", "/bookings", "/sign-in", "/sign-up"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
