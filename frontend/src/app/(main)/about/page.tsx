import type { Metadata } from "next";
import { api } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function getSEOData(page: string) {
  try {
    const res = await fetch(`${API}/seo/${page}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEOData("about");
  return {
    title: seo?.title || "About Us | ShopBD",
    description: seo?.description || "Learn more about ShopBD - your trusted online shopping destination in Bangladesh.",
    alternates: seo?.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
    openGraph: seo?.ogImage ? { images: [{ url: seo.ogImage }] } : undefined,
  };
}

async function getPageContent(): Promise<string> {
  try {
    const res = await api.get("/pages/about");
    return res.data?.data?.content || "";
  } catch {
    return "";
  }
}

export default async function AboutPage() {
  const content = await getPageContent();

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      {content ? (
        <article
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">About Us</p>
          <p className="text-sm mt-2">Content coming soon.</p>
        </div>
      )}
    </main>
  );
}
