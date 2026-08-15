import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Tag, Download, Eye, Smartphone, Layout, Bot, Sliders, Monitor } from 'lucide-react';
import { ResourceCategory } from '../types';

export const SearchModal: React.FC = () => {
  const {
    isSearchModalOpen,
    setIsSearchModalOpen,
    resources,
    categories,
    setActiveResourceModal,
    setTelegramDownloadModalResource
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState<ResourceCategory | 'all'>('all');

  const popularTags = ['Mod APK', 'Midjourney', 'ChatGPT', 'Lightroom', 'Preset', 'Photoshop', 'SaaS', 'Pro Unlocked'];

  const filtered = resources.filter(res => {
    const matchesCategory = selectedCatFilter === 'all' || res.category === selectedCatFilter;
    const matchesQuery =
      res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesQuery;
  });

  const handleSelectResource = (res: any) => {
    setIsSearchModalOpen(false);
    setActiveResourceModal(res);
  };

  return (
    <AnimatePresence>
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 pb-10">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSearchModalOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Body */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-2xl bg-[#0B1D51]/95 border border-[#5DE2E7]/40 glass-panel rounded-3xl text-white shadow-[0_0_50px_rgba(93,226,231,0.3)] z-10 overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* Top Search Bar Input */}
          <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-slate-950/60">
            <Search className="w-5 h-5 text-[#5DE2E7] shrink-0" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search Apps, AI Prompts, Presets, Software, Templates..."
              className="w-full bg-transparent border-none text-white text-sm sm:text-base focus:outline-none placeholder-slate-400 font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-white/5"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setIsSearchModalOpen(false)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Pills */}
          <div className="px-4 py-3 border-b border-white/10 bg-slate-900/40 flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-slate-400 text-[11px] font-semibold uppercase pr-1">Filter:</span>
            <button
              onClick={() => setSelectedCatFilter('all')}
              className={`px-3 py-1 rounded-xl font-semibold capitalize whitespace-nowrap transition ${
                selectedCatFilter === 'all'
                  ? 'bg-[#5DE2E7] text-slate-950 shadow-[0_0_10px_#5DE2E7]'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              All Resources
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCatFilter(cat.id)}
                className={`px-3 py-1 rounded-xl font-semibold capitalize whitespace-nowrap transition ${
                  selectedCatFilter === cat.id
                    ? 'bg-[#5DE2E7] text-slate-950 shadow-[0_0_10px_#5DE2E7]'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Quick Popular Tags */}
          {!searchTerm && (
            <div className="px-4 py-3 bg-slate-950/30 border-b border-white/5 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 text-[11px] font-semibold flex items-center gap-1 mr-1">
                <Tag className="w-3 h-3 text-[#5DE2E7]" /> Popular Tags:
              </span>
              {popularTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSearchTerm(tag)}
                  className="px-2.5 py-0.5 rounded-lg bg-white/5 hover:bg-[#5DE2E7]/20 hover:text-[#5DE2E7] text-slate-300 text-[11px] border border-white/10 transition"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* Search Results List */}
          <div className="p-4 overflow-y-auto space-y-2 flex-1">
            <div className="text-xs text-slate-400 font-semibold mb-2 flex items-center justify-between">
              <span>FOUND {filtered.length} RESULTS</span>
              {searchTerm && <span>Key: "{searchTerm}"</span>}
            </div>

            {filtered.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No matching resources found for "{searchTerm}". Try searching for another keyword.
              </div>
            ) : (
              filtered.map(res => (
                <div
                  key={res.id}
                  onClick={() => handleSelectResource(res)}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#5DE2E7]/40 cursor-pointer transition flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={res.thumbnail}
                      alt={res.title}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10 group-hover:scale-105 transition"
                    />
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-white group-hover:text-[#5DE2E7] transition truncate">
                        {res.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {res.shortDescription}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-mono">
                        <span className="text-[#5DE2E7] font-semibold uppercase">{res.category}</span>
                        <span>• {res.fileSize}</span>
                        <span>• {res.version}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setIsSearchModalOpen(false);
                      setTelegramDownloadModalResource(res);
                    }}
                    className="p-2 rounded-xl bg-[#133E87] hover:bg-[#5DE2E7] text-white hover:text-slate-950 transition shrink-0"
                    title="Download via Telegram"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
