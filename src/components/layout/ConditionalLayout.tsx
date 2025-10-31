"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPortalPage = pathname?.startsWith("/portal");
  const isAdminPage = pathname?.startsWith("/admin");

  // Hide Navbar and Footer when user is on portal or admin pages
  if (isPortalPage || isAdminPage) {
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

