import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Mail,
  Send,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Eye,
  MessageCircle,
  Youtube,
  Facebook,
  Instagram,
  Twitter,
  Globe,
  HelpCircle,
  Sparkles,
  Save,
  Check,
  X
} from 'lucide-react';
import { TikTokIcon } from '../icons/TikTokIcon';
import { SocialButton, FAQItem } from '../../types';

export const AdminContactManager: React.FC = () => {
  const {
    inquiries,
    deleteInquiry,
    updateInquiryStatus,
    contactSettings,
    updateContactSettings,
    addSocialButton,
    updateSocialButton,
    deleteSocialButton,
    addFaq,
    updateFaq,
    deleteFaq
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'inquiries' | 'socials' | 'hero' | 'faqs'>('inquiries');

  // Inquiry View state
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);

  // Hero Form State
  const [heroForm, setHeroForm] = useState({
    modalTitle: contactSettings.modalTitle || 'Contact & Support Center',
    heroBadge: contactSettings.heroBadge || '24/7 Fast Telegram Support',
    heroTitle: contactSettings.heroTitle || 'Need Assistance or Custom Mod Requests?',
    heroSubtitle: contactSettings.heroSubtitle || 'Join our official Telegram Admin Desk for instant 1-on-1 support, broken link reports, or custom resource requests.',
    telegramButtonText: contactSettings.telegramButtonText || 'Chat Direct with Admin',
    telegramAdminUrl: contactSettings.telegramAdminUrl || 'https://t.me/OnlineTaskLabAdmin',
    formTitle: contactSettings.formTitle || 'Send an Email Inquiry',
    faqTitle: contactSettings.faqTitle || 'Frequently Asked Questions (FAQ)'
  });

  // Social Button Modal / Form State
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [editingSocialId, setEditingSocialId] = useState<string | null>(null);
  const [socialForm, setSocialForm] = useState<Omit<SocialButton, 'id'>>({
    platform: 'youtube',
    title: '',
    url: '',
    enabled: true,
    badgeText: 'Subscribe'
  });

  // FAQ Modal / Form State
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [faqForm, setFaqForm] = useState<{ question: string; answer: string }>({
    question: '',
    answer: ''
  });

  const unreadCount = inquiries.filter(i => i.status === 'unread').length;

  // Handle Save Hero Settings
  const handleSaveHero = (e: React.FormEvent) => {
    e.preventDefault();
    updateContactSettings(heroForm);
  };

  // Social Button Handlers
  const handleOpenNewSocial = () => {
    setEditingSocialId(null);
    setSocialForm({
      platform: 'youtube',
      title: 'YouTube Channel',
      url: 'https://youtube.com/@onlinetasklab',
      enabled: true,
      badgeText: 'Subscribe'
    });
    setIsSocialModalOpen(true);
  };

  const handleEditSocial = (s: SocialButton) => {
    setEditingSocialId(s.id);
    setSocialForm({
      platform: s.platform,
      title: s.title,
      url: s.url,
      enabled: s.enabled,
      badgeText: s.badgeText || ''
    });
    setIsSocialModalOpen(true);
  };

  const handleSaveSocial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialForm.title || !socialForm.url) return;

    if (editingSocialId) {
      updateSocialButton(editingSocialId, socialForm);
    } else {
      addSocialButton(socialForm);
    }
    setIsSocialModalOpen(false);
  };

  // FAQ Handlers
  const handleOpenNewFaq = () => {
    setEditingFaqId(null);
    setFaqForm({ question: '', answer: '' });
    setIsFaqModalOpen(true);
  };

  const handleEditFaq = (f: FAQItem) => {
    setEditingFaqId(f.id);
    setFaqForm({ question: f.question, answer: f.answer });
    setIsFaqModalOpen(true);
  };

  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqForm.question || !faqForm.answer) return;

    if (editingFaqId) {
      updateFaq(editingFaqId, faqForm);
    } else {
      addFaq(faqForm);
    }
    setIsFaqModalOpen(false);
  };

  const getPlatformIcon = (platform: SocialButton['platform']) => {
    switch (platform) {
      case 'youtube':
        return <Youtube className="w-5 h-5 text-red-500" />;
      case 'facebook':
        return <Facebook className="w-5 h-5 text-blue-500" />;
      case 'tiktok':
        return <TikTokIcon className="w-5 h-5 text-[#FE2C55]" />;
      case 'instagram':
        return <Instagram className="w-5 h-5 text-pink-500" />;
      case 'twitter':
        return <Twitter className="w-5 h-5 text-cyan-400" />;
      case 'telegram':
        return <Send className="w-5 h-5 text-sky-400" />;
      default:
        return <Globe className="w-5 h-5 text-[#5DE2E7]" />;
    }
  };

  return (
    <div className="space-y-6 text-white">
      {/* Top Banner Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0B1D51] via-[#133E87] to-[#0B1D51] border border-[#5DE2E7]/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-6 h-6 text-[#5DE2E7]" />
            <h2 className="text-xl font-black tracking-tight text-white">Contact & Support Center Manager</h2>
          </div>
          <p className="text-xs text-slate-300">
            Control the Contact Modal, view user email inquiries, manage YouTube/Facebook/TikTok social buttons, and customize Telegram support links.
          </p>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-white/10 shrink-0">
          <button
            onClick={() => setActiveSubTab('inquiries')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'inquiries'
                ? 'bg-[#5DE2E7] text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>User Inquiries</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('socials')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'socials'
                ? 'bg-[#5DE2E7] text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Social Buttons ({contactSettings.socialButtons?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('hero')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'hero'
                ? 'bg-[#5DE2E7] text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Support Hero Settings</span>
          </button>

          <button
            onClick={() => setActiveSubTab('faqs')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'faqs'
                ? 'bg-[#5DE2E7] text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>FAQ Manager</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: USER INQUIRIES */}
      {activeSubTab === 'inquiries' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#5DE2E7]" />
              Inquiries Received from Contact Form ({inquiries.length})
            </h3>
          </div>

          {inquiries.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-950/60 border border-white/10 text-slate-400">
              <Mail className="w-10 h-10 mx-auto mb-3 text-slate-600" />
              <p className="text-sm font-bold">No user inquiries yet!</p>
              <p className="text-xs text-slate-500 mt-1">
                When visitors fill out the form on the Contact Modal, their messages will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Inquiries List */}
              <div className="lg:col-span-1 space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {inquiries.map(inq => (
                  <div
                    key={inq.id}
                    onClick={() => {
                      setSelectedInquiryId(inq.id);
                      if (inq.status === 'unread') {
                        updateInquiryStatus(inq.id, 'read');
                      }
                    }}
                    className={`p-4 rounded-2xl border transition cursor-pointer ${
                      selectedInquiryId === inq.id
                        ? 'bg-[#133E87]/80 border-[#5DE2E7] shadow-lg'
                        : inq.status === 'unread'
                        ? 'bg-slate-950/90 border-amber-500/50 hover:border-amber-400'
                        : 'bg-slate-950/50 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-mono text-slate-400">{inq.createdAt}</span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          inq.status === 'unread'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : inq.status === 'replied'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {inq.status.toUpperCase()}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white truncate mb-1">{inq.subject}</h4>
                    <p className="text-[11px] text-cyan-400 truncate mb-0.5">{inq.email}</p>
                    {inq.telegramWhatsapp && (
                      <p className="text-[10px] text-emerald-400 font-medium truncate mb-1">
                        TG/WA: {inq.telegramWhatsapp}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400 line-clamp-2">{inq.message}</p>
                  </div>
                ))}
              </div>

              {/* Selected Inquiry Detail View */}
              <div className="lg:col-span-2">
                {selectedInquiryId ? (
                  (() => {
                    const activeInquiry = inquiries.find(i => i.id === selectedInquiryId);
                    if (!activeInquiry) return null;

                    return (
                      <div className="p-6 rounded-2xl bg-slate-950/80 border border-white/10 space-y-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                          <div>
                            <span className="text-[10px] text-slate-400">Inquiry ID: {activeInquiry.id}</span>
                            <h3 className="text-base font-black text-white mt-0.5">{activeInquiry.subject}</h3>
                          </div>
                          <button
                            onClick={() => deleteInquiry(activeInquiry.id)}
                            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition flex items-center gap-1.5 text-xs font-bold"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">From Email</span>
                            <a
                              href={`mailto:${activeInquiry.email}`}
                              className="text-cyan-400 font-bold hover:underline"
                            >
                              {activeInquiry.email}
                            </a>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Telegram / WhatsApp</span>
                            <span className="text-emerald-400 font-bold">
                              {activeInquiry.telegramWhatsapp || 'N/A'}
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Received On</span>
                            <span className="text-white font-bold">{activeInquiry.createdAt}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold mb-2">Message Content</span>
                          <div className="p-4 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                            {activeInquiry.message}
                          </div>
                        </div>

                        {/* Status Change & Quick Actions */}
                        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-bold">Mark Status:</span>
                            <button
                              onClick={() => updateInquiryStatus(activeInquiry.id, 'unread')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                activeInquiry.status === 'unread'
                                  ? 'bg-amber-500 text-slate-950 font-black'
                                  : 'bg-white/5 hover:bg-white/10 text-slate-400'
                              }`}
                            >
                              Unread
                            </button>
                            <button
                              onClick={() => updateInquiryStatus(activeInquiry.id, 'read')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                activeInquiry.status === 'read'
                                  ? 'bg-cyan-500 text-slate-950 font-black'
                                  : 'bg-white/5 hover:bg-white/10 text-slate-400'
                              }`}
                            >
                              Read
                            </button>
                            <button
                              onClick={() => updateInquiryStatus(activeInquiry.id, 'replied')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                activeInquiry.status === 'replied'
                                  ? 'bg-emerald-500 text-slate-950 font-black'
                                  : 'bg-white/5 hover:bg-white/10 text-slate-400'
                              }`}
                            >
                              Replied
                            </button>
                          </div>

                          <a
                            href={`mailto:${activeInquiry.email}?subject=Re: ${encodeURIComponent(
                              activeInquiry.subject
                            )}`}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs flex items-center gap-2 hover:scale-105 transition shadow-lg"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Reply via Email Client</span>
                          </a>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="p-12 text-center rounded-2xl bg-slate-950/60 border border-white/10 text-slate-400 h-full flex flex-col items-center justify-center">
                    <Eye className="w-10 h-10 mb-3 text-slate-600" />
                    <p className="text-sm font-bold">Select an inquiry from the list to view details.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: SOCIAL BUTTONS MANAGER */}
      {activeSubTab === 'socials' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#5DE2E7]" />
                Social Media & Channels Manager
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Add YouTube, Facebook, TikTok, Instagram, Twitter, or custom channel buttons that display in the Contact Modal.
              </p>
            </div>

            <button
              onClick={handleOpenNewSocial}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg hover:scale-105 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Social Button</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contactSettings.socialButtons?.map(social => (
              <div
                key={social.id}
                className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 hover:border-[#5DE2E7]/40 transition flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    {getPlatformIcon(social.platform)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">{social.title}</h4>
                      {social.badgeText && (
                        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-cyan-500/20 text-[#5DE2E7]">
                          {social.badgeText}
                        </span>
                      )}
                    </div>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-slate-400 hover:text-cyan-400 truncate max-w-[200px] block"
                    >
                      {social.url}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() =>
                      updateSocialButton(social.id, { enabled: !social.enabled })
                    }
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition ${
                      social.enabled
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {social.enabled ? 'Active' : 'Disabled'}
                  </button>

                  <button
                    onClick={() => handleEditSocial(social)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => deleteSocialButton(social.id)}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: SUPPORT HERO SETTINGS */}
      {activeSubTab === 'hero' && (
        <form onSubmit={handleSaveHero} className="p-6 rounded-2xl bg-slate-950/80 border border-white/10 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Contact Modal & Telegram Hero Box Configuration
              </h3>
              <p className="text-xs text-slate-400">
                Customize titles, badges, and the Telegram Admin redirect URL.
              </p>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-xs flex items-center gap-2 hover:scale-105 transition shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Modal Window Header Title</label>
              <input
                type="text"
                value={heroForm.modalTitle}
                onChange={e => setHeroForm({ ...heroForm, modalTitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:border-[#5DE2E7] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Hero Badge Text</label>
              <input
                type="text"
                value={heroForm.heroBadge}
                onChange={e => setHeroForm({ ...heroForm, heroBadge: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:border-[#5DE2E7] focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1">Hero Box Headline</label>
              <input
                type="text"
                value={heroForm.heroTitle}
                onChange={e => setHeroForm({ ...heroForm, heroTitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:border-[#5DE2E7] focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1">Hero Box Subtitle Description</label>
              <textarea
                rows={2}
                value={heroForm.heroSubtitle}
                onChange={e => setHeroForm({ ...heroForm, heroSubtitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:border-[#5DE2E7] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Telegram Button Label</label>
              <input
                type="text"
                value={heroForm.telegramButtonText}
                onChange={e => setHeroForm({ ...heroForm, telegramButtonText: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:border-[#5DE2E7] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Telegram Admin Handle / Link</label>
              <input
                type="text"
                value={heroForm.telegramAdminUrl}
                onChange={e => setHeroForm({ ...heroForm, telegramAdminUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:border-[#5DE2E7] focus:outline-none"
              />
            </div>
          </div>
        </form>
      )}

      {/* SUB-TAB 4: FAQ MANAGER */}
      {activeSubTab === 'faqs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#5DE2E7]" />
                Frequently Asked Questions (FAQ) Manager
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage questions and answers displayed at the bottom of the Contact Modal.
              </p>
            </div>

            <button
              onClick={handleOpenNewFaq}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg hover:scale-105 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add FAQ</span>
            </button>
          </div>

          <div className="space-y-3">
            {contactSettings.faqs?.map(faq => (
              <div
                key={faq.id}
                className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2"
              >
                <div className="flex items-center justify-between gap-4">
                  <h4 className="text-xs font-bold text-cyan-400">{faq.question}</h4>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleEditFaq(faq)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteFaq(faq.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-white/5">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SOCIAL BUTTON MODAL */}
      {isSocialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#0B1D51] border border-[#5DE2E7]/40 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#5DE2E7]" />
                {editingSocialId ? 'Edit Social Button' : 'Add New Social Button'}
              </h3>
              <button onClick={() => setIsSocialModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSocial} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Platform Category</label>
                <select
                  value={socialForm.platform}
                  onChange={e =>
                    setSocialForm({
                      ...socialForm,
                      platform: e.target.value as SocialButton['platform']
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none"
                >
                  <option value="youtube">YouTube</option>
                  <option value="facebook">Facebook</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="twitter">Twitter / X</option>
                  <option value="telegram">Telegram</option>
                  <option value="custom">Custom Link</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Button Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. YouTube Channel, Facebook Page"
                  value={socialForm.title}
                  onChange={e => setSocialForm({ ...socialForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">URL / Link</label>
                <input
                  type="text"
                  required
                  placeholder="https://youtube.com/@onlinetasklab"
                  value={socialForm.url}
                  onChange={e => setSocialForm({ ...socialForm, url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Badge Text (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Subscribe, Follow, Join 50K+"
                  value={socialForm.badgeText}
                  onChange={e => setSocialForm({ ...socialForm, badgeText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="enabledCheck"
                  checked={socialForm.enabled}
                  onChange={e => setSocialForm({ ...socialForm, enabled: e.target.checked })}
                  className="rounded bg-slate-900 border-white/10 text-cyan-500"
                />
                <label htmlFor="enabledCheck" className="text-xs text-slate-300 font-bold">
                  Enable Button on Contact Page
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsSocialModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-xs"
                >
                  Save Button
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ MODAL */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#0B1D51] border border-[#5DE2E7]/40 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#5DE2E7]" />
                {editingFaqId ? 'Edit FAQ Item' : 'Add FAQ Item'}
              </h3>
              <button onClick={() => setIsFaqModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Question</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How do I download files?"
                  value={faqForm.question}
                  onChange={e => setFaqForm({ ...faqForm, question: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Answer</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain the answer in detail..."
                  value={faqForm.answer}
                  onChange={e => setFaqForm({ ...faqForm, answer: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsFaqModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-xs"
                >
                  Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
