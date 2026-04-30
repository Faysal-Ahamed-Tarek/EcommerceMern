"use client";

import { useEffect, useState, useCallback } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, Loader2, Check, ImagePlus, Eye, EyeOff, Save, GripVertical } from "lucide-react";
import type { HeroSlide, PromoPanel, PromoPanelItem, Category } from "@/types";

// ─── Hero Slides ────────────────────────────────────────────────────────────

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

// ─── Promo Panel ─────────────────────────────────────────────────────────────

const emptyPanelItem = (): PromoPanelItem => ({
  imageUrl: "",
  publicId: "",
  link: "",
  altText: "",
});

export default function AdminContentPage() {
  // Hero slides state
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loadingSlides, setLoadingSlides] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [form, setForm] = useState<SlideForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Promo panel state
  const [promoLeft, setPromoLeft] = useState<PromoPanelItem>(emptyPanelItem());
  const [promoRight, setPromoRight] = useState<PromoPanelItem>(emptyPanelItem());
  const [loadingPromo, setLoadingPromo] = useState(true);
  const [savingPromo, setSavingPromo] = useState(false);

  // Marquee texts state
  const [marqueeTexts, setMarqueeTexts] = useState<string[]>([
    '🚚 Free delivery on orders above ৳999',
    'Cash on Delivery available across Bangladesh',
  ]);
  const [newMarqueeText, setNewMarqueeText] = useState('');
  const [savingMarquee, setSavingMarquee] = useState(false);

  // Home categories state
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [homeCategories, setHomeCategories] = useState<string[]>([]);
  const [savingHomeCats, setSavingHomeCats] = useState(false);

  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // ── Hero slide handlers ──────────────────────────────────────────────────

  const fetchSlides = useCallback(async () => {
    try {
      const res = await api.get("/admin/slides");
      setSlides(res.data.data);
    } catch {
      toast.error("Failed to load slides");
    } finally {
      setLoadingSlides(false);
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
      await api.put(`/admin/slides/${slide._id}`, { isActive: !slide.isActive });
      toast.success("Slide updated");
      fetchSlides();
    } catch {
      toast.error("Update failed");
    }
  };

  const handleSlideUpload = (result: any) => {
    const info = result?.info;
    if (info?.secure_url && info?.public_id) {
      setForm((f) => ({ ...f, imageUrl: info.secure_url, publicId: info.public_id }));
    }
  };

  // ── Promo panel handlers ─────────────────────────────────────────────────

  const fetchPromoPanel = useCallback(async () => {
    try {
      const res = await api.get("/admin/promo-panel");
      const data: PromoPanel = res.data?.data;
      if (data) {
        setPromoLeft({ ...emptyPanelItem(), ...data.left });
        setPromoRight({ ...emptyPanelItem(), ...data.right });
      }
    } catch {
      // silently ignore — panel just stays empty
    } finally {
      setLoadingPromo(false);
    }
  }, []);

  useEffect(() => { fetchPromoPanel(); }, [fetchPromoPanel]);

  // Load marquee texts and home categories from config, plus all categories
  useEffect(() => {
    api.get('/config')
      .then((r) => {
        const d = r.data?.data;
        if (d?.marqueeTexts?.length > 0) setMarqueeTexts(d.marqueeTexts);
        if (d?.homeCategories) setHomeCategories(d.homeCategories);
      })
      .catch(() => {});

    api.get('/categories')
      .then((r) => setAllCategories(r.data?.data ?? []))
      .catch(() => {});
  }, []);

  const handleSaveMarquee = async () => {
    setSavingMarquee(true);
    try {
      await api.put('/admin/config', { marqueeTexts });
      toast.success('Marquee texts saved');
    } catch {
      toast.error('Failed to save marquee texts');
    } finally {
      setSavingMarquee(false);
    }
  };

  const addMarqueeText = () => {
    if (!newMarqueeText.trim()) return;
    setMarqueeTexts((t) => [...t, newMarqueeText.trim()]);
    setNewMarqueeText('');
  };

  const removeMarqueeText = (i: number) =>
    setMarqueeTexts((t) => t.filter((_, idx) => idx !== i));

  const updateMarqueeText = (i: number, val: string) =>
    setMarqueeTexts((t) => t.map((item, idx) => (idx === i ? val : item)));

  const handleSaveHomeCategories = async () => {
    setSavingHomeCats(true);
    try {
      await api.put('/admin/config', { homeCategories });
      toast.success('Home categories saved');
    } catch {
      toast.error('Failed to save home categories');
    } finally {
      setSavingHomeCats(false);
    }
  };

  const toggleHomeCategory = (slug: string) => {
    setHomeCategories((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 2) {
        toast.error('You can select at most 2 categories');
        return prev;
      }
      return [...prev, slug];
    });
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPromo(true);
    try {
      await api.put("/admin/promo-panel", { left: promoLeft, right: promoRight });
      toast.success("Promo banner saved");
    } catch {
      toast.error("Failed to save promo banner");
    } finally {
      setSavingPromo(false);
    }
  };

  const makePromoUploadHandler =
    (side: "left" | "right") => (result: any) => {
      const info = result?.info;
      if (info?.secure_url && info?.public_id) {
        const setter = side === "left" ? setPromoLeft : setPromoRight;
        setter((p) => ({ ...p, imageUrl: info.secure_url, publicId: info.public_id }));
      }
    };

  return (
    <div className="space-y-10">
      {/* ── Hero Slides ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Home Page banner sliders</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage the homepage banner slider</p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus size={16} /> Add Slide
          </button>
        </div>

        {loadingSlides ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-gray-400" size={28} />
          </div>
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
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      No slides yet — add one to configure the hero banner
                    </td>
                  </tr>
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
                    <td className="px-4 py-3 text-gray-500 text-xs font-mono truncate max-w-[160px]">
                      {s.ctaLink || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{s.order}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(s)}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                          s.isActive
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {s.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                        {s.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(s)}
                          className="text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteId(s._id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
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
      </div>

      {/* ── Promo Banner ────────────────────────────────────────────── */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Home Page Promo Banner</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Two side-by-side images shown after Featured Products
          </p>
        </div>

        {loadingPromo ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-gray-400" size={28} />
          </div>
        ) : (
          <form onSubmit={handleSavePromo} className="bg-white rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <PromoPanelEditor
                label="Left Panel"
                value={promoLeft}
                onChange={setPromoLeft}
                uploadPreset={uploadPreset}
                onUploadSuccess={makePromoUploadHandler("left")}
              />
              <PromoPanelEditor
                label="Right Panel"
                value={promoRight}
                onChange={setPromoRight}
                uploadPreset={uploadPreset}
                onUploadSuccess={makePromoUploadHandler("right")}
              />
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={savingPromo}
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
              >
                {savingPromo ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Promo Banner
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Marquee Texts ───────────────────────────────────────────── */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Header Marquee Texts</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Texts that scroll in the top announcement bar — one per line
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          {marqueeTexts.map((text, i) => (
            <div key={i} className="flex items-center gap-2">
              <GripVertical size={16} className="text-gray-300 shrink-0" />
              <input
                value={text}
                onChange={(e) => updateMarqueeText(i, e.target.value)}
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => removeMarqueeText(i)}
                className="text-red-400 hover:text-red-600 shrink-0"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}

          {/* Add new text */}
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <input
              value={newMarqueeText}
              onChange={(e) => setNewMarqueeText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMarqueeText())}
              placeholder="Add new announcement text…"
              className={inputCls}
            />
            <button
              type="button"
              onClick={addMarqueeText}
              className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors shrink-0 border border-indigo-200"
            >
              <Plus size={14} /> Add
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveMarquee}
              disabled={savingMarquee}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {savingMarquee ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Marquee
            </button>
          </div>
        </div>
      </div>

      {/* ── Home Page Categories ────────────────────────────────────── */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Home Page Category Sections</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Select up to 2 categories to display as product carousels on the home page (before the footer)
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          {allCategories.length === 0 ? (
            <p className="text-sm text-gray-400">No categories found. Create categories first.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-5">
              {allCategories.map((cat) => {
                const selected = homeCategories.includes(cat.slug);
                return (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => toggleHomeCategory(cat.slug)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-colors text-left ${
                      selected
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center ${
                        selected ? "border-indigo-500 bg-indigo-500" : "border-gray-300"
                      }`}
                    >
                      {selected && <Check size={10} className="text-white" />}
                    </span>
                    {cat.name}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              {homeCategories.length}/2 selected
              {homeCategories.length > 0 && `: ${homeCategories.join(", ")}`}
            </p>
            <button
              type="button"
              onClick={handleSaveHomeCategories}
              disabled={savingHomeCats}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {savingHomeCats ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Categories
            </button>
          </div>
        </div>
      </div>

      {/* ── Hero Slide Modal ─────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{editing ? "Edit Slide" : "New Slide"}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image <span className="text-red-500">*</span>
                </label>
                {form.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.imageUrl} alt="Preview" className="w-full h-36 object-cover rounded-xl mb-3" />
                )}
                {uploadPreset ? (
                  <CldUploadWidget
                    uploadPreset={uploadPreset}
                    onSuccess={handleSlideUpload}
                    options={{ resourceType: "image" }}
                  >
                    {({ open }) => (
                      <button
                        type="button"
                        onClick={() => open()}
                        className="flex items-center gap-2 w-full border-2 border-dashed border-gray-300 rounded-xl py-3 justify-center text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                      >
                        <ImagePlus size={16} />
                        {form.imageUrl ? "Change Image" : "Upload Image"}
                      </button>
                    )}
                  </CldUploadWidget>
                ) : (
                  <div className="space-y-2">
                    <input
                      placeholder="Image URL"
                      value={form.imageUrl}
                      onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                      className={inputCls}
                    />
                    <input
                      placeholder="Public ID"
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
                  <input
                    value={form.altText}
                    onChange={(e) => setForm((f) => ({ ...f, altText: e.target.value }))}
                    placeholder="Banner description"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Order</label>
                  <input
                    type="number"
                    min="0"
                    value={form.order}
                    onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">CTA Link</label>
                <input
                  value={form.ctaLink}
                  onChange={(e) => setForm((f) => ({ ...f, ctaLink: e.target.value }))}
                  placeholder="/products or /category/name"
                  className={inputCls}
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-indigo-600"
                />
                <span className="text-sm text-gray-700">Active (visible on homepage)</span>
              </label>

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  {editing ? "Update" : "Create"} Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete confirm ───────────────────────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold text-gray-900 mb-2">Delete Slide?</h3>
            <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Promo panel sub-editor ────────────────────────────────────────────────────

function PromoPanelEditor({
  label,
  value,
  onChange,
  uploadPreset,
  onUploadSuccess,
}: {
  label: string;
  value: PromoPanelItem;
  onChange: (v: PromoPanelItem) => void;
  uploadPreset: string | undefined;
  onUploadSuccess: (result: any) => void;
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">{label}</h3>

      {/* Image preview + upload */}
      <div>
        {value.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value.imageUrl}
            alt={value.altText || label}
            className="w-full h-36 object-cover rounded-xl mb-3"
          />
        )}
        {uploadPreset ? (
          <CldUploadWidget
            uploadPreset={uploadPreset}
            onSuccess={onUploadSuccess}
            options={{ resourceType: "image" }}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                className="flex items-center gap-2 w-full border-2 border-dashed border-gray-300 rounded-xl py-3 justify-center text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
              >
                <ImagePlus size={16} />
                {value.imageUrl ? "Change Image" : "Upload Image"}
              </button>
            )}
          </CldUploadWidget>
        ) : (
          <div className="space-y-2">
            <input
              placeholder="Image URL"
              value={value.imageUrl}
              onChange={(e) => onChange({ ...value, imageUrl: e.target.value })}
              className={inputCls}
            />
            <input
              placeholder="Public ID"
              value={value.publicId}
              onChange={(e) => onChange({ ...value, publicId: e.target.value })}
              className={inputCls}
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Link (URL)</label>
        <input
          placeholder="/products or /category/name"
          value={value.link}
          onChange={(e) => onChange({ ...value, link: e.target.value })}
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Alt Text</label>
        <input
          placeholder="Image description"
          value={value.altText}
          onChange={(e) => onChange({ ...value, altText: e.target.value })}
          className={inputCls}
        />
      </div>
    </div>
  );
}

const inputCls =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";
