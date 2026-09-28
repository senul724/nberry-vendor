"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Bell,
  Layers,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Loader2,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { useToken } from "@/hooks/use-token";
import { useUser } from "@/hooks/use-user";
import type { User } from "@/lib/atoms";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardNavProps {
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function DashboardNav({ breadcrumbs }: DashboardNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { getUser } = useUser();
  const { setAccessToken } = useToken();
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authApi.logout();
      setAccessToken(null);
      setUser(null);
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.message || "Failed to log out");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/85 backdrop-blur-xl shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Breadcrumbs */}
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <Link href="/dashboard/apps" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-600 text-white flex items-center justify-center shadow-xs ring-1 ring-violet-500/30 group-hover:scale-105 transition-transform duration-150">
              <Bell className="w-4 h-4 fill-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-zinc-900 tracking-tight text-base">
                  Notify Berry
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 bg-violet-50 border border-violet-200/60 px-1.5 py-0.2 rounded-md">
                  Vendor
                </span>
              </div>
            </div>
          </Link>

          {/* Breadcrumbs or Nav Links */}
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <div className="hidden md:flex items-center gap-1.5 text-xs text-zinc-400">
              <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <div key={idx} className="flex items-center gap-1.5">
                    {crumb.href && !isLast ? (
                      <Link
                        href={crumb.href}
                        className="text-zinc-500 hover:text-zinc-900 font-medium transition-colors truncate max-w-[160px]"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className={cn("truncate max-w-[200px]", isLast ? "font-semibold text-zinc-900" : "text-zinc-500")}>
                        {crumb.label}
                      </span>
                    )}
                    {!isLast && <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />}
                  </div>
                );
              })}
            </div>
          ) : (
            <nav className="hidden sm:flex items-center gap-1">
              <Link
                href="/dashboard/apps"
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
                  pathname.startsWith("/dashboard/apps")
                    ? "bg-zinc-100 text-zinc-900"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                )}
              >
                Applications
              </Link>
            </nav>
          )}
        </div>

        {/* User profile & Logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-zinc-100/90 border border-zinc-200/70 text-xs text-zinc-700 shadow-2xs">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-[10px]">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : <UserIcon className="w-3 h-3" />}
            </div>
            <div className="text-left hidden sm:block">
              <p className="font-semibold text-zinc-900 leading-tight text-xs">
                {user?.name || "Vendor User"}
              </p>
              <p className="text-[10px] text-zinc-500 leading-tight truncate max-w-[130px]">
                {user?.email || "vendor@notifyberry.com"}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="h-8 px-2.5 text-zinc-600 hover:text-rose-600 hover:bg-rose-50/50 hover:border-rose-200 text-xs font-medium rounded-lg"
          >
            {isLoggingOut ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <LogOut className="w-3.5 h-3.5 sm:mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
