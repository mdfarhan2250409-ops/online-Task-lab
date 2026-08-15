import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Download,
  Send,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  HardDrive,
  Cpu,
  CheckCircle2,
  Sparkles,
  Bot,
  Sliders,
  Layers,
  FileCode
} from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const {
    activeResourceModal,
    setActiveResourceModal,
    setTelegramDownloadModalResource,
    recordTelegramClick,
    resources,
    categories,
    showToast
  } = useApp();

  const { requireAuth } = useAuth();

  const [copied, setCopied] = useState(false);
  const [selectedGalleryImg, setSelectedGalleryImg] = useState<string | null>(null);

  const resource = activeResourceModal;

  const handleCopyPrompt = () => {
    if (!resource) return;
    if (!requireAuth(undefined, '🔒 Account Required: Please log in or create an account to copy AI Prompts!')) {
      return;
    }
    if (resource.promptText) {
      navigator.clipboard.writeText(resource.promptText);
      setCopied(true);
      showToast('AI Prompt copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadClick = () => {
    if (!resource) return;
    if (!requireAuth(() => setTelegramDownloadModalResource(resource), '🔒 Account Required: Please sign in or create an account to access downloads!')) {
      return;
    }
    setTelegramDownloadModalResource(resource);
  };

  const handleTelegramChannelClick = () => {
    if (!resource) return;
    if (!requireAuth(() => {
      recordTelegramClick(resource.id);
      window.open(resource.telegramUrl || resource.downloadUrl, '_blank');
    }, '🔒 Account Required: Please sign in or create an account to access Telegram drops!')) {
      return;
    }
    recordTelegramClick(resource.id);
    window.open(resource.telegramUrl || resource.downloadUrl, '_blank');
  };

  // Find related resources in same category
  const related = resource
    ? resources
        .filter(r => r.category === resource.category && r.id !== resource.id)
        .slice(0, 3)
    : [];

  return (
    <AnimatePresence>
      {resource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setActiveResourceModal(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl bg-[#0B1D51]/95 border border-[#5DE2E7]/30 glass-panel rounded-3xl text-white overflow-hidden shadow-[0_0_60px_rgba(11,29,81,0.9)] max-h-[90vh] flex flex-col z-10 my-auto"
        >
          {/* Header Bar */}
          <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-slate-950/40 shrink-0">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-[#5DE2E7]/20 text-[#5DE2E7] border border-[#5DE2E7]/30 uppercase tracking-widest">
                {categories.find(c => c.id === resource.category)?.name || resource.category.replace('-', ' ')}
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
                ID: {resource.id}
              </span>
            </div>

            <button
              onClick={() => setActiveResourceModal(null)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body Content */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
            
            {/* Main Visual Media Section */}
            <div>
              {/* Category-Specific Visual: Before/After Slider for LR Presets */}
              {resource.category === 'lr-presets' && resource.beforeImage && resource.afterImage ? (
                <div className="mb-4">
                  <h4 className="text-xs font-bold uppercase text-[#5DE2E7] tracking-wider mb-2 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4" />
                    Interactive Preset Comparison (Drag Slider)
                  </h4>
                  <BeforeAfterSlider
                    beforeImage={resource.beforeImage}
                    afterImage={resource.afterImage}
                    className="h-[280px] sm:h-[380px] w-full"
                  />
                </div>
              ) : (
                /* Regular Thumbnail or Gallery Banner */
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-white/10 mb-4 shadow-xl">
                  <img
                    src={selectedGalleryImg || resource.thumbnail}
                    alt={resource.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-slate-950/80 text-[#5DE2E7] text-xs font-bold border border-[#5DE2E7]/30 backdrop-blur-md flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4" />
                    <span>{resource.fileSize}</span>
                  </div>
                </div>
              )}

              {/* Gallery Image Thumbnails if available */}
              {resource.screenshots && resource.screenshots.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  <img
                    src={resource.thumbnail}
                    alt="Thumbnail"
                    onClick={() => setSelectedGalleryImg(resource.thumbnail)}
                    className={`w-20 h-14 rounded-xl object-cover cursor-pointer border-2 transition ${
                      selectedGalleryImg === resource.thumbnail || !selectedGalleryImg
                        ? 'border-[#5DE2E7] shadow-[0_0_10px_#5DE2E7]'
                        : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  />
                  {resource.screenshots.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Screenshot ${idx + 1}`}
                      onClick={() => setSelectedGalleryImg(img)}
                      className={`w-20 h-14 rounded-xl object-cover cursor-pointer border-2 transition ${
                        selectedGalleryImg === img
                          ? 'border-[#5DE2E7] shadow-[0_0_10px_#5DE2E7]'
                          : 'border-white/10 opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Title & Quick Metadata */}
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
                {resource.title}
              </h2>
              
              <div className="flex flex-wrap gap-2 text-xs text-slate-300 mb-4 font-medium">
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10">
                  Version: <strong className="text-white">{resource.version}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10">
                  Size: <strong className="text-white">{resource.fileSize}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10">
                  Downloads: <strong className="text-white">{(resource.downloadsCount ?? 0).toLocaleString()}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Clean
                </span>
              </div>

              <p className="text-sm text-slate-200 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10">
                {resource.fullDescription || resource.shortDescription}
              </p>
            </div>

            {/* AI Prompts Special Section */}
            {resource.category === 'ai-prompts' && (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-purple-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Master AI Prompt ({resource.aiModel || 'Midjourney V6'})
                    </span>
                  </div>
                  <button
                    onClick={handleCopyPrompt}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                      copied
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied Prompt' : 'Copy Prompt'}</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 font-mono text-xs text-purple-200 border border-purple-500/20 leading-relaxed select-all">
                  {resource.promptText}
                </div>

                {resource.negativePrompt && (
                  <div className="text-xs text-slate-400">
                    <strong className="text-red-400">Negative Prompt:</strong> {resource.negativePrompt}
                  </div>
                )}
              </div>
            )}

            {/* Apps APK Specs */}
            {resource.category === 'apps' && (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-2 text-xs">
                <h4 className="font-extrabold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" /> App Specifications
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                  <div><strong>Package:</strong> {resource.packageName || 'Com.mod.apk'}</div>
                  <div><strong>Requirements:</strong> {resource.requirements || 'Android 6.0+'}</div>
                  <div className="sm:col-span-2"><strong>Mod Info:</strong> {resource.modInfo || 'Premium Unlocked / No Ads / Pro Features'}</div>
                </div>
              </div>
            )}

            {/* Lightroom Preset Specs */}
            {resource.category === 'lr-presets' && (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-2 text-xs">
                <h4 className="font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4" /> Preset Specifications & Compatibility
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                  <div><strong>Format:</strong> {resource.presetFormat || '.DNG / .XMP'}</div>
                  <div><strong>Requirements:</strong> {resource.requirements || 'Lightroom CC / Mobile & Desktop'}</div>
                  <div className="sm:col-span-2"><strong>Compatibility:</strong> {resource.modInfo || 'iOS, Android, Windows & Mac (One-Click Apply)'}</div>
                </div>
              </div>
            )}

            {/* Live Preview Demo Section (Landing Pages, LR Presets & Any Item with demoUrl) */}
            {(Boolean(resource.demoUrl) || resource.category === 'landing-pages' || resource.category === 'lr-presets') && (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/30 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Live Preview Demo</h4>
                  <p className="text-xs text-slate-400">
                    {resource.category === 'lr-presets'
                      ? 'Test preset color grading & effects in real time'
                      : resource.category === 'landing-pages'
                      ? 'Test template layout & animations in real time'
                      : 'Test and preview resource layout & features in real time'}
                  </p>
                </div>
                <a
                  href={resource.demoUrl || resource.telegramUrl || 'https://t.me/OnlineTaskLab'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shrink-0 transition hover:scale-105"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Launch Demo</span>
                </a>
              </div>
            )}

            {/* Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {resource.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 text-[11px] font-medium border border-white/10"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Related Resources */}
            {related.length > 0 && (
              <div className="border-t border-white/10 pt-4">
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-3">
                  More in {resource.category.replace('-', ' ')}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {related.map(rel => (
                    <div
                      key={rel.id}
                      onClick={() => setActiveResourceModal(rel)}
                      className="p-2.5 rounded-xl bg-slate-900/60 border border-white/10 hover:border-[#5DE2E7]/40 cursor-pointer transition flex items-center gap-3"
                    >
                      <img src={rel.thumbnail} alt={rel.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-white truncate">{rel.title}</div>
                        <div className="text-[10px] text-slate-400">{rel.fileSize}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Sticky Modal Bottom Action Bar */}
          <div className="p-4 sm:p-6 border-t border-white/10 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-slate-400 font-medium text-center sm:text-left">
              Direct Telegram Download Link Verified by OTL
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                onClick={handleTelegramChannelClick}
                className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-[#5DE2E7]/30 text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <Send className="w-4 h-4 text-[#5DE2E7] fill-current" />
                <span>Telegram Post</span>
              </button>

              <button
                onClick={handleDownloadClick}
                className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-gradient-to-r from-[#133E87] via-cyan-500 to-[#5DE2E7] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(93,226,231,0.5)] hover:scale-105 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Get Download Link</span>
              </button>
            </div>
          </div>

        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
