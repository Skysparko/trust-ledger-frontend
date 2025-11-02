import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isPortal = request.nextUrl.pathname.startsWith("/portal");
  const isAdmin = request.nextUrl.pathname.startsWith("/admin");
  const isAdminLogin = request.nextUrl.pathname === "/admin/login";

  // Portal protection
  if (isPortal && !isAdmin) {
    // Check for either auth cookie or auth_token cookie
    const auth = request.cookies.get("auth")?.value;
    const authToken = request.cookies.get("auth_token")?.value;
    
    if (!auth && !authToken) {
      const url = new URL("/login", request.url);
      url.searchParams.set("from", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Admin protection (except login page)
  if (isAdmin && !isAdminLogin) {
    const adminAuth = request.cookies.get("admin_auth")?.value;
    if (!adminAuth) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*", "/admin/:path*"],
};


