"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Loader2, Save } from "lucide-react";
import SEOPreview from "@/components/admin/SEOPreview";

type PageKey = "homepage" | "all_products" | "about" | "privacy_policy" | "terms_conditions";

interface SEOForm {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage: string;
  keywords: string;
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

export default function AdminSEOPage() {
  const [selectedPage, setSelectedPage] = useState<PageKey>("homepage");
  const [form, setForm] = useState<SEOForm>(emptyForm());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

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

  const handleSave = async (e: React.FormEvent) => {
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

  return (
    <div className="max-w-3xl mx-auto">
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
    </div>
  );
}
