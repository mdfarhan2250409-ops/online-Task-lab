import React from 'react';
import { useApp } from '../context/AppContext';
import { Search, Send, Menu, Shield, Zap, Sliders, Smartphone, Layout, Bot, Monitor, Mail } from 'lucide-react';
import { ResourceCategory } from '../types';
import { OtlLogo } from './OtlLogo';
import { BrandIcon } from './BrandIcons';

export const Header: React.FC = () => {
  const {
    siteSettings,
    selectedCategory,
    setSelectedCategory,
    setIsSearchModalOpen,
    setIsContactModalOpen,
    setIsAdminOpen,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen
  } = useApp();

  const handleCategoryClick = (cat: ResourceCategory | 'all') => {
    setSelectedCategory(cat);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left: Mobile Menu Toggle + Brand Logo */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition"
            aria-label="Toggle Mobile Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo */}
          <div
            onClick={() => handleCategoryClick('all')}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <OtlLogo size="sm" animate={true} />
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-[#5DE2E7] transition-colors">
                  {siteSettings.logoText || 'OTL'}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#5DE2E7]/20 text-[#5DE2E7] border border-[#5DE2E7]/30 uppercase tracking-widest">
                  Hub
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block -mt-1 tracking-wider hidden sm:block">
                Online Task Lab
              </span>
            </div>
          </div>
        </div>

        {/* Center: Navigation Menu (Desktop) */}
        <nav className="hidden lg:flex items-center space-x-1 bg-slate-900/40 p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => handleCategoryClick('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-[#133E87] to-cyan-500/80 text-white shadow-[0_0_12px_rgba(93,226,231,0.4)]'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleCategoryClick('apps')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedCategory === 'apps'
                ? 'bg-gradient-to-r from-[#133E87] to-cyan-500/80 text-white shadow-[0_0_12px_rgba(93,226,231,0.4)]'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-[#5DE2E7]" />
            Apps
          </button>
          <button
            onClick={() => handleCategoryClick('landing-pages')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedCategory === 'landing-pages'
                ? 'bg-gradient-to-r from-[#133E87] to-cyan-500/80 text-white shadow-[0_0_12px_rgba(93,226,231,0.4)]'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layout className="w-3.5 h-3.5 text-[#5DE2E7]" />
            Landing Pages
          </button>
          <button
            onClick={() => handleCategoryClick('ai-prompts')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedCategory === 'ai-prompts'
                ? 'bg-gradient-to-r from-[#133E87] to-cyan-500/80 text-white shadow-[0_0_12px_rgba(93,226,231,0.4)]'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-[#5DE2E7]" />
            AI Prompts
          </button>
          <button
            onClick={() => handleCategoryClick('lr-presets')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedCategory === 'lr-presets'
                ? 'bg-gradient-to-r from-[#133E87] to-cyan-500/80 text-white shadow-[0_0_12px_rgba(93,226,231,0.4)]'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-[#5DE2E7]" />
            LR Presets
          </button>
          <button
            onClick={() => handleCategoryClick('pc-software')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedCategory === 'pc-software'
                ? 'bg-gradient-to-r from-[#133E87] to-cyan-500/80 text-white shadow-[0_0_12px_rgba(93,226,231,0.4)]'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Monitor className="w-3.5 h-3.5 text-[#5DE2E7]" />
            PC Software
          </button>
          <button
            onClick={() => setIsContactModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5 text-[#5DE2E7]" />
            Contact
          </button>
        </nav>

        {/* Right: Actions (Search, Admin, Telegram) */}
        <div className="flex items-center space-x-2.5">
          {/* Search Button */}
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 transition-all flex items-center gap-2 group"
            title="Search Resources"
          >
            <Search className="w-4 h-4 text-[#5DE2E7] group-hover:scale-110 transition-transform" />
            <span className="text-xs text-slate-400 hidden sm:inline-block pr-1 font-medium">Search...</span>
          </button>

          {/* Admin Control Panel Entrance */}
          <button
            onClick={() => setIsAdminOpen(true)}
            className="px-3 py-2 rounded-xl bg-[#133E87]/40 hover:bg-[#133E87]/70 text-slate-200 hover:text-white border border-[#5DE2E7]/30 transition-all flex items-center gap-1.5 text-xs font-semibold shadow-[0_0_10px_rgba(19,62,135,0.3)]"
            title="Admin Management Panel"
          >
            <Shield className="w-3.5 h-3.5 text-[#5DE2E7]" />
            <span className="hidden md:inline-block">Admin</span>
          </button>

          {/* Telegram Channel Button */}
          <a
            href={siteSettings.telegramChannel}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_18px_rgba(93,226,231,0.4)] transition-all hover:scale-105"
          >
            <BrandIcon name="telegram" className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline-block">Telegram</span>
          </a>
        </div>

      </div>
    </header>
  );
};
