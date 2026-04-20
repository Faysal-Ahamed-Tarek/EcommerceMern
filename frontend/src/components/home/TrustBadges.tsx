const BADGES = [
  {
    icon: "🚚",
    title: "Free Delivery",
    desc: "On orders above ৳999",
  },
  {
    icon: "🌿",
    title: "100% Natural",
    desc: "Sourced from trusted farms",
  },
  {
    icon: "🔒",
    title: "Secure Payment",
    desc: "Cash on delivery available",
  },
  {
    icon: "↩️",
    title: "Easy Returns",
    desc: "7-day hassle-free returns",
  },
];

export default function TrustBadges() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 my-6">
      {BADGES.map((b) => (
        <div
          key={b.title}
          className="bg-white border border-gray-100 rounded-2xl px-4 py-4 flex items-center gap-3 shadow-sm hover:shadow-md hover:border-green-200 transition-all"
        >
          <span className="text-2xl">{b.icon}</span>
          <div>
            <p className="text-sm font-semibold text-gray-900">{b.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{b.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
