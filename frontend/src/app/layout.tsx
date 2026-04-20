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

export const metadata: Metadata = {
  title: { default: "ShopBD – Fresh & Organic", template: "%s | ShopBD" },
  description: "Quality organic products delivered across Bangladesh. Shop fresh, shop healthy.",
  openGraph: { siteName: "ShopBD", type: "website" },
};

async function getPrimaryColor(): Promise<string> {
  try {
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const res = await fetch(`${API}/config`, { next: { revalidate: 60 } });
    if (!res.ok) return "#16a34a";
    const json = await res.json();
    return json.data?.primaryColor ?? "#16a34a";
  } catch {
    return "#16a34a";
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const primaryColor = await getPrimaryColor();

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
