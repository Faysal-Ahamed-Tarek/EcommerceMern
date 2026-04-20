import type { Review } from "@/types";

interface Props {
  reviews: Review[];
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`text-base ${i < rating ? "text-amber-400" : "text-gray-200"}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function ReviewsSection({ reviews }: Props) {
  if (!reviews.length) return null;

  return (
    <section className="my-12">
      <div className="flex items-center gap-3 mb-6">
        <span className="block w-1 h-6 bg-green-600 rounded-full" />
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Customer Reviews</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.map((review) => (
          <div
            key={review._id}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
          >
            {/* Decorative quote */}
            <span className="absolute top-3 right-4 text-5xl text-green-100 font-serif leading-none select-none">
              "
            </span>

            <Stars rating={review.rating} />

            <p className="mt-3 text-sm text-gray-700 leading-relaxed line-clamp-3">
              {review.comment}
            </p>

            <div className="mt-4 flex items-center gap-2 pt-3 border-t border-gray-100">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm uppercase">
                {review.customerName[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{review.customerName}</p>
                {review.isVerifiedPurchase && (
                  <p className="text-[11px] text-green-600 font-medium">✓ Verified Purchase</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
