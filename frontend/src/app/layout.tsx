import type { Metadata } from "next";
import { Maven_Pro } from "next/font/google";
import { Toaster } from "react-hot-toast";
import ThemeProvider from "@/components/ThemeProvider";
import "./globals.css";

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
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
function buildPaletteVars(hex: string): string {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return "";
  const [h, s, l] = hexToHsl(hex);
  const vars: Record<string, string> = {
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
  return `:root{${Object.entries(vars).map(([k, v]) => `${k}:${v}`).join(";")}}`;
}

const mavenPro = Maven_Pro({
  variable: "--font-maven-pro",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700"],
});

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function getConfig() {
  try {
    const res = await fetch(`${API}/config`, { next: { revalidate: 10 } });
    if (!res.ok) return null;
    return (await res.json()).data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const d = await getConfig();
  const title = d?.siteTitle || "ShopBD – Fresh & Organic";
  const siteName = d?.storeName || "ShopBD";
  return {
    title: { default: title, template: `%s | ${siteName}` },
    description: "Quality organic products delivered across Bangladesh. Shop fresh, shop healthy.",
    openGraph: { siteName, type: "website" },
    icons: { icon: d?.favicon || '/favicon.ico' },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const d = await getConfig();
  const primaryColor = d?.primaryColor ?? "#16a34a";
  const themeVars = buildPaletteVars(primaryColor);

  return (
    <html lang="en" className={`${mavenPro.variable} h-full`}>
      <head>
        {themeVars && <style dangerouslySetInnerHTML={{ __html: themeVars }} />}
        {d?.favicon && <link rel="icon" href={d.favicon} />}
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider primaryColor={primaryColor} />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: { borderRadius: "10px", fontSize: "14px" },
            success: { iconTheme: { primary: primaryColor, secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
