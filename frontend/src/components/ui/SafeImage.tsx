"use client";

import Image from "next/image";
import { useState } from "react";

interface Props {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/* Renders Next Image with a green-tinted fallback div if src is empty or broken */
export default function SafeImage({ src, alt, fill, width, height, className, sizes, priority }: Props) {
  const [error, setError] = useState(false);
  const validSrc = src && src.trim() !== "";

  if (!validSrc || error) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-green-50 text-green-300 ${className ?? ""}`}
        style={fill ? { position: "absolute", inset: 0 } : { width, height }}
      >
        <svg viewBox="0 0 64 64" className="w-12 h-12 opacity-60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="14" width="48" height="36" rx="4" stroke="#86efac" strokeWidth="2.5"/>
          <circle cx="22" cy="27" r="5" stroke="#86efac" strokeWidth="2.5"/>
          <polyline points="8,50 24,32 36,42 46,30 56,50" stroke="#86efac" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
        </svg>
        <span className="text-[10px] text-green-400 mt-1.5 font-medium">No Image</span>
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 400}
      height={height ?? 400}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={() => setError(true)}
    />
  );
}
