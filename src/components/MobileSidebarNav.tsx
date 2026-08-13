import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { OtlLogo } from './OtlLogo';
import { BrandIcon } from './BrandIcons';
import {
  X,
  Home,
  Smartphone,
  Layout,
  Bot,
  Sliders,
  Monitor,
  Sparkles,
  Flame,
  Mail,
  Zap,
  Shield,
  ExternalLink
} from 'lucide-react';
import { ResourceCategory } from '../types';

export const MobileSidebarNav: React.FC = () => {
  const {
    siteSettings,
    mobileNavSettings,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    selectedCategory,
    setSelectedCategory,
    setIsContactModalOpen,
    setIsAdminOpen,
    activeTag,
    setActiveTag
  } = useApp();

  if (!mobileNavSettings.enabled) return null;

  const handleNavClick = (categoryFilter?: ResourceCategory | 'all' | 'featured' | 'trending', link?: string) => {
    setIsMobileSidebarOpen(false);

    if (link === '#contact') {
      setIsContactModalOpen(true);
      return;
    }

    if (link && link.startsWith('http')) {
      window.open(link, '_blank');
      return;
    }

    if (categoryFilter === 'featured') {
      setSelectedCategory('all');
      setActiveTag('featured');
    } else if (categoryFilter === 'trending') {
      setSelectedCategory('all');
      setActiveTag('trending');
    } else if (categoryFilter) {
      setSelectedCategory(categoryFilter);
      setActiveTag(null);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isMobileSidebarOpen && (
        <>
          {/* Dark Glass Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md lg:hidden"
          />

          {/* Fixed YouTube-style Left Sidebar */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 left-0 bottom-0 z-50 w-[280px] bg-[#0B1D51]/95 border-r border-[#5DE2E7]/25 glass-panel backdrop-blur-2xl text-white flex flex-col justify-between shadow-[0_0_50px_rgba(11,29,81,0.9)] lg:hidden overflow-y-auto"
          >
            <div>
              {/* Header inside Sidebar */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/40">
                <div className="flex items-center space-x-2.5">
                  <OtlLogo size="sm" animate={true} />
                  <div>
                    <span className="font-extrabold text-base tracking-wide text-white block leading-tight">
                      {siteSettings.logoText || 'OTL'}
                    </span>
                    <span className="text-[10px] text-[#5DE2E7] tracking-wider uppercase font-semibold">
                      Online Task Lab
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items List */}
              <div className="p-3 space-y-1">
                <div className="px-3 py-1 text-[10px] uppercase tracking-widest text-[#5DE2E7]/70 font-bold">
                  Main Navigation
                </div>

                <button
                  onClick={() => handleNavClick('all')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedCategory === 'all' && !activeTag
                      ? 'bg-gradient-to-r from-[#133E87] to-cyan-500/80 text-white shadow-[0_0_15px_rgba(93,226,231,0.4)] border border-[#5DE2E7]/40'
                      : 'text-slate-200 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Home className="w-4 h-4 text-[#5DE2E7]" />
                    <span>Home</span>
                  </div>
                </button>

                <button
                  onClick={() => handleNavClick('apps')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedCategory === 'apps'
                      ? 'bg-gradient-to-r from-[#133E87] to-cyan-500/80 text-white shadow-[0_0_15px_rgba(93,226,231,0.4)] border border-[#5DE2E7]/40'
                      : 'text-slate-200 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-4 h-4 text-[#5DE2E7]" />
                    <span>Mobile Apps</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    Hot
                  </span>
                </button>

                <button
                  onClick={() => handleNavClick('landing-pages')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedCategory === 'landing-pages'
                      ? 'bg-gradient-to-r from-[#133E87] to-cyan-500/80 text-white shadow-[0_0_15px_rgba(93,226,231,0.4)] border border-[#5DE2E7]/40'
                      : 'text-slate-200 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Layout className="w-4 h-4 text-[#5DE2E7]" />
                    <span>Landing Pages</span>
                  </div>
                </button>

                <button
                  onClick={() => handleNavClick('ai-prompts')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedCategory === 'ai-prompts'
                      ? 'bg-gradient-to-r from-[#133E87] to-cyan-500/80 text-white shadow-[0_0_15px_rgba(93,226,231,0.4)] border border-[#5DE2E7]/40'
                      : 'text-slate-200 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Bot className="w-4 h-4 text-[#5DE2E7]" />
                    <span>AI Prompts</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#5DE2E7]/20 text-[#5DE2E7] font-bold border border-[#5DE2E7]/30">
                    New
                  </span>
                </button>

                <button
                  onClick={() => handleNavClick('lr-presets')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedCategory === 'lr-presets'
                      ? 'bg-gradient-to-r from-[#133E87] to-cyan-500/80 text-white shadow-[0_0_15px_rgba(93,226,231,0.4)] border border-[#5DE2E7]/40'
                      : 'text-slate-200 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sliders className="w-4 h-4 text-[#5DE2E7]" />
                    <span>Lightroom Presets</span>
                  </div>
                </button>

                <button
                  onClick={() => handleNavClick('pc-software')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedCategory === 'pc-software'
                      ? 'bg-gradient-to-r from-[#133E87] to-cyan-500/80 text-white shadow-[0_0_15px_rgba(93,226,231,0.4)] border border-[#5DE2E7]/40'
                      : 'text-slate-200 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Monitor className="w-4 h-4 text-[#5DE2E7]" />
                    <span>PC Software</span>
                  </div>
                </button>

                <div className="my-3 border-t border-white/10" />

                <div className="px-3 py-1 text-[10px] uppercase tracking-widest text-[#5DE2E7]/70 font-bold">
                  Highlights
                </div>

                <button
                  onClick={() => handleNavClick('featured')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTag === 'featured'
                      ? 'bg-gradient-to-r from-[#133E87] to-cyan-500/80 text-white shadow-[0_0_15px_rgba(93,226,231,0.4)]'
                      : 'text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Featured Items</span>
                  </div>
                </button>

                <button
                  onClick={() => handleNavClick('trending')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTag === 'trending'
                      ? 'bg-gradient-to-r from-[#133E87] to-cyan-500/80 text-white shadow-[0_0_15px_rgba(93,226,231,0.4)]'
                      : 'text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Flame className="w-4 h-4 text-red-400" />
                    <span>Trending Now</span>
                  </div>
                </button>

                <button
                  onClick={() => handleNavClick(undefined, '#contact')}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/5 transition-all"
                >
                  <Mail className="w-4 h-4 text-[#5DE2E7]" />
                  <span>Contact Support</span>
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-white/10 bg-slate-950/60 space-y-2">
              <a
                href={siteSettings.telegramChannel}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(93,226,231,0.4)]"
              >
                <BrandIcon name="telegram" className="w-4 h-4 text-white" />
                <span>Join Official Telegram</span>
              </a>

              <button
                onClick={() => {
                  setIsMobileSidebarOpen(false);
                  setIsAdminOpen(true);
                }}
                className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-[#5DE2E7]" />
                <span>Admin Panel</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
