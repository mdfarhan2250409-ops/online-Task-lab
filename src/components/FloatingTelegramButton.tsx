import React from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { FloatingButton } from '../types';
import { BrandIcon } from './BrandIcons';

export const FloatingTelegramButton: React.FC = () => {
  const { floatingButtonsSettings, siteSettings, recordTelegramClick } = useApp();

  if (!floatingButtonsSettings || !floatingButtonsSettings.enabled) {
    return null;
  }

  // Get active enabled buttons
  let activeButtons = (floatingButtonsSettings.buttons || [])
    .filter(b => b.enabled)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // If no custom buttons exist yet, fallback to single default site channel
  if (activeButtons.length === 0 && siteSettings.telegramChannel) {
    activeButtons = [
      {
        id: 'default-tg',
        title: 'Join Telegram',
        url: siteSettings.telegramChannel,
        icon: 'telegram',
        enabled: true,
        color: 'cyan',
        badgeText: 'Live',
        order: 1
      }
    ];
  }

  if (activeButtons.length === 0) return null;

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'emerald':
        return 'from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-[0_0_20px_rgba(16,185,129,0.6)] hover:shadow-[0_0_35px_rgba(16,185,129,0.9)]';
      case 'amber':
        return 'from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-[0_0_20px_rgba(245,158,11,0.6)] hover:shadow-[0_0_35px_rgba(245,158,11,0.9)]';
      case 'rose':
        return 'from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 shadow-[0_0_20px_rgba(244,63,94,0.6)] hover:shadow-[0_0_35px_rgba(244,63,94,0.9)]';
      case 'indigo':
        return 'from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-[0_0_20px_rgba(99,102,241,0.6)] hover:shadow-[0_0_35px_rgba(99,102,241,0.9)]';
      case 'purple':
        return 'from-purple-500 to-pink-600 hover:from-purple-400 hover:to-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.6)] hover:shadow-[0_0_35px_rgba(168,85,247,0.9)]';
      case 'cyan':
      default:
        return 'from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_20px_rgba(93,226,231,0.6)] hover:shadow-[0_0_35px_rgba(93,226,231,0.9)]';
    }
  };

  const handleButtonClick = (btn: FloatingButton) => {
    recordTelegramClick();
    window.open(btn.url, '_blank');
  };

  const posClass =
    floatingButtonsSettings.position === 'bottom-left'
      ? 'bottom-6 left-6 items-start'
      : 'bottom-6 right-6 items-end';

  // Sort direction based on stackDirection
  const displayButtons =
    floatingButtonsSettings.stackDirection === 'top-to-bottom'
      ? activeButtons
      : [...activeButtons].reverse(); // bottom-to-top means first item at bottom or top depending on column flow

  return (
    <div className={`fixed z-40 flex flex-col gap-3 ${posClass}`}>
      <AnimatePresence>
        {displayButtons.map((btn, index) => (
          <motion.div
            key={btn.id}
            initial={{ scale: 0, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 10 }}
            transition={{ delay: index * 0.08 }}
          >
            <button
              onClick={() => handleButtonClick(btn)}
              className={`group relative flex items-center gap-2 p-3 sm:px-4 sm:py-2.5 rounded-full bg-gradient-to-r ${getColorClasses(
                btn.color || 'cyan'
              )} text-white font-extrabold text-xs transition-all hover:scale-105 cursor-pointer border border-white/20`}
              title={btn.title}
            >
              {/* Ping Badge if present */}
              {btn.badgeText && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-400 border border-slate-950" />
                </span>
              )}

              <BrandIcon name={btn.icon} className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-110 transition-transform" />
              <span className="inline-block tracking-wide">{btn.title}</span>

              {btn.badgeText && (
                <span className="ml-1 px-1.5 py-0.2 bg-slate-950/60 rounded-full text-[9px] text-amber-300 border border-amber-400/40 uppercase tracking-wider font-black">
                  {btn.badgeText}
                </span>
              )}
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
