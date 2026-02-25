"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS } from "@/constants/navigation";
import { Logo } from "@/components/shared/Logo";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col bg-charcoal-800 text-white transition-all duration-300 ease-in-out h-screen sticky top-0 z-30",
        isCollapsed ? "w-18" : "w-60",
        className
      )}
    >
      {/* Logo area */}
      <div
        className={cn(
          "flex items-center border-b border-charcoal-700 h-16 shrink-0",
          isCollapsed ? "justify-center px-2" : "px-5"
        )}
      >
        {isCollapsed ? (
          <span className="text-gold-500 font-heading font-bold text-xl">
            A
          </span>
        ) : (
          <Logo size="sm" variant="light" />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" &&
                pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={isCollapsed ? item.title : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    "min-h-11",
                    isActive
                      ? "bg-gold-500/10 text-gold-400 border-l-[3px] border-gold-500 ml-0 pl-2.25"
                      : "text-charcoal-300 hover:bg-charcoal-700 hover:text-white border-l-[3px] border-transparent pl-2.25",
                    isCollapsed && "justify-center px-2 pl-2 border-l-0"
                  )}
                >
                  <item.icon
                    className={cn(
                      "shrink-0",
                      isActive ? "text-gold-500" : "text-charcoal-400"
                    )}
                    size={20}
                  />
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15 }}
                        className="whitespace-nowrap overflow-hidden"
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {!isCollapsed && item.badge && (
                    <span className="ml-auto bg-gold-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-charcoal-700 p-2 shrink-0">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-center w-full h-10 rounded-lg text-charcoal-400 hover:bg-charcoal-700 hover:text-white transition-colors duration-200"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight size={18} />
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <ChevronLeft size={18} />
              <span>Collapse</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
