import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  Mail,
  MessageSquare,
  ChevronDown,
  Youtube,
  Facebook,
  Instagram,
  Twitter,
  Globe,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { TikTokIcon } from './icons/TikTokIcon';
import { SocialButton } from '../types';
import { BrandIcon } from './BrandIcons';

export const ContactModal: React.FC = () => {
  const {
    isContactModalOpen,
    setIsContactModalOpen,
    contactSettings,
    siteSettings,
    addInquiry
  } = useApp();

  const [subject, setSubject] = useState('');
  const [email, setEmail] = useState('');
  const [telegramWhatsapp, setTelegramWhatsapp] = useState('');
  const [message, setMessage] = useState('');
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  if (!isContactModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !subject || !message) return;

    addInquiry({
      email,
      subject,
      telegramWhatsapp,
      message
    });

    setSubject('');
    setEmail('');
    setTelegramWhatsapp('');
    setMessage('');
    setIsContactModalOpen(false);
  };

  const getSocialIcon = (platform: SocialButton['platform']) => {
    switch (platform) {
      case 'youtube':
        return <BrandIcon name="youtube" className="w-4 h-4 text-red-500" />;
      case 'facebook':
        return <BrandIcon name="facebook" className="w-4 h-4 text-blue-500" />;
      case 'tiktok':
        return <TikTokIcon className="w-4 h-4 text-[#FE2C55]" />;
      case 'instagram':
        return <BrandIcon name="instagram" className="w-4 h-4 text-pink-500" />;
      case 'twitter':
        return <Twitter className="w-4 h-4 text-cyan-400" />;
      case 'telegram':
        return <BrandIcon name="telegram" className="w-4 h-4 text-sky-400" />;
      default:
        return <BrandIcon name="globe" className="w-4 h-4 text-[#5DE2E7]" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsContactModalOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl bg-[#0B1D51]/95 border border-[#5DE2E7]/30 glass-panel rounded-3xl text-white overflow-hidden shadow-[0_0_60px_rgba(11,29,81,0.9)] max-h-[90vh] flex flex-col z-10 my-auto"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-slate-950/50 shrink-0">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#5DE2E7]" />
              <h3 className="text-lg font-black text-white">{contactSettings.modalTitle || 'Contact & Support Center'}</h3>
            </div>
            <button
              onClick={() => setIsContactModalOpen(false)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
            
            {/* Telegram Main Option Hero Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-[#133E87]/40 to-blue-600/20 border border-[#5DE2E7]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#5DE2E7] text-slate-950 uppercase tracking-wider mb-1.5 inline-block">
                  {contactSettings.heroBadge || 'Fastest Support'}
                </span>
                <h4 className="text-base font-bold text-white mb-1">
                  {contactSettings.heroTitle || 'Need Assistance or Custom Mod Requests?'}
                </h4>
                <p className="text-xs text-slate-300">
                  {contactSettings.heroSubtitle || 'Get instant response from our admin or group moderators in real-time.'}
                </p>
              </div>

              <a
                href={contactSettings.telegramAdminUrl || 'https://t.me/OnlineTaskLabAdmin'}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(93,226,231,0.5)] shrink-0 hover:scale-105 transition"
              >
                <BrandIcon name="telegram" className="w-4 h-4 text-white" />
                <span>{contactSettings.telegramButtonText || 'Chat Direct with Admin'}</span>
              </a>
            </div>

            {/* Social Media & Channels Links */}
            {contactSettings.socialButtons && contactSettings.socialButtons.filter(s => s.enabled).length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#5DE2E7]" />
                  Official Social Channels & Media
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {contactSettings.socialButtons.filter(s => s.enabled).map(social => (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 hover:border-[#5DE2E7]/60 hover:bg-slate-900/80 transition flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition">
                          {getSocialIcon(social.platform)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white group-hover:text-[#5DE2E7] transition">
                            {social.title}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[170px]">
                            {social.url}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-white transition">
                        {social.badgeText && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-[#5DE2E7]">
                            {social.badgeText}
                          </span>
                        )}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Email Contact Form */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[#5DE2E7]" />
                  {contactSettings.formTitle || 'Send an Email Inquiry'}
                </h4>
                {siteSettings.contactEmail && (
                  <a
                    href={`mailto:${siteSettings.contactEmail}`}
                    className="flex items-center gap-1.5 text-xs text-[#5DE2E7] hover:underline font-bold bg-white/5 hover:bg-white/10 px-3 py-1 rounded-lg border border-[#5DE2E7]/30 transition"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{siteSettings.contactEmail}</span>
                  </a>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder="Subject / Resource Name"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/10 focus:border-[#5DE2E7] text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Your Email Address"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/10 focus:border-[#5DE2E7] text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-1">
                    <input
                      type="text"
                      value={telegramWhatsapp}
                      onChange={e => setTelegramWhatsapp(e.target.value)}
                      placeholder="Telegram Username / WhatsApp Number"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/10 focus:border-[#5DE2E7] text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe your issue or custom resource request..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/10 focus:border-[#5DE2E7] text-xs text-white focus:outline-none"
                />

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#133E87] to-cyan-600 hover:from-cyan-500 hover:to-blue-600 text-white font-bold text-xs shadow-lg transition"
                >
                  Send Inquiry to Admin Panel
                </button>
              </form>
            </div>

            {/* FAQ Accordion */}
            {contactSettings.faqs && contactSettings.faqs.length > 0 && (
              <div className="border-t border-white/10 pt-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  {contactSettings.faqTitle || 'Frequently Asked Questions (FAQ)'}
                </h4>

                <div className="space-y-2">
                  {contactSettings.faqs.map(faq => (
                    <div
                      key={faq.id}
                      className="rounded-xl bg-slate-950/50 border border-white/10 overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                        className="w-full p-3 text-left text-xs font-bold text-slate-200 flex items-center justify-between hover:bg-white/5 transition"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-[#5DE2E7] transition-transform ${
                            openFaq === faq.id ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {openFaq === faq.id && (
                        <div className="p-3 text-xs text-slate-300 border-t border-white/5 bg-slate-900/50 leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

