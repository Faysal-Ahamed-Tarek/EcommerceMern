function PulseBox({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-xl ${className ?? ""}`} />;
}

export function ProductSectionSkeleton({ title }: { title?: string }) {
  return (
    <section className="my-10">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="block w-1 h-6 bg-gray-200 rounded-full" />
          {title ? (
            <h2 className="text-lg sm:text-xl font-bold text-gray-300">{title}</h2>
          ) : (
            <PulseBox className="h-6 w-36" />
          )}
        </div>
        <PulseBox className="h-4 w-16" />
      </div>
      <div className="flex gap-3 sm:gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="shrink-0 w-[calc(50%-0.375rem)] sm:w-[calc(50%-0.5rem)] lg:w-[calc((100%-3rem)/4)]"
          >
            <PulseBox className="aspect-square mb-2" />
            <PulseBox className="h-4 w-3/4 mb-1.5" />
            <PulseBox className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function PromoBannerSkeleton() {
  return (
    <section className="mt-10 mb-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PulseBox className="aspect-[16/7] rounded-2xl" />
        <PulseBox className="aspect-[16/7] rounded-2xl" />
      </div>
    </section>
  );
}

export function ReviewsSkeleton() {
  return (
    <section className="my-10">
      <div className="flex items-center gap-3 mb-6">
        <span className="block w-1 h-6 bg-gray-200 rounded-full" />
        <PulseBox className="h-6 w-40" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="shrink-0 w-full lg:w-[calc((100%-2rem)/3)] rounded-2xl border border-gray-100 p-5 flex flex-col gap-3"
          >
            <PulseBox className="h-4 w-24" />
            <PulseBox className="h-3 w-full" />
            <PulseBox className="h-3 w-5/6" />
            <PulseBox className="h-3 w-4/6" />
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100 mt-auto">
              <PulseBox className="w-9 h-9 rounded-full shrink-0" />
              <PulseBox className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function OutletsSkeleton() {
  return (
    <section className="max-w-[1200px] mx-auto px-4 py-5">
      <div className="flex items-center gap-3 mb-6">
        <span className="block w-1 h-6 bg-gray-200 rounded-full" />
        <PulseBox className="h-6 w-40" />
      </div>
      <div className="flex gap-3 sm:gap-4 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="shrink-0 w-[calc(50%-0.375rem)] sm:w-[calc(50%-0.5rem)] lg:w-[calc((100%-2rem)/3)]"
          >
            <div className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col gap-4">
              <PulseBox className="h-6 w-1/3" />
              <div className="flex flex-col gap-2">
                <PulseBox className="h-4 w-full" />
                <PulseBox className="h-4 w-5/6" />
                <PulseBox className="h-4 w-4/6" />
              </div>
              <PulseBox className="h-10 w-full rounded-xl mt-2" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
