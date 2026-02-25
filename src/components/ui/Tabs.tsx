"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  content?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  activeTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

export function Tabs({
  tabs,
  defaultTab,
  activeTab: controlledActiveTab,
  onChange,
  className,
}: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultTab || tabs[0]?.id
  );

  const activeTab = controlledActiveTab ?? internalActiveTab;
  const handleTabClick = (tabId: string) => {
    if (onChange) {
      onChange(tabId);
    } else {
      setInternalActiveTab(tabId);
    }
  };

  const activeContent = tabs.find((t) => t.id === activeTab)?.content;

  return (
    <div className={className}>
      {/* Tab Headers — scrollable on mobile */}
      <div className="flex gap-1 overflow-x-auto border-b border-charcoal-100 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={cn(
              "shrink-0 px-4 py-2.5 text-sm font-medium transition-colors relative whitespace-nowrap",
              activeTab === tab.id
                ? "text-gold-600"
                : "text-charcoal-400 hover:text-charcoal-600"
            )}
            role="tab"
            aria-selected={activeTab === tab.id}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content — only render if tabs have content */}
      {activeContent && (
        <div className="mt-4" role="tabpanel">
          {activeContent}
        </div>
      )}
    </div>
  );
}
