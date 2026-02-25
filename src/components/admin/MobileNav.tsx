"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MoreHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ADMIN_MOBILE_NAV_ITEMS,
  ADMIN_MORE_NAV_ITEMS,
} from "@/constants/navigation";

export function MobileNav() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  return (
    <>
      {/* More overlay */}
      <AnimatePresence>
        {isMoreOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMoreOpen(false)}
            />

            {/* More menu — bottom sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed bottom-17 left-0 right-0 bg-white rounded-t-2xl z-50 md:hidden shadow-modal"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-charcoal-600">
                    More
                  </h3>
                  <button
                    onClick={() => setIsMoreOpen(false)}
                    className="flex items-center justify-center w-8 h-8 rounded-full text-charcoal-400 hover:bg-charcoal-100"
                    aria-label="Close menu"
                  >
                    <X size={18} />
                  </button>
                </div>
                <ul className="space-y-1">
                  {ADMIN_MORE_NAV_ITEMS.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(item.href);

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setIsMoreOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors duration-200",
                            "min-h-11",
                            isActive
                              ? "bg-gold-500/10 text-gold-700"
                              : "text-charcoal-500 hover:bg-charcoal-50"
                          )}
                        >
                          <item.icon
                            size={20}
                            className={
                              isActive
                                ? "text-gold-500"
                                : "text-charcoal-400"
                            }
                          />
                          {item.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-charcoal-100 z-40 md:hidden safe-area-bottom">
        <div className="flex items-center justify-around h-17 px-2">
          {ADMIN_MOBILE_NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" &&
                pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 w-full h-full py-1.5 rounded-lg transition-colors duration-200",
                  "min-w-11 min-h-11",
                  isActive
                    ? "text-gold-600"
                    : "text-charcoal-400 active:text-charcoal-600"
                )}
              >
                <item.icon
                  size={22}
                  className={isActive ? "text-gold-500" : "text-charcoal-400"}
                />
                <span
                  className={cn(
                    "text-[11px] font-medium leading-none",
                    isActive ? "text-gold-600" : "text-charcoal-400"
                  )}
                >
                  {item.title}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gold-500 rounded-full"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-full h-full py-1.5 rounded-lg transition-colors duration-200",
              "min-w-11 min-h-11",
              isMoreOpen
                ? "text-gold-600"
                : "text-charcoal-400 active:text-charcoal-600"
            )}
          >
            <MoreHorizontal
              size={22}
              className={isMoreOpen ? "text-gold-500" : "text-charcoal-400"}
            />
            <span
              className={cn(
                "text-[11px] font-medium leading-none",
                isMoreOpen ? "text-gold-600" : "text-charcoal-400"
              )}
            >
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
