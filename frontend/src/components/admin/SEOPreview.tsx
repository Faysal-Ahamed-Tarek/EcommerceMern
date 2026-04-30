"use client";

interface SEOPreviewProps {
  title: string;
  description: string;
  url?: string;
}

export default function SEOPreview({ title, description, url }: SEOPreviewProps) {
  const displayUrl = url || "yoursite.com";
  const displayTitle = title || "Page Title";
  const displayDesc = description || "Page description will appear here.";

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Google Search Preview
      </p>
      <div className="space-y-0.5">
        <p className="text-xs text-gray-500 truncate">{displayUrl}</p>
        <p className="text-blue-700 text-base font-medium leading-snug line-clamp-1 hover:underline cursor-pointer">
          {displayTitle}
        </p>
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{displayDesc}</p>
      </div>
    </div>
  );
}
