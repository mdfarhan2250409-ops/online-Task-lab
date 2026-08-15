export type ResourceCategory = string;

export interface Resource {
  id: string;
  title: string;
  slug: string;
  category: ResourceCategory;
  shortDescription: string;
  fullDescription: string;
  thumbnail: string;
  gallery?: string[];
  version: string;
  fileSize: string;
  downloadUrl: string;
  telegramUrl: string;
  demoUrl?: string;
  tags: string[];
  isFeatured: boolean;
  isTrending: boolean;
  downloadsCount: number;
  telegramClicksCount: number;
  createdAt: string;
  
  // Apps specific
  apkVersion?: string;
  requirements?: string;
  packageName?: string;
  modInfo?: string;
  screenshots?: string[];

  // Landing Pages specific
  demoLink?: string;
  documentationLink?: string;
  previewImages?: string[];

  // AI Prompts specific
  promptText?: string;
  negativePrompt?: string;
  aiModel?: 'Midjourney V6' | 'ChatGPT 4o' | 'Gemini 1.5' | 'Stable Diffusion' | 'DALL-E 3' | 'General AI';

  // LR Presets specific
  beforeImage?: string;
  afterImage?: string;
  presetFormat?: '.DNG' | '.XMP' | '.ZIP';
}

export interface CategoryItem {
  id: ResourceCategory;
  name: string;
  slug: string;
  icon: string; // Lucide icon name
  banner?: string;
  description: string;
  itemCount: number;
}

export interface SiteSettings {
  websiteTitle: string;
  tagline: string;
  logoText: string;
  logoUrl?: string;
  footerLogoUrl?: string;
  faviconUrl?: string;
  footerText: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  telegramChannel: string;
  telegramGroup: string;
  adminTelegram: string;
  contactEmail: string;
  socialLinks: {
    youtube?: string;
    facebook?: string;
    twitter?: string;
    github?: string;
    instagram?: string;
  };
  customCss?: string;
}

export interface HomepageBuilderSettings {
  heroBadgeText?: string;
  heroLogoText?: string;
  heroLogoUrl?: string;
  heroTitle: string;
  heroSubtitle: string;
  heroExploreBtnText: string;
  heroTelegramBtnText: string;
  heroTelegramBtnUrl?: string;
  showHeroParticles: boolean;
  showFeaturedCategories: boolean;
  showTrendingSection: boolean;
  showLatestSection: boolean;
  homepageBannerEnabled: boolean;
  homepageBannerText: string;
  homepageBannerLink: string;
  // Hero Live Stat Cards
  stat1Value?: string;
  stat1Label?: string;
  stat2Value?: string;
  stat2Label?: string;
  stat3Value?: string;
  stat3Label?: string;
  stat4Value?: string;
  stat4Label?: string;
}

export interface SplashLoaderSettings {
  enabled: boolean;
  showOnlyFirstVisit: boolean;
  duration: number; // in milliseconds e.g. 2500
  titleText: string;
  loadingTexts: string[];
  animationStyle: 'glow-pulse' | 'progress-bar' | 'circular-ring' | 'dots';
  glowColor: string;
  progressBarColor: string;
  backgroundColor: string;
}

export interface MobileNavSettings {
  enabled: boolean;
  position: 'fixed-left' | 'fixed-bottom';
  glowActive: boolean;
  items: {
    id: string;
    label: string;
    icon: string;
    link: string;
    categoryFilter?: ResourceCategory | 'all' | 'featured' | 'trending';
    badge?: string;
  }[];
}

export interface Advertisement {
  id: string;
  title: string;
  type: 'homepage-banner' | 'sidebar-banner' | 'popup-banner' | 'telegram-promo';
  imageUrl?: string;
  text?: string;
  targetLink: string;
  enabled: boolean;
}

export interface SEOConfig {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage?: string;
}

export interface AnalyticsData {
  totalVisitors: number;
  totalDownloads: number;
  telegramClicks: number;
  popularProductIds: string[];
}

export interface Inquiry {
  id: string;
  email: string;
  subject: string;
  telegramWhatsapp?: string;
  message: string;
  createdAt: string;
  status: 'unread' | 'read' | 'replied';
}

export interface SocialButton {
  id: string;
  platform: 'youtube' | 'facebook' | 'tiktok' | 'instagram' | 'twitter' | 'telegram' | 'whatsapp' | 'discord' | 'custom';
  title: string;
  url: string;
  enabled: boolean;
  color?: string;
  badgeText?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface ContactPageSettings {
  modalTitle: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  telegramButtonText: string;
  telegramAdminUrl: string;
  formTitle: string;
  faqTitle: string;
  faqs: FAQItem[];
  socialButtons: SocialButton[];
}

export interface FloatingButton {
  id: string;
  title: string;
  url: string;
  icon: 'telegram' | 'whatsapp' | 'discord' | 'youtube' | 'facebook' | 'instagram' | 'custom' | 'send' | 'message-circle' | 'globe';
  enabled: boolean;
  color: 'cyan' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'purple';
  badgeText?: string;
  order: number;
}

export interface FloatingButtonsSettings {
  enabled: boolean;
  position: 'bottom-right' | 'bottom-left';
  stackDirection: 'bottom-to-top' | 'top-to-bottom';
  buttons: FloatingButton[];
}

// User and Authentication Types
export type UserStatus = 'active' | 'suspended' | 'banned' | 'disabled';
export type UserRole = 'user' | 'admin';
export type AuthProviderType = 'email' | 'google';

export interface UserProfile {
  id: string; // Document ID (usually same as userId / auth uid)
  userId: string; // Auth UID
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  photoURL?: string;
  provider: AuthProviderType;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
  lastActiveAt: string;
  lastLogoutAt?: string;
  downloadedResourceIds?: string[];
  downloadCount?: number;
  notes?: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  userEmail: string;
  username?: string;
  action:
    | 'Account Created'
    | 'Email Verified'
    | 'Login'
    | 'Logout'
    | 'Password Reset Requested'
    | 'Password Changed'
    | 'Google Login'
    | 'Last Active'
    | 'Download';
  timestamp: string;
  details?: string;
  ipAddress?: string;
}

export interface AdminActivityLog {
  id: string;
  adminEmail: string;
  action:
    | 'User Banned'
    | 'User Unbanned'
    | 'User Suspended'
    | 'User Deleted'
    | 'Template Updated'
    | 'Email Settings Updated'
    | 'Template Activated'
    | 'User Status Changed'
    | 'Settings Updated';
  targetId?: string;
  targetEmail?: string;
  timestamp: string;
  details?: string;
}

// Custom Branded Email System Types
export type EmailTemplateType =
  | 'email-verification'
  | 'password-reset-otp'
  | 'welcome-email'
  | 'password-changed'
  | 'account-suspended'
  | 'account-reactivated'
  | 'custom-system';

export interface EmailTemplate {
  id: string;
  type: EmailTemplateType;
  name: string;
  subject: string;
  heading: string;
  description: string;
  otpBoxText?: string;
  buttonText?: string;
  buttonUrl?: string;
  footerText?: string;
  supportEmail?: string;
  websiteUrl?: string;
  logoUrl?: string;
  brandName?: string;
  backgroundColor?: string;
  containerColor?: string;
  primaryColor?: string;
  textColor?: string;
  accentColor?: string;
  borderRadius?: string;
  fontSize?: string;
  isActive: boolean;
  version: number;
  updatedAt: string;
}

export interface EmailLog {
  id: string;
  recipient: string;
  emailType: string;
  templateId?: string;
  subject: string;
  sentAt: string;
  status: 'delivered' | 'sent' | 'pending' | 'failed';
  provider: string;
  otpPreview?: string;
  details?: string;
}

export interface EmailSettings {
  senderName: string;
  senderEmail: string;
  replyToEmail: string;
  supportEmail: string;
  logoUrl: string;
  brandName: string;
  brandColor: string;
  secondaryColor: string;
  websiteUrl: string;
  defaultTemplateId?: string;
  apiKeyConfigured?: boolean;
}

export interface OTPRecord {
  id: string;
  email: string;
  otp: string;
  type: 'verification' | 'password-reset';
  expiresAt: number; // Unix timestamp ms
  attempts: number;
  verified: boolean;
  createdAt: number;
  tempPassword?: string;
}

