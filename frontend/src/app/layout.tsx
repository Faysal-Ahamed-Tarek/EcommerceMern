import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "ShopBD – Fresh & Organic", template: "%s | ShopBD" },
  description: "Quality organic products delivered across Bangladesh. Shop fresh, shop healthy.",
  openGraph: { siteName: "ShopBD", type: "website" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { borderRadius: "10px", fontSize: "14px" },
            success: { iconTheme: { primary: "#16a34a", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
