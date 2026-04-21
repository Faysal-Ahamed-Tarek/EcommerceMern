"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, Loader2, Check } from "lucide-react";
import type { Product } from "@/types";

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

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

  const getProductPrice = (p: Product) => {
    if (p.variants && p.variants.length > 0) {
      const minPrice = Math.min(
        ...p.variants.map((v) => (v.discountPrice > 0 ? v.discountPrice : v.price))
      );
      return `From ৳${minPrice.toLocaleString()}`;
    }
    return `৳${p.basePrice.toLocaleString()}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button
          onClick={() => router.push("/admin/products/new")}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-gray-400" size={28} />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Variants</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Featured</th>
                <th className="px-4 py-3">Top Selling</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    No products yet
                  </td>
                </tr>
              )}
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-[220px] truncate">
                    {p.title}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.category}</td>
                  <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                    {getProductPrice(p)}
                  </td>
                  <td className="px-4 py-3">
                    {p.variants && p.variants.length > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                        {p.variants.length} option{p.variants.length !== 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.isFeatured ? (
                      <Check size={16} className="text-green-600" />
                    ) : (
                      <X size={16} className="text-red-500" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {p.isTopSelling ? (
                      <Check size={16} className="text-green-600" />
                    ) : (
                      <X size={16} className="text-red-500" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/products/${p._id}/edit`)}
                        className="p-2 rounded-md cursor-pointer bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-800 transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteId(p._id)}
                        className="p-2 rounded-md cursor-pointer bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors"
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

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold text-gray-900 mb-2">Delete Product?</h3>
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
