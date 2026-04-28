import { api } from "@/lib/api";

async function getPageContent(): Promise<string> {
  try {
    const res = await api.get("/pages/privacy-policy");
    return res.data?.data?.content || "";
  } catch {
    return "";
  }
}

export default async function PrivacyPolicyPage() {
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
          <p className="text-lg font-medium">Privacy Policy</p>
          <p className="text-sm mt-2">Content coming soon.</p>
        </div>
      )}
    </main>
  );
}
