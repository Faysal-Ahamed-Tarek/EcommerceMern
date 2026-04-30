"use client";

import { useEffect, useState, useCallback } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import {
  Plus, Pencil, Trash2, X, Loader2, Check, ImagePlus,
  Eye, EyeOff, Save,
} from "lucide-react";
import type { HeroSlide, PromoPanel, PromoPanelItem, Category, HomeReview } from "@/types";

interface SlideForm {
  imageUrl: string;
  publicId: string;
  ctaLink: string;
  altText: string;
  order: string;
  isActive: boolean;
}

const emptySlideForm = (): SlideForm => ({
  imageUrl: "", publicId: "", ctaLink: "", altText: "", order: "0", isActive: true,
});

const slideToForm = (s: HeroSlide): SlideForm => ({
  imageUrl: s.imageUrl,
  publicId: s.publicId,
  ctaLink: s.ctaLink ?? "",
  altText: s.altText ?? "",
  order: String(s.order ?? 0),
  isActive: s.isActive ?? true,
});

const emptyPanelItem = (): PromoPanelItem => ({
  imageUrl: "", publicId: "", link: "", altText: "",
});

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";

type ReviewForm = {
  customerName: string;
  rating: number;
  comment: string;
  reviewerPhoto: string;
  imageUrl: string;
  isVerified: boolean;
  isActive: boolean;
  order: string;
};

const emptyReviewForm = (): ReviewForm => ({
  customerName: "", rating: 5, comment: "",
  reviewerPhoto: "", imageUrl: "",
  isVerified: false, isActive: true, order: "0",
});

export default function AdminHomePage() {
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // Hero slides state
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loadingSlides, setLoadingSlides] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [form, setForm] = useState<SlideForm>(emptySlideForm());
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Promo panel state
  const [promoLeft, setPromoLeft] = useState<PromoPanelItem>(emptyPanelItem());
  const [promoRight, setPromoRight] = useState<PromoPanelItem>(emptyPanelItem());
  const [loadingPromo, setLoadingPromo] = useState(true);
  const [savingPromo, setSavingPromo] = useState(false);

  // Home category rows state
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [row1Slug, setRow1Slug] = useState("");
  const [row2Slug, setRow2Slug] = useState("");
  const [savingRows, setSavingRows] = useState(false);

  // Home reviews state
  const [homeReviews, setHomeReviews] = useState<HomeReview[]>([]);
  const [reviewModal, setReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState<HomeReview | null>(null);
  const [reviewForm, setReviewForm] = useState(emptyReviewForm());
  const [savingReview, setSavingReview] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

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

  const fetchPromoPanel = useCallback(async () => {
    try {
      const res = await api.get("/admin/promo-panel");
      const data: PromoPanel = res.data?.data;
      if (data) {
        setPromoLeft({ ...emptyPanelItem(), ...data.left });
        setPromoRight({ ...emptyPanelItem(), ...data.right });
      }
    } catch {
      // silently ignore
    } finally {
      setLoadingPromo(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchSlides(); }, [fetchSlides]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchPromoPanel(); }, [fetchPromoPanel]);

  useEffect(() => {
    api.get("/categories").then((r) => setAllCategories(r.data?.data ?? [])).catch(() => {});
    api.get("/config")
      .then((r) => {
        const cats: string[] = r.data?.data?.homeCategories ?? [];
        setRow1Slug(cats[0] ?? "");
        setRow2Slug(cats[1] ?? "");
      })
      .catch(() => {});
    api.get("/home-reviews/all").then((r) => setHomeReviews(r.data?.data ?? [])).catch(() => {});
  }, []);

  const openNew = () => { setEditing(null); setForm(emptySlideForm()); setModalOpen(true); };
  const openEdit = (s: HeroSlide) => { setEditing(s); setForm(slideToForm(s)); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imageUrl || !form.publicId) { toast.error("Image is required"); return; }
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
    } catch (err) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Save failed");
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

  const handleSlideUpload = (result: unknown) => {
    const info = (result as { info?: { secure_url?: string; public_id?: string } })?.info;
    if (info?.secure_url && info?.public_id) {
      setForm((f) => ({ ...f, imageUrl: info.secure_url ?? "", publicId: info.public_id ?? "" }));
    }
  };

  const handleSaveCategoryRows = async () => {
    const slugs = [row1Slug, row2Slug].filter(Boolean);
    setSavingRows(true);
    try {
      await api.put("/admin/config", { homeCategories: slugs });
      toast.success("Category rows saved");
    } catch {
      toast.error("Failed to save category rows");
    } finally {
      setSavingRows(false);
    }
  };

  const openNewReview = () => { setEditingReview(null); setReviewForm(emptyReviewForm()); setReviewModal(true); };
  const openEditReview = (r: HomeReview) => {
    setEditingReview(r);
    setReviewForm({
      customerName: r.customerName, rating: r.rating, comment: r.comment,
      reviewerPhoto: r.reviewerPhoto ?? "", imageUrl: r.imageUrl ?? "",
      isVerified: r.isVerified, isActive: r.isActive, order: String(r.order),
    });
    setReviewModal(true);
  };

  const handleSaveReview = async () => {
    if (!reviewForm.customerName.trim() || !reviewForm.comment.trim()) {
      toast.error("Name and comment are required");
      return;
    }
    setSavingReview(true);
    try {
      const payload = { ...reviewForm, order: Number(reviewForm.order) };
      if (editingReview) {
        const res = await api.put(`/home-reviews/${editingReview._id}`, payload);
        setHomeReviews((prev) => prev.map((r) => r._id === editingReview._id ? res.data.data : r));
        toast.success("Review updated");
      } else {
        const res = await api.post("/home-reviews", payload);
        setHomeReviews((prev) => [res.data.data, ...prev]);
        toast.success("Review added");
      }
      setReviewModal(false);
    } catch { toast.error("Save failed"); }
    finally { setSavingReview(false); }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      await api.delete(`/home-reviews/${id}`);
      setHomeReviews((prev) => prev.filter((r) => r._id !== id));
      setDeletingReviewId(null);
      toast.success("Review deleted");
    } catch { toast.error("Delete failed"); }
  };

  const toggleReviewActive = async (r: HomeReview) => {
    try {
      const res = await api.put(`/home-reviews/${r._id}`, { isActive: !r.isActive });
      setHomeReviews((prev) => prev.map((x) => x._id === r._id ? res.data.data : x));
    } catch { toast.error("Update failed"); }
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

  const makePromoUploadHandler = (side: "left" | "right") => (result: unknown) => {
    const info = (result as { info?: { secure_url?: string; public_id?: string } })?.info;
    if (info?.secure_url && info?.public_id) {
      const setter = side === "left" ? setPromoLeft : setPromoRight;
      setter((p) => ({ ...p, imageUrl: info.secure_url ?? "", publicId: info.public_id ?? "" }));
    }
  };

  return (
    <div className="space-y-10">
      {/* Hero Slides */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Banner Sliders</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage the homepage hero banner slides</p>
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
      </div>

      {/* Promo Banner */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Promo Banner</h2>
          <p className="text-sm text-gray-500 mt-0.5">Two side-by-side images shown after Featured Products</p>
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

      {/* ── Home Page Category Rows ──────────────────────────────── */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Category Sections</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Choose which categories to display as product carousels at the bottom of the home page, before the footer.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          {/* Row 1 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Row 1 — Category
            </label>
            <select
              value={row1Slug}
              onChange={(e) => setRow1Slug(e.target.value)}
              className={inputCls}
            >
              <option value="">— None (hide row 1) —</option>
              {allCategories.map((cat) => (
                <option key={cat._id} value={cat.slug} disabled={cat.slug === row2Slug}>
                  {cat.name}
                </option>
              ))}
            </select>
            {row1Slug && (
              <p className="mt-1.5 text-xs text-gray-400">
                Shows up to 8 products from <strong>{allCategories.find((c) => c.slug === row1Slug)?.name}</strong> with a &ldquo;View All&rdquo; link.
              </p>
            )}
          </div>

          {/* Row 2 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Row 2 — Category
            </label>
            <select
              value={row2Slug}
              onChange={(e) => setRow2Slug(e.target.value)}
              className={inputCls}
            >
              <option value="">— None (hide row 2) —</option>
              {allCategories.map((cat) => (
                <option key={cat._id} value={cat.slug} disabled={cat.slug === row1Slug}>
                  {cat.name}
                </option>
              ))}
            </select>
            {row2Slug && (
              <p className="mt-1.5 text-xs text-gray-400">
                Shows up to 8 products from <strong>{allCategories.find((c) => c.slug === row2Slug)?.name}</strong> with a &ldquo;View All&rdquo; link.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              {[row1Slug, row2Slug].filter(Boolean).length} of 2 rows active
            </p>
            <button
              type="button"
              onClick={handleSaveCategoryRows}
              disabled={savingRows}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {savingRows ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Category Rows
            </button>
          </div>
        </div>
      </div>

      {/* ── Home Reviews ─────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
            <p className="text-sm text-gray-500 mt-0.5">Customer testimonials shown at the bottom of the home page</p>
          </div>
          <button
            onClick={openNewReview}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus size={16} /> Add Review
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Reviewer</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Comment</th>
                <th className="px-4 py-3">Images</th>
                <th className="px-4 py-3">Verified</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {homeReviews.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    No reviews yet — add one to show testimonials on the home page
                  </td>
                </tr>
              )}
              {homeReviews.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {r.reviewerPhoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.reviewerPhoto} alt={r.customerName} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center uppercase">
                          {r.customerName[0]}
                        </div>
                      )}
                      <span className="font-medium text-gray-800 text-xs">{r.customerName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`text-sm ${i < r.rating ? "text-amber-400" : "text-gray-200"}`}>★</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-[180px]">
                    <p className="text-xs text-gray-600 line-clamp-2">{r.comment}</p>
                  </td>
                  <td className="px-4 py-3">
                    {r.imageUrl ? (
                      <a href={r.imageUrl} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={r.imageUrl} alt="Review" className="w-10 h-10 object-cover rounded-lg border border-gray-200 hover:scale-105 transition-transform cursor-zoom-in" />
                      </a>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {r.isVerified
                      ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">✓ Verified</span>
                      : <span className="text-xs text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleReviewActive(r)}
                      className={`text-xs px-2 py-1 rounded-full font-medium transition-colors flex items-center gap-1 ${
                        r.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {r.isActive ? <Eye size={11} /> : <EyeOff size={11} />}
                      {r.isActive ? "Active" : "Hidden"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditReview(r)} className="text-indigo-500 hover:text-indigo-700 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeletingReviewId(r._id)} className="text-red-500 hover:text-red-700 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Review Modal ─────────────────────────────────────────── */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{editingReview ? "Edit Review" : "Add Review"}</h3>
              <button onClick={() => setReviewModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Customer Name <span className="text-red-500">*</span></label>
                  <input value={reviewForm.customerName} onChange={(e) => setReviewForm((f) => ({ ...f, customerName: e.target.value }))} placeholder="e.g. Rina Akter" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Rating</label>
                  <select value={reviewForm.rating} onChange={(e) => setReviewForm((f) => ({ ...f, rating: Number(e.target.value) }))} className={inputCls}>
                    {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)} ({n})</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Comment <span className="text-red-500">*</span></label>
                <textarea rows={3} value={reviewForm.comment} onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))} placeholder="Write the review…" className={`${inputCls} resize-none`} />
              </div>

              {/* Reviewer Photo */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Reviewer Photo</label>
                {reviewForm.reviewerPhoto && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={reviewForm.reviewerPhoto} alt="Reviewer" className="w-14 h-14 rounded-full object-cover mb-2 border-2 border-indigo-100" />
                )}
                {uploadPreset ? (
                  <CldUploadWidget uploadPreset={uploadPreset} onSuccess={(r: unknown) => { const i = (r as { info?: { secure_url?: string } })?.info; if (i?.secure_url) setReviewForm((f) => ({ ...f, reviewerPhoto: i.secure_url ?? "" })); }} options={{ resourceType: "image" }}>
                    {({ open }) => (
                      <button type="button" onClick={() => open()} className="flex items-center gap-2 w-full border-2 border-dashed border-gray-300 rounded-xl py-2.5 justify-center text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
                        <ImagePlus size={15} /> {reviewForm.reviewerPhoto ? "Change Photo" : "Upload Photo"}
                      </button>
                    )}
                  </CldUploadWidget>
                ) : (
                  <input value={reviewForm.reviewerPhoto} onChange={(e) => setReviewForm((f) => ({ ...f, reviewerPhoto: e.target.value }))} placeholder="Photo URL" className={inputCls} />
                )}
              </div>

              {/* Review Image */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Review Image <span className="text-gray-400 font-normal">(optional, clickable on front-end)</span></label>
                {reviewForm.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={reviewForm.imageUrl} alt="Review" className="w-full h-28 object-cover rounded-xl mb-2 border border-gray-200" />
                )}
                {uploadPreset ? (
                  <CldUploadWidget uploadPreset={uploadPreset} onSuccess={(r: unknown) => { const i = (r as { info?: { secure_url?: string } })?.info; if (i?.secure_url) setReviewForm((f) => ({ ...f, imageUrl: i.secure_url ?? "" })); }} options={{ resourceType: "image" }}>
                    {({ open }) => (
                      <button type="button" onClick={() => open()} className="flex items-center gap-2 w-full border-2 border-dashed border-gray-300 rounded-xl py-2.5 justify-center text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
                        <ImagePlus size={15} /> {reviewForm.imageUrl ? "Change Image" : "Upload Image"}
                      </button>
                    )}
                  </CldUploadWidget>
                ) : (
                  <input value={reviewForm.imageUrl} onChange={(e) => setReviewForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="Image URL" className={inputCls} />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Display Order</label>
                  <input type="number" min="0" value={reviewForm.order} onChange={(e) => setReviewForm((f) => ({ ...f, order: e.target.value }))} className={inputCls} />
                </div>
                <div className="flex flex-col gap-2 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                    <input type="checkbox" checked={reviewForm.isVerified} onChange={(e) => setReviewForm((f) => ({ ...f, isVerified: e.target.checked }))} className="w-4 h-4 accent-green-600" />
                    Verified Purchase
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                    <input type="checkbox" checked={reviewForm.isActive} onChange={(e) => setReviewForm((f) => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-indigo-600" />
                    Active (visible)
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setReviewModal(false)} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="button" onClick={handleSaveReview} disabled={savingReview} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors">
                  {savingReview ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  {editingReview ? "Update" : "Add"} Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Review Confirm ────────────────────────────────── */}
      {deletingReviewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold text-gray-900 mb-2">Delete Review?</h3>
            <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeletingReviewId(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={() => handleDeleteReview(deletingReviewId)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Slide Modal */}
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
                  <CldUploadWidget uploadPreset={uploadPreset} onSuccess={handleSlideUpload} options={{ resourceType: "image" }}>
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
                    <input placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} className={inputCls} />
                    <input placeholder="Public ID" value={form.publicId} onChange={(e) => setForm((f) => ({ ...f, publicId: e.target.value }))} className={inputCls} />
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

function PromoPanelEditor({
  label, value, onChange, uploadPreset, onUploadSuccess,
}: {
  label: string;
  value: PromoPanelItem;
  onChange: (v: PromoPanelItem) => void;
  uploadPreset: string | undefined;
  onUploadSuccess: (result: unknown) => void;
}) {
  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">{label}</h3>
      <div>
        {value.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value.imageUrl} alt={value.altText || label} className="w-full h-36 object-cover rounded-xl mb-3" />
        )}
        {uploadPreset ? (
          <CldUploadWidget uploadPreset={uploadPreset} onSuccess={onUploadSuccess} options={{ resourceType: "image" }}>
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
            <input placeholder="Image URL" value={value.imageUrl} onChange={(e) => onChange({ ...value, imageUrl: e.target.value })} className={inputCls} />
            <input placeholder="Public ID" value={value.publicId} onChange={(e) => onChange({ ...value, publicId: e.target.value })} className={inputCls} />
          </div>
        )}
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Link (URL)</label>
        <input placeholder="/products or /category/name" value={value.link} onChange={(e) => onChange({ ...value, link: e.target.value })} className={inputCls} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Alt Text</label>
        <input placeholder="Image description" value={value.altText} onChange={(e) => onChange({ ...value, altText: e.target.value })} className={inputCls} />
      </div>
    </div>
  );
}
