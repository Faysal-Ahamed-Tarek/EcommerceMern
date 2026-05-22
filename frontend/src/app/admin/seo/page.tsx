"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Loader2, Save, Globe, FileText, Download, ExternalLink, Copy, RefreshCw } from "lucide-react";
import SEOPreview from "@/components/admin/SEOPreview";

type PageKey = "homepage" | "all_products" | "about" | "privacy_policy" | "terms_conditions";

interface SEOForm {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage: string;
  keywords: string;
}

interface SiteDefaultsForm {
  siteUrl: string;
  defaultOgImage: string;
  defaultMetaDescription: string;
}

const PAGE_OPTIONS: { value: PageKey; label: string }[] = [
  { value: "homepage", label: "Homepage" },
  { value: "all_products", label: "All Products" },
  { value: "about", label: "About Us" },
  { value: "privacy_policy", label: "Privacy Policy" },
  { value: "terms_conditions", label: "Terms & Conditions" },
];

const emptyForm = (): SEOForm => ({
  title: "",
  description: "",
  canonicalUrl: "",
  ogImage: "",
  keywords: "",
});

const emptySiteDefaults = (): SiteDefaultsForm => ({
  siteUrl: "",
  defaultOgImage: "",
  defaultMetaDescription: "",
});

export default function AdminSEOPage() {
  const [selectedPage, setSelectedPage] = useState<PageKey>("homepage");
  const [form, setForm] = useState<SEOForm>(emptyForm());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Site-wide SEO defaults
  const [siteDefaults, setSiteDefaults] = useState<SiteDefaultsForm>(emptySiteDefaults());
  const [savingDefaults, setSavingDefaults] = useState(false);

  // Sitemap stats
  const [sitemapUrlCount, setSitemapUrlCount] = useState<number | null>(null);
  const [sitemapLoading, setSitemapLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const sitemapUrl =
    (typeof window !== "undefined" ? window.location.origin : "") + "/sitemap.xml";

  const loadSitemapStats = async () => {
    setSitemapLoading(true);
    try {
      const res = await fetch("/sitemap.xml");
      const xml = await res.text();
      const count = (xml.match(/<url>/g) ?? []).length;
      setSitemapUrlCount(count);
    } catch {
      setSitemapUrlCount(null);
    } finally {
      setSitemapLoading(false);
    }
  };

  const downloadSitemap = async () => {
    try {
      const res = await fetch("/sitemap.xml");
      const xml = await res.text();
      const blob = new Blob([xml], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sitemap.xml";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("sitemap.xml downloaded");
    } catch {
      toast.error("Failed to download sitemap");
    }
  };

  const copySitemapUrl = () => {
    navigator.clipboard.writeText(sitemapUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Load site defaults from /api/config on mount
  useEffect(() => {
    api.get("/config").then((res) => {
      const d = res.data?.data;
      if (d) {
        setSiteDefaults({
          siteUrl: d.siteUrl ?? "",
          defaultOgImage: d.defaultOgImage ?? "",
          defaultMetaDescription: d.defaultMetaDescription ?? "",
        });
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchSEO = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/seo/${selectedPage}`);
        const data = res.data?.data;
        if (data) {
          setForm({
            title: data.title ?? "",
            description: data.description ?? "",
            canonicalUrl: data.canonicalUrl ?? "",
            ogImage: data.ogImage ?? "",
            keywords: data.keywords ?? "",
          });
          setLastUpdated(data.updatedAt ?? null);
        } else {
          setForm(emptyForm());
          setLastUpdated(null);
        }
      } catch {
        setForm(emptyForm());
        setLastUpdated(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSEO();
  }, [selectedPage]);

  const handleChange = (field: keyof SEOForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (form.title.trim().length < 5) {
      toast.error("Title must be at least 5 characters.");
      return;
    }
    if (form.description.trim().length < 10) {
      toast.error("Description must be at least 10 characters.");
      return;
    }
    setSaving(true);
    try {
      const res = await api.put(`/seo/${selectedPage}`, form);
      setLastUpdated(res.data?.data?.updatedAt ?? new Date().toISOString());
      toast.success("SEO settings saved!");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to save SEO settings.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDefaults = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (siteDefaults.siteUrl && !/^https?:\/\/.+/.test(siteDefaults.siteUrl)) {
      toast.error("Site URL must start with http:// or https://");
      return;
    }
    setSavingDefaults(true);
    try {
      await api.put("/admin/config", {
        siteUrl: siteDefaults.siteUrl || undefined,
        defaultOgImage: siteDefaults.defaultOgImage || undefined,
        defaultMetaDescription: siteDefaults.defaultMetaDescription || undefined,
      });
      toast.success("Site defaults saved!");
    } catch {
      toast.error("Failed to save site defaults.");
    } finally {
      setSavingDefaults(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10">

      {/* ── Site-Wide SEO Defaults ── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Globe size={18} className="text-indigo-500" />
          <h2 className="text-lg font-bold text-gray-900">Site-Wide SEO Defaults</h2>
        </div>
        <p className="text-gray-500 text-sm mb-5">
          These values are used as fallbacks on any page that does not have its own SEO data — including product pages.
          Set <code className="bg-gray-100 px-1 rounded text-xs">NEXT_PUBLIC_SITE_URL</code> in your environment to override the Site URL at build time.
        </p>

        <form onSubmit={handleSaveDefaults} className="space-y-4 border border-gray-200 rounded-2xl p-5 bg-gray-50">
          {/* Site URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Site URL <span className="text-gray-400 font-normal">(canonical origin)</span>
            </label>
            <input
              type="url"
              value={siteDefaults.siteUrl}
              onChange={(e) => setSiteDefaults((d) => ({ ...d, siteUrl: e.target.value }))}
              placeholder="https://herblifenutri.com"
              className="w-full border-2 border-gray-200 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors bg-white"
            />
            <p className="text-xs text-gray-400 mt-1">
              Used to build canonical URLs and JSON-LD product links. Env var takes priority if set.
            </p>
          </div>

          {/* Default OG Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Default OG Image URL <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="url"
              value={siteDefaults.defaultOgImage}
              onChange={(e) => setSiteDefaults((d) => ({ ...d, defaultOgImage: e.target.value }))}
              placeholder="https://drskinc.com/og-default.png"
              className="w-full border-2 border-gray-200 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors bg-white"
            />
            <p className="text-xs text-gray-400 mt-1">Recommended 1200×630 px. Used when a product has no images.</p>
          </div>

          {/* Default Meta Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Default Meta Description <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <span className={`text-xs font-medium ${siteDefaults.defaultMetaDescription.length > 160 ? "text-red-500" : "text-gray-400"}`}>
                {siteDefaults.defaultMetaDescription.length}/160
              </span>
            </div>
            <textarea
              rows={2}
              value={siteDefaults.defaultMetaDescription}
              onChange={(e) => setSiteDefaults((d) => ({ ...d, defaultMetaDescription: e.target.value }))}
              maxLength={160}
              placeholder="Site-wide fallback description for search engines…"
              className="w-full border-2 border-gray-200 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors resize-none bg-white"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingDefaults}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              {savingDefaults ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save Defaults</>}
            </button>
          </div>
        </form>
      </section>

      <hr className="border-gray-200" />

      {/* ── Sitemap ── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <FileText size={18} className="text-indigo-500" />
          <h2 className="text-lg font-bold text-gray-900">Sitemap</h2>
        </div>
        <p className="text-gray-500 text-sm mb-5">
          Your sitemap is auto-generated at <code className="bg-gray-100 px-1 rounded text-xs">/sitemap.xml</code> and
          includes all published products, categories, and static pages. It refreshes every hour via Next.js ISR.
        </p>

        <div className="border border-gray-200 rounded-2xl p-5 space-y-4">
          {/* Stats row */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[140px] bg-indigo-50 rounded-xl px-4 py-3">
              <p className="text-xs text-indigo-500 font-medium mb-0.5">Total URLs</p>
              <p className="text-2xl font-extrabold text-indigo-700">
                {sitemapLoading ? (
                  <Loader2 size={18} className="animate-spin inline" />
                ) : sitemapUrlCount !== null ? (
                  sitemapUrlCount
                ) : (
                  "—"
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={loadSitemapStats}
              disabled={sitemapLoading}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={sitemapLoading ? "animate-spin" : ""} />
              {sitemapUrlCount === null ? "Load stats" : "Refresh"}
            </button>
          </div>

          {/* Sitemap URL row */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200">
            <code className="flex-1 text-xs text-gray-600 truncate">{sitemapUrl}</code>
            <button
              type="button"
              onClick={copySitemapUrl}
              title="Copy URL"
              className="shrink-0 text-gray-400 hover:text-indigo-600 transition-colors"
            >
              {copied ? (
                <span className="text-xs text-green-600 font-medium">Copied!</span>
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={downloadSitemap}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              <Download size={15} />
              Download sitemap.xml
            </button>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border-2 border-gray-200 hover:border-indigo-400 text-gray-700 hover:text-indigo-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              <ExternalLink size={15} />
              View in browser
            </a>
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border-2 border-gray-200 hover:border-indigo-400 text-gray-700 hover:text-indigo-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              <Globe size={15} />
              Submit to Google
            </a>
          </div>

          <p className="text-xs text-gray-400">
            To submit: open Google Search Console → Sitemaps → paste the sitemap URL above → Submit.
          </p>
        </div>
      </section>

      <hr className="border-gray-200" />

      {/* ── Per-Page SEO ── */}
      <section>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">SEO Settings</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage meta titles, descriptions, and other SEO data for each page.
          </p>
        </div>

        {/* Page selector */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Select Page</label>
          <select
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value as PageKey)}
            className="border-2 border-gray-200 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm outline-none bg-white w-full sm:w-auto transition-colors"
          >
            {PAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-gray-400" size={28} />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            {/* Title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Meta Title <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs font-medium ${
                    form.title.length > 60 ? "text-red-500" : "text-gray-400"
                  }`}
                >
                  {form.title.length}/60
                </span>
              </div>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                maxLength={60}
                placeholder="e.g. Best Online Shopping in Bangladesh | ShopBD"
                className="w-full border-2 border-gray-200 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
              />
              <p className="text-xs text-gray-400 mt-1">5–60 characters recommended</p>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Meta Description <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs font-medium ${
                    form.description.length > 320 ? "text-red-500" : "text-gray-400"
                  }`}
                >
                  {form.description.length}/320
                </span>
              </div>
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                maxLength={320}
                rows={3}
                placeholder="Brief description of the page for search engines…"
                className="w-full border-2 border-gray-200 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">10–320 characters recommended</p>
            </div>

            {/* Google Preview */}
            <SEOPreview
              title={form.title}
              description={form.description}
              url={form.canonicalUrl}
            />

            {/* Canonical URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Canonical URL <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="url"
                value={form.canonicalUrl}
                onChange={(e) => handleChange("canonicalUrl", e.target.value)}
                placeholder="https://yoursite.com/page"
                className="w-full border-2 border-gray-200 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
              />
            </div>

            {/* OG Image */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                OG Image URL <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="url"
                value={form.ogImage}
                onChange={(e) => handleChange("ogImage", e.target.value)}
                placeholder="https://yoursite.com/og-image.png"
                className="w-full border-2 border-gray-200 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
              />
              <p className="text-xs text-gray-400 mt-1">
                Recommended: 1200×630px image shown when shared on social media
              </p>
            </div>

            {/* Keywords */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Keywords <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <span
                  className={`text-xs font-medium ${
                    form.keywords.length > 200 ? "text-red-500" : "text-gray-400"
                  }`}
                >
                  {form.keywords.length}/200
                </span>
              </div>
              <input
                type="text"
                value={form.keywords}
                onChange={(e) => handleChange("keywords", e.target.value)}
                maxLength={200}
                placeholder="comma, separated, keywords"
                className="w-full border-2 border-gray-200 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2">
              {lastUpdated ? (
                <p className="text-xs text-gray-400">
                  Last updated:{" "}
                  {new Date(lastUpdated).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              ) : (
                <span />
              )}
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                {saving ? (
                  <><Loader2 size={15} className="animate-spin" /> Saving…</>
                ) : (
                  <><Save size={15} /> Save SEO</>
                )}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
