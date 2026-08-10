import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Save } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { siteSettings, updateSiteSettings } = useApp();

  const [websiteTitle, setWebsiteTitle] = useState(siteSettings.websiteTitle);
  const [tagline, setTagline] = useState(siteSettings.tagline);
  const [logoText, setLogoText] = useState(siteSettings.logoText);
  const [footerText, setFooterText] = useState(siteSettings.footerText);
  const [contactEmail, setContactEmail] = useState(siteSettings.contactEmail);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings({
      websiteTitle,
      tagline,
      logoText,
      footerText,
      contactEmail
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-4 text-xs">
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-3">
        <h3 className="text-sm font-extrabold text-white mb-2">Website Identity Settings</h3>

        <div>
          <label className="block text-slate-300 font-bold mb-1">Website Title</label>
          <input
            type="text"
            value={websiteTitle}
            onChange={e => setWebsiteTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-[#5DE2E7]"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-bold mb-1">Tagline</label>
          <input
            type="text"
            value={tagline}
            onChange={e => setTagline(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-[#5DE2E7]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Logo Abbreviation (Text)</label>
            <input
              type="text"
              value={logoText}
              onChange={e => setLogoText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-[#5DE2E7]"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Contact Email</label>
            <input
              type="email"
              value={contactEmail}
              onChange={e => setContactEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-[#5DE2E7]"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-300 font-bold mb-1">Footer Copyright Text</label>
          <input
            type="text"
            value={footerText}
            onChange={e => setFooterText(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-[#5DE2E7]"
          />
        </div>
      </div>

      <button
        type="submit"
        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold flex items-center gap-2 shadow-lg cursor-pointer"
      >
        <Save className="w-4 h-4" /> Save Website Settings
      </button>
    </form>
  );
};
