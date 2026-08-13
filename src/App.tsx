import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { SpaceParticles } from './components/SpaceParticles';
import { SplashLoader } from './components/SplashLoader';
import { Header } from './components/Header';
import { MobileSidebarNav } from './components/MobileSidebarNav';
import { HeroSection } from './components/HeroSection';
import { CategoryGrid } from './components/CategoryGrid';
import { ResourceFeed } from './components/ResourceFeed';
import { CategoryPage } from './components/CategoryPage';
import { ProductDetailModal } from './components/ProductDetailModal';
import { TelegramModal } from './components/TelegramModal';
import { SearchModal } from './components/SearchModal';
import { ContactModal } from './components/ContactModal';
import { NotFoundPage } from './components/NotFoundPage';
import { FloatingTelegramButton } from './components/FloatingTelegramButton';
import { Footer } from './components/Footer';
import { AdminPanel } from './components/admin/AdminPanel';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { toastMessage, homepageBuilder, siteSettings, seo, selectedCategory, isAdminOpen, isNotFound } = useApp();

  // Dynamically update document title and favicon
  useEffect(() => {
    const title = seo?.metaTitle || siteSettings?.websiteTitle || 'Online Task Lab (OTL)';
    document.title = title;

    if (siteSettings?.faviconUrl) {
      let favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = siteSettings.faviconUrl;
    }
  }, [siteSettings, seo]);

  // Scroll to top smoothly whenever category or admin page state changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedCategory, isAdminOpen]);

  return (
    <div className="min-h-screen bg-[#060B1E] text-white flex flex-col relative selection:bg-[#5DE2E7] selection:text-slate-950 font-sans">
      {/* Space Particle Canvas Backdrop */}
      {homepageBuilder.showHeroParticles && <SpaceParticles density={60} />}

      {/* Splash Screen Loader */}
      <SplashLoader />

      {/* Header Navbar */}
      <Header />

      {/* YouTube Style Mobile Sidebar Navigation */}
      <MobileSidebarNav />

      {/* Main Container */}
      <main className="flex-1 relative z-10">
        {isNotFound ? (
          <NotFoundPage />
        ) : isAdminOpen ? (
          <AdminPanel />
        ) : selectedCategory === 'all' ? (
          <>
            {/* Hero Section */}
            <HeroSection />

            {/* Featured Categories */}
            {homepageBuilder.showFeaturedCategories && <CategoryGrid />}

            {/* Resources Feed */}
            <ResourceFeed />
          </>
        ) : (
          <CategoryPage />
        )}
      </main>

      {/* Floating Telegram Action Button */}
      <FloatingTelegramButton />

      {/* Footer */}
      <Footer />

      {/* Modals & Overlays */}
      <ProductDetailModal />
      <TelegramModal />
      <SearchModal />
      <ContactModal />

      {/* System Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] px-5 py-3 rounded-2xl bg-slate-950/90 border border-[#5DE2E7]/60 text-white font-bold text-xs shadow-[0_0_30px_rgba(93,226,231,0.5)] backdrop-blur-xl flex items-center gap-2.5"
          >
            <CheckCircle2 className="w-4 h-4 text-[#5DE2E7]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
