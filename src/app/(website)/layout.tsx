import { Header } from "@/components/website/Header";
import { Footer } from "@/components/website/Footer";
import { MobileBottomNav } from "@/components/website/MobileBottomNav";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { Toaster } from "sonner";

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileBottomNav />
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: { fontFamily: "var(--font-body)" },
          }}
        />
      </div>
    </LanguageProvider>
  );
}
