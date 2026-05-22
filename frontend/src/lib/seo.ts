const FALLBACK_ORIGIN = "https://herblifenutri.com";

/**
 * Returns the canonical site origin.
 * Priority: NEXT_PUBLIC_SITE_URL env var → configUrl from SiteConfig → hardcoded fallback.
 * The fallback is defined once here so it is never scattered across files.
 */
export function getSiteOrigin(configUrl?: string): string {
  return (
    (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "") ||
    (configUrl ?? "").replace(/\/$/, "") ||
    FALLBACK_ORIGIN
  );
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncate(str: string, max: number): string {
  const s = str.trim();
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

export function buildCanonical(siteOrigin: string, slug: string): string {
  return `${siteOrigin}/products/${encodeURIComponent(slug)}`;
}
