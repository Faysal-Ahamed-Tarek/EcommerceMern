"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Save, Loader2, MapPin, Store, ImagePlus } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";

interface DeliveryZone {
  label: string;
  charge: number;
}

const DEFAULT_ZONES: DeliveryZone[] = [
  { label: "Inside Dhaka", charge: 60 },
  { label: "Outside Dhaka", charge: 120 },
];

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";
const labelCls = "block text-xs font-medium text-gray-600 mb-1";

export default function AdminShopPage() {
  const [storeName, setStoreName]       = useState("");
  const [storeTagline, setStoreTagline] = useState("");
  const [favicon, setFavicon]           = useState("");
  const [zones, setZones]               = useState<DeliveryZone[]>(DEFAULT_ZONES);
  const [loading, setLoading]           = useState(true);
  const [savingBranding, setSavingBranding] = useState(false);
  const [savingSite, setSavingSite]         = useState(false);
  const [savingZones, setSavingZones]       = useState(false);

  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
    api.get("/config")
      .then((r) => {
        const d = r.data?.data;
        if (!d) return;
        if (d.storeName)    setStoreName(d.storeName);
        if (d.storeTagline) setStoreTagline(d.storeTagline);
        if (d.favicon)      setFavicon(d.favicon);
        const z: DeliveryZone[] = d.deliveryZones;
        if (z?.length >= 2) setZones(z.slice(0, 2));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaveBranding = async () => {
    setSavingBranding(true);
    try {
      await api.put("/admin/config", { storeName, storeTagline });
      toast.success("Store branding saved");
    } catch {
      toast.error("Failed to save store branding");
    } finally {
      setSavingBranding(false);
    }
  };

  const handleSaveSite = async () => {
    setSavingSite(true);
    try {
      await api.put("/admin/config", { favicon });
      toast.success("Site identity saved");
    } catch {
      toast.error("Failed to save site identity");
    } finally {
      setSavingSite(false);
    }
  };

  const updateZone = (idx: number, field: keyof DeliveryZone, value: string) => {
    setZones((prev) =>
      prev.map((z, i) =>
        i === idx
          ? { ...z, [field]: field === "charge" ? Number(value) || 0 : value }
          : z
      )
    );
  };

  const handleSaveZones = async () => {
    if (zones.some((z) => !z.label.trim())) {
      toast.error("Zone label cannot be empty");
      return;
    }
    setSavingZones(true);
    try {
      await api.put("/admin/config", { deliveryZones: zones });
      toast.success("Delivery zones saved");
    } catch {
      toast.error("Failed to save delivery zones");
    } finally {
      setSavingZones(false);
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Shop Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Store branding and delivery configuration</p>
      </div>

      {/* ── Store Branding ─────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Store size={16} className="text-indigo-500" />
          <h2 className="font-semibold text-gray-800">Store Branding</h2>
        </div>
        <p className="text-xs text-gray-500 -mt-2">
          Shown on order confirmation receipts and PDFs. The logo used is your Header Logo (set in Pages → Header).
        </p>

        <div>
          <label className={labelCls}>Store Name</label>
          <input
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="e.g. Herblife"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Store Tagline</label>
          <input
            value={storeTagline}
            onChange={(e) => setStoreTagline(e.target.value)}
            placeholder="e.g. Natural Health Products"
            className={inputCls}
          />
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button
            onClick={handleSaveBranding}
            disabled={savingBranding}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {savingBranding ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Branding
          </button>
        </div>
      </div>

      {/* ── Site Identity ──────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <ImagePlus size={16} className="text-indigo-500" />
          <h2 className="font-semibold text-gray-800">Site Identity</h2>
        </div>
        <p className="text-xs text-gray-500 -mt-2">
          Favicon shown in the browser tab across the entire site.
        </p>

        <div>
          <label className={labelCls}>Favicon</label>
          {favicon && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={favicon} alt="Favicon preview" className="w-10 h-10 object-contain rounded border border-gray-200 p-1 mb-2" />
          )}
          <div className="flex flex-col gap-2">
            {uploadPreset ? (
              <CldUploadWidget
                uploadPreset={uploadPreset}
                onSuccess={(r: unknown) => {
                  const info = (r as { info?: { secure_url?: string } })?.info;
                  if (info?.secure_url) setFavicon(info.secure_url);
                }}
                options={{ resourceType: "image" }}
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="flex items-center gap-2 border-2 border-dashed border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors w-fit"
                  >
                    <ImagePlus size={16} />
                    {favicon ? "Change Favicon" : "Upload Favicon"}
                  </button>
                )}
              </CldUploadWidget>
            ) : (
              <input
                placeholder="Favicon image URL"
                value={favicon}
                onChange={(e) => setFavicon(e.target.value)}
                className={inputCls}
              />
            )}
            {favicon && (
              <button
                type="button"
                onClick={() => setFavicon("")}
                className="text-xs text-red-500 hover:underline w-fit"
              >
                Remove favicon
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button
            onClick={handleSaveSite}
            disabled={savingSite}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {savingSite ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Site Identity
          </button>
        </div>
      </div>

      {/* ── Delivery Zones ─────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        <div>
          <h2 className="font-semibold text-gray-800">Delivery Zones</h2>
          <p className="text-xs text-gray-500 mt-0.5">These two options appear in the cart for customers to select</p>
        </div>

        {zones.map((zone, idx) => (
          <div key={idx} className="border border-gray-100 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                <MapPin size={14} className="text-green-600" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Zone {idx + 1}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Zone Label</label>
                <input
                  value={zone.label}
                  onChange={(e) => updateZone(idx, "label", e.target.value)}
                  placeholder={idx === 0 ? "e.g. Inside Dhaka" : "e.g. Outside Dhaka"}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Delivery Charge (৳)</label>
                <input
                  type="number"
                  min="0"
                  value={zone.charge}
                  onChange={(e) => updateZone(idx, "charge", e.target.value)}
                  placeholder="e.g. 60"
                  className={inputCls}
                />
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button
            onClick={handleSaveZones}
            disabled={savingZones}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {savingZones ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Delivery Zones
          </button>
        </div>
      </div>
    </div>
  );
}
