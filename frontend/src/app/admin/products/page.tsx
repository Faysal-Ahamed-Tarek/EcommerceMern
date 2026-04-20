"use client";

import { useEffect, useState, useCallback } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, Loader2, ImagePlus, Star } from "lucide-react";
import type { Product, Category, ProductVariant, ProductImage } from "@/types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProductFormData {
  title: string;
  sku: string;
  description: string;
  category: string;
  basePrice: string;
  DiscountPrice: string;
  totalStock: string;
  isFeatured: boolean;
  status: "draft" | "published";
  images: ProductImage[];
  variants: ProductVariant[];
}

const emptyForm = (): ProductFormData => ({
  title: "",
  sku: "",
  description: "",
  category: "",
  basePrice: "",
  DiscountPrice: "",
  totalStock: "",
  isFeatured: false,
  status: "draft",
  images: [],
  variants: [],
});

const productToForm = (p: Product): ProductFormData => ({
  title: p.title,
  sku: p.sku,
  description: p.description,
  category: p.category,
  basePrice: String(p.basePrice),
  DiscountPrice: String(p.DiscountPrice),
  totalStock: p.totalStock !== undefined ? String(p.totalStock) : "",
  isFeatured: p.isFeatured,
  status: p.status,
  images: p.images,
  variants: p.variants,
});

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get("/admin/products?limit=200");
      setProducts(res.data.data);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    api.get("/categories").then((r) => setCategories(r.data.data)).catch(() => {});
  }, [fetchProducts]);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm(productToForm(p));
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.images.length === 0) {
      toast.error("Add at least one image");
      return;
    }
    if (form.variants.length === 0) {
      toast.error("Add at least one variant");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        basePrice: Number(form.basePrice),
        DiscountPrice: Number(form.DiscountPrice),
        totalStock: form.totalStock ? Number(form.totalStock) : undefined,
      };
      if (editing) {
        await api.put(`/products/${editing._id}`, payload);
        toast.success("Product updated");
      } else {
        await api.post("/products", payload);
        toast.success("Product created");
      }
      closeModal();
      fetchProducts();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      setDeleteId(null);
      fetchProducts();
    } catch {
      toast.error("Delete failed");
    }
  };

  // ─── Variant helpers ───────────────────────────────────────────────────────
  const addVariant = () =>
    setForm((f) => ({ ...f, variants: [...f.variants, { name: "", price: 0, stock: 0, sku: "" }] }));

  const updateVariant = (i: number, key: keyof ProductVariant, val: string | number) =>
    setForm((f) => {
      const variants = [...f.variants];
      variants[i] = { ...variants[i], [key]: val } as ProductVariant;
      return { ...f, variants };
    });

  const removeVariant = (i: number) =>
    setForm((f) => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }));

  // ─── Image helpers ─────────────────────────────────────────────────────────
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

  const handleUploadSuccess = (result: any) => {
    const info = result?.info;
    if (info?.secure_url && info?.public_id) {
      setForm((f) => ({
        ...f,
        images: [...f.images, { cloudinaryUrl: info.secure_url, publicId: info.public_id }],
      }));
    }
  };

  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-400" size={28} /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Featured</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No products yet</td></tr>
              )}
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{p.title}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.sku}</td>
                  <td className="px-4 py-3 text-gray-600">{p.category}</td>
                  <td className="px-4 py-3 text-gray-900">৳{p.basePrice.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.isFeatured && <Star size={14} className="text-amber-500 fill-amber-500" />}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="text-indigo-600 hover:text-indigo-800 transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setDeleteId(p._id)} className="text-red-500 hover:text-red-700 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Product Modal ──────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4 my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{editing ? "Edit Product" : "New Product"}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <form onSubmit={handleSave} className="px-6 py-5 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Basic fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Title" required>
                  <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputCls} />
                </Field>
                <Field label="SKU" required>
                  <input required value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} className={inputCls} />
                </Field>
                <Field label="Base Price (৳)" required>
                  <input required type="number" min="0" value={form.basePrice} onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))} className={inputCls} />
                </Field>
                <Field label="Discount Price (৳)" required>
                  <input required type="number" min="0" value={form.DiscountPrice} onChange={(e) => setForm((f) => ({ ...f, DiscountPrice: e.target.value }))} className={inputCls} />
                </Field>
                <Field label="Total Stock">
                  <input type="number" min="0" value={form.totalStock} onChange={(e) => setForm((f) => ({ ...f, totalStock: e.target.value }))} className={inputCls} />
                </Field>
                <Field label="Category" required>
                  <select required value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className={inputCls}>
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Status">
                  <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "draft" | "published" }))} className={inputCls}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </Field>
                <Field label="">
                  <label className="flex items-center gap-2 mt-5 cursor-pointer">
                    <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))} className="w-4 h-4 accent-indigo-600" />
                    <span className="text-sm text-gray-700">Featured product</span>
                  </label>
                </Field>
              </div>

              <Field label="Description" required>
                <textarea required rows={4} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={`${inputCls} resize-none`} />
              </Field>

              {/* Images */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Images</p>
                  <div className="flex items-center gap-2">
                    {uploadPreset ? (
                      <CldUploadWidget uploadPreset={uploadPreset} onSuccess={handleUploadSuccess} options={{ multiple: true, resourceType: "image" }}>
                        {({ open }) => (
                          <button type="button" onClick={() => open()} className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
                            <ImagePlus size={13} /> Upload
                          </button>
                        )}
                      </CldUploadWidget>
                    ) : (
                      <button type="button" onClick={addManualImage} className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
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
                      <button type="button" onClick={() => removeImage(i)} className="text-red-400 hover:text-red-600 shrink-0">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {form.images.length === 0 && (
                    <p className="text-xs text-gray-400 italic">No images added yet</p>
                  )}
                </div>
              </div>

              {/* Variants */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Variants</p>
                  <button type="button" onClick={addVariant} className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors">
                    <Plus size={13} /> Add Variant
                  </button>
                </div>
                <div className="space-y-2">
                  {form.variants.map((v, i) => (
                    <div key={i} className="grid grid-cols-4 gap-2 bg-gray-50 rounded-lg p-2 items-center">
                      <input placeholder="Name (e.g. 500g)" value={v.name} onChange={(e) => updateVariant(i, "name", e.target.value)} className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                      <input placeholder="Price" type="number" min="0" value={v.price} onChange={(e) => updateVariant(i, "price", Number(e.target.value))} className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                      <input placeholder="Stock" type="number" min="0" value={v.stock ?? ""} onChange={(e) => updateVariant(i, "stock", Number(e.target.value))} className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                      <div className="flex items-center gap-1">
                        <input placeholder="SKU" value={v.sku ?? ""} onChange={(e) => updateVariant(i, "sku", e.target.value)} className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                        <button type="button" onClick={() => removeVariant(i)} className="text-red-400 hover:text-red-600 shrink-0">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {form.variants.length === 0 && (
                    <p className="text-xs text-gray-400 italic">No variants added yet</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60">
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {editing ? "Update" : "Create"} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Delete Confirm ────────────────────────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold text-gray-900 mb-2">Delete Product?</h3>
            <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
    </div>
  );
}
