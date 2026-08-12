import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Zap, Shield, ExternalLink, Mail } from 'lucide-react';
import { ResourceCategory } from '../types';
import { OtlLogo } from './OtlLogo';
import { BrandIcon } from './BrandIcons';

export const Footer: React.FC = () => {
  const { siteSettings, setSelectedCategory, setIsContactModalOpen, setIsAdminOpen } = useApp();

  const handleCategoryClick = (cat: ResourceCategory | 'all') => {
    setSelectedCategory(cat);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-20 border-t border-white/10 bg-[#060B1E]/90 backdrop-blur-2xl text-slate-300 py-12 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        
        {/* Col 1: Brand Info */}
        <div className="space-y-4 md:col-span-1">
          <Link to="/" onClick={() => handleCategoryClick('all')} className="flex items-center space-x-2.5">
            <OtlLogo size="sm" animate={true} />
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                {siteSettings.logoText || 'OTL'}
              </span>
              <span className="text-[10px] text-[#5DE2E7] uppercase font-bold tracking-widest block -mt-1">
                Online Task Lab
              </span>
            </div>
          </Link>

          <p className="text-xs text-slate-400 leading-relaxed">
            {siteSettings.tagline || 'Apps • AI Prompts • Landing Pages • Lightroom Presets • PC Software'}
          </p>

          {siteSettings.contactEmail && (
            <a
              href={`mailto:${siteSettings.contactEmail}`}
              className="flex items-center gap-1.5 text-xs text-cyan-300 hover:text-white transition font-medium"
            >
              <Mail className="w-3.5 h-3.5 text-[#5DE2E7]" />
              <span className="truncate">{siteSettings.contactEmail}</span>
            </a>
          )}

          <a
            href={siteSettings.telegramChannel}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg hover:scale-105 transition"
          >
            <BrandIcon name="telegram" className="w-3.5 h-3.5 text-white" />
            <span>Join Main Telegram Channel</span>
          </a>
        </div>

        {/* Col 2: Quick Links */}
        <div>
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
            Quick Links
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/" onClick={() => handleCategoryClick('all')} className="hover:text-[#5DE2E7] transition">
                Homepage
              </Link>
            </li>
            <li>
              <Link to="/contact" onClick={() => setIsContactModalOpen(true)} className="hover:text-[#5DE2E7] transition">
                Contact & Support
              </Link>
            </li>
            <li>
              <Link to="/admin" onClick={() => setIsAdminOpen(true)} className="hover:text-[#5DE2E7] transition flex items-center gap-1">
                <Shield className="w-3 h-3 text-[#5DE2E7]" /> Admin Panel
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Resource Categories */}
        <div>
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
            Categories
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/category/apps" onClick={() => handleCategoryClick('apps')} className="hover:text-[#5DE2E7] transition">
                Mobile Apps (Mod APKs)
              </Link>
            </li>
            <li>
              <Link to="/category/landing-pages" onClick={() => handleCategoryClick('landing-pages')} className="hover:text-[#5DE2E7] transition">
                Landing Page Templates
              </Link>
            </li>
            <li>
              <Link to="/category/ai-prompts" onClick={() => handleCategoryClick('ai-prompts')} className="hover:text-[#5DE2E7] transition">
                AI Prompts (Midjourney/GPT)
              </Link>
            </li>
            <li>
              <Link to="/category/lr-presets" onClick={() => handleCategoryClick('lr-presets')} className="hover:text-[#5DE2E7] transition">
                Lightroom Presets (DNG/XMP)
              </Link>
            </li>
            <li>
              <Link to="/category/pc-software" onClick={() => handleCategoryClick('pc-software')} className="hover:text-[#5DE2E7] transition">
                PC Software (Pre-Activated)
              </Link>
            </li>
          </ul>
        </div>


        {/* Col 4: Telegram & Social */}
        <div>
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
            Official Telegram Network
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <a
                href={siteSettings.telegramChannel}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200 transition font-semibold"
              >
                <BrandIcon name="telegram" className="w-3.5 h-3.5 text-cyan-300" />
                <span>Telegram Official Channel</span>
              </a>
            </li>
            <li>
              <a
                href={siteSettings.telegramGroup}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-slate-300 hover:text-white transition"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#5DE2E7]" />
                <span>Telegram Community Group</span>
              </a>
            </li>
            <li>
              <a
                href={siteSettings.adminTelegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-slate-300 hover:text-white transition"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#5DE2E7]" />
                <span>Admin Direct Contact</span>
              </a>
            </li>
            {siteSettings.contactEmail && (
              <li>
                <a
                  href={`mailto:${siteSettings.contactEmail}`}
                  className="flex items-center gap-1.5 text-slate-300 hover:text-[#5DE2E7] transition"
                >
                  <Mail className="w-3.5 h-3.5 text-[#5DE2E7]" />
                  <span>Email: {siteSettings.contactEmail}</span>
                </a>
              </li>
            )}
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-center sm:justify-between text-xs text-slate-400 gap-4 text-center">
        <div>{siteSettings.footerText || '© 2026 Online Task Lab (OTL). All rights reserved.'}</div>
      </div>
    </footer>
  );
};
