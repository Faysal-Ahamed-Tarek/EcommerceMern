import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_HOSTNAME = "admin.herblifenutri.com";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") ?? "";
  const bare = hostname.split(":")[0]; // strip port for local dev comparison

  if (bare !== ADMIN_HOSTNAME) return NextResponse.next();

  const { pathname, search } = request.nextUrl;

  // Already under /admin — pass through
  if (pathname.startsWith("/admin")) return NextResponse.next();

  // Rewrite root → /admin/dashboard, everything else → /admin/<path>
  const target = pathname === "/" ? "/admin/dashboard" : `/admin${pathname}`;
  const url = request.nextUrl.clone();
  url.pathname = target;
  url.search = search;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    // Run on all paths except Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)",
  ],
};
