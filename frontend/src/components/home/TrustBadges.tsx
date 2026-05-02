"use client";

import {
  Truck, Leaf, ShieldCheck, RotateCcw, Package, Clock,
  Star, Heart, BadgeCheck, Headphones, Gift, Zap, CreditCard,
  type LucideIcon,
} from "lucide-react";
import { useSiteData } from "@/context/SiteDataContext";

const ICON_MAP: Record<string, LucideIcon> = {
  Truck,
  Leaf,
  ShieldCheck,
  RotateCcw,
  Package,
  Clock,
  Star,
  Heart,
  BadgeCheck,
  Headphones,
  Gift,
  Zap,
  CreditCard,
};

export default function TrustBadges() {
  const { config } = useSiteData();
  const badges = config.trustBadges;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 my-6">
      {badges.map((b) => {
        const Icon = ICON_MAP[b.icon] ?? ShieldCheck;
        return (
          <div
            key={b.title}
            className="bg-white border border-gray-100 rounded-2xl px-4 py-4 flex items-center gap-3 shadow-sm hover:shadow-md hover:border-green-200 transition-all"
          >
            <div className="shrink-0 w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <Icon size={20} className="text-green-600" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{b.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{b.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
