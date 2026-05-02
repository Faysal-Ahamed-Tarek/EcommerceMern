"use client";

import { useEffect, useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Save, Loader2, ImagePlus } from "lucide-react";

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";
const labelCls = "block text-xs font-medium text-gray-600 mb-1";

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const SOCIAL_PLATFORMS = [
  { key: "Facebook",  label: "Facebook URL",  Icon: FacebookIcon,  placeholder: "https://facebook.com/yourpage" },
  { key: "Instagram", label: "Instagram URL", Icon: InstagramIcon, placeholder: "https://instagram.com/yourhandle" },
  { key: "LinkedIn",  label: "LinkedIn URL",  Icon: LinkedInIcon,  placeholder: "https://linkedin.com/company/yourcompany" },
] as const;

type PlatformKey = typeof SOCIAL_PLATFORMS[number]["key"];

export default function AdminFooterPage() {
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const [footerLogo, setFooterLogo]               = useState("");
  const [footerDescription, setFooterDescription] = useState(
    "Your trusted marketplace for fresh, organic, and quality products. Delivered across Bangladesh with love."
  );
  const [socialUrls, setSocialUrls] = useState<Record<PlatformKey, string>>({
    Facebook: "", Instagram: "", LinkedIn: "",
  });
  const [copyrightText, setCopyrightText]           = useState("© {year} ShopBD. All rights reserved.");
  const [paymentMethodsText, setPaymentMethodsText] = useState("Payment: Cash on Delivery 💵");
  const [footerPhone, setFooterPhone]               = useState("+880 1XXX-XXXXXX");
  const [footerEmail, setFooterEmail]               = useState("support@shopbd.com");
  const [footerLocation, setFooterLocation]         = useState("Dhaka, Bangladesh");
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    api.get("/config")
      .then((r) => {
        const d = r.data?.data;
        if (!d) return;
        if (d.footerLogo)          setFooterLogo(d.footerLogo);
        if (d.footerDescription)   setFooterDescription(d.footerDescription);
        if (d.copyrightText)       setCopyrightText(d.copyrightText);
        if (d.paymentMethodsText)  setPaymentMethodsText(d.paymentMethodsText);
        if (d.footerPhone)         setFooterPhone(d.footerPhone);
        if (d.footerEmail)         setFooterEmail(d.footerEmail);
        if (d.footerLocation)      setFooterLocation(d.footerLocation);
        if (Array.isArray(d.socialLinks)) {
          const map: Record<string, string> = {};
          for (const s of d.socialLinks) map[s.platform] = s.url ?? "";
          setSocialUrls({
            Facebook:  map["Facebook"]  ?? "",
            Instagram: map["Instagram"] ?? "",
            LinkedIn:  map["LinkedIn"]  ?? "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const socialLinks = SOCIAL_PLATFORMS
        .filter(({ key }) => socialUrls[key].trim())
        .map(({ key }) => ({ platform: key, url: socialUrls[key].trim(), isActive: true }));

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

  const handleLogoUpload = (result: unknown) => {
    const info = (result as { info?: { secure_url?: string } })?.info;
    if (info?.secure_url) setFooterLogo(info.secure_url);
  };

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
          <input placeholder="Logo image URL" value={footerLogo} onChange={(e) => setFooterLogo(e.target.value)} className={inputCls} />
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
        <div>
          <h2 className="font-semibold text-gray-800">Social Links</h2>
          <p className="text-xs text-gray-500 mt-0.5">Leave a field empty to hide that icon in the footer</p>
        </div>

        {SOCIAL_PLATFORMS.map(({ key, label, Icon, placeholder }) => (
          <div key={key}>
            <label className={labelCls}>
              <span className="inline-flex items-center gap-1.5">
                <Icon /> {label}
              </span>
            </label>
            <input
              type="url"
              value={socialUrls[key]}
              onChange={(e) => setSocialUrls((prev) => ({ ...prev, [key]: e.target.value }))}
              placeholder={placeholder}
              className={inputCls}
            />
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
