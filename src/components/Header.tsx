import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Search, Menu, Mail, User, ShieldCheck } from 'lucide-react';
import { ResourceCategory } from '../types';
import { OtlLogo } from './OtlLogo';
import { BrandIcon } from './BrandIcons';
import { CategoryIcon } from './CategoryIcon';

export const Header: React.FC = () => {
  const {
    siteSettings,
    categories,
    selectedCategory,
    setSelectedCategory,
    setIsSearchModalOpen,
    setIsContactModalOpen,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen
  } = useApp();

  const {
    currentUser,
    isAuthenticated,
    setIsAuthModalOpen,
    setIsProfileModalOpen
  } = useAuth();

  const handleCategoryClick = (cat: ResourceCategory | 'all') => {
    setSelectedCategory(cat);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAccountClick = () => {
    if (isAuthenticated && currentUser) {
      setIsProfileModalOpen(true);
    } else {
      setIsAuthModalOpen(true, 'login');
    }
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
          <Link
            to="/"
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
          </Link>
        </div>

        {/* Center: Navigation Menu (Desktop) */}
        <nav className="hidden lg:flex items-center space-x-1 bg-slate-900/40 p-1.5 rounded-2xl border border-white/10 overflow-x-auto max-w-[55vw]">
          <Link
            to="/"
            onClick={() => handleCategoryClick('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-[#133E87] to-cyan-500/80 text-white shadow-[0_0_12px_rgba(93,226,231,0.4)]'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Home
          </Link>

          {categories.map(cat => {
            const isActive = selectedCategory === cat.id;
            return (
              <Link
                key={cat.id}
                to={`/category/${cat.id}`}
                onClick={() => handleCategoryClick(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-[#133E87] to-cyan-500/80 text-white shadow-[0_0_12px_rgba(93,226,231,0.4)]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <CategoryIcon name={cat.icon || cat.id} className="w-3.5 h-3.5 text-[#5DE2E7]" />
                <span>{cat.name}</span>
              </Link>
            );
          })}

          <Link
            to="/contact"
            onClick={() => setIsContactModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <Mail className="w-3.5 h-3.5 text-[#5DE2E7]" />
            Contact
          </Link>
        </nav>

        {/* Right: Actions (Search, Telegram, My Account) */}
        <div className="flex items-center space-x-2">
          {/* Search Button */}
          <Link
            to="/search"
            onClick={() => setIsSearchModalOpen(true)}
            className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 transition-all flex items-center gap-2 group"
            title="Search Resources"
          >
            <Search className="w-4 h-4 text-[#5DE2E7] group-hover:scale-110 transition-transform" />
            <span className="text-xs text-slate-400 hidden md:inline-block pr-1 font-medium">Search...</span>
          </Link>

          {/* Telegram Channel Button */}
          <a
            href={siteSettings.telegramChannel}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_18px_rgba(93,226,231,0.3)] transition-all hover:scale-105"
          >
            <BrandIcon name="telegram" className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline-block">Telegram</span>
          </a>

          {/* My Account Button (Identified from User Prompt/Image) */}
          <button
            onClick={handleAccountClick}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
              isAuthenticated && currentUser
                ? 'bg-[#133E87]/80 hover:bg-[#133E87] text-white border border-[#5DE2E7]/40 shadow-[0_0_15px_rgba(93,226,231,0.3)]'
                : 'bg-gradient-to-r from-[#133E87] to-cyan-700 hover:from-cyan-600 hover:to-blue-600 text-white border border-[#5DE2E7]/40 shadow-[0_0_15px_rgba(93,226,231,0.2)]'
            }`}
            title={isAuthenticated ? 'Open Account Center' : 'Sign In or Register'}
          >
            {isAuthenticated && currentUser ? (
              <>
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.firstName}
                    className="w-5 h-5 rounded-full object-cover border border-[#5DE2E7]"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center text-[10px] font-black">
                    {currentUser.firstName?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <span className="hidden sm:inline-block max-w-[90px] truncate">
                  {currentUser.firstName || 'Account'}
                </span>
                {currentUser.role === 'admin' && (
                  <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-purple-500/30 text-purple-300 border border-purple-400/40 hidden md:inline-block">
                    Admin
                  </span>
                )}
              </>
            ) : (
              <>
                <div className="p-0.5 rounded-full bg-[#5DE2E7]/20 text-[#5DE2E7]">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span>My Account</span>
              </>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};

