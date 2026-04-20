import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="text-center max-w-md">
          <p className="text-8xl font-extrabold text-green-600 leading-none select-none">404</p>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Page not found</h1>
          <p className="mt-2 text-gray-500 text-sm">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/"
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Go home
            </Link>
            <Link
              href="/products"
              className="border border-gray-300 hover:border-gray-400 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Browse products
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
