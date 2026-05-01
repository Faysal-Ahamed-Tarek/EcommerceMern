import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/seo";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const STATIC_PAGES: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "/",               priority: 1.0, changeFrequency: "daily"   },
  { path: "/products",       priority: 0.9, changeFrequency: "daily"   },
  { path: "/about",          priority: 0.5, changeFrequency: "monthly" },
  { path: "/privacy-policy", priority: 0.3, changeFrequency: "yearly"  },
  { path: "/terms",          priority: 0.3, changeFrequency: "yearly"  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Resolve canonical origin from SiteConfig or env
  let siteUrl: string | undefined;
  try {
    const res = await fetch(`${API}/config`, { next: { revalidate: 3600 } });
    if (res.ok) siteUrl = (await res.json()).data?.siteUrl;
  } catch {}
  const origin = getSiteOrigin(siteUrl);

  // Static routes
  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((p) => ({
    url: `${origin}${p.path}`,
    lastModified: new Date(),
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  // Product pages
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API}/products?limit=2000&status=published`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const json = await res.json();
      productEntries = (json.data ?? []).map(
        (p: { slug: string; updatedAt: string }) => ({
          url: `${origin}/products/${encodeURIComponent(p.slug)}`,
          lastModified: new Date(p.updatedAt),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        })
      );
    }
  } catch {}

  // Category pages
  let categoryEntries: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API}/categories`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const json = await res.json();
      categoryEntries = (json.data ?? [])
        .filter((c: { productCount?: number }) => (c.productCount ?? 0) > 0)
        .map((c: { slug: string; updatedAt?: string }) => ({
          url: `${origin}/category/${encodeURIComponent(c.slug)}`,
          lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }));
    }
  } catch {}

  return [...staticEntries, ...productEntries, ...categoryEntries];
}
