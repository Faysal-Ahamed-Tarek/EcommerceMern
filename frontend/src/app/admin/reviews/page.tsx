"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Loader2, CheckCircle, XCircle, Trash2, Star, Pencil, Plus, X } from "lucide-react";
import type { Review } from "@/types";

type ReviewStatus = Review["status"];

const STATUS_COLORS: Record<ReviewStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
        >
          <Star
            size={20}
            className={n <= (hover || value) ? "fill-amber-400 text-amber-400" : "text-gray-300"}
          />
        </button>
      ))}
    </div>
  );
}

type ReviewFormData = {
  productSlug: string;
  customerName: string;
  rating: number;
  comment: string;
  imageUrl: string;
  status: ReviewStatus;
};

function ReviewFormModal({
  title,
  initial,
  onSave,
  onClose,
  saving,
}: {
  title: string;
  initial: ReviewFormData;
  onSave: (data: ReviewFormData) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<ReviewFormData>(initial);

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-base">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Product Slug <span className="text-red-500">*</span></label>
            <input
              value={form.productSlug}
              onChange={(e) => setForm((f) => ({ ...f, productSlug: e.target.value }))}
              placeholder="e.g. organic-face-cream"
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Customer Name <span className="text-red-500">*</span></label>
            <input
              value={form.customerName}
              onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
              placeholder="John Doe"
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Rating <span className="text-red-500">*</span></label>
            <StarPicker value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Comment <span className="text-red-500">*</span></label>
            <textarea
              rows={4}
              value={form.comment}
              onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
              placeholder="Review text…"
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Image URL (optional)</label>
            <input
              value={form.imageUrl}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              placeholder="https://..."
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ReviewStatus }))}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
            >
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => onSave(form)}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-60"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const EMPTY_FORM: ReviewFormData = {
  productSlug: "", customerName: "", rating: 5, comment: "", imageUrl: "", status: "approved",
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | ReviewStatus>("pending");
  const [acting, setActing] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<Review | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const query = tab !== "all" ? `?status=${tab}` : "";
      const res = await api.get(`/admin/reviews${query}`);
      setReviews(res.data.data);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const updateStatus = async (id: string, status: ReviewStatus) => {
    setActing(id);
    try {
      await api.patch(`/reviews/${id}/status`, { status });
      toast.success(`Review ${status}`);
      setReviews((prev) => prev.map((r) => r._id === id ? { ...r, status } : r));
    } catch {
      toast.error("Failed to update status");
    } finally {
      setActing(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/reviews/${id}`);
      toast.success("Review deleted");
      setDeleteId(null);
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleEdit = async (data: ReviewFormData) => {
    if (!editTarget) return;
    setSaving(true);
    try {
      const res = await api.put(`/reviews/${editTarget._id}`, data);
      setReviews((prev) => prev.map((r) => r._id === editTarget._id ? { ...r, ...res.data.data } : r));
      toast.success("Review updated");
      setEditTarget(null);
    } catch {
      toast.error("Failed to update review");
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (data: ReviewFormData) => {
    if (!data.productSlug.trim() || !data.customerName.trim() || !data.comment.trim()) {
      toast.error("Product slug, name, and comment are required");
      return;
    }
    setSaving(true);
    try {
      const res = await api.post("/admin/reviews", data);
      toast.success("Review created");
      setCreateOpen(false);
      if (tab === "all" || tab === res.data.data.status) {
        setReviews((prev) => [res.data.data, ...prev]);
      }
    } catch {
      toast.error("Failed to create review");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
        >
          <Plus size={16} /> Add Review
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
        {(["pending", "approved", "rejected", "all"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors capitalize ${tab === s ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-400" size={28} /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Comment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reviews.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No reviews found</td></tr>
              )}
              {reviews.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                    {r.customerName}
                    {r.isVerifiedPurchase && (
                      <span className="ml-1.5 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">✓ Verified</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs max-w-[120px] truncate">{r.productSlug}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} className={i < r.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                      ))}
                      <span className="ml-1 text-xs text-gray-600">{r.rating}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[220px]">
                    <p className="line-clamp-2 text-xs">{r.comment}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {r.status !== "approved" && (
                        <button
                          onClick={() => updateStatus(r._id, "approved")}
                          disabled={acting === r._id}
                          title="Approve"
                          className="text-green-600 hover:text-green-800 transition-colors disabled:opacity-40"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      {r.status !== "rejected" && (
                        <button
                          onClick={() => updateStatus(r._id, "rejected")}
                          disabled={acting === r._id}
                          title="Reject"
                          className="text-orange-500 hover:text-orange-700 transition-colors disabled:opacity-40"
                        >
                          <XCircle size={16} />
                        </button>
                      )}
                      <button
                        onClick={() =>
                          setEditTarget(r)
                        }
                        title="Edit"
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteId(r._id)}
                        title="Delete"
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

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold text-gray-900 mb-2">Delete Review?</h3>
            <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editTarget && (
        <ReviewFormModal
          title="Edit Review"
          initial={{
            productSlug: editTarget.productSlug,
            customerName: editTarget.customerName,
            rating: editTarget.rating,
            comment: editTarget.comment,
            imageUrl: editTarget.imageUrl ?? "",
            status: editTarget.status,
          }}
          onSave={handleEdit}
          onClose={() => setEditTarget(null)}
          saving={saving}
        />
      )}

      {/* Create modal */}
      {createOpen && (
        <ReviewFormModal
          title="Add Review"
          initial={EMPTY_FORM}
          onSave={handleCreate}
          onClose={() => setCreateOpen(false)}
          saving={saving}
        />
      )}
    </div>
  );
}
