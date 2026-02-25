import { AuthProvider } from "@/components/providers/AuthProvider";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { MobileNav } from "@/components/admin/MobileNav";
import { Toaster } from "sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen bg-charcoal-50">
        {/* Desktop / Tablet sidebar */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Top bar */}
          <TopBar />

          {/* Page content */}
          <main className="flex-1 px-4 py-6 md:px-6 md:py-8 pb-24 md:pb-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>

        {/* Mobile bottom navigation */}
        <MobileNav />
      </div>
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: { fontFamily: "var(--font-body)" },
        }}
      />
    </AuthProvider>
  );
}
