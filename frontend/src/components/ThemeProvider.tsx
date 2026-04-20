"use client";

import { useEffect } from "react";

// ─── Color math ──────────────────────────────────────────────────────────────

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
    return Math.round(255 * Math.max(0, Math.min(1, color)))
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** Generate the full green-50 … green-900 ramp from a single brand hex. */
function buildPalette(hex: string): Record<string, string> {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return {};
  const [h, s, l] = hexToHsl(hex);
  return {
    "--color-green-50":  hslToHex(h, Math.min(s, 40), 96),
    "--color-green-100": hslToHex(h, Math.min(s, 45), 92),
    "--color-green-200": hslToHex(h, Math.min(s, 50), 84),
    "--color-green-300": hslToHex(h, s, 72),
    "--color-green-400": hslToHex(h, s, 60),
    "--color-green-500": hslToHex(h, s, l + 8 > 90 ? 90 : l + 8),
    "--color-green-600": hex,
    "--color-green-700": hslToHex(h, s, l - 8 < 5 ? 5 : l - 8),
    "--color-green-800": hslToHex(h, s, l - 16 < 5 ? 5 : l - 16),
    "--color-green-900": hslToHex(h, s, l - 24 < 5 ? 5 : l - 24),
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  primaryColor: string;
}

export default function ThemeProvider({ primaryColor }: Props) {
  useEffect(() => {
    const palette = buildPalette(primaryColor);
    const root = document.documentElement;
    Object.entries(palette).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });
  }, [primaryColor]);

  return null;
}
