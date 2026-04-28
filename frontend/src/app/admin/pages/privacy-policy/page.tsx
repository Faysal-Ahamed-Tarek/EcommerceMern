"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Save, Loader2 } from "lucide-react";
import RichTextEditor from "@/components/admin/RichTextEditor";

const DUMMY_CONTENT = `<h2>Privacy Policy</h2>
<p>Last updated: January 2025</p>
<p>Welcome to ShopBD. Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform.</p>
<h3>Information We Collect</h3>
<ul>
  <li>Name, phone number, and delivery address when you place an order</li>
  <li>Order history and product preferences</li>
  <li>Device and browser information for security purposes</li>
</ul>
<h3>How We Use Your Information</h3>
<p>We use your information solely to process orders, provide customer support, and improve our services. We do not sell your personal data to third parties.</p>
<h3>Data Security</h3>
<p>We implement industry-standard security measures to protect your data. All transactions are processed securely.</p>
<h3>Contact Us</h3>
<p>If you have any questions about this Privacy Policy, please contact us at support@shopbd.com.</p>`;

export default function AdminPrivacyPolicyPage() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/admin/pages/privacy-policy")
      .then((r) => setContent(r.data?.data?.content || ""))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/admin/pages/privacy-policy", { content });
      toast.success("Privacy Policy saved");
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
          <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mt-0.5">This content appears on the public /privacy-policy page</p>
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
          placeholder="Enter your privacy policy content here…"
          minHeight="400px"
        />
      </div>
    </div>
  );
}
