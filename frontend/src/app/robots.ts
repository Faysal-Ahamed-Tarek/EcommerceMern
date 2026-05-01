import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/seo";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default async function robots(): Promise<MetadataRoute.Robots> {
  let siteUrl: string | undefined;
  try {
    const res = await fetch(`${API}/config`, { next: { revalidate: 3600 } });
    if (res.ok) siteUrl = (await res.json()).data?.siteUrl;
  } catch {}
  const origin = getSiteOrigin(siteUrl);

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/checkout",
          "/order-confirmation",
          "/api/",
        ],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
  };
}
