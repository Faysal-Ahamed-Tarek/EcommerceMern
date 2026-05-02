import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ui/ScrollToTop";
import { SiteDataProvider } from "@/context/SiteDataContext";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteDataProvider>
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
      <ScrollToTop />
    </SiteDataProvider>
  );
}
