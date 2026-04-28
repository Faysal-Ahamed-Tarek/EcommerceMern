"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Save, Loader2 } from "lucide-react";
import RichTextEditor from "@/components/admin/RichTextEditor";

const DUMMY_CONTENT = `<h2>About Us</h2>
<p>Welcome to ShopBD — Bangladesh's trusted online marketplace for quality products delivered straight to your door.</p>
<h3>Our Story</h3>
<p>Founded with a simple mission: make quality shopping accessible to every household in Bangladesh. We started with a small catalog and a big dream, and today we serve thousands of happy customers across the country.</p>
<h3>Our Mission</h3>
<p>To provide genuine, high-quality products at fair prices, backed by excellent customer service and reliable delivery. We believe everyone deserves access to the best products without compromise.</p>
<h3>Why Choose ShopBD?</h3>
<ul>
  <li><strong>Genuine Products</strong> — Every item is quality-checked before listing</li>
  <li><strong>Fast Delivery</strong> — We deliver across Bangladesh within 2-5 business days</li>
  <li><strong>Cash on Delivery</strong> — Pay when you receive your order, no upfront payment required</li>
  <li><strong>Easy Returns</strong> — 7-day hassle-free return policy</li>
  <li><strong>24/7 Support</strong> — Our team is always ready to help you</li>
</ul>
<h3>Contact Us</h3>
<p>Have questions? We'd love to hear from you. Reach out at support@shopbd.com or call us at +880 1XXX-XXXXXX.</p>`;

export default function AdminAboutPage() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/admin/pages/about")
      .then((r) => setContent(r.data?.data?.content || ""))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/admin/pages/about", { content });
      toast.success("About Us saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const loadDummy = () => setContent(DUMMY_CONTENT);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-gray-400" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">About Us</h1>
          <p className="text-sm text-gray-500 mt-0.5">This content appears on the public /about page</p>
        </div>
        <div className="flex items-center gap-2">
          {!content && (
            <button
              type="button"
              onClick={loadDummy}
              className="px-4 py-2 text-sm text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Load Sample Content
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Enter your About Us content here…"
          minHeight="400px"
        />
      </div>
    </div>
  );
}
