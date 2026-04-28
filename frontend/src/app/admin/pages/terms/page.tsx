"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Save, Loader2 } from "lucide-react";
import RichTextEditor from "@/components/admin/RichTextEditor";

const DUMMY_CONTENT = `<h2>Terms and Conditions</h2>
<p>Last updated: January 2025</p>
<p>Please read these Terms and Conditions carefully before using ShopBD. By placing an order or using our platform, you agree to be bound by these terms.</p>
<h3>1. Orders and Payment</h3>
<ul>
  <li>All orders are subject to product availability</li>
  <li>We currently accept Cash on Delivery (COD) only</li>
  <li>Prices are listed in Bangladeshi Taka (৳) and are inclusive of applicable taxes</li>
  <li>We reserve the right to cancel orders in cases of pricing errors or stock unavailability</li>
</ul>
<h3>2. Delivery</h3>
<ul>
  <li>Delivery is available across Bangladesh within 2-5 business days</li>
  <li>Free delivery on orders above ৳999; a delivery charge applies to smaller orders</li>
  <li>We are not responsible for delays caused by circumstances beyond our control</li>
</ul>
<h3>3. Returns and Refunds</h3>
<ul>
  <li>Items may be returned within 7 days of delivery if they are defective or not as described</li>
  <li>Products must be unused and in original packaging</li>
  <li>Refunds will be processed within 5-7 business days after the returned item is received</li>
</ul>
<h3>4. User Responsibilities</h3>
<p>You agree to provide accurate and complete information when placing orders. Any fraudulent activity will result in immediate cancellation of your order.</p>
<h3>5. Governing Law</h3>
<p>These Terms are governed by the laws of Bangladesh. Any disputes shall be settled in the courts of Dhaka.</p>
<h3>Contact Us</h3>
<p>For questions about these Terms, contact us at support@shopbd.com.</p>`;

export default function AdminTermsPage() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/admin/pages/terms")
      .then((r) => setContent(r.data?.data?.content || ""))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/admin/pages/terms", { content });
      toast.success("Terms & Conditions saved");
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
          <h1 className="text-2xl font-bold text-gray-900">Terms and Conditions</h1>
          <p className="text-sm text-gray-500 mt-0.5">This content appears on the public /terms page</p>
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
          placeholder="Enter your Terms & Conditions content here…"
          minHeight="400px"
        />
      </div>
    </div>
  );
}
