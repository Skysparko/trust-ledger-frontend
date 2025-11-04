"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store";
import { hydrateAdminFromStorage, adminLogout } from "@/store/slices/adminAuth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  Newspaper,
  Video,
  FolderOpen,
  CreditCard,
  LogOut,
  Menu,
  X,
  UserCircle,
  ChevronRight,
  Home,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Investment Opportunities", href: "/admin/investment-opportunities", icon: TrendingUp },
  { name: "Projects", href: "/admin/projects", icon: Building2 },
  { name: "Blog/News", href: "/admin/posts", icon: Newspaper },
  { name: "Webinars", href: "/admin/webinars", icon: Video },
  { name: "Documents", href: "/admin/documents", icon: FolderOpen },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Transactions", href: "/admin/transactions", icon: CreditCard },
  { name: "Blockchain", href: "/admin/blockchain", icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const admin = useAppSelector((s) => s.adminAuth.user);
  const isAuthenticated = useAppSelector((s) => s.adminAuth.isAuthenticated);
  const isLoginPage = pathname === "/admin/login";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    dispatch(hydrateAdminFromStorage());
  }, [dispatch]);

  useEffect(() => {
    const isLogin = pathname === "/admin/login";
    if (!isAuthenticated && !isLogin) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, pathname, router]);

  const handleLogout = () => {
    dispatch(adminLogout());
    router.push("/admin/login");
  };

  // Get current page title from pathname
  const getPageTitle = () => {
    if (pathname === "/admin") return "Dashboard";
    const route = navigation.find((item) => pathname?.startsWith(item.href));
    return route?.name || "Admin";
  };

  // Get breadcrumbs
  const getBreadcrumbs = () => {
    const crumbs = [{ label: "Dashboard", href: "/admin" }];
    if (pathname !== "/admin") {
      const route = navigation.find((item) => pathname?.startsWith(item.href) && item.href !== "/admin");
      if (route) {
        crumbs.push({ label: route.name, href: route.href });
      }
    }
    return crumbs;
  };

  // If on login page, render without sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // If not authenticated and not on login page, show nothing (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 transition-transform duration-300 ease-in-out lg:translate-x-0",
          "shadow-2xl shadow-black/20",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-20 items-center justify-between border-b border-zinc-800/50 px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                <LayoutDashboard className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">Admin Panel</h1>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Dashboard</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                    "hover:bg-zinc-800/50",
                    isActive
                      ? "bg-zinc-100 text-zinc-900 shadow-lg shadow-black/10"
                      : "text-zinc-300"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-blue-500 to-cyan-500" />
                  )}
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-all duration-200",
                      isActive ? "text-zinc-700" : "text-zinc-400 group-hover:text-zinc-300"
                    )}
                  />
                  <span className="flex-1">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="border-t border-zinc-800/50 p-4">
            <div className="mb-3 rounded-xl bg-zinc-800/30 px-4 py-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                  <UserCircle className="h-5 w-5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{admin?.name || "Admin User"}</p>
                  <p className="text-xs text-zinc-400 truncate">{admin?.email || "admin@example.com"}</p>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800/50 hover:text-white transition-all duration-200"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-zinc-200/50 bg-gradient-to-b from-white via-white to-zinc-50/50 px-6 backdrop-blur-sm dark:border-zinc-800/50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900/50">
          {/* Left side - Breadcrumbs and Title */}
          <div className="flex flex-1 items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Breadcrumbs */}
            <nav className="hidden items-center gap-2 text-sm md:flex">
              <Link
                href="/admin"
                className="flex items-center gap-1.5 text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                <Home className="h-3.5 w-3.5" />
                <span>Dashboard</span>
              </Link>
              {pathname !== "/admin" && (
                <>
                  <ChevronRight className="h-4 w-4 text-zinc-400" />
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {getPageTitle()}
                  </span>
                </>
              )}
            </nav>

            {/* Mobile Title */}
            <div className="md:hidden">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {getPageTitle()}
              </h2>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            {/* User info (mobile) */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                <UserCircle className="h-4 w-4 text-blue-500" />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                  {admin?.name?.split(" ")[0] || "Admin"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
          <div className="mx-auto max-w-7xl p-6 lg:p-8">
            {/* Desktop Page Title */}
            <div className="mb-6 hidden md:block">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {getPageTitle()}
              </h1>
              {pathname !== "/admin" && (
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Manage and monitor {getPageTitle().toLowerCase()} from this page
                </p>
              )}
            </div>
            <div>{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}

