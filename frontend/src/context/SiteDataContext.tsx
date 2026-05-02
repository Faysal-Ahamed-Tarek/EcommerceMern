"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import type { Category } from "@/types";

interface SocialLink {
  platform: string;
  url: string;
  isActive: boolean;
}

export interface TrustBadge {
  icon: string;
  title: string;
  desc: string;
}

export interface DeliveryZone {
  label: string;
  charge: number;
}

export interface SiteConfig {
  primaryColor: string;
  storeName?: string;
  storeTagline?: string;
  siteTitle?: string;
  favicon?: string;
  marqueeTexts: string[];
  headerLogo?: string;
  footerLogo?: string;
  footerDescription: string;
  socialLinks: SocialLink[];
  copyrightText: string;
  paymentMethodsText: string;
  footerPhone: string;
  footerEmail: string;
  footerLocation: string;
  trustBadges: TrustBadge[];
  deliveryZones: DeliveryZone[];
}

const DEFAULT_CONFIG: SiteConfig = {
  primaryColor: "#16a34a",
  marqueeTexts: [
    "🚚 Free delivery on orders above ৳999",
    "Cash on Delivery available across Bangladesh",
  ],
  footerDescription:
    "Your trusted marketplace for fresh, organic, and quality products. Delivered across Bangladesh with love.",
  socialLinks: [],
  copyrightText: "© {year} ShopBD. All rights reserved.",
  paymentMethodsText: "Payment: Cash on Delivery 💵",
  footerPhone: "+880 1XXX-XXXXXX",
  footerEmail: "support@shopbd.com",
  footerLocation: "Dhaka, Bangladesh",
  trustBadges: [
    { icon: "Truck", title: "Free Delivery", desc: "On orders above ৳999" },
    { icon: "Leaf", title: "100% Natural", desc: "Sourced from trusted farms" },
    { icon: "ShieldCheck", title: "Secure Payment", desc: "Cash on delivery available" },
    { icon: "RotateCcw", title: "Easy Returns", desc: "7-day hassle-free returns" },
  ],
  deliveryZones: [
    { label: "Inside Dhaka", charge: 60 },
    { label: "Outside Dhaka", charge: 120 },
  ],
};

interface SiteData {
  categories: Category[];
  config: SiteConfig;
}

const SiteDataContext = createContext<SiteData>({ categories: [], config: DEFAULT_CONFIG });

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    // Single Promise.all replaces the independent fetches in Header, Footer,
    // CategoryGrid and ProductsClient — four round-trips become one pair.
    Promise.all([
      api.get("/categories").catch(() => null),
      api.get("/config").catch(() => null),
    ]).then(([catRes, cfgRes]) => {
      if (catRes?.data?.data) setCategories(catRes.data.data);
      if (cfgRes?.data?.data) {
        const d = cfgRes.data.data;
        setConfig({
          primaryColor: d.primaryColor || DEFAULT_CONFIG.primaryColor,
          storeName: d.storeName,
          storeTagline: d.storeTagline,
          siteTitle: d.siteTitle,
          favicon: d.favicon,
          marqueeTexts:
            d.marqueeTexts?.length > 0 ? d.marqueeTexts : DEFAULT_CONFIG.marqueeTexts,
          headerLogo: d.headerLogo || undefined,
          footerLogo: d.footerLogo || undefined,
          footerDescription: d.footerDescription || DEFAULT_CONFIG.footerDescription,
          socialLinks: d.socialLinks || [],
          copyrightText: d.copyrightText || DEFAULT_CONFIG.copyrightText,
          paymentMethodsText: d.paymentMethodsText || DEFAULT_CONFIG.paymentMethodsText,
          footerPhone: d.footerPhone || DEFAULT_CONFIG.footerPhone,
          footerEmail: d.footerEmail || DEFAULT_CONFIG.footerEmail,
          footerLocation: d.footerLocation || DEFAULT_CONFIG.footerLocation,
          trustBadges: d.trustBadges?.length > 0 ? d.trustBadges : DEFAULT_CONFIG.trustBadges,
          deliveryZones: d.deliveryZones?.length >= 2 ? d.deliveryZones : DEFAULT_CONFIG.deliveryZones,
        });
      }
    });
  }, []);

  return (
    <SiteDataContext.Provider value={{ categories, config }}>
      {children}
    </SiteDataContext.Provider>
  );
}

export const useSiteData = () => useContext(SiteDataContext);
