import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserProfile, UserStatus, UserActivity, AdminActivityLog } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  Ban,
  Trash2,
  Clock,
  Calendar,
  Mail,
  User,
  LogIn,
  LogOut,
  Activity,
  AlertTriangle,
  Download,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  MoreVertical,
  ChevronDown,
  History,
  FileText,
  Sparkles,
  ExternalLink,
  ChevronRight,
  X
} from 'lucide-react';

export const AdminUserManagement: React.FC = () => {
  const {
    allUsers,
    userActivities,
    adminActivityLogs,
    updateUserStatus,
    deleteUserAccount,
    currentUser
  } = useAuth();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
  const [providerFilter, setProviderFilter] = useState<'all' | 'email' | 'google'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'lastActive' | 'downloads'>('newest');

  // Selected User Modal / Detail Drawer
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [activeUserTab, setActiveUserTab] = useState<'details' | 'activity' | 'downloads'>('details');

  // Action Confirmation Modals
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserProfile | null>(null);
  const [statusChangeConfirm, setStatusChangeConfirm] = useState<{
    user: UserProfile;
    newStatus: UserStatus;
    reason?: string;
  } | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Active sub-tab in Admin User Management: 'users' or 'logs'
  const [viewMode, setViewMode] = useState<'users' | 'logs'>('users');

  // Statistics Calculations
  const stats = useMemo(() => {
    const total = allUsers.length;
    const active = allUsers.filter(u => u.status === 'active').length;
    const suspended = allUsers.filter(u => u.status === 'suspended').length;
    const banned = allUsers.filter(u => u.status === 'banned').length;
    const googleUsers = allUsers.filter(u => u.provider === 'google').length;
    const emailUsers = allUsers.filter(u => u.provider === 'email').length;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const newToday = allUsers.filter(u => new Date(u.createdAt) >= todayStart).length;

    return { total, active, suspended, banned, googleUsers, emailUsers, newToday };
  }, [allUsers]);

  // Filtered & Sorted Users
  const filteredUsers = useMemo(() => {
    return allUsers.filter(user => {
      // Search matching: name, username, email, userId
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const matchName = fullName.includes(query);
        const matchUsername = (user.username || '').toLowerCase().includes(query);
        const matchEmail = (user.email || '').toLowerCase().includes(query);
        const matchId = (user.id || user.userId || '').toLowerCase().includes(query);
        if (!matchName && !matchUsername && !matchEmail && !matchId) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && user.status !== statusFilter) {
        return false;
      }

      // Provider filter
      if (providerFilter !== 'all' && user.provider !== providerFilter) {
        return false;
      }

      // Date filter
      if (dateFilter !== 'all') {
        const userDate = new Date(user.createdAt).getTime();
        const now = Date.now();
        if (dateFilter === 'today') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (userDate < today.getTime()) return false;
        } else if (dateFilter === '7days') {
          if (now - userDate > 7 * 24 * 60 * 60 * 1000) return false;
        } else if (dateFilter === '30days') {
          if (now - userDate > 30 * 24 * 60 * 60 * 1000) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'lastActive') {
        const timeA = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0;
        const timeB = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0;
        return timeB - timeA;
      }
      if (sortBy === 'downloads') {
        return (b.downloadCount || 0) - (a.downloadCount || 0);
      }
      return 0;
    });
  }, [allUsers, searchQuery, statusFilter, providerFilter, dateFilter, sortBy]);

  // Selected User's activities
  const selectedUserActivities = useMemo(() => {
    if (!selectedUser) return [];
    return userActivities.filter(act => act.userId === selectedUser.id || act.userEmail === selectedUser.email);
  }, [selectedUser, userActivities]);

  // Handlers
  const handleExecuteStatusChange = async () => {
    if (!statusChangeConfirm) return;
    setIsProcessing(true);
    const { user, newStatus } = statusChangeConfirm;
    const res = await updateUserStatus(user.id, newStatus, actionReason || undefined);
    setIsProcessing(false);
    setStatusChangeConfirm(null);
    setActionReason('');

    if (res.success) {
      setFeedbackMessage({ type: 'success', text: `Successfully updated ${user.username || user.email}'s status to ${newStatus}.` });
      if (selectedUser?.id === user.id) {
        setSelectedUser(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } else {
      setFeedbackMessage({ type: 'error', text: res.error || 'Failed to update user status.' });
    }
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleExecuteDelete = async () => {
    if (!deleteConfirmUser) return;
    setIsProcessing(true);
    const targetUser = deleteConfirmUser;
    const res = await deleteUserAccount(targetUser.id, `Deleted by admin (${currentUser?.email || 'admin'})`);
    setIsProcessing(false);
    setDeleteConfirmUser(null);

    if (res.success) {
      setFeedbackMessage({ type: 'success', text: `User ${targetUser.username || targetUser.email} has been permanently deleted.` });
      if (selectedUser?.id === targetUser.id) {
        setSelectedUser(null);
      }
    } else {
      setFeedbackMessage({ type: 'error', text: res.error || 'Failed to delete user.' });
    }
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Active
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Suspended
          </span>
        );
      case 'banned':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
            <Ban className="w-3 h-3" />
            Banned
          </span>
        );
      case 'disabled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30">
            <UserX className="w-3 h-3" />
            Disabled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with quick stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#133E87] to-cyan-500/30 border border-[#5DE2E7]/40 flex items-center justify-center text-[#5DE2E7] shadow-[0_0_15px_rgba(93,226,231,0.3)]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                User Management Center
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#5DE2E7]/20 text-[#5DE2E7] border border-[#5DE2E7]/30 font-bold">
                  {allUsers.length} Users Registered
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Manage all registered accounts, view real-time user activity timelines, manage security statuses, and review admin audit logs.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-950/60 border border-white/10 self-start md:self-auto">
          <button
            onClick={() => setViewMode('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              viewMode === 'users'
                ? 'bg-gradient-to-r from-[#133E87] to-cyan-500 text-white shadow-[0_0_15px_rgba(93,226,231,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users List</span>
          </button>
          <button
            onClick={() => setViewMode('logs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              viewMode === 'logs'
                ? 'bg-gradient-to-r from-[#133E87] to-cyan-500 text-white shadow-[0_0_15px_rgba(93,226,231,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Admin Activity Logs ({adminActivityLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedbackMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
              : 'bg-red-500/20 border-red-500/40 text-red-200'
          }`}
        >
          {feedbackMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />}
          <span>{feedbackMessage.text}</span>
        </motion.div>
      )}

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl glass-panel border border-white/10 bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Users</span>
            <Users className="w-4 h-4 text-[#5DE2E7]" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{stats.total}</div>
          <div className="text-[10px] text-slate-400 mt-1 font-medium">All registered accounts</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-emerald-500/20 bg-emerald-950/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-300 text-xs">
            <span>Active Users</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-300 mt-2">{stats.active}</div>
          <div className="text-[10px] text-emerald-400/80 mt-1 font-medium">In good standing</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-cyan-500/20 bg-cyan-950/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-cyan-300 text-xs">
            <span>New Today</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-300 mt-2">+{stats.newToday}</div>
          <div className="text-[10px] text-cyan-400/80 mt-1 font-medium">Joined past 24 hrs</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-red-500/20 bg-red-950/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-red-300 text-xs">
            <span>Banned / Suspended</span>
            <Ban className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-300 mt-2">{stats.banned + stats.suspended}</div>
          <div className="text-[10px] text-red-400/80 mt-1 font-medium">{stats.banned} banned • {stats.suspended} susp</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-amber-500/20 bg-amber-950/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-300 text-xs">
            <span>Google Auth</span>
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z" />
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
              <path fill="#FBBC05" d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.9 6.4C.7 8.8 0 10.3 0 12s.7 3.2 1.9 5.6l3.7-2.9z" />
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 15.9C3.7 19.7 7.5 23 12 23z" />
            </svg>
          </div>
          <div className="text-2xl font-black text-amber-300 mt-2">{stats.googleUsers}</div>
          <div className="text-[10px] text-amber-400/80 mt-1 font-medium">Verified Google sign-ins</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-indigo-500/20 bg-indigo-950/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-indigo-300 text-xs">
            <span>Email Auth</span>
            <Mail className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-300 mt-2">{stats.emailUsers}</div>
          <div className="text-[10px] text-indigo-400/80 mt-1 font-medium">Direct email / OTP users</div>
        </div>
      </div>

      {viewMode === 'users' ? (
        <>
          {/* Search, Filters, and Sorting Controls */}
          <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-4 bg-slate-900/50">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search users by name, @username, email, or user ID..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/80 border border-white/15 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#5DE2E7] transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Filter className="w-3 h-3 text-[#5DE2E7]" /> Status:
                </span>
                {(['all', 'active', 'suspended', 'banned', 'disabled'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition ${
                      statusFilter === st
                        ? 'bg-[#5DE2E7]/20 text-[#5DE2E7] border border-[#5DE2E7]/40'
                        : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub Filters Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs text-slate-300">
              <div className="flex items-center gap-4 flex-wrap">
                {/* Provider Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-400">Provider:</span>
                  <select
                    value={providerFilter}
                    onChange={e => setProviderFilter(e.target.value as any)}
                    className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-white/15 text-xs text-white focus:outline-none focus:border-[#5DE2E7]"
                  >
                    <option value="all">All Providers</option>
                    <option value="email">Email</option>
                    <option value="google">Google</option>
                  </select>
                </div>

                {/* Date Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-400">Registered:</span>
                  <select
                    value={dateFilter}
                    onChange={e => setDateFilter(e.target.value as any)}
                    className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-white/15 text-xs text-white focus:outline-none focus:border-[#5DE2E7]"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                  </select>
                </div>

                {/* Sort By */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-400">Sort By:</span>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-white/15 text-xs text-white focus:outline-none focus:border-[#5DE2E7]"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="lastActive">Most Recently Active</option>
                    <option value="downloads">Most Downloads</option>
                  </select>
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                Showing <span className="font-bold text-[#5DE2E7]">{filteredUsers.length}</span> of {allUsers.length} users
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-2xl glass-panel border border-white/10 overflow-hidden bg-slate-900/60">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-white/10 text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-4">User / Profile</th>
                    <th className="py-3.5 px-4">Username & Email</th>
                    <th className="py-3.5 px-4">Provider</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Joined Date</th>
                    <th className="py-3.5 px-4">Last Active</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Users className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
                        <p className="font-bold text-sm text-slate-300">No users found matching your criteria</p>
                        <p className="text-xs text-slate-500 mt-1">Try clearing your filters or search keywords</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => {
                      const initial = (user.firstName?.[0] || user.username?.[0] || user.email[0] || 'U').toUpperCase();
                      const isCurrentUserAdmin = user.role === 'admin';

                      return (
                        <tr
                          key={user.id}
                          className="hover:bg-white/[0.03] transition group cursor-pointer"
                          onClick={() => {
                            setSelectedUser(user);
                            setActiveUserTab('details');
                          }}
                        >
                          {/* Profile Picture & Full Name */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {user.photoURL ? (
                                <img
                                  src={user.photoURL}
                                  alt={user.firstName}
                                  referrerPolicy="no-referrer"
                                  className="w-9 h-9 rounded-xl object-cover border border-white/15 shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#133E87] to-cyan-500/40 border border-[#5DE2E7]/40 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-[0_0_10px_rgba(93,226,231,0.2)]">
                                  {initial}
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  <span>{user.firstName} {user.lastName}</span>
                                  {isCurrentUserAdmin && (
                                    <span className="px-1.5 py-0.2 rounded bg-[#5DE2E7]/20 text-[#5DE2E7] text-[9px] font-black uppercase tracking-wider border border-[#5DE2E7]/40">
                                      Admin
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  ID: {user.id.substring(0, 10)}...
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Username & Email */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-200">
                              @{user.username || 'unknown'}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-500" />
                              <span>{user.email}</span>
                              {user.emailVerified ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" title="Email Verified" />
                              ) : (
                                <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  Unverified
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Login Provider */}
                          <td className="py-3.5 px-4">
                            {user.provider === 'google' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px] font-bold">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z" />
                                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                                  <path fill="#FBBC05" d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.9 6.4C.7 8.8 0 10.3 0 12s.7 3.2 1.9 5.6l3.7-2.9z" />
                                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 15.9C3.7 19.7 7.5 23 12 23z" />
                                </svg>
                                Google
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px] font-bold">
                                <Mail className="w-3.5 h-3.5" />
                                Email
                              </span>
                            )}
                          </td>

                          {/* Account Status */}
                          <td className="py-3.5 px-4">
                            {getStatusBadge(user.status)}
                          </td>

                          {/* Account Created Time */}
                          <td className="py-3.5 px-4 text-slate-300">
                            <div className="flex items-center gap-1 text-[11px]">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              <span>{formatDate(user.createdAt)}</span>
                            </div>
                          </td>

                          {/* Last Active Time */}
                          <td className="py-3.5 px-4 text-slate-300">
                            <div className="flex items-center gap-1 text-[11px]">
                              <Activity className="w-3 h-3 text-[#5DE2E7]" />
                              <span>{formatDate(user.lastActiveAt || user.lastLoginAt)}</span>
                            </div>
                          </td>

                          {/* Actions button group */}
                          <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setActiveUserTab('details');
                                }}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                                title="View User Profile & Timeline"
                              >
                                <Eye className="w-4 h-4 text-[#5DE2E7]" />
                              </button>

                              {user.status === 'active' ? (
                                <>
                                  <button
                                    onClick={() => setStatusChangeConfirm({ user, newStatus: 'suspended' })}
                                    className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition"
                                    title="Suspend User"
                                  >
                                    <UserX className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setStatusChangeConfirm({ user, newStatus: 'banned' })}
                                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 transition"
                                    title="Ban User"
                                  >
                                    <Ban className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => setStatusChangeConfirm({ user, newStatus: 'active' })}
                                  className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition"
                                  title="Unban / Activate User"
                                >
                                  <UserCheck className="w-4 h-4" />
                                </button>
                              )}

                              <button
                                onClick={() => setDeleteConfirmUser(user)}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                                title="Permanently Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Admin Activity Audit Logs View */
        <div className="space-y-4">
          <div className="p-4 rounded-2xl glass-panel border border-white/10 bg-slate-900/60 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-[#5DE2E7]" />
                Admin Audit & Action Logs
              </h3>
              <p className="text-xs text-slate-400">
                Transparent records of all administrative actions: Bans, Suspensions, Activations, Deletions, and Role Changes.
              </p>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Total Logged Actions: <span className="text-[#5DE2E7] font-bold">{adminActivityLogs.length}</span>
            </div>
          </div>

          <div className="rounded-2xl glass-panel border border-white/10 overflow-hidden bg-slate-900/60">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-white/10 text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Admin Actor</th>
                    <th className="py-3 px-4">Action Type</th>
                    <th className="py-3 px-4">Target User</th>
                    <th className="py-3 px-4">Details / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {adminActivityLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400">
                        <History className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
                        <p className="font-bold text-sm text-slate-300">No admin actions recorded yet</p>
                      </td>
                    </tr>
                  ) : (
                    adminActivityLogs.map(log => (
                      <tr key={log.id} className="hover:bg-white/[0.03] transition">
                        <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-white">
                          <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-[#5DE2E7] border border-[#5DE2E7]/20 text-[10px]">
                            {log.adminEmail || 'admin'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-white px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px]">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                          {log.targetUserEmail || log.targetUserId || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {log.details || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* User Details & Timeline Drawer / Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl my-8 rounded-3xl glass-panel border border-[#5DE2E7]/40 bg-[#0B1D51] shadow-[0_0_50px_rgba(11,29,81,0.9)] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 flex items-start justify-between gap-4 bg-slate-950/40">
                <div className="flex items-center gap-4">
                  {selectedUser.photoURL ? (
                    <img
                      src={selectedUser.photoURL}
                      alt={selectedUser.firstName}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover border border-[#5DE2E7]/40 shadow-[0_0_15px_rgba(93,226,231,0.3)]"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#133E87] to-cyan-500/40 border border-[#5DE2E7]/40 flex items-center justify-center text-white font-black text-xl shadow-[0_0_15px_rgba(93,226,231,0.3)]">
                      {(selectedUser.firstName?.[0] || selectedUser.username?.[0] || 'U').toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg sm:text-xl font-black text-white">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </h3>
                      {getStatusBadge(selectedUser.status)}
                    </div>
                    <p className="text-xs text-[#5DE2E7] font-semibold">@{selectedUser.username}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedUser.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs Inside Modal */}
              <div className="flex items-center gap-2 px-6 pt-3 border-b border-white/10 bg-slate-950/20 text-xs">
                <button
                  onClick={() => setActiveUserTab('details')}
                  className={`pb-3 font-bold border-b-2 transition flex items-center gap-1.5 ${
                    activeUserTab === 'details'
                      ? 'border-[#5DE2E7] text-[#5DE2E7]'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Personal & Account Details</span>
                </button>

                <button
                  onClick={() => setActiveUserTab('activity')}
                  className={`pb-3 font-bold border-b-2 transition flex items-center gap-1.5 ${
                    activeUserTab === 'activity'
                      ? 'border-[#5DE2E7] text-[#5DE2E7]'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>User Activity Timeline ({selectedUserActivities.length})</span>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
                {activeUserTab === 'details' ? (
                  <div className="space-y-6">
                    {/* Section 1: Personal Information */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-[#5DE2E7]" />
                        Personal Information
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-slate-950/50 border border-white/10">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">First Name</div>
                          <div className="text-sm font-bold text-white mt-0.5">{selectedUser.firstName || '—'}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-950/50 border border-white/10">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Last Name</div>
                          <div className="text-sm font-bold text-white mt-0.5">{selectedUser.lastName || '—'}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-950/50 border border-white/10">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Username</div>
                          <div className="text-sm font-bold text-[#5DE2E7] mt-0.5">@{selectedUser.username}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-950/50 border border-white/10">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Email Address</div>
                          <div className="text-sm font-bold text-white mt-0.5">{selectedUser.email}</div>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Account Information */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-[#5DE2E7]" />
                        Account & Security Information
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl bg-slate-950/50 border border-white/10">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">User ID</div>
                          <div className="text-xs font-mono text-slate-300 mt-0.5 break-all">{selectedUser.id}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-950/50 border border-white/10">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Login Provider</div>
                          <div className="text-xs font-bold text-white mt-0.5 capitalize">{selectedUser.provider}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-950/50 border border-white/10">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Email Verified</div>
                          <div className="text-xs font-bold mt-0.5">
                            {selectedUser.emailVerified ? (
                              <span className="text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                              </span>
                            ) : (
                              <span className="text-amber-400 flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" /> Unverified
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-950/50 border border-white/10">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Account Created</div>
                          <div className="text-xs text-slate-300 mt-0.5">{formatDate(selectedUser.createdAt)}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-950/50 border border-white/10">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Last Login</div>
                          <div className="text-xs text-slate-300 mt-0.5">{formatDate(selectedUser.lastLoginAt)}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-950/50 border border-white/10">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Last Active</div>
                          <div className="text-xs text-slate-300 mt-0.5">{formatDate(selectedUser.lastActiveAt)}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-950/50 border border-white/10">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Last Logout</div>
                          <div className="text-xs text-slate-300 mt-0.5">{formatDate(selectedUser.lastLogoutAt)}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-950/50 border border-white/10">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Total Downloads</div>
                          <div className="text-xs font-bold text-[#5DE2E7] mt-0.5">{selectedUser.downloadCount || 0} resources</div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-950/50 border border-white/10">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Account Status</div>
                          <div className="mt-0.5">{getStatusBadge(selectedUser.status)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Admin Action Buttons */}
                    <div className="p-4 rounded-2xl border border-white/10 bg-slate-950/80 space-y-3">
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-[#5DE2E7]" />
                        Quick Administrative Actions
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {selectedUser.status === 'active' ? (
                          <>
                            <button
                              onClick={() => setStatusChangeConfirm({ user: selectedUser, newStatus: 'suspended' })}
                              className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span>Suspend Account</span>
                            </button>
                            <button
                              onClick={() => setStatusChangeConfirm({ user: selectedUser, newStatus: 'banned' })}
                              className="px-3.5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold flex items-center gap-1.5 transition"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Ban User</span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setStatusChangeConfirm({ user: selectedUser, newStatus: 'active' })}
                            className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Unban / Restore to Active</span>
                          </button>
                        )}

                        <button
                          onClick={() => setDeleteConfirmUser(selectedUser)}
                          className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-1.5 transition ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Permanently Delete User</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* User Activity Timeline */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Real-time Activity Timeline
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        {selectedUserActivities.length} total events recorded
                      </span>
                    </div>

                    {selectedUserActivities.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 rounded-2xl bg-slate-950/40 border border-white/5">
                        <Activity className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                        <p className="font-bold text-xs text-slate-300">No activity events recorded yet</p>
                      </div>
                    ) : (
                      <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                        {selectedUserActivities.map(act => (
                          <div key={act.id} className="relative group">
                            {/* Timeline dot */}
                            <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-[#133E87] border-2 border-[#5DE2E7] flex items-center justify-center">
                              <span className="w-1 h-1 rounded-full bg-white"></span>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 hover:border-[#5DE2E7]/40 transition space-y-1">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                                  {act.action === 'Account Created' && <User className="w-3.5 h-3.5 text-cyan-400" />}
                                  {act.action === 'Email Verified' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                                  {act.action === 'Login' && <LogIn className="w-3.5 h-3.5 text-blue-400" />}
                                  {act.action === 'Logout' && <LogOut className="w-3.5 h-3.5 text-slate-400" />}
                                  {act.action === 'Download' && <Download className="w-3.5 h-3.5 text-purple-400" />}
                                  <span>{act.action}</span>
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {formatDate(act.timestamp)}
                                </span>
                              </div>
                              {act.details && (
                                <p className="text-xs text-slate-300">{act.details}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-950/60 border-t border-white/10 flex items-center justify-end">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
                >
                  Close Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal for Status Changes (Suspend / Ban / Unban) */}
      <AnimatePresence>
        {statusChangeConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl glass-panel border border-[#5DE2E7]/40 bg-[#0B1D51] p-6 space-y-4 shadow-[0_0_50px_rgba(11,29,81,0.9)]"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Confirm {statusChangeConfirm.newStatus === 'banned' ? 'Ban' : statusChangeConfirm.newStatus === 'suspended' ? 'Suspension' : 'Activation'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Target: <span className="font-bold text-[#5DE2E7]">@{statusChangeConfirm.user.username || statusChangeConfirm.user.email}</span>
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300">
                {statusChangeConfirm.newStatus === 'banned' && 'This user will be permanently prevented from logging in or using the site until unbanned by an admin.'}
                {statusChangeConfirm.newStatus === 'suspended' && 'This user will be temporarily suspended from accessing member features.'}
                {statusChangeConfirm.newStatus === 'active' && 'This user will be restored to active standing with normal login access.'}
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Reason for admin log (optional):</label>
                <input
                  type="text"
                  value={actionReason}
                  onChange={e => setActionReason(e.target.value)}
                  placeholder="e.g. Terms violation, spamming, resolved ticket..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/15 text-white text-xs focus:outline-none focus:border-[#5DE2E7]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setStatusChangeConfirm(null);
                    setActionReason('');
                  }}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteStatusChange}
                  disabled={isProcessing}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : `Confirm ${statusChangeConfirm.newStatus}`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal for Permanent Delete User */}
      <AnimatePresence>
        {deleteConfirmUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl glass-panel border border-red-500/50 bg-[#0B1D51] p-6 space-y-4 shadow-[0_0_50px_rgba(239,68,68,0.4)]"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-300 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Delete User Account</h3>
                  <p className="text-xs text-red-300 font-bold">This action is permanent and cannot be undone</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs space-y-1">
                <div className="text-slate-400 font-bold">User to delete:</div>
                <div className="text-white font-bold">{deleteConfirmUser.firstName} {deleteConfirmUser.lastName} (@{deleteConfirmUser.username})</div>
                <div className="text-slate-400 font-mono">{deleteConfirmUser.email}</div>
              </div>

              <p className="text-xs text-slate-300">
                Are you sure you want to permanently delete this user profile and remove their data from the platform?
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmUser(null)}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteDelete}
                  disabled={isProcessing}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black text-xs uppercase tracking-wider transition shadow-[0_0_20px_rgba(239,68,68,0.4)] disabled:opacity-50"
                >
                  {isProcessing ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
