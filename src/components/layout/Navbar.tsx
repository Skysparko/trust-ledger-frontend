"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/uitgiften", label: "Issuances" },
  { href: "/projecten", label: "Projects" },
  { href: "/kennis", label: "Knowledge" },
  { href: "/webinars", label: "Webinars" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const progressX = useSpring(scrollYProgress, { stiffness: 140, damping: 20, mass: 0.2 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={
      "sticky top-0 z-50 w-full backdrop-blur-xl transition-all duration-300 " +
      (scrolled
        ? "bg-white/70 shadow-lg shadow-zinc-200/20 dark:bg-zinc-950/70 dark:shadow-zinc-900/30"
        : "bg-transparent")
    }>
      {/* scroll progress */}
      <motion.div
        className="fixed left-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600"
        style={{ scaleX: progressX }}
      />
      {/* gradient bottom border */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent dark:via-zinc-800" />

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/globe.svg" alt="Logo" width={32} height={32} />
          <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-lg font-extrabold tracking-tight text-transparent">TrustLedger</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="group relative rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 outline-none transition-colors hover:text-black focus-visible:ring-2 focus-visible:ring-blue-500/50 dark:text-zinc-300 dark:hover:text-white"
              >
                {item.label}
                <span
                  className={
                    "pointer-events-none absolute inset-0 -z-10 rounded-lg bg-zinc-900/0 transition-colors duration-300 group-hover:bg-zinc-900/5 dark:group-hover:bg-white/5"
                  }
                />
                {active ? (
                  <span className="pointer-events-none absolute -bottom-1 left-0 h-0.5 w-full origin-left bg-gradient-to-r from-blue-500 to-cyan-500" />
                ) : null}
              </Link>
            );
          })}
          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />
          <Button asChild variant="outline" className="hover:-translate-y-0.5">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="hidden translate-y-0 lg:inline-flex hover:-translate-y-0.5">
            <Link href="/uitgiften">Get started</Link>
          </Button>
        </nav>
        <button
          className="inline-flex items-center justify-center rounded-md p-2 outline-none ring-1 ring-transparent transition-all hover:bg-zinc-100 focus-visible:ring-blue-500/50 dark:hover:bg-zinc-900 md:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="border-t border-zinc-200/60 bg-white/80 backdrop-blur-xl p-4 dark:border-zinc-800/60 dark:bg-zinc-950/80 md:hidden"
          >
            <div className="flex flex-col gap-4">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      "text-sm font-medium transition-colors " +
                      (active ? "text-black dark:text-white" : "text-zinc-700 dark:text-zinc-300")
                    }
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <div className="mt-2 flex gap-2">
                <Button asChild className="flex-1">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/uitgiften">Get started</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}


