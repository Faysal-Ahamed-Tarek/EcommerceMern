import Link from "next/link";
import type { PromoPanel } from "@/types";

interface Props {
  panel: PromoPanel | null;
}

export default function PromoBanner({ panel }: Props) {
  if (!panel || (!panel.left.imageUrl && !panel.right.imageUrl)) return null;

  return (
    <section className="mt-10 mb-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PanelImage
          imageUrl={panel.left.imageUrl}
          altText={panel.left.altText}
          link={panel.left.link}
        />
        <PanelImage
          imageUrl={panel.right.imageUrl}
          altText={panel.right.altText}
          link={panel.right.link}
        />
      </div>
    </section>
  );
}

function PanelImage({
  imageUrl,
  altText,
  link,
}: {
  imageUrl: string;
  altText: string;
  link: string;
}) {
  if (!imageUrl) return null;

  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt={altText || "Promo banner"}
      className="w-full h-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-[1.02]"
    />
  );

  const wrapper = (
    <div className="relative overflow-hidden rounded-2xl aspect-[16/7] bg-gray-100 group cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-300">
      {img}
    </div>
  );

  if (link) {
    return <Link href={link}>{wrapper}</Link>;
  }

  return wrapper;
}
