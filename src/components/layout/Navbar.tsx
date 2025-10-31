"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store";
import { hydrateFromStorage, logout } from "@/store/slices/auth";

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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { scrollYProgress } = useScroll();
  const progressX = useSpring(scrollYProgress, { stiffness: 140, damping: 20, mass: 0.2 });
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    dispatch(hydrateFromStorage());
  }, [dispatch]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Close user menu when clicking outside
    if (userMenuOpen) {
      const handleClickOutside = () => setUserMenuOpen(false);
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [userMenuOpen]);

  function handleLogout() {
    dispatch(logout());
    router.push("/");
    setUserMenuOpen(false);
  }

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
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUserMenuOpen(!userMenuOpen);
                }}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-black dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-xs font-semibold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden lg:inline">{user.name}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-zinc-200 bg-white/95 backdrop-blur-xl shadow-xl dark:border-zinc-800 dark:bg-zinc-950/95"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-2">
                      <div className="rounded-lg px-3 py-2 text-sm font-semibold text-zinc-900 dark:text-white">
                        {user.name}
                      </div>
                      <div className="rounded-lg px-3 py-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {user.email}
                      </div>
                      <div className="my-2 h-px bg-zinc-200 dark:bg-zinc-800" />
                      <Link
                        href="/portal/dashboard"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-black dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <Link
                        href="/portal/profile"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-black dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <div className="my-2 h-px bg-zinc-200 dark:bg-zinc-800" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Button asChild variant="outline" className="hover:-translate-y-0.5">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="hidden translate-y-0 lg:inline-flex hover:-translate-y-0.5">
                <Link href="/uitgiften">Get started</Link>
              </Button>
            </>
          )}
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
              {isAuthenticated && user ? (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2 rounded-lg px-3 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-xs font-semibold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-zinc-900 dark:text-white">{user.name}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">{user.email}</div>
                    </div>
                  </div>
                  <Link
                    href="/portal/dashboard"
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-black dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
                    onClick={() => setOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/portal/profile"
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-black dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
                    onClick={() => setOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setOpen(false);
                    }}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex gap-2">
                  <Button asChild className="flex-1">
                    <Link href="/login" onClick={() => setOpen(false)}>Login</Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link href="/uitgiften" onClick={() => setOpen(false)}>Get started</Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}


