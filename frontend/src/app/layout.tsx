import type { Metadata } from "next";
import { Maven_Pro } from "next/font/google";
import { Toaster } from "react-hot-toast";
import ThemeProvider from "@/components/ThemeProvider";
import "./globals.css";

const mavenPro = Maven_Pro({
  variable: "--font-maven-pro",
  subsets: ["latin"],
  display: "swap",
});

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function getConfig() {
  try {
    const res = await fetch(`${API}/config`, { next: { revalidate: 60 } });
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
    ...(d?.favicon ? { icons: { icon: d.favicon } } : {}),
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const d = await getConfig();
  const primaryColor = d?.primaryColor ?? "#16a34a";

  return (
    <html lang="en" className={`${mavenPro.variable} h-full`}>
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
