export type ResourceCategory = 'apps' | 'landing-pages' | 'ai-prompts' | 'lr-presets' | 'pc-software';

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

  // PC Software specific
  softwareVersion?: string;
  systemRequirements?: {
    os: string;
    processor: string;
    ram: string;
    gpu?: string;
    storage: string;
  };
  changelog?: string[];
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
