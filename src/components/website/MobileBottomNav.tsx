"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3X3, Sparkles, Phone, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { title: "Home", href: "/", icon: Home },
  { title: "Categories", href: "/categories", icon: Grid3X3 },
  { title: "New", href: "/new-arrivals", icon: Sparkles },
  { title: "About", href: "/about", icon: User },
  { title: "Contact", href: "/contact", icon: Phone },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-charcoal-100 bg-white/95 backdrop-blur-md md:hidden">
      <div className="flex items-center justify-around px-2 py-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-gold-600"
                  : "text-charcoal-400 active:text-charcoal-600"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5",
                  isActive ? "text-gold-600" : "text-charcoal-400"
                )}
              />
              <span>{item.title}</span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-gold-500" />
              )}
            </Link>
          );
        })}
      </div>
      {/* Safe area padding for devices with bottom notch */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
