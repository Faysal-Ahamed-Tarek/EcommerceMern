"use client";

import { useEffect, useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Save, Loader2, Plus, Trash2, GripVertical, ImagePlus } from "lucide-react";

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";

export default function AdminHeaderPage() {
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const [headerLogo, setHeaderLogo] = useState("");
  const [marqueeTexts, setMarqueeTexts] = useState<string[]>([
    "🚚 Free delivery on orders above ৳999",
    "Cash on Delivery available across Bangladesh",
  ]);
  const [newMarqueeText, setNewMarqueeText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/config")
      .then((r) => {
        const d = r.data?.data;
        if (d?.headerLogo) setHeaderLogo(d.headerLogo);
        if (d?.marqueeTexts?.length > 0) setMarqueeTexts(d.marqueeTexts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/admin/config", { headerLogo, marqueeTexts });
      toast.success("Header settings saved");
    } catch {
      toast.error("Failed to save header settings");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (result: any) => {
    const info = result?.info;
    if (info?.secure_url) setHeaderLogo(info.secure_url);
  };

  const addMarqueeText = () => {
    if (!newMarqueeText.trim()) return;
    setMarqueeTexts((t) => [...t, newMarqueeText.trim()]);
    setNewMarqueeText("");
  };

  const removeMarqueeText = (i: number) =>
    setMarqueeTexts((t) => t.filter((_, idx) => idx !== i));

  const updateMarqueeText = (i: number, val: string) =>
    setMarqueeTexts((t) => t.map((item, idx) => (idx === i ? val : item)));

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-gray-400" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Header</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your store logo and announcement marquee</p>
      </div>

      {/* Logo */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Logo</h2>
        {headerLogo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={headerLogo} alt="Header logo" className="h-16 object-contain rounded-lg border border-gray-200 p-2" />
        )}
        <div className="space-y-2">
          {uploadPreset ? (
            <CldUploadWidget uploadPreset={uploadPreset} onSuccess={handleLogoUpload} options={{ resourceType: "image" }}>
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  className="flex items-center gap-2 border-2 border-dashed border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                >
                  <ImagePlus size={16} />
                  {headerLogo ? "Change Logo" : "Upload Logo"}
                </button>
              )}
            </CldUploadWidget>
          ) : (
            <input
              placeholder="Logo image URL"
              value={headerLogo}
              onChange={(e) => setHeaderLogo(e.target.value)}
              className={inputCls}
            />
          )}
          {headerLogo && (
            <input
              placeholder="Or paste image URL directly"
              value={headerLogo}
              onChange={(e) => setHeaderLogo(e.target.value)}
              className={inputCls}
            />
          )}
          {!headerLogo && !uploadPreset && null}
        </div>
      </div>

      {/* Marquee Texts */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-gray-800">Marquee Announcement Texts</h2>
          <p className="text-xs text-gray-500 mt-0.5">Texts that scroll in the top announcement bar</p>
        </div>

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

        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <input
            value={newMarqueeText}
            onChange={(e) => setNewMarqueeText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMarqueeText())}
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
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save Header Settings
        </button>
      </div>
    </div>
  );
}
