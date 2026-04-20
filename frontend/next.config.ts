import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        // Allow http for local dev if needed
        protocol: "http",
        hostname: "res.cloudinary.com",
      },
    ],
    // Allow unoptimized for placeholder SVG served locally
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
  },
};

export default nextConfig;
