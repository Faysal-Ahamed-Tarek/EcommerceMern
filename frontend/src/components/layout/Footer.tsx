"use client";

import type { FC } from "react";
import Link from "next/link";
import {
  Phone, Mail, MapPin,
  Truck, Leaf, ShieldCheck, RotateCcw, Package, Clock,
  Star, Heart, BadgeCheck, Headphones, Gift, Zap, CreditCard,
  type LucideIcon,
} from "lucide-react";
import { useSiteData } from "@/context/SiteDataContext";

const ICON_MAP: Record<string, LucideIcon> = {
  Truck, Leaf, ShieldCheck, RotateCcw, Package, Clock,
  Star, Heart, BadgeCheck, Headphones, Gift, Zap, CreditCard,
};

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const SOCIAL_ICON_MAP: Record<string, FC> = {
  Facebook: FacebookIcon,
  Instagram: InstagramIcon,
  LinkedIn: LinkedInIcon,
};

const QUICK_LINKS = [
  { label: "Home",               href: "/" },
  { label: "All Products",       href: "/products" },
  { label: "About Us",           href: "/about" },
  { label: "Privacy Policy",     href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms" },
];

function resolveCopyright(text: string) {
  return text.replace("{year}", String(new Date().getFullYear()));
}

export default function Footer() {
  const { config } = useSiteData();
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
            <div className="flex gap-2 pt-1">
              {activeSocials.map((s) => {
                const Icon = SOCIAL_ICON_MAP[s.platform];
                if (!Icon) return null;
                return (
                  <a
                    key={s.platform}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.platform}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-green-600 text-gray-600 hover:text-white transition-colors"
                  >
                    <Icon />
                  </a>
                );
              })}
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
            {config.trustBadges.map((b) => {
              const Icon = ICON_MAP[b.icon] ?? ShieldCheck;
              return (
                <div key={b.title} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-green-600" strokeWidth={1.75} />
                  </div>
                  <div>
                    <span className="text-gray-800 font-medium">{b.title}</span>
                    <span className="text-gray-400 text-xs block">{b.desc}</span>
                  </div>
                </div>
              );
            })}
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
