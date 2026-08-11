import React from 'react';
import { Resource } from '../types';
import { useApp } from '../context/AppContext';
import {
  Download,
  Send,
  Copy,
  ExternalLink,
  Eye,
  Sliders,
  Check,
  Smartphone,
  Layout,
  Bot,
  Monitor,
  HardDrive
} from 'lucide-react';

export const ProductCard: React.FC<{ resource: Resource }> = ({ resource }) => {
  const {
    setActiveResourceModal,
    setTelegramDownloadModalResource,
    recordTelegramClick,
    showToast
  } = useApp();

  const [copied, setCopied] = React.useState(false);

  const getCategoryBadge = () => {
    switch (resource.category) {
      case 'apps':
        return { label: 'APP', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'landing-pages':
        return { label: 'LANDING PAGE', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
      case 'ai-prompts':
        return { label: 'AI PROMPT', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'lr-presets':
        return { label: 'PRESET', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'pc-software':
        return { label: 'PC SOFTWARE', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
      default:
        return { label: 'RESOURCE', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
    }
  };

  const badge = getCategoryBadge();

  const handleCopyPrompt = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (resource.promptText) {
      navigator.clipboard.writeText(resource.promptText);
      setCopied(true);
      showToast('AI Prompt copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTelegramDownloadModalResource(resource);
  };

  const handleTelegramClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    recordTelegramClick(resource.id);
    window.open(resource.telegramUrl || resource.downloadUrl, '_blank');
  };

  return (
    <div
      onClick={() => setActiveResourceModal(resource)}
      className="group glass-card rounded-2xl border border-white/10 hover:border-[#5DE2E7]/40 p-3 sm:p-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_0_30px_rgba(93,226,231,0.25)] cursor-pointer flex flex-col justify-between relative overflow-hidden"
    >
      {/* Top Media Thumbnail */}
      <div>
        <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-3.5 bg-slate-900 border border-white/10">
          <img
            src={resource.thumbnail}
            alt={resource.title}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
            loading="lazy"
          />

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border backdrop-blur-md uppercase tracking-wider ${badge.color}`}>
              {badge.label}
            </span>
            {resource.isFeatured && (
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/80 text-slate-950 shadow-md">
                ⭐ FEATURED
              </span>
            )}
          </div>

          <div className="absolute top-2.5 right-2.5">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-950/80 text-slate-200 border border-white/20 backdrop-blur-md flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-[#5DE2E7]" />
              {resource.fileSize}
            </span>
          </div>

          {/* Hover Quick Preview Eye Overlay */}
          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
            <span className="px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-bold border border-[#5DE2E7]/50 flex items-center gap-1.5 shadow-lg">
              <Eye className="w-3.5 h-3.5 text-[#5DE2E7]" />
              View Details
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#5DE2E7] transition-colors line-clamp-2 leading-snug mb-1.5">
          {resource.title}
        </h3>

        {/* Short Description */}
        <p className="text-xs text-slate-300 line-clamp-2 mb-3 leading-relaxed">
          {resource.shortDescription}
        </p>

        {/* Category Specific Indicators */}
        {resource.category === 'ai-prompts' && resource.promptText && (
          <div className="mb-3 p-2 rounded-xl bg-slate-950/60 border border-purple-500/20 text-[11px] text-purple-200 font-mono line-clamp-1 relative">
            <span className="opacity-80">"</span>
            {resource.promptText}
            <span className="opacity-80">"</span>
          </div>
        )}

        {resource.category === 'lr-presets' && (
          <div className="mb-3 flex items-center gap-1.5 text-[11px] text-amber-300 font-medium">
            <Sliders className="w-3.5 h-3.5" />
            <span>Format: {resource.presetFormat || '.DNG + .XMP'}</span>
          </div>
        )}

        {resource.category === 'apps' && resource.apkVersion && (
          <div className="mb-3 text-[11px] text-emerald-300 font-medium flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Ver: {resource.apkVersion}</span>
          </div>
        )}
      </div>

      {/* Footer Meta & Action Buttons */}
      <div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-white/10 pt-2.5 mb-3 font-medium">
          <span>Ver: {resource.version}</span>
          <span>{(resource.downloadsCount ?? 0).toLocaleString()} Downloads</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          {/* Main Download Button */}
          <button
            onClick={handleDownloadClick}
            className="py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl bg-gradient-to-r from-[#133E87] to-cyan-500 hover:from-[#133E87] hover:to-cyan-400 text-white font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 sm:gap-1.5 shadow-[0_0_15px_rgba(93,226,231,0.3)] transition-all"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Download</span>
          </button>

          {/* Quick Category Action OR Telegram Button */}
          {resource.category === 'ai-prompts' ? (
            <button
              onClick={handleCopyPrompt}
              className={`py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl border text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/15'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0" /> : <Copy className="w-3.5 h-3.5 text-[#5DE2E7] shrink-0" />}
              <span className="truncate">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          ) : (
            <button
              onClick={handleTelegramClick}
              className="py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-[#5DE2E7]/30 text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5 text-[#5DE2E7] fill-current shrink-0" />
              <span className="truncate">Telegram</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
