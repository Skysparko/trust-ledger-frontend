"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Home, FileText, Bell, User2, LogOut, ChevronDown, Package, Wallet } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { logout, hydrateFromStorage } from "@/store/slices/auth";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const notifications = useAppSelector((s) => s.notifications.items);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    dispatch(hydrateFromStorage());
  }, [dispatch]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (userMenuOpen) {
      const handleClickOutside = () => setUserMenuOpen(false);
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [userMenuOpen]);

  function NavItem({ href, label, icon: Icon }: { href: string; label: string; icon: any }) {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
          active
            ? "bg-zinc-800 text-white shadow-md dark:bg-zinc-800 dark:text-white"
            : "text-zinc-400 hover:text-white hover:bg-zinc-800/50 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800/50"
        )}
      >
        <Icon className="h-5 w-5 shrink-0" /> 
        <span>{label}</span>
      </Link>
    );
  }

  function onLogout() {
    dispatch(logout());
    router.push("/");
    setUserMenuOpen(false);
  }

  // Show loading if user is not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black dark:bg-black">
      {/* Header Bar */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-950/95 backdrop-blur-xl">
        {/* Gradient accent line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Left Side - Branding */}
          <Link href="/portal/dashboard" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-sm group-hover:blur-md transition-all" />
              <Image 
                src="/globe.svg" 
                alt="RWA" 
                width={28} 
                height={28} 
                className="relative z-10 opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </div>
            <div className="flex flex-col">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-lg font-extrabold tracking-tight text-transparent">
                RWA
              </span>
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
                Portal
              </span>
            </div>
          </Link>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications Icon */}
            <Link
              href="/portal/notifications"
              className="relative flex items-center justify-center rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-2.5 text-zinc-400 transition-all duration-200 hover:border-zinc-700/50 hover:bg-zinc-800/50 hover:text-white hover:shadow-lg hover:shadow-blue-500/10"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-[10px] font-bold text-white shadow-lg shadow-blue-500/50 ring-2 ring-zinc-950">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            {/* Divider */}
            <div className="h-8 w-px bg-gradient-to-b from-transparent via-zinc-800/50 to-transparent mx-1" />

            {/* User Menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserMenuOpen(!userMenuOpen);
                  }}
                  className="flex items-center gap-3 rounded-xl border border-zinc-800/50 bg-zinc-900/50 px-3 py-2 text-sm font-medium text-white transition-all duration-200 hover:border-zinc-700/50 hover:bg-zinc-800/50 hover:shadow-lg hover:shadow-blue-500/10"
                >
                  <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-500/20">
                    {user.name.charAt(0).toUpperCase()}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
                  </div>
                  <div className="hidden flex-col items-start md:flex">
                    <span className="font-medium text-white leading-tight">{user.name}</span>
                    <span className="text-[10px] text-zinc-400 leading-tight">Investor</span>
                  </div>
                  <ChevronDown 
                    className={`h-4 w-4 text-zinc-400 transition-all duration-200 ${userMenuOpen ? "rotate-180 text-white" : ""}`} 
                  />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-zinc-800/50 bg-zinc-900/95 backdrop-blur-xl shadow-2xl ring-1 ring-zinc-800/50 overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Gradient header */}
                      <div className="bg-gradient-to-r from-zinc-800/50 to-zinc-900/50 px-4 py-3 border-b border-zinc-800/50">
                        <div className="text-sm font-semibold text-white">
                          {user.name}
                        </div>
                        <div className="mt-0.5 text-xs text-zinc-400">
                          {user.email}
                        </div>
                      </div>
                      
                      <div className="p-2">
                        <Link
                          href="/portal/profile"
                          className="flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800/50 hover:text-white"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User2 className="h-4 w-4" />
                          Profile Settings
                        </Link>
                        <div className="my-2 h-px bg-zinc-800/50" />
                        <button
                          onClick={onLogout}
                          className="flex w-full items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom border gradient */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-zinc-700/30 to-transparent" />
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 md:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-xl border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="mb-5 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
            Investor Portal
          </div>
          <nav className="flex flex-col gap-1.5">
            <NavItem href="/portal/dashboard" label="Dashboard" icon={Home} />
            <NavItem href="/portal/issues" label="Investment Opportunities" icon={FileText} />
            <NavItem href="/portal/owned-assets" label="Owned Assets" icon={Package} />
            <NavItem href="/portal/transactions/fiat" label="Transactions" icon={Wallet} />
          </nav>
        </aside>
        <section className="min-h-screen">{children}</section>
      </div>
    </div>
  );
}


