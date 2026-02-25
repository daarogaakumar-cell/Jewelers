"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { LogOut, User, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/constants";
import { ADMIN_NAV_ITEMS } from "@/constants/navigation";
import { Logo } from "@/components/shared/Logo";

interface TopBarProps {
  className?: string;
}

export function TopBar({ className }: TopBarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Derive current page title from nav items
  const currentNavItem = ADMIN_NAV_ITEMS.find(
    (item) =>
      pathname === item.href ||
      (item.href !== "/admin/dashboard" && pathname.startsWith(item.href))
  );
  const pageTitle = currentNavItem?.title || "Dashboard";

  return (
    <header
      className={cn(
        "sticky top-0 z-20 bg-white border-b border-charcoal-100 h-16 shrink-0",
        className
      )}
    >
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Mobile logo + page title */}
        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <Logo size="sm" variant="dark" />
          </div>
          <div className="hidden md:block">
            <h1 className="text-lg font-heading font-semibold text-charcoal-700">
              {pageTitle}
            </h1>
          </div>
        </div>

        {/* Right section — admin info + actions */}
        <div className="flex items-center gap-2">
          {/* Notifications placeholder */}
          <button
            className="relative flex items-center justify-center w-10 h-10 rounded-lg text-charcoal-400 hover:bg-charcoal-50 hover:text-charcoal-600 transition-colors duration-200"
            aria-label="Notifications"
          >
            <Bell size={20} />
          </button>

          {/* Admin info */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-charcoal-100">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/10 text-gold-600">
              <User size={16} />
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-charcoal-700 leading-tight">
                {session?.user?.name || "Admin"}
              </p>
              <p className="text-xs text-charcoal-400 leading-tight">
                {APP_NAME}
              </p>
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center justify-center w-10 h-10 rounded-lg text-charcoal-400 hover:bg-error/10 hover:text-error transition-colors duration-200"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
