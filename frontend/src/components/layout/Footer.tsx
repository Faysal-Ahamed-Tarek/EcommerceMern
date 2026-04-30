"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { api } from "@/lib/api";

interface SocialLink {
  platform: string;
  url: string;
  isActive: boolean;
}

interface FooterConfig {
  footerLogo?: string;
  footerDescription: string;
  socialLinks: SocialLink[];
  copyrightText: string;
  paymentMethodsText: string;
  footerPhone: string;
  footerEmail: string;
  footerLocation: string;
}

const DEFAULTS: FooterConfig = {
  footerDescription: "Your trusted marketplace for fresh, organic, and quality products. Delivered across Bangladesh with love.",
  socialLinks: [],
  copyrightText: "© {year} ShopBD. All rights reserved.",
  paymentMethodsText: "Payment: Cash on Delivery 💵",
  footerPhone: "+880 1XXX-XXXXXX",
  footerEmail: "support@shopbd.com",
  footerLocation: "Dhaka, Bangladesh",
};

const QUICK_LINKS = [
  { label: "Home",             href: "/" },
  { label: "All Products",     href: "/products" },
  { label: "About Us",         href: "/about" },
  { label: "Privacy Policy",   href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms" },
];

function resolveCopyright(text: string) {
  return text.replace("{year}", String(new Date().getFullYear()));
}

export default function Footer() {
  const [config, setConfig] = useState<FooterConfig>(DEFAULTS);

  useEffect(() => {
    api.get("/config")
      .then((r) => {
        const d = r.data?.data;
        if (!d) return;
        setConfig({
          footerLogo: d.footerLogo || undefined,
          footerDescription: d.footerDescription || DEFAULTS.footerDescription,
          socialLinks: d.socialLinks || [],
          copyrightText: d.copyrightText || DEFAULTS.copyrightText,
          paymentMethodsText: d.paymentMethodsText || DEFAULTS.paymentMethodsText,
          footerPhone: d.footerPhone || DEFAULTS.footerPhone,
          footerEmail: d.footerEmail || DEFAULTS.footerEmail,
          footerLocation: d.footerLocation || DEFAULTS.footerLocation,
        });
      })
      .catch(() => {});
  }, []);

  const activeSocials = config.socialLinks.filter((s) => s.isActive);

  return (
    <footer className="bg-white border-t border-gray-100">
      {/* Main footer grid */}
      <div className="max-w-[1200px] mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="space-y-4">
          <div className="inline-block">
            {config.footerLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={config.footerLogo} alt="Store logo" className="h-12 object-contain" />
            ) : (
              <div className="bg-green-600 text-white font-extrabold text-xl px-3 py-1.5 rounded-lg leading-none">
                Shop<span className="text-green-200">BD</span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">{config.footerDescription}</p>
          {activeSocials.length > 0 && (
            <div className="flex gap-3 pt-1 flex-wrap">
              {activeSocials.map((s) => (
                <a
                  key={s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-100 hover:bg-green-600 transition-colors text-gray-600 hover:text-white px-3 py-2 rounded-lg text-xs font-bold"
                  aria-label={s.platform}
                >
                  {s.platform}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-gray-900 font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-2.5">
            {QUICK_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-gray-500 hover:text-green-600 transition-colors flex items-center gap-1.5 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-green-500 transition-colors" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-gray-900 font-semibold mb-4 text-sm uppercase tracking-wider">Contact Us</h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-2.5 text-sm text-gray-500">
              <Phone size={15} className="text-green-500 mt-0.5 shrink-0" />
              <span>{config.footerPhone}</span>
            </li>
            <li className="flex items-start gap-2.5 text-sm text-gray-500">
              <Mail size={15} className="text-green-500 mt-0.5 shrink-0" />
              <span>{config.footerEmail}</span>
            </li>
            <li className="flex items-start gap-2.5 text-sm text-gray-500">
              <MapPin size={15} className="text-green-500 mt-0.5 shrink-0" />
              <span>{config.footerLocation}</span>
            </li>
          </ul>
        </div>

        {/* Trust badges */}
        <div>
          <h4 className="text-gray-900 font-semibold mb-4 text-sm uppercase tracking-wider">We Assure</h4>
          <div className="space-y-2.5">
            {[
              { icon: "🚚", label: "Free Delivery",    sub: "Orders above ৳999" },
              { icon: "🔒", label: "Secure Payment",   sub: "100% safe checkout" },
              { icon: "↩️", label: "Easy Returns",     sub: "7-day return policy" },
              { icon: "✅", label: "Genuine Products",  sub: "Quality guaranteed" },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-3 text-sm">
                <span className="text-base">{b.icon}</span>
                <div>
                  <span className="text-gray-800 font-medium">{b.label}</span>
                  <span className="text-gray-400 text-xs block">{b.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-100">
        <div className="max-w-[1200px] mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <p>{resolveCopyright(config.copyrightText)}</p>
          <p>{config.paymentMethodsText}</p>
        </div>
      </div>
    </footer>
  );
}
