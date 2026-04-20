import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "All Products", href: "/products" },
  { label: "About Us", href: "/about" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      {/* Main footer grid */}
      <div className="max-w-[1200px] mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="space-y-4">
          <div className="inline-block">
            <div className="bg-green-600 text-white font-extrabold text-xl px-3 py-1.5 rounded-lg leading-none">
              Shop<span className="text-green-200">BD</span>
            </div>
          </div>
          <p className="text-sm leading-relaxed">
            Your trusted marketplace for fresh, organic, and quality products. Delivered across Bangladesh with love.
          </p>
          <div className="flex gap-3 pt-1">
            <a
              href="#"
              className="bg-gray-800 hover:bg-green-700 transition-colors text-gray-400 hover:text-white p-2 rounded-lg"
              aria-label="Facebook"
            >
              <span className="text-xs font-bold">f</span>
            </a>
            <a
              href="#"
              className="bg-gray-800 hover:bg-green-700 transition-colors text-gray-400 hover:text-white p-2 rounded-lg"
              aria-label="Instagram"
            >
              <span className="text-xs font-bold">in</span>
            </a>
            <a
              href="https://wa.me/8801XXXXXXXXX"
              className="bg-gray-800 hover:bg-green-700 transition-colors text-gray-400 hover:text-white p-2 rounded-lg text-xs font-bold"
              aria-label="WhatsApp"
            >
              WA
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-2.5">
            {QUICK_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm hover:text-green-400 transition-colors flex items-center gap-1.5 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-green-500 transition-colors" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact Us</h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-2.5 text-sm">
              <Phone size={15} className="text-green-500 mt-0.5 shrink-0" />
              <span>+880 1XXX-XXXXXX</span>
            </li>
            <li className="flex items-start gap-2.5 text-sm">
              <Mail size={15} className="text-green-500 mt-0.5 shrink-0" />
              <span>support@shopbd.com</span>
            </li>
            <li className="flex items-start gap-2.5 text-sm">
              <MapPin size={15} className="text-green-500 mt-0.5 shrink-0" />
              <span>Dhaka, Bangladesh</span>
            </li>
          </ul>
        </div>

        {/* Trust badges */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">We Assure</h4>
          <div className="space-y-2.5">
            {[
              { icon: "🚚", label: "Free Delivery", sub: "Orders above ৳999" },
              { icon: "🔒", label: "Secure Payment", sub: "100% safe checkout" },
              { icon: "↩️", label: "Easy Returns", sub: "7-day return policy" },
              { icon: "✅", label: "Genuine Products", sub: "Quality guaranteed" },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-3 text-sm">
                <span className="text-base">{b.icon}</span>
                <div>
                  <span className="text-white font-medium">{b.label}</span>
                  <span className="text-gray-500 text-xs block">{b.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-[1200px] mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
          <p>&copy; {new Date().getFullYear()} ShopBD. All rights reserved.</p>
          <p>Payment: Cash on Delivery 💵</p>
        </div>
      </div>
    </footer>
  );
}
