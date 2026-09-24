import type { MetadataRoute } from "next";

/**
 * Konfiguracja pliku robots.txt dla wyszukiwarek (Next.js App Router).
 * Zezwala na indeksowanie publicznych stron (landing page, cennik),
 * natomiast chroni prywatne trasy użytkowników i panel administratora.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
    "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/pricing"],
      disallow: ["/dashboard", "/admin", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
