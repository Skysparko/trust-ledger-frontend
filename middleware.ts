import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isPortal = request.nextUrl.pathname.startsWith("/portal");
  if (!isPortal) return NextResponse.next();

  const auth = request.cookies.get("auth")?.value;
  if (!auth) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*"],
};


