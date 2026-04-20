"use client";

import { useEffect, useState, useCallback } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, Loader2, Check, ImagePlus, Eye, EyeOff } from "lucide-react";
import type { HeroSlide } from "@/types";

interface SlideForm {
  imageUrl: string;
  publicId: string;
  ctaLink: string;
  altText: string;
  order: string;
  isActive: boolean;
}

const emptyForm = (): SlideForm => ({
  imageUrl: "",
  publicId: "",
  ctaLink: "",
  altText: "",
  order: "0",
  isActive: true,
});

const slideToForm = (s: HeroSlide): SlideForm => ({
  imageUrl: s.imageUrl,
  publicId: s.publicId,
  ctaLink: s.ctaLink ?? "",
  altText: s.altText ?? "",
  order: String(s.order ?? 0),
  isActive: s.isActive ?? true,
});

export default function AdminContentPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [form, setForm] = useState<SlideForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchSlides = useCallback(async () => {
    try {
      const res = await api.get("/admin/slides");
      setSlides(res.data.data);
    } catch {
      toast.error("Failed to load slides");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSlides(); }, [fetchSlides]);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (s: HeroSlide) => {
    setEditing(s);
    setForm(slideToForm(s));
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imageUrl || !form.publicId) {
      toast.error("Image is required");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, order: Number(form.order) };
      if (editing) {
        await api.put(`/admin/slides/${editing._id}`, payload);
        toast.success("Slide updated");
      } else {
        await api.post("/admin/slides", payload);
        toast.success("Slide created");
      }
      closeModal();
      fetchSlides();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/admin/slides/${id}`);
      toast.success("Slide deleted");
      setDeleteId(null);
      fetchSlides();
    } catch {
      toast.error("Delete failed");
    }
  };

  const toggleActive = async (slide: HeroSlide) => {
    try {
      await api.put(`/admin/slides/${slide._id}`, { isActive: !(slide as any).isActive });
      toast.success("Slide updated");
      fetchSlides();
    } catch {
      toast.error("Update failed");
    }
  };

  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const handleUploadSuccess = (result: any) => {
    const info = result?.info;
    if (info?.secure_url && info?.public_id) {
      setForm((f) => ({ ...f, imageUrl: info.secure_url, publicId: info.public_id }));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hero Slides</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage the homepage banner slider</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> Add Slide
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-400" size={28} /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Preview</th>
                <th className="px-4 py-3">Alt Text</th>
                <th className="px-4 py-3">CTA Link</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {slides.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No slides yet — add one to configure the hero banner</td></tr>
              )}
              {slides.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    {s.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.imageUrl} alt={s.altText ?? "Slide"} className="w-24 h-14 object-cover rounded-lg" />
                    ) : (
                      <div className="w-24 h-14 bg-gray-100 rounded-lg" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{s.altText || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs font-mono truncate max-w-[160px]">{s.ctaLink || "—"}</td>
                  <td className="px-4 py-3 text-gray-700">{s.order}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(s)}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium transition-colors ${s.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                    >
                      {s.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                      {s.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(s)} className="text-indigo-600 hover:text-indigo-800 transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setDeleteId(s._id)} className="text-red-500 hover:text-red-700 transition-colors">
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{editing ? "Edit Slide" : "New Slide"}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image <span className="text-red-500">*</span>
                </label>
                {form.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.imageUrl} alt="Preview" className="w-full h-36 object-cover rounded-xl mb-3" />
                )}
                {uploadPreset ? (
                  <CldUploadWidget uploadPreset={uploadPreset} onSuccess={handleUploadSuccess} options={{ resourceType: "image" }}>
                    {({ open }) => (
                      <button type="button" onClick={() => open()} className="flex items-center gap-2 w-full border-2 border-dashed border-gray-300 rounded-xl py-3 justify-center text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
                        <ImagePlus size={16} /> {form.imageUrl ? "Change Image" : "Upload Image"}
                      </button>
                    )}
                  </CldUploadWidget>
                ) : (
                  <div className="space-y-2">
                    <input
                      placeholder="Image URL (e.g. https://res.cloudinary.com/...)"
                      value={form.imageUrl}
                      onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                      className={inputCls}
                    />
                    <input
                      placeholder="Public ID (e.g. folder/filename)"
                      value={form.publicId}
                      onChange={(e) => setForm((f) => ({ ...f, publicId: e.target.value }))}
                      className={inputCls}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Alt Text</label>
                  <input value={form.altText} onChange={(e) => setForm((f) => ({ ...f, altText: e.target.value }))} placeholder="Banner description" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Order</label>
                  <input type="number" min="0" value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))} className={inputCls} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">CTA Link</label>
                <input value={form.ctaLink} onChange={(e) => setForm((f) => ({ ...f, ctaLink: e.target.value }))} placeholder="/products or /category/name" className={inputCls} />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-indigo-600" />
                <span className="text-sm text-gray-700">Active (visible on homepage)</span>
              </label>

              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  {editing ? "Update" : "Create"} Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold text-gray-900 mb-2">Delete Slide?</h3>
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

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";
