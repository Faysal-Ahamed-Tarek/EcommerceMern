"use client";

import { useEffect, useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Save, Loader2, Plus, Trash2, ImagePlus, ToggleLeft, ToggleRight } from "lucide-react";

interface SocialLink {
  platform: string;
  url: string;
  isActive: boolean;
}

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";
const labelCls = "block text-xs font-medium text-gray-600 mb-1";

const emptySocial = (): SocialLink => ({ platform: "", url: "", isActive: true });

export default function AdminFooterPage() {
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const [footerLogo, setFooterLogo] = useState("");
  const [footerDescription, setFooterDescription] = useState(
    "Your trusted marketplace for fresh, organic, and quality products. Delivered across Bangladesh with love."
  );
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [copyrightText, setCopyrightText] = useState("© {year} ShopBD. All rights reserved.");
  const [paymentMethodsText, setPaymentMethodsText] = useState("Payment: Cash on Delivery 💵");
  const [footerPhone, setFooterPhone] = useState("+880 1XXX-XXXXXX");
  const [footerEmail, setFooterEmail] = useState("support@shopbd.com");
  const [footerLocation, setFooterLocation] = useState("Dhaka, Bangladesh");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/config")
      .then((r) => {
        const d = r.data?.data;
        if (!d) return;
        if (d.footerLogo) setFooterLogo(d.footerLogo);
        if (d.footerDescription) setFooterDescription(d.footerDescription);
        if (d.socialLinks) setSocialLinks(d.socialLinks);
        if (d.copyrightText) setCopyrightText(d.copyrightText);
        if (d.paymentMethodsText) setPaymentMethodsText(d.paymentMethodsText);
        if (d.footerPhone) setFooterPhone(d.footerPhone);
        if (d.footerEmail) setFooterEmail(d.footerEmail);
        if (d.footerLocation) setFooterLocation(d.footerLocation);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/admin/config", {
        footerLogo,
        footerDescription,
        socialLinks,
        copyrightText,
        paymentMethodsText,
        footerPhone,
        footerEmail,
        footerLocation,
      });
      toast.success("Footer settings saved");
    } catch {
      toast.error("Failed to save footer settings");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (result: any) => {
    const info = result?.info;
    if (info?.secure_url) setFooterLogo(info.secure_url);
  };

  const addSocialLink = () => setSocialLinks((l) => [...l, emptySocial()]);
  const removeSocialLink = (i: number) => setSocialLinks((l) => l.filter((_, idx) => idx !== i));
  const updateSocialLink = (i: number, field: keyof SocialLink, val: string | boolean) =>
    setSocialLinks((l) => l.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

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
        <h1 className="text-2xl font-bold text-gray-900">Footer</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage footer content, contact info, and social links</p>
      </div>

      {/* Logo */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Footer Logo</h2>
        {footerLogo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={footerLogo} alt="Footer logo" className="h-16 object-contain rounded-lg border border-gray-200 p-2" />
        )}
        {uploadPreset ? (
          <CldUploadWidget uploadPreset={uploadPreset} onSuccess={handleLogoUpload} options={{ resourceType: "image" }}>
            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                className="flex items-center gap-2 border-2 border-dashed border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
              >
                <ImagePlus size={16} />
                {footerLogo ? "Change Logo" : "Upload Logo"}
              </button>
            )}
          </CldUploadWidget>
        ) : (
          <input
            placeholder="Logo image URL"
            value={footerLogo}
            onChange={(e) => setFooterLogo(e.target.value)}
            className={inputCls}
          />
        )}
      </div>

      {/* Shop Description */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h2 className="font-semibold text-gray-800">Shop Description</h2>
        <textarea
          rows={3}
          value={footerDescription}
          onChange={(e) => setFooterDescription(e.target.value)}
          placeholder="Brief description shown in the footer brand section"
          className={inputCls + " resize-none"}
        />
      </div>

      {/* Social Links */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-800">Social Links</h2>
            <p className="text-xs text-gray-500 mt-0.5">Platform name, URL, and visibility toggle</p>
          </div>
          <button
            type="button"
            onClick={addSocialLink}
            className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors border border-indigo-200"
          >
            <Plus size={14} /> Add
          </button>
        </div>

        {socialLinks.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No social links yet — click Add to create one</p>
        )}

        {socialLinks.map((link, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              placeholder="Platform (e.g. Facebook)"
              value={link.platform}
              onChange={(e) => updateSocialLink(i, "platform", e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <input
              placeholder="URL (https://...)"
              value={link.url}
              onChange={(e) => updateSocialLink(i, "url", e.target.value)}
              className="flex-[2] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              type="button"
              onClick={() => updateSocialLink(i, "isActive", !link.isActive)}
              title={link.isActive ? "Active" : "Inactive"}
              className={link.isActive ? "text-green-600 hover:text-green-800" : "text-gray-400 hover:text-gray-600"}
            >
              {link.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
            </button>
            <button
              type="button"
              onClick={() => removeSocialLink(i)}
              className="text-red-400 hover:text-red-600 shrink-0"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Contact Information</h2>
        <div>
          <label className={labelCls}>Phone Number</label>
          <input value={footerPhone} onChange={(e) => setFooterPhone(e.target.value)} placeholder="+880 1XXX-XXXXXX" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Email Address</label>
          <input value={footerEmail} onChange={(e) => setFooterEmail(e.target.value)} placeholder="support@shopbd.com" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Location / Address</label>
          <input value={footerLocation} onChange={(e) => setFooterLocation(e.target.value)} placeholder="Dhaka, Bangladesh" className={inputCls} />
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Bottom Bar</h2>
        <div>
          <label className={labelCls}>Copyright Text <span className="text-gray-400">(use {"{year}"} for current year)</span></label>
          <input value={copyrightText} onChange={(e) => setCopyrightText(e.target.value)} placeholder="© {year} ShopBD. All rights reserved." className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Payment Methods Text</label>
          <input value={paymentMethodsText} onChange={(e) => setPaymentMethodsText(e.target.value)} placeholder="Payment: Cash on Delivery 💵" className={inputCls} />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save Footer Settings
        </button>
      </div>
    </div>
  );
}
