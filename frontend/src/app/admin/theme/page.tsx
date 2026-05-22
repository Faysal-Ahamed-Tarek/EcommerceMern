"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Loader2, Palette, RotateCcw, Building2, ImagePlus } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";

// Same shade generation as ThemeProvider (kept in sync)
function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}
function hslToHex(h: number, s: number, l: number): string {
  const lf = l / 100;
  const a = (s * Math.min(lf, 1 - lf)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = lf - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * Math.max(0, Math.min(1, color))).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
function buildPalette(hex: string): string[] {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return [];
  const [h, s, l] = hexToHsl(hex);
  return [
    hslToHex(h, Math.min(s, 40), 96),
    hslToHex(h, Math.min(s, 45), 92),
    hslToHex(h, Math.min(s, 50), 84),
    hslToHex(h, s, 72),
    hslToHex(h, s, 60),
    hslToHex(h, s, l + 8 > 90 ? 90 : l + 8),
    hex,
    hslToHex(h, s, l - 8 < 5 ? 5 : l - 8),
    hslToHex(h, s, l - 16 < 5 ? 5 : l - 16),
    hslToHex(h, s, l - 24 < 5 ? 5 : l - 24),
  ];
}

const PRESETS = [
  { name: "Forest Green", color: "#16a34a" },
  { name: "Ocean Blue",   color: "#2563eb" },
  { name: "Royal Purple", color: "#7c3aed" },
  { name: "Sunset Orange",color: "#ea580c" },
  { name: "Rose Red",     color: "#dc2626" },
  { name: "Sky Cyan",     color: "#0891b2" },
  { name: "Hot Pink",     color: "#db2777" },
  { name: "Slate",        color: "#475569" },
];

const SHADE_LABELS = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"];

export default function AdminThemePage() {
  const [color, setColor] = useState("#16a34a");
  const [saved, setSaved] = useState("#16a34a");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adminPanelName, setAdminPanelName] = useState("");
  const [adminPanelLogo, setAdminPanelLogo] = useState("");
  const [brandingSaving, setBrandingSaving] = useState(false);
  const [favicon, setFavicon] = useState("");
  const [faviconSaving, setFaviconSaving] = useState(false);
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
    api.get("/config")
      .then((r) => {
        const c = r.data.data?.primaryColor ?? "#16a34a";
        setColor(c);
        setSaved(c);
        setAdminPanelName(r.data.data?.adminPanelName ?? "");
        setAdminPanelLogo(r.data.data?.adminPanelLogo ?? "");
        setFavicon(r.data.data?.favicon ?? "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Live-preview: push CSS vars to the page as the picker changes
  useEffect(() => {
    if (!color || !/^#[0-9a-fA-F]{6}$/.test(color)) return;
    const palette = buildPalette(color);
    const root = document.documentElement;
    SHADE_LABELS.forEach((_, i) => {
      root.style.setProperty(`--color-green-${SHADE_LABELS[i]}`, palette[i]);
    });
  }, [color]);

  const handleSave = async () => {
    if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
      toast.error("Invalid hex color");
      return;
    }
    setSaving(true);
    try {
      await api.put("/admin/config", { primaryColor: color });
      setSaved(color);
      toast.success("Theme saved — changes are live site-wide");
    } catch {
      toast.error("Failed to save theme");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBranding = async () => {
    setBrandingSaving(true);
    try {
      await api.put("/admin/config", { adminPanelName, adminPanelLogo });
      toast.success("Branding saved — reload the page to see changes");
    } catch {
      toast.error("Failed to save branding");
    } finally {
      setBrandingSaving(false);
    }
  };

  const handleSaveFavicon = async () => {
    setFaviconSaving(true);
    try {
      await api.put("/admin/config", { favicon });
      toast.success("Favicon saved — visible after next page load");
    } catch {
      toast.error("Failed to save favicon");
    } finally {
      setFaviconSaving(false);
    }
  };

  const palette = buildPalette(color);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-gray-400" size={28} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Palette size={22} className="text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Site Theme</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-7">
        {/* Color picker + hex input */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Brand Color</p>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-16 h-16 rounded-xl border-2 border-gray-200 cursor-pointer p-1"
            />
            <div>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                maxLength={7}
                className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-mono w-32 focus:outline-none focus:border-indigo-400 uppercase"
              />
              <p className="text-xs text-gray-400 mt-1">6-digit hex, e.g. #16a34a</p>
            </div>
          </div>
        </div>

        {/* Shade preview */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Generated Palette</p>
          <div className="flex gap-1 rounded-xl overflow-hidden border border-gray-200">
            {palette.map((shade, i) => (
              <div
                key={i}
                title={`${SHADE_LABELS[i]}: ${shade}`}
                className="flex-1 h-12 flex items-end justify-center pb-1"
                style={{ backgroundColor: shade }}
              >
                <span
                  className="text-[9px] font-bold opacity-60"
                  style={{ color: i >= 5 ? "#fff" : "#000" }}
                >
                  {SHADE_LABELS[i]}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            Hover a swatch to see the hex value. Changes preview live on the page.
          </p>
        </div>

        {/* Quick presets */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Quick Presets</p>
          <div className="grid grid-cols-4 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.color}
                onClick={() => setColor(p.color)}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all ${
                  color === p.color ? "border-indigo-500 bg-indigo-50" : "border-gray-100 hover:border-gray-300"
                }`}
              >
                <div className="w-8 h-8 rounded-lg shadow-sm" style={{ backgroundColor: p.color }} />
                <span className="text-xs font-medium text-gray-600 text-center leading-tight">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <button
            onClick={() => setColor(saved)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <RotateCcw size={14} /> Reset to saved
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Save Theme
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-4 text-center">
        The color picker gives a live preview. Click "Save Theme" to persist it for all visitors.
      </p>

      {/* Admin Panel Branding */}
      <div className="flex items-center gap-3 mt-8 mb-4">
        <Building2 size={22} className="text-indigo-600" />
        <h2 className="text-xl font-bold text-gray-900">Admin Panel Branding</h2>
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Panel Name</label>
          <input
            type="text"
            value={adminPanelName}
            onChange={(e) => setAdminPanelName(e.target.value)}
            placeholder="Admin Panel"
            maxLength={50}
            className="border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:border-indigo-400"
          />
          <p className="text-xs text-gray-400 mt-1">Shown in the sidebar header. Leave blank to use "Admin Panel".</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Panel Logo URL</label>
          <input
            type="url"
            value={adminPanelLogo}
            onChange={(e) => setAdminPanelLogo(e.target.value)}
            placeholder="https://example.com/logo.png"
            className="border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:border-indigo-400"
          />
          <p className="text-xs text-gray-400 mt-1">Image URL for the sidebar logo (28×28 px recommended).</p>
        </div>
        {adminPanelLogo && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={adminPanelLogo} alt="preview" className="w-8 h-8 rounded object-contain border border-gray-200" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
            <span className="text-xs text-gray-500">Logo preview</span>
          </div>
        )}
        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button
            onClick={handleSaveBranding}
            disabled={brandingSaving}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {brandingSaving && <Loader2 size={14} className="animate-spin" />}
            Save Branding
          </button>
        </div>
      </div>

      {/* Favicon */}
      <div className="flex items-center gap-3 mt-8 mb-4">
        <ImagePlus size={22} className="text-indigo-600" />
        <h2 className="text-xl font-bold text-gray-900">Site Favicon</h2>
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
        <p className="text-xs text-gray-500">
          Shown in the browser tab for all pages on your store. Use a square image (PNG or ICO, 32×32 or 64×64 px recommended).
        </p>

        {favicon && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={favicon}
              alt="Favicon preview"
              className="w-10 h-10 object-contain rounded border border-gray-200 p-1"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
            <span className="text-xs text-gray-500">Current favicon</span>
          </div>
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
              type="url"
              placeholder="https://example.com/favicon.png"
              value={favicon}
              onChange={(e) => setFavicon(e.target.value)}
              className="border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:border-indigo-400"
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

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button
            onClick={handleSaveFavicon}
            disabled={faviconSaving}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {faviconSaving && <Loader2 size={14} className="animate-spin" />}
            Save Favicon
          </button>
        </div>
      </div>
    </div>
  );
}
