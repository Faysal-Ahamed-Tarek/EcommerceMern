"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import ProductForm from "../../_components/ProductForm";
import type { Product } from "@/types";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .get(`/admin/products/${id}`)
      .then((r) => setProduct(r.data.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-gray-400" size={28} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-20 text-gray-500">Product not found.</div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Product</h1>
      <ProductForm initialProduct={product} />
    </div>
  );
}
