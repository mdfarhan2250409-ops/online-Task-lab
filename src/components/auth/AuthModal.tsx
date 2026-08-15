import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { OtlLogo } from '../OtlLogo';
import {
  X,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  KeyRound,
  RefreshCw,
  ShieldCheck,
  Zap,
  ArrowLeft
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    unauthenticatedAlertMessage,
    loginWithEmailOrUsername,
    registerWithEmail,
    loginWithGoogle,
    verifyEmailOTP,
    resendEmailOTP,
    requestPasswordReset,
    verifyPasswordResetOTP,
    completePasswordReset,
    resendPasswordResetOTP,
    pendingVerificationEmail,
    pendingResetEmail,
    lastGeneratedOtp
  } = useAuth();

  // Form states
  const [identifier, setIdentifier] = useState(''); // Email or username
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot / Reset password fields
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // 6-digit OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Countdown for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (authModalMode === 'verify-email') {
      setResendTimer(60);
      setCanResend(false);
      interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [authModalMode]);

  // Reset errors when mode changes
  useEffect(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setOtpDigits(['', '', '', '', '', '']);
  }, [authModalMode]);

  // Password strength calculation
  const calculatePasswordStrength = (pwd: string) => {
    let score = 0;
    if (!pwd) return 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score; // 0 - 5
  };

  const getStrengthLabel = (score: number) => {
    if (score <= 2) return { text: 'Weak', color: 'text-rose-400', bg: 'bg-rose-500' };
    if (score === 3 || score === 4) return { text: 'Good', color: 'text-amber-400', bg: 'bg-amber-500' };
    return { text: 'Strong', color: 'text-emerald-400', bg: 'bg-emerald-500' };
  };

  // OTP inputs handler
  const handleOtpChange = (index: number, val: string) => {
    // If multiple digits pasted
    if (val.length > 1) {
      const pasteData = val.replace(/\D/g, '').slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pasteData.forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setOtpDigits(newDigits);
      const nextFocus = Math.min(pasteData.length, 5);
      otpInputsRef.current[nextFocus]?.focus();
      return;
    }

    const char = val.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    // Auto-advance
    if (char && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Submission Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setErrorMessage('Please enter both your email/username and password.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    const res = await loginWithEmailOrUsername(identifier, password);
    setIsLoading(false);
    if (!res.success) {
      setErrorMessage(res.error || 'Failed to sign in');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!firstName.trim() || !username.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    // Username format check
    const usernameRegex = /^[a-zA-Z0-9_.]+$/;
    if (!usernameRegex.test(username.trim()) || username.length < 3 || username.length > 30) {
      setErrorMessage('Username must be 3-30 characters with letters, numbers, underscore, or period (no spaces).');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const res = await registerWithEmail({
      firstName,
      lastName,
      username,
      email,
      password
    });
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Registration failed');
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const res = await loginWithGoogle();
    setIsLoading(false);
    if (!res.success) {
      setErrorMessage(res.error || 'Google sign in failed');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      setErrorMessage('Please enter the full 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    if (pendingResetEmail) {
      const res = await verifyPasswordResetOTP(otp);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Invalid OTP code');
      }
    } else {
      const res = await verifyEmailOTP(otp);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Invalid OTP code');
      }
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    let res;
    if (pendingResetEmail) {
      res = await resendPasswordResetOTP();
    } else {
      res = await resendEmailOTP();
    }
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage('A fresh 6-digit code has been sent to your email!');
      setResendTimer(60);
      setCanResend(false);
    } else {
      setErrorMessage(res.error || 'Failed to resend OTP');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetIdentifier) {
      setErrorMessage('Please enter your registered email or username.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    const res = await requestPasswordReset(resetIdentifier);
    setIsLoading(false);
    if (!res.success) {
      setErrorMessage(res.error || 'Failed to process password reset');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    const res = await completePasswordReset(newPassword);
    setIsLoading(false);
    if (res.success) {
      setSuccessMessage('Password reset successfully! Please sign in with your new password.');
    } else {
      setErrorMessage(res.error || 'Failed to update password');
    }
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsAuthModalOpen(false)}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-[#0B1D51]/95 border border-[#5DE2E7]/40 glass-panel rounded-3xl text-white overflow-hidden shadow-[0_0_60px_rgba(11,29,81,0.95)] z-10 my-auto"
        >
          {/* Header Accent Glow Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#133E87] via-[#5DE2E7] to-cyan-400" />

          {/* Close Button */}
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 sm:p-7">
            {/* Unauthenticated Alert Prompt Banner (if triggered by clicking restricted download) */}
            {unauthenticatedAlertMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-amber-500/20 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5 shadow-lg animate-pulse">
                <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300 block mb-0.5">Account Required to Download</span>
                  <span>{unauthenticatedAlertMessage}</span>
                </div>
              </div>
            )}

            {/* Logo & Header */}
            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-2xl bg-[#060B1E]/80 border border-[#5DE2E7]/30 shadow-[0_0_20px_rgba(93,226,231,0.3)] mb-3">
                <OtlLogo size="md" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {authModalMode === 'login' && 'Welcome Back to OTL'}
                {authModalMode === 'register' && 'Create Your Free Account'}
                {authModalMode === 'verify-email' && 'Verify 6-Digit Email Code'}
                {authModalMode === 'forgot-password' && 'Reset Your Password'}
                {authModalMode === 'reset-password' && 'Create New Password'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {authModalMode === 'login' && 'Sign in to access unlimited downloads & premium resources'}
                {authModalMode === 'register' && 'Join thousands of creators, gamers & digital innovators'}
                {authModalMode === 'verify-email' && `Enter code sent to ${pendingResetEmail || pendingVerificationEmail || 'your email'}`}
                {authModalMode === 'forgot-password' && 'We will send a 6-digit OTP to reset your password'}
                {authModalMode === 'reset-password' && 'Set a secure new password for your account'}
              </p>
            </div>

            {/* Mode Switcher Tabs (Only for Login & Register) */}
            {(authModalMode === 'login' || authModalMode === 'register') && (
              <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#060B1E]/80 border border-white/10 mb-6">
                <button
                  type="button"
                  onClick={() => setAuthModalMode('login')}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    authModalMode === 'login'
                      ? 'bg-gradient-to-r from-[#133E87] to-cyan-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthModalMode('register')}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    authModalMode === 'register'
                      ? 'bg-gradient-to-r from-[#133E87] to-cyan-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Error & Success Messages */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* 1. LOGIN FORM */}
            {authModalMode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-3.5">
                {/* Google Sign-in Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-white text-slate-900 font-bold text-xs flex items-center justify-center gap-2.5 hover:bg-slate-100 transition shadow-md disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="flex items-center my-3">
                  <div className="flex-1 border-t border-white/10" />
                  <span className="px-3 text-[10px] text-slate-400 uppercase tracking-widest font-bold">Or with email/username</span>
                  <div className="flex-1 border-t border-white/10" />
                </div>

                {/* Email / Username Input */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Email or Username</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      placeholder="e.g. john_doe or user@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 focus:border-[#5DE2E7] text-xs text-white placeholder-slate-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => setAuthModalMode('forgot-password')}
                      className="text-[11px] text-[#5DE2E7] hover:underline font-semibold"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 focus:border-[#5DE2E7] text-xs text-white placeholder-slate-500 focus:outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#133E87] via-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(93,226,231,0.4)] transition disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* 2. REGISTRATION FORM */}
            {authModalMode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3">
                {/* Google Sign-in */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-white text-slate-900 font-bold text-xs flex items-center justify-center gap-2.5 hover:bg-slate-100 transition shadow-md disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign Up with Google</span>
                </button>

                <div className="flex items-center my-2">
                  <div className="flex-1 border-t border-white/10" />
                  <span className="px-3 text-[10px] text-slate-400 uppercase tracking-widest font-bold">Or register with email</span>
                  <div className="flex-1 border-t border-white/10" />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 mb-1">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      placeholder="Alex"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-white/10 focus:border-[#5DE2E7] text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      placeholder="Morgan"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-white/10 focus:border-[#5DE2E7] text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 mb-1">Username (@)</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                      placeholder="alex_99"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-white/10 focus:border-[#5DE2E7] text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="alex@gmail.com"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-white/10 focus:border-[#5DE2E7] text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Password & Confirm Password */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full px-3 py-2 pr-9 rounded-xl bg-slate-950/70 border border-white/10 focus:border-[#5DE2E7] text-xs text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 grid grid-cols-4 gap-1 h-1">
                        {[1, 2, 3, 4].map(step => (
                          <div
                            key={step}
                            className={`rounded-full transition-all ${
                              calculatePasswordStrength(password) >= step
                                ? getStrengthLabel(calculatePasswordStrength(password)).bg
                                : 'bg-white/10'
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`text-[10px] font-bold ${getStrengthLabel(calculatePasswordStrength(password)).color}`}>
                        {getStrengthLabel(calculatePasswordStrength(password)).text}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-300 mb-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full px-3 py-2 pr-9 rounded-xl bg-slate-950/70 border border-white/10 focus:border-[#5DE2E7] text-xs text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#133E87] via-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(93,226,231,0.4)] transition disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Create Account & Send Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* 3. 6-DIGIT EMAIL OTP VERIFICATION */}
            {authModalMode === 'verify-email' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {/* Visual OTP Container */}
                <div className="flex justify-center gap-2 sm:gap-2.5 my-3">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => (otpInputsRef.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(index, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(index, e)}
                      autoFocus={index === 0}
                      className="w-11 h-13 sm:w-12 sm:h-14 rounded-2xl bg-slate-950/90 border-2 border-white/20 focus:border-[#5DE2E7] text-center text-xl font-black text-white focus:outline-none shadow-inner transition focus:scale-105"
                    />
                  ))}
                </div>

                {/* Instant Testing Helper Badge (Provides instant feedback) */}
                {lastGeneratedOtp && (
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-center text-xs text-cyan-300 flex items-center justify-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#5DE2E7]" />
                    <span>Testing OTP Code: <strong className="text-white tracking-widest font-mono text-sm">{lastGeneratedOtp}</strong></span>
                    <button
                      type="button"
                      onClick={() => {
                        const digits = lastGeneratedOtp.split('');
                        setOtpDigits(digits);
                      }}
                      className="ml-1 text-[10px] uppercase font-bold bg-[#5DE2E7] text-slate-950 px-2 py-0.5 rounded-md hover:bg-white"
                    >
                      Auto-fill
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify & Continue</span>
                    </>
                  )}
                </button>

                {/* Resend Timer / Button */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                  <button
                    type="button"
                    onClick={() => setAuthModalMode('login')}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={!canResend || isLoading}
                    className={`font-bold transition ${
                      canResend ? 'text-[#5DE2E7] hover:underline cursor-pointer' : 'text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
                  </button>
                </div>
              </form>
            )}

            {/* 4. FORGOT PASSWORD (EMAIL INPUT) */}
            {authModalMode === 'forgot-password' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Your Email or Username</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={resetIdentifier}
                      onChange={e => setResetIdentifier(e.target.value)}
                      placeholder="Enter registered email address or @username"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 focus:border-[#5DE2E7] text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#133E87] to-cyan-600 hover:from-cyan-500 hover:to-blue-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Send 6-Digit Reset Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setAuthModalMode('login')}
                    className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 mx-auto"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </button>
                </div>
              </form>
            )}

            {/* 5. RESET PASSWORD (NEW PASSWORD INPUT) */}
            {authModalMode === 'reset-password' && (
              <form onSubmit={handleResetPassword} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters with letters & numbers"
                      className="w-full px-3 py-2.5 pr-10 rounded-xl bg-slate-950/70 border border-white/10 focus:border-[#5DE2E7] text-xs text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={e => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 focus:border-[#5DE2E7] text-xs text-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Update Password & Log In</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
