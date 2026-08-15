import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OtlLogo } from '../OtlLogo';
import { AdminDashboard } from './AdminDashboard';
import { AdminProducts } from './AdminProducts';
import { AdminCategories } from './AdminCategories';
import { AdminSettings } from './AdminSettings';
import { AdminHomepageBuilder } from './AdminHomepageBuilder';
import { AdminTelegramSettings } from './AdminTelegramSettings';
import { AdminSplashSettings } from './AdminSplashSettings';
import { AdminMobileNavSettings } from './AdminMobileNavSettings';
import { AdminAdsManager } from './AdminAdsManager';
import { AdminContactManager } from './AdminContactManager';
import { AdminUserManagement } from './AdminUserManagement';
import { AdminEmailManager } from './AdminEmailManager';
import { motion } from 'motion/react';
import {
  Shield,
  LayoutDashboard,
  Layers,
  Settings,
  Layout,
  Send,
  Sparkles,
  Smartphone,
  Megaphone,
  FolderTree,
  Mail,
  Users,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  ShieldCheck,
  AlertCircle,
  Home,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

const ADMIN_EMAIL = 'onlinetasklab@gmail.com';
const ADMIN_PASSWORD = '(mmi_f-arhan)';

export const AdminPanel: React.FC = () => {
  const { setIsAdminOpen, inquiries } = useApp();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('otl_admin_authenticated') === 'true';
  });
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'users' | 'email' | 'products' | 'categories' | 'contact' | 'settings' | 'homepage' | 'telegram' | 'splash' | 'mobilenav' | 'ads'
  >('dashboard');

  const unreadInquiriesCount = inquiries ? inquiries.filter(i => i.status === 'unread').length : 0;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      emailInput.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
      passwordInput === ADMIN_PASSWORD
    ) {
      setIsAuthenticated(true);
      localStorage.setItem('otl_admin_authenticated', 'true');
      setLoginError('');
    } else {
      setLoginError('Invalid Email or Password! Access Denied.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('otl_admin_authenticated');
    setEmailInput('');
    setPasswordInput('');
    setLoginError('');
  };

  return (
    <div className="py-6 px-3 sm:px-6 lg:px-8 max-w-[1700px] mx-auto space-y-6">
      
      {/* Top Breadcrumb Nav Bar */}
      <div className="flex items-center justify-between gap-4 py-2 border-b border-white/10 text-xs text-slate-300">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAdminOpen(false)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-[#5DE2E7] transition font-medium"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-[#5DE2E7] font-bold">Admin Management Panel</span>
        </div>

        <button
          onClick={() => setIsAdminOpen(false)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold transition hover:border-[#5DE2E7]/40"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#5DE2E7]" />
          <span>Exit to Main Website</span>
        </button>
      </div>

      {/* Admin Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden glass-panel border border-[#5DE2E7]/30 p-6 sm:p-8 shadow-[0_0_50px_rgba(11,29,81,0.7)]"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#133E87] to-[#0B1D51] border border-[#5DE2E7]/50 flex items-center justify-center shrink-0 shadow-[0_0_25px_rgba(93,226,231,0.35)]">
              <OtlLogo size="lg" animate={true} />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-[#5DE2E7]/20 text-[#5DE2E7] text-[10px] sm:text-xs font-extrabold uppercase tracking-widest border border-[#5DE2E7]/30">
                  Admin Control Center
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Secure & Password Protected</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Online Task Lab (OTL) Dashboard
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                Manage site resources, categories, homepage settings, advertisements, splash loader, and support inquiries in one central place.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-4 py-2.5 rounded-2xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold flex items-center gap-2 transition shadow-[0_0_15px_rgba(239,68,68,0.2)]"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout Admin</span>
              </button>
            )}

            <button
              onClick={() => setIsAdminOpen(false)}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/15 text-xs font-bold flex items-center gap-2 transition"
            >
              <ArrowLeft className="w-4 h-4 text-[#5DE2E7]" />
              <span>Back to Site</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Admin Page Content */}
      {!isAuthenticated ? (
        /* Login Card View */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto my-8 p-6 sm:p-8 rounded-3xl glass-panel border border-[#5DE2E7]/40 shadow-[0_0_50px_rgba(11,29,81,0.8)] space-y-6 bg-[#0B1D51]"
        >
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#133E87] to-cyan-500/30 border border-[#5DE2E7]/40 flex items-center justify-center text-[#5DE2E7] shadow-[0_0_25px_rgba(93,226,231,0.3)]">
              <Shield className="w-8 h-8 text-[#5DE2E7]" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Admin Authentication</h2>
            <p className="text-xs text-slate-300">
              Please enter your admin credentials to unlock full site administration.
            </p>
          </div>

          {loginError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2 font-medium"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{loginError}</span>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Admin Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={e => {
                    setEmailInput(e.target.value);
                    setLoginError('');
                  }}
                  placeholder="onlinetasklab@gmail.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-950/80 border border-white/15 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#5DE2E7] focus:ring-1 focus:ring-[#5DE2E7] transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={e => {
                    setPasswordInput(e.target.value);
                    setLoginError('');
                  }}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-950/80 border border-white/15 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#5DE2E7] focus:ring-1 focus:ring-[#5DE2E7] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#133E87] to-cyan-500 hover:from-[#133E87] hover:to-cyan-400 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(93,226,231,0.35)] transition-all transform active:scale-[0.99]"
            >
              Login to Admin Page
            </button>
          </form>
        </motion.div>
      ) : (
        /* Authenticated Admin Management View */
        <div className="space-y-6">
          {/* Admin Navigation Tabs */}
          <div className="p-2 rounded-2xl glass-panel border border-white/10 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-[#133E87] to-cyan-500 text-white shadow-[0_0_15px_rgba(93,226,231,0.4)] border border-[#5DE2E7]/40'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-[#5DE2E7]" /> Dashboard
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-[#133E87] to-cyan-500 text-white shadow-[0_0_15px_rgba(93,226,231,0.4)] border border-[#5DE2E7]/40'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4 text-[#5DE2E7]" /> Users Management
            </button>

            <button
              onClick={() => setActiveTab('email')}
              className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition ${
                activeTab === 'email'
                  ? 'bg-gradient-to-r from-[#133E87] to-cyan-500 text-white shadow-[0_0_15px_rgba(93,226,231,0.4)] border border-[#5DE2E7]/40'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <Mail className="w-4 h-4 text-[#5DE2E7]" /> Email & OTP
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition ${
                activeTab === 'products'
                  ? 'bg-gradient-to-r from-[#133E87] to-cyan-500 text-white shadow-[0_0_15px_rgba(93,226,231,0.4)] border border-[#5DE2E7]/40'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <Layers className="w-4 h-4 text-[#5DE2E7]" /> Products
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition ${
                activeTab === 'categories'
                  ? 'bg-gradient-to-r from-[#133E87] to-cyan-500 text-white shadow-[0_0_15px_rgba(93,226,231,0.4)] border border-[#5DE2E7]/40'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <FolderTree className="w-4 h-4 text-[#5DE2E7]" /> Categories
            </button>

            <button
              onClick={() => setActiveTab('contact')}
              className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition relative ${
                activeTab === 'contact'
                  ? 'bg-gradient-to-r from-[#133E87] to-cyan-500 text-white shadow-[0_0_15px_rgba(93,226,231,0.4)] border border-[#5DE2E7]/40'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <Mail className="w-4 h-4 text-[#5DE2E7]" /> Contact & Inquiries
              {unreadInquiriesCount > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-black rounded-full animate-pulse ml-1">
                  {unreadInquiriesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-[#133E87] to-cyan-500 text-white shadow-[0_0_15px_rgba(93,226,231,0.4)] border border-[#5DE2E7]/40'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <Settings className="w-4 h-4 text-[#5DE2E7]" /> Site Settings
            </button>

            <button
              onClick={() => setActiveTab('homepage')}
              className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition ${
                activeTab === 'homepage'
                  ? 'bg-gradient-to-r from-[#133E87] to-cyan-500 text-white shadow-[0_0_15px_rgba(93,226,231,0.4)] border border-[#5DE2E7]/40'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <Layout className="w-4 h-4 text-[#5DE2E7]" /> Homepage Builder
            </button>

            <button
              onClick={() => setActiveTab('telegram')}
              className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition ${
                activeTab === 'telegram'
                  ? 'bg-gradient-to-r from-[#133E87] to-cyan-500 text-white shadow-[0_0_15px_rgba(93,226,231,0.4)] border border-[#5DE2E7]/40'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <Send className="w-4 h-4 text-[#5DE2E7]" /> Telegram Settings
            </button>

            <button
              onClick={() => setActiveTab('splash')}
              className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition ${
                activeTab === 'splash'
                  ? 'bg-gradient-to-r from-[#133E87] to-cyan-500 text-white shadow-[0_0_15px_rgba(93,226,231,0.4)] border border-[#5DE2E7]/40'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#5DE2E7]" /> Splash Loader
            </button>

            <button
              onClick={() => setActiveTab('mobilenav')}
              className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition ${
                activeTab === 'mobilenav'
                  ? 'bg-gradient-to-r from-[#133E87] to-cyan-500 text-white shadow-[0_0_15px_rgba(93,226,231,0.4)] border border-[#5DE2E7]/40'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <Smartphone className="w-4 h-4 text-[#5DE2E7]" /> Mobile Sidebar
            </button>

            <button
              onClick={() => setActiveTab('ads')}
              className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition ${
                activeTab === 'ads'
                  ? 'bg-gradient-to-r from-[#133E87] to-cyan-500 text-white shadow-[0_0_15px_rgba(93,226,231,0.4)] border border-[#5DE2E7]/40'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <Megaphone className="w-4 h-4 text-[#5DE2E7]" /> Ads & Banners
            </button>
          </div>

          {/* Active Panel Component Container */}
          <div className="p-4 sm:p-6 rounded-3xl glass-panel border border-white/10 bg-[#0B1D51]/70 shadow-[0_0_40px_rgba(11,29,81,0.6)]">
            {activeTab === 'dashboard' && <AdminDashboard />}
            {activeTab === 'users' && <AdminUserManagement />}
            {activeTab === 'email' && <AdminEmailManager />}
            {activeTab === 'products' && <AdminProducts />}
            {activeTab === 'categories' && <AdminCategories />}
            {activeTab === 'contact' && <AdminContactManager />}
            {activeTab === 'settings' && <AdminSettings />}
            {activeTab === 'homepage' && <AdminHomepageBuilder />}
            {activeTab === 'telegram' && <AdminTelegramSettings />}
            {activeTab === 'splash' && <AdminSplashSettings />}
            {activeTab === 'mobilenav' && <AdminMobileNavSettings />}
            {activeTab === 'ads' && <AdminAdsManager />}
          </div>
        </div>
      )}
    </div>
  );
};


