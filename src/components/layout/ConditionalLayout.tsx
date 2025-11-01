"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPortalPage = pathname?.startsWith("/portal");
  const isAdminPage = pathname?.startsWith("/admin");
  
  // Auth pages that should not show Navbar/Footer
  const authPages = ["/login", "/signup", "/verify", "/verify-email", "/reset", "/reset-password", "/reset-password-confirm"];
  const isAuthPage = authPages.some((page) => pathname === page || pathname?.startsWith(page + "/"));

  // Hide Navbar and Footer when user is on portal, admin, or auth pages
  if (isPortalPage || isAdminPage || isAuthPage) {
    return <main id="main-content">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}

