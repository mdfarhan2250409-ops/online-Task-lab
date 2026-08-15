import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { OtlLogo } from '../OtlLogo';
import {
  X,
  User,
  Mail,
  Shield,
  Calendar,
  Clock,
  Download,
  LogOut,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  KeyRound,
  FileText
} from 'lucide-react';

export const UserProfileModal: React.FC = () => {
  const {
    currentUser,
    isProfileModalOpen,
    setIsProfileModalOpen,
    logout,
    updateUserProfileData
  } = useAuth();
  const { setIsAdminOpen, resources } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'downloads' | 'security'>('profile');
  const [firstName, setFirstName] = useState(currentUser?.firstName || '');
  const [lastName, setLastName] = useState(currentUser?.lastName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  React.useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.firstName || '');
      setLastName(currentUser.lastName || '');
    }
  }, [currentUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const ok = await updateUserProfileData({
      firstName,
      lastName
    });
    setIsSaving(false);
    if (ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const downloadedResources = ((currentUser && currentUser.downloadedResourceIds) || [])
    .map(id => resources.find(r => r.id === id))
    .filter(Boolean);

  return (
    <AnimatePresence>
      {isProfileModalOpen && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsProfileModalOpen(false)}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-[#0B1D51]/95 border border-[#5DE2E7]/40 glass-panel rounded-3xl text-white overflow-hidden shadow-[0_0_60px_rgba(11,29,81,0.95)] z-10 my-auto flex flex-col max-h-[90vh]"
        >
          {/* Header Bar */}
          <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-slate-950/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-[#5DE2E7]/30 text-[#5DE2E7]">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">My Account Center</h3>
                <p className="text-xs text-slate-400">Manage your profile, active downloads & credentials</p>
              </div>
            </div>

            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Hero Banner */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-[#133E87]/60 via-[#0B1D51]/80 to-cyan-900/40 border-b border-white/10 shrink-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.firstName}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-[#5DE2E7]/50 shadow-[0_0_15px_rgba(93,226,231,0.4)]"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#133E87] to-cyan-500 flex items-center justify-center text-white text-xl font-black border-2 border-[#5DE2E7]/40 shadow-lg">
                      {currentUser.firstName?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0B1D51]" />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-lg font-bold text-white">
                      {currentUser.firstName} {currentUser.lastName}
                    </h4>
                    {/* Role Badge */}
                    <span
                      className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md border ${
                        currentUser.role === 'admin'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          : 'bg-cyan-500/20 text-[#5DE2E7] border-[#5DE2E7]/40'
                      }`}
                    >
                      {currentUser.role === 'admin' ? 'Admin' : 'Member'}
                    </span>
                    {/* Status Badge */}
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                        currentUser.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {currentUser.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono mt-0.5">@{currentUser.username}</p>
                  <p className="text-xs text-slate-400">{currentUser.email}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => {
                      setIsProfileModalOpen(false);
                      setIsAdminOpen(true);
                    }}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-purple-600/80 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Admin Panel</span>
                  </button>
                )}

                <button
                  onClick={logout}
                  className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-white border border-rose-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 px-5 sm:px-6 bg-slate-950/40 shrink-0">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'profile'
                  ? 'border-[#5DE2E7] text-[#5DE2E7]'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Profile Details
            </button>
            <button
              onClick={() => setActiveTab('downloads')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'downloads'
                  ? 'border-[#5DE2E7] text-[#5DE2E7]'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <span>Download History</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-[#5DE2E7]">
                {currentUser.downloadCount || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'security'
                  ? 'border-[#5DE2E7] text-[#5DE2E7]'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Security & Auth
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
            {/* TAB 1: PROFILE */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                {saveSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Your profile updates have been saved successfully.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 focus:border-[#5DE2E7] text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 focus:border-[#5DE2E7] text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Username</label>
                    <input
                      type="text"
                      disabled
                      value={`@${currentUser.username}`}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/40 border border-white/5 text-xs text-slate-400 cursor-not-allowed font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
                    <input
                      type="text"
                      disabled
                      value={currentUser.email}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/40 border border-white/5 text-xs text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Account Metadata Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Joined Date</span>
                    <span className="text-xs text-white font-semibold mt-0.5 block">
                      {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Last Active</span>
                    <span className="text-xs text-white font-semibold mt-0.5 block">
                      {currentUser.lastActiveAt ? new Date(currentUser.lastActiveAt).toLocaleDateString() : 'Just now'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-white/5 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Auth Method</span>
                    <span className="text-xs text-[#5DE2E7] font-semibold mt-0.5 capitalize block">
                      {currentUser.provider} Sign-in
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#133E87] to-cyan-600 hover:from-cyan-500 hover:to-blue-600 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
                  >
                    {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: DOWNLOAD HISTORY */}
            {activeTab === 'downloads' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Recent Downloads & Unlocks
                  </h4>
                  <span className="text-xs text-slate-400">Total: {currentUser.downloadCount || 0}</span>
                </div>

                {downloadedResources.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl bg-slate-950/30">
                    <Download className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
                    <p className="text-xs text-slate-300 font-bold">No downloaded resources yet</p>
                    <p className="text-[11px] text-slate-500 mt-1">Explore our feed to download premium mods, prompts and assets!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {downloadedResources.map((res: any) => (
                      <div
                        key={res.id}
                        className="p-3 rounded-xl bg-slate-950/60 border border-white/10 flex items-center justify-between hover:border-[#5DE2E7]/40 transition"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={res.imageUrl}
                            alt={res.title}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <p className="text-xs font-bold text-white">{res.title}</p>
                            <p className="text-[10px] text-cyan-400 capitalize">{res.category}</p>
                          </div>
                        </div>

                        {res.downloadUrl && (
                          <a
                            href={res.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-[#133E87] hover:bg-cyan-600 text-white text-xs font-bold flex items-center gap-1 transition"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SECURITY */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">Email Verification Status</h5>
                      <p className="text-[11px] text-slate-400">
                        {currentUser.emailVerified
                          ? 'Your email address is verified with a 6-digit OTP code.'
                          : 'Your email address has not been verified.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                        currentUser.emailVerified
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {currentUser.emailVerified ? 'Verified Account' : 'Verification Required'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-[#5DE2E7] border border-[#5DE2E7]/30">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">Password & Credentials</h5>
                      <p className="text-[11px] text-slate-400">
                        {currentUser.provider === 'google'
                          ? 'Managed securely through your Google Account.'
                          : 'Standard encrypted password security enabled.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
