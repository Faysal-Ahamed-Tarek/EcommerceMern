"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Plus, X, Loader2, ImagePlus } from "lucide-react";
import RichTextEditor from "@/components/admin/RichTextEditor";
import type { Product, Category, ProductImage, ProductVariant } from "@/types";
import DOMPurify from "dompurify";

// ─── Types ───────────────────────────────────────────────────────────────────

interface VariantRow {
  weight_label: string;
  base_price: string;
  discount_price: string;
  stock: string;
}

interface FormData {
  title_en: string;
  title_bn: string;
  description: string;
  shortDescription: string;
  sku: string;
  category: string;
  hasVariants: boolean;
  basePrice: string;
  DiscountPrice: string;
  variants: VariantRow[];
  totalStock: string;
  isFeatured: boolean;
  isTopSelling: boolean;
  status: "draft" | "published";
  order: string;
  images: ProductImage[];
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string;
  canonicalUrl: string;
}

const emptyVariantRow = (): VariantRow => ({
  weight_label: "",
  base_price: "",
  discount_price: "0",
  stock: "",
});

const empty = (): FormData => ({
  title_en: "",
  title_bn: "",
  description: "",
  shortDescription: "",
  sku: "",
  category: "",
  hasVariants: false,
  basePrice: "",
  DiscountPrice: "0",
  variants: [],
  totalStock: "",
  isFeatured: false,
  isTopSelling: false,
  status: "draft",
  order: "",
  images: [],
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  ogImage: "",
  canonicalUrl: "",
});

function generateSku() {
  return "PROD-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

const fromProduct = (p: Product): FormData => ({
  title_en: p.title_en,
  title_bn: p.title_bn ?? "",
  description: p.description,
  shortDescription: p.shortDescription ?? "",
  sku: p.sku ?? "",
  category: p.category,
  hasVariants: (p.variants ?? []).length > 0,
  basePrice: String(p.basePrice),
  DiscountPrice: String(p.DiscountPrice),
  variants: (p.variants ?? []).map((v: ProductVariant) => ({
    weight_label: v.weight_label,
    base_price: String(v.base_price),
    discount_price: v.discount_price !== undefined ? String(v.discount_price) : "0",
    stock: String(v.stock),
  })),
  totalStock: p.totalStock !== undefined ? String(p.totalStock) : "",
  isFeatured: p.isFeatured,
  isTopSelling: p.isTopSelling,
  status: p.status,
  order: p.order !== undefined ? String(p.order) : "",
  images: p.images,
  metaTitle: p.metaTitle ?? "",
  metaDescription: p.metaDescription ?? "",
  metaKeywords: p.metaKeywords ?? "",
  ogImage: p.ogImage ?? "",
  canonicalUrl: p.canonicalUrl ?? "",
});

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  initialProduct?: Product | null;
}

export default function ProductForm({ initialProduct }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(
    initialProduct ? fromProduct(initialProduct) : empty()
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data.data)).catch(() => {});
  }, []);

  // ─── Variant helpers ────────────────────────────────────────────────────────
  const addVariantRow = () =>
    setForm((f) => ({ ...f, variants: [...f.variants, emptyVariantRow()] }));

  const removeVariantRow = (i: number) =>
    setForm((f) => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }));

  const updateVariant = (i: number, key: keyof VariantRow, val: string) =>
    setForm((f) => {
      const variants = [...f.variants];
      variants[i] = { ...variants[i], [key]: val };
      return { ...f, variants };
    });

  // ─── Image helpers ───────────────────────────────────────────────────────────
  const removeImage = (i: number) =>
    setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  const addManualImage = () =>
    setForm((f) => ({ ...f, images: [...f.images, { cloudinaryUrl: "", publicId: "" }] }));

  const updateManualImage = (i: number, key: keyof ProductImage, val: string) =>
    setForm((f) => {
      const images = [...f.images];
      images[i] = { ...images[i], [key]: val };
      return { ...f, images };
    });

  const handleUploadSuccess = (result: unknown) => {
    const info = (result as { info?: { secure_url?: string; public_id?: string } })?.info;
    if (info?.secure_url && info?.public_id) {
      setForm((f) => ({
        ...f,
        images: [...f.images, { cloudinaryUrl: info.secure_url!, publicId: info.public_id! }],
      }));
    }
  };

  // ─── Submit ──────────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.images.length === 0) {
      toast.error("Add at least one image");
      return;
    }
    if (form.hasVariants && form.variants.length === 0) {
      toast.error("Add at least one weight variant or disable the variants toggle");
      return;
    }
    if (form.hasVariants) {
      for (const v of form.variants) {
        if (!v.weight_label.trim() || !v.base_price) {
          toast.error("Fill in weight label and base price for all variants");
          return;
        }
        if (Number(v.discount_price) > Number(v.base_price)) {
          toast.error("Discount price cannot exceed base price");
          return;
        }
      }
    }

    const safeDescription =
      typeof window !== "undefined"
        ? DOMPurify.sanitize(form.description)
        : form.description;

    setSaving(true);
    try {
      const payload = {
        title_en: form.title_en,
        title_bn: form.title_bn || undefined,
        description: safeDescription,
        shortDescription: form.shortDescription || undefined,
        sku: form.sku || undefined,
        category: form.category,
        basePrice: form.hasVariants ? 0 : Number(form.basePrice),
        DiscountPrice: form.hasVariants ? 0 : Number(form.DiscountPrice),
        totalStock: form.totalStock ? Number(form.totalStock) : undefined,
        isFeatured: form.isFeatured,
        isTopSelling: form.isTopSelling,
        status: form.status,
        order: form.order !== "" ? Number(form.order) : undefined,
        images: form.images,
        variants: form.hasVariants
          ? form.variants.map((v) => ({
              weight_label: v.weight_label.trim(),
              base_price: Number(v.base_price),
              discount_price: Number(v.discount_price) || undefined,
              stock: v.stock ? Number(v.stock) : 0,
            }))
          : [],
        metaTitle: form.metaTitle || undefined,
        metaDescription: form.metaDescription || undefined,
        metaKeywords: form.metaKeywords || undefined,
        ogImage: form.ogImage || undefined,
        canonicalUrl: form.canonicalUrl || undefined,
      };

      if (initialProduct) {
        await api.put(`/products/${initialProduct._id}`, payload);
        toast.success("Product updated");
      } else {
        await api.post("/products", payload);
        toast.success("Product created");
      }
      router.push("/admin/products");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e?.response?.data?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-3xl mx-auto">

      {/* ── Basic info ── */}
      <Section title="Basic Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="English Title" required>
            <input
              required
              value={form.title_en}
              onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))}
              placeholder="Product name in English"
              className={inputCls}
            />
          </Field>
          <Field label="Bangla Title (optional)">
            <input
              value={form.title_bn}
              onChange={(e) => setForm((f) => ({ ...f, title_bn: e.target.value }))}
              placeholder="পণ্যের নাম বাংলায়"
              className={inputCls}
            />
          </Field>
          <Field label="Category" required>
            <select
              required
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className={inputCls}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Total Stock">
            <input
              type="number"
              min="0"
              value={form.totalStock}
              onChange={(e) => setForm((f) => ({ ...f, totalStock: e.target.value }))}
              className={inputCls}
            />
          </Field>
          <Field label="Display Order">
            <input
              type="number"
              min="1"
              placeholder="e.g. 1 (lower = shown first)"
              value={form.order}
              onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
              className={inputCls}
            />
          </Field>
          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value as "draft" | "published" }))
              }
              className={inputCls}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </Field>
        </div>
        <div className="flex gap-6 mt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
              className="w-4 h-4 accent-indigo-600"
            />
            <span className="text-sm text-gray-700">For you</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isTopSelling}
              onChange={(e) => setForm((f) => ({ ...f, isTopSelling: e.target.checked }))}
              className="w-4 h-4 accent-orange-500"
            />
            <span className="text-sm text-gray-700">Top Selling</span>
          </label>
        </div>
      </Section>

      {/* ── Short Description ── */}
      <Section title="Short Description">
        <Field label="Short Description">
          <textarea
            rows={2}
            maxLength={300}
            value={form.shortDescription}
            onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
            placeholder="A brief 1-2 sentence description shown on the product page below the price"
            className={`${inputCls} resize-none`}
          />
          <p className="text-xs text-gray-400 mt-1">{form.shortDescription.length}/300</p>
        </Field>
      </Section>

      {/* ── Description ── */}
      <Section title="Full Description">
        <RichTextEditor
          value={form.description}
          onChange={(html) => setForm((f) => ({ ...f, description: html }))}
          placeholder="Enter product description. You can paste formatted text directly."
          minHeight="200px"
          uploadPreset={uploadPreset}
        />
      </Section>

      {/* ── SKU ── */}
      <Section title="SKU">
        <div className="flex items-end gap-2">
          <Field label="SKU (auto-generated if blank)">
            <input
              value={form.sku}
              onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
              placeholder="PROD-ABC123"
              className={inputCls}
            />
          </Field>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, sku: generateSku() }))}
            className="flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-700 px-3 py-2.5 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-200 font-medium whitespace-nowrap mb-0.5"
          >
            Auto-generate
          </button>
        </div>
      </Section>

      {/* ── Pricing & Variants ── */}
      <Section title="Pricing & Weight Variants">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">Toggle on to add weight variants with individual prices.</p>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                form.hasVariants ? "bg-indigo-600" : "bg-gray-300"
              }`}
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  hasVariants: !f.hasVariants,
                  variants:
                    !f.hasVariants
                      ? f.variants.length > 0
                        ? f.variants
                        : [emptyVariantRow()]
                      : [],
                }))
              }
            >
              <span
                className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                  form.hasVariants ? "translate-x-[18px]" : "translate-x-[2px]"
                }`}
              />
            </div>
            <span className="text-sm font-medium text-gray-700">Has Variants</span>
          </label>
        </div>

        {!form.hasVariants ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Base Price (৳)" required>
              <input
                required
                type="number"
                min="0"
                value={form.basePrice}
                onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))}
                className={inputCls}
              />
            </Field>
            <Field label="Discount Price (৳)">
              <input
                type="number"
                min="0"
                value={form.DiscountPrice}
                onChange={(e) => setForm((f) => ({ ...f, DiscountPrice: e.target.value }))}
                className={inputCls}
              />
            </Field>
          </div>
        ) : (
          <div>
            <div className="space-y-2">
              {form.variants.length === 0 && (
                <p className="text-xs text-gray-400 italic">No weight variants added yet.</p>
              )}
              {form.variants.map((row, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-end bg-gray-50 rounded-lg p-2"
                >
                  <div>
                    {i === 0 && <p className="text-[10px] text-gray-400 uppercase mb-1">Weight Label</p>}
                    <input
                      placeholder="e.g. 250g, 500g, 1kg"
                      value={row.weight_label}
                      onChange={(e) => updateVariant(i, "weight_label", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    {i === 0 && <p className="text-[10px] text-gray-400 uppercase mb-1">Price ৳</p>}
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={row.base_price}
                      onChange={(e) => updateVariant(i, "base_price", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    {i === 0 && <p className="text-[10px] text-gray-400 uppercase mb-1">Discount ৳</p>}
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={row.discount_price}
                      onChange={(e) => updateVariant(i, "discount_price", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    {i === 0 && <p className="text-[10px] text-gray-400 uppercase mb-1">Stock</p>}
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={row.stock}
                      onChange={(e) => updateVariant(i, "stock", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVariantRow(i)}
                    className="pb-1 text-red-400 hover:text-red-600"
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addVariantRow}
              className="mt-2 flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              <Plus size={13} /> Add Weight Variant
            </button>
          </div>
        )}
      </Section>

      {/* ── Images ── */}
      <Section title="Images">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-500">At least one image is required.</p>
          <div className="flex items-center gap-2">
            {uploadPreset ? (
              <CldUploadWidget
                uploadPreset={uploadPreset}
                onSuccess={handleUploadSuccess}
                options={{ multiple: true, resourceType: "image" }}
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <ImagePlus size={13} /> Upload
                  </button>
                )}
              </CldUploadWidget>
            ) : (
              <button
                type="button"
                onClick={addManualImage}
                className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <Plus size={13} /> Add URL
              </button>
            )}
          </div>
        </div>
        <div className="space-y-2">
          {form.images.map((img, i) => (
            <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
              {img.cloudinaryUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img.cloudinaryUrl} alt="" className="w-12 h-12 object-cover rounded-md shrink-0" />
              )}
              <div className="flex-1 min-w-0 space-y-1">
                <input
                  placeholder="Cloudinary URL"
                  value={img.cloudinaryUrl}
                  onChange={(e) => updateManualImage(i, "cloudinaryUrl", e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
                <input
                  placeholder="Public ID"
                  value={img.publicId}
                  onChange={(e) => updateManualImage(i, "publicId", e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="text-red-400 hover:text-red-600 shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {form.images.length === 0 && (
            <p className="text-xs text-gray-400 italic">No images added yet.</p>
          )}
        </div>
      </Section>

      {/* ── SEO ── */}
      <Section title="SEO (optional)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Meta Title">
            <input
              maxLength={60}
              placeholder="Defaults to English product title"
              value={form.metaTitle}
              onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))}
              className={inputCls}
            />
            <p className={`text-xs mt-1 ${form.metaTitle.length > 60 ? "text-red-500" : "text-gray-400"}`}>
              {form.metaTitle.length}/60 — 5–60 chars recommended
            </p>
          </Field>
          <Field label="Canonical URL">
            <input
              type="url"
              placeholder="https://..."
              value={form.canonicalUrl}
              onChange={(e) => setForm((f) => ({ ...f, canonicalUrl: e.target.value }))}
              className={inputCls}
            />
          </Field>
          <Field label="OG Image URL">
            <input
              type="url"
              placeholder="Defaults to first product image"
              value={form.ogImage}
              onChange={(e) => setForm((f) => ({ ...f, ogImage: e.target.value }))}
              className={inputCls}
            />
          </Field>
          <Field label="Meta Keywords">
            <input
              maxLength={500}
              placeholder="keyword1, keyword2, keyword3"
              value={form.metaKeywords}
              onChange={(e) => setForm((f) => ({ ...f, metaKeywords: e.target.value }))}
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Meta Description">
          <textarea
            rows={3}
            maxLength={320}
            placeholder="Defaults to plain text of description (160 chars)"
            value={form.metaDescription}
            onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
            className={`${inputCls} resize-none`}
          />
          <p className={`text-xs mt-1 ${form.metaDescription.length > 160 ? "text-amber-500" : "text-gray-400"}`}>
            {form.metaDescription.length}/320 — Google shows ~160 chars in search results
          </p>
        </Field>
      </Section>

      {/* ── Submit ── */}
      <div className="flex items-center justify-between pt-2 pb-6">
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← Back to Products
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {initialProduct ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputCls =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
      <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-2">{title}</h3>
      {children}
    </div>
  );
}
