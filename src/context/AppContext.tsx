import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Resource,
  CategoryItem,
  SiteSettings,
  HomepageBuilderSettings,
  SplashLoaderSettings,
  MobileNavSettings,
  Advertisement,
  SEOConfig,
  AnalyticsData,
  ResourceCategory,
  Inquiry,
  ContactPageSettings,
  SocialButton,
  FAQItem,
  FloatingButton,
  FloatingButtonsSettings
} from '../types';

import {
  initialCategories,
  initialResources,
  initialSiteSettings,
  initialHomepageBuilder,
  initialSplashSettings,
  initialMobileNavSettings,
  initialAds,
  initialSEO,
  initialAnalytics,
  initialInquiries,
  initialContactSettings,
  initialFloatingButtonsSettings
} from '../data/initialData';
import {
  db,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query
} from '../lib/firebase';

interface AppContextType {
  // Data
  resources: Resource[];
  categories: CategoryItem[];
  siteSettings: SiteSettings;
  homepageBuilder: HomepageBuilderSettings;
  splashSettings: SplashLoaderSettings;
  mobileNavSettings: MobileNavSettings;
  ads: Advertisement[];
  seo: SEOConfig;
  analytics: AnalyticsData;
  inquiries: Inquiry[];
  contactSettings: ContactPageSettings;
  floatingButtonsSettings: FloatingButtonsSettings;

  // Active UI states
  selectedCategory: ResourceCategory | 'all';
  setSelectedCategory: (cat: ResourceCategory | 'all') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeTag: string | null;
  setActiveTag: (tag: string | null) => void;
  sortBy: 'latest' | 'trending' | 'downloads' | 'title';
  setSortBy: (sort: 'latest' | 'trending' | 'downloads' | 'title') => void;

  // Modals
  activeResourceModal: Resource | null;
  setActiveResourceModal: (r: Resource | null) => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  isContactModalOpen: boolean;
  setIsContactModalOpen: (open: boolean) => void;
  telegramDownloadModalResource: Resource | null;
  setTelegramDownloadModalResource: (r: Resource | null) => void;
  
  // Admin Mode
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;

  // Toast / Notification system
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // 404 Route handling
  isNotFound: boolean;

  // Tracking
  recordDownload: (resourceId: string) => void;
  recordTelegramClick: (resourceId?: string) => void;

  // Actions for CRUD & Settings
  addResource: (resource: Omit<Resource, 'id' | 'createdAt' | 'downloadsCount' | 'telegramClicksCount'>) => void;
  updateResource: (id: string, updated: Partial<Resource>) => void;
  deleteResource: (id: string) => void;
  cloneResource: (id: string) => void;
  
  updateCategory: (id: ResourceCategory, updated: Partial<CategoryItem>) => void;
  addCategory: (cat: CategoryItem) => void;
  deleteCategory: (id: string) => void;

  updateSiteSettings: (settings: Partial<SiteSettings>) => void;
  updateHomepageBuilder: (builder: Partial<HomepageBuilderSettings>) => void;
  updateSplashSettings: (splash: Partial<SplashLoaderSettings>) => void;
  updateMobileNavSettings: (mobileNav: Partial<MobileNavSettings>) => void;
  updateAds: (ads: Advertisement[]) => void;
  updateSEO: (seo: Partial<SEOConfig>) => void;

  // Inquiry & Contact Manager Actions
  addInquiry: (inquiry: Omit<Inquiry, 'id' | 'createdAt' | 'status'>) => void;
  deleteInquiry: (id: string) => void;
  updateInquiryStatus: (id: string, status: 'unread' | 'read' | 'replied') => void;

  updateContactSettings: (settings: Partial<ContactPageSettings>) => void;
  addSocialButton: (btn: Omit<SocialButton, 'id'>) => void;
  updateSocialButton: (id: string, updated: Partial<SocialButton>) => void;
  deleteSocialButton: (id: string) => void;

  addFaq: (faq: Omit<FAQItem, 'id'>) => void;
  updateFaq: (id: string, updated: Partial<FAQItem>) => void;
  deleteFaq: (id: string) => void;

  // Floating Buttons Actions
  updateFloatingButtonsSettings: (settings: Partial<FloatingButtonsSettings>) => void;
  addFloatingButton: (btn: Omit<FloatingButton, 'id' | 'order'>) => void;
  updateFloatingButton: (id: string, updated: Partial<FloatingButton>) => void;
  deleteFloatingButton: (id: string) => void;
  moveFloatingButton: (id: string, direction: 'up' | 'down') => void;

  resetToDefaults: () => void;
  triggerSplashLoaderPreview: () => void;
  isSplashLoaderVisible: boolean;
  setIsSplashLoaderVisible: (vis: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'OTL_APP_DATA_V1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from LocalStorage or Defaults
  const [resources, setResources] = useState<Resource[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_resources`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((r: any) => r.id));
          const missing = initialResources.filter(r => !existingIds.has(r.id));
          return missing.length > 0 ? [...parsed, ...missing] : parsed;
        }
      }
      return initialResources;
    } catch (e) {
      return initialResources;
    }
  });

  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_categories`);
      return saved ? JSON.parse(saved) : initialCategories;
    } catch (e) {
      return initialCategories;
    }
  });

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_settings`);
      return saved ? JSON.parse(saved) : initialSiteSettings;
    } catch (e) {
      return initialSiteSettings;
    }
  });

  const [homepageBuilder, setHomepageBuilder] = useState<HomepageBuilderSettings>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_homepage`);
      return saved ? JSON.parse(saved) : initialHomepageBuilder;
    } catch (e) {
      return initialHomepageBuilder;
    }
  });

  const [splashSettings, setSplashSettings] = useState<SplashLoaderSettings>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_splash`);
      return saved ? JSON.parse(saved) : initialSplashSettings;
    } catch (e) {
      return initialSplashSettings;
    }
  });

  const [mobileNavSettings, setMobileNavSettings] = useState<MobileNavSettings>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_mobilenav`);
      return saved ? JSON.parse(saved) : initialMobileNavSettings;
    } catch (e) {
      return initialMobileNavSettings;
    }
  });

  const [ads, setAds] = useState<Advertisement[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_ads`);
      return saved ? JSON.parse(saved) : initialAds;
    } catch (e) {
      return initialAds;
    }
  });

  const [seo, setSeo] = useState<SEOConfig>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_seo`);
      return saved ? JSON.parse(saved) : initialSEO;
    } catch (e) {
      return initialSEO;
    }
  });

  const [analytics, setAnalytics] = useState<AnalyticsData>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_analytics`);
      return saved ? JSON.parse(saved) : initialAnalytics;
    } catch (e) {
      return initialAnalytics;
    }
  });

  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_inquiries`);
      return saved ? JSON.parse(saved) : initialInquiries;
    } catch (e) {
      return initialInquiries;
    }
  });

  const [contactSettings, setContactSettings] = useState<ContactPageSettings>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_contact_settings`);
      return saved ? JSON.parse(saved) : initialContactSettings;
    } catch (e) {
      return initialContactSettings;
    }
  });

  const [floatingButtonsSettings, setFloatingButtonsSettings] = useState<FloatingButtonsSettings>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_floating_buttons`);
      return saved ? JSON.parse(saved) : initialFloatingButtonsSettings;
    } catch (e) {
      return initialFloatingButtonsSettings;
    }
  });

  // Router Hooks
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to inspect initial URL before first render
  const getInitialPath = (): string => {
    if (typeof window === 'undefined') return '/';
    let p = window.location.pathname.toLowerCase();
    if (window.location.hash && window.location.hash.startsWith('#')) {
      const hp = window.location.hash.replace('#', '').toLowerCase();
      if (hp && hp.startsWith('/')) p = hp;
    }
    if (p.length > 1 && p.endsWith('/')) {
      p = p.slice(0, -1);
    }
    return p || '/';
  };

  const initialPath = getInitialPath();

  // Admin & Navigation States initialized from URL
  const [isAdminOpen, setIsAdminOpenState] = useState<boolean>(() => {
    const isAdminPath = (p: string) =>
      p === '/admin' || p === 'admin' ||
      p === '/admin-login' || p === 'admin-login' ||
      p === '/admin/login' || p === 'admin/login';
    return isAdminPath(initialPath);
  });

  const [selectedCategory, setSelectedCategoryState] = useState<ResourceCategory | 'all'>(() => {
    if (initialPath.startsWith('/category/')) {
      const cat = initialPath.replace('/category/', '') as ResourceCategory;
      const validCategories = ['all', 'apps', 'landing-pages', 'ai-prompts', 'lr-presets', 'pc-software'];
      if (validCategories.includes(cat)) return cat;
    }
    return 'all';
  });

  const [isSearchModalOpen, setIsSearchModalOpenState] = useState<boolean>(() => {
    return initialPath === '/search' || initialPath === 'search';
  });

  const [isContactModalOpen, setIsContactModalOpenState] = useState<boolean>(() => {
    return initialPath === '/contact' || initialPath === 'contact';
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'downloads' | 'title'>('latest');

  // Modals & Navigation
  const [activeResourceModal, setActiveResourceModalState] = useState<Resource | null>(null);
  const [telegramDownloadModalResource, setTelegramDownloadModalResource] = useState<Resource | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // 404 Route state
  const [isNotFound, setIsNotFound] = useState<boolean>(false);

  // Synchronize React state FROM browser URL address bar
  useEffect(() => {
    let path = location.pathname.toLowerCase();
    if (location.hash && location.hash.startsWith('#')) {
      const hp = location.hash.replace('#', '').toLowerCase();
      if (hp && hp.startsWith('/')) path = hp;
    }
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }

    if (path === '/' || path === '') {
      setSelectedCategoryState('all');
      setIsAdminOpenState(false);
      setIsContactModalOpenState(false);
      setIsSearchModalOpenState(false);
      setActiveResourceModalState(null);
      setIsNotFound(false);
    } else if (
      path === '/admin' || path === 'admin' ||
      path === '/admin-login' || path === 'admin-login' ||
      path === '/admin/login' || path === 'admin/login'
    ) {
      setIsAdminOpenState(true);
      setIsContactModalOpenState(false);
      setIsSearchModalOpenState(false);
      setActiveResourceModalState(null);
      setIsNotFound(false);
    } else if (path === '/contact' || path === 'contact') {
      setIsContactModalOpenState(true);
      setIsAdminOpenState(false);
      setIsSearchModalOpenState(false);
      setActiveResourceModalState(null);
      setIsNotFound(false);
    } else if (path === '/search' || path === 'search') {
      setIsSearchModalOpenState(true);
      setIsAdminOpenState(false);
      setIsContactModalOpenState(false);
      setActiveResourceModalState(null);
      setIsNotFound(false);
    } else if (path.startsWith('/category/')) {
      const catId = path.replace('/category/', '') as ResourceCategory;
      const validCategories = ['all', 'apps', 'landing-pages', 'ai-prompts', 'lr-presets', 'pc-software'];
      if (validCategories.includes(catId)) {
        setSelectedCategoryState(catId);
        setIsAdminOpenState(false);
        setIsContactModalOpenState(false);
        setIsSearchModalOpenState(false);
        setActiveResourceModalState(null);
        setIsNotFound(false);
      } else {
        setIsNotFound(true);
      }
    } else if (path.startsWith('/product/')) {
      const prodId = path.replace('/product/', '');
      setIsAdminOpenState(false);
      setIsContactModalOpenState(false);
      setIsSearchModalOpenState(false);
      const found = resources.find(r => r.id.toLowerCase() === prodId);
      if (found) {
        setActiveResourceModalState(found);
        setIsNotFound(false);
      } else if (resources.length > 0) {
        setIsNotFound(true);
      }
    } else {
      setIsNotFound(true);
    }
  }, [location.pathname, location.hash, resources]);

  // Synchronize browser URL address bar FROM user interaction actions
  const setSelectedCategory = (cat: ResourceCategory | 'all') => {
    setSelectedCategoryState(cat);
    setIsAdminOpenState(false);
    setIsContactModalOpenState(false);
    setIsSearchModalOpenState(false);
    setActiveResourceModalState(null);
    setIsNotFound(false);

    if (cat === 'all') {
      navigate('/');
    } else {
      navigate(`/category/${cat}`);
    }
  };

  const setIsAdminOpen = (open: boolean) => {
    setIsAdminOpenState(open);
    setIsNotFound(false);
    if (open) {
      setIsContactModalOpenState(false);
      setIsSearchModalOpenState(false);
      setActiveResourceModalState(null);
      navigate('/admin');
    } else {
      navigate(selectedCategory === 'all' ? '/' : `/category/${selectedCategory}`);
    }
  };

  const setActiveResourceModal = (r: Resource | null) => {
    setActiveResourceModalState(r);
    setIsNotFound(false);

    if (r) {
      navigate(`/product/${r.id}`);
    } else {
      if (isAdminOpen) {
        navigate('/admin');
      } else if (selectedCategory !== 'all') {
        navigate(`/category/${selectedCategory}`);
      } else {
        navigate('/');
      }
    }
  };

  const setIsContactModalOpen = (open: boolean) => {
    setIsContactModalOpenState(open);
    setIsNotFound(false);

    if (open) {
      navigate('/contact');
    } else {
      if (isAdminOpen) {
        navigate('/admin');
      } else if (selectedCategory !== 'all') {
        navigate(`/category/${selectedCategory}`);
      } else {
        navigate('/');
      }
    }
  };

  const setIsSearchModalOpen = (open: boolean) => {
    setIsSearchModalOpenState(open);
    setIsNotFound(false);

    if (open) {
      navigate('/search');
    } else {
      if (isAdminOpen) {
        navigate('/admin');
      } else if (selectedCategory !== 'all') {
        navigate(`/category/${selectedCategory}`);
      } else {
        navigate('/');
      }
    }
  };


  // Splash Loader visibility logic
  const [isSplashLoaderVisible, setIsSplashLoaderVisible] = useState<boolean>(() => {
    if (!splashSettings.enabled) return false;
    if (splashSettings.showOnlyFirstVisit) {
      const hasVisited = sessionStorage.getItem('OTL_VISITED');
      if (hasVisited) return false;
      sessionStorage.setItem('OTL_VISITED', 'true');
    }
    return true;
  });

  // Toast System
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Firestore Real-Time Subscriptions
  useEffect(() => {
    // 1. Inquiries subscription
    const qInquiries = query(collection(db, 'inquiries'));
    const unsubInquiries = onSnapshot(qInquiries, (snapshot) => {
      if (!snapshot.empty) {
        const inqs: Inquiry[] = [];
        snapshot.forEach(docSnap => {
          inqs.push({ id: docSnap.id, ...docSnap.data() } as Inquiry);
        });
        setInquiries(inqs);
      }
    }, (err) => console.warn('Firestore inquiries error:', err));

    // 2. Resources subscription
    const qResources = query(collection(db, 'resources'));
    const unsubResources = onSnapshot(qResources, (snapshot) => {
      const resList: Resource[] = [];
      if (!snapshot.empty) {
        snapshot.forEach(docSnap => {
          resList.push({ id: docSnap.id, ...docSnap.data() } as Resource);
        });
      }

      // Merge with initialResources so all categories have products
      const existingIds = new Set(resList.map(r => r.id));
      const missingInitial = initialResources.filter(r => !existingIds.has(r.id));

      if (missingInitial.length > 0) {
        missingInitial.forEach((res) => {
          setDoc(doc(db, 'resources', res.id), res, { merge: true }).catch(() => {});
        });
        setResources([...resList, ...missingInitial]);
      } else {
        setResources(resList);
      }
    }, (err) => {
      console.warn('Firestore resources error:', err);
      setResources(initialResources);
    });

    // 3. Global Settings subscription
    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.siteSettings) setSiteSettings(data.siteSettings);
        if (data.homepageBuilder) setHomepageBuilder(data.homepageBuilder);
        if (data.contactSettings) setContactSettings(data.contactSettings);
        if (data.floatingButtonsSettings) setFloatingButtonsSettings(data.floatingButtonsSettings);
        if (data.categories) setCategories(data.categories);
        if (data.ads) setAds(data.ads);
        if (data.seo) setSeo(data.seo);
        if (data.analytics) setAnalytics(data.analytics);
      }
    }, (err) => console.warn('Firestore settings error:', err));

    return () => {
      unsubInquiries();
      unsubResources();
      unsubSettings();
    };
  }, []);

  // Sync state to local storage as fallback
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_resources`, JSON.stringify(resources));
  }, [resources]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_categories`, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_settings`, JSON.stringify(siteSettings));
  }, [siteSettings]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_homepage`, JSON.stringify(homepageBuilder));
  }, [homepageBuilder]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_splash`, JSON.stringify(splashSettings));
  }, [splashSettings]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_mobilenav`, JSON.stringify(mobileNavSettings));
  }, [mobileNavSettings]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_ads`, JSON.stringify(ads));
  }, [ads]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_seo`, JSON.stringify(seo));
  }, [seo]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_analytics`, JSON.stringify(analytics));
  }, [analytics]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_inquiries`, JSON.stringify(inquiries));
  }, [inquiries]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_contact_settings`, JSON.stringify(contactSettings));
  }, [contactSettings]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_floating_buttons`, JSON.stringify(floatingButtonsSettings));
  }, [floatingButtonsSettings]);

  // Firestore Sync Helper for Settings
  const syncSettingsDoc = async (field: string, value: any) => {
    try {
      await setDoc(doc(db, 'settings', 'global'), { [field]: value }, { merge: true });
    } catch (err) {
      console.error(`Error updating Firestore settings.${field}:`, err);
    }
  };

  // Analytics helper functions
  const recordDownload = (resourceId: string) => {
    setResources(prev =>
      prev.map(r => (r.id === resourceId ? { ...r, downloadsCount: r.downloadsCount + 1 } : r))
    );
    setAnalytics(prev => {
      const next = { ...prev, totalDownloads: prev.totalDownloads + 1 };
      syncSettingsDoc('analytics', next);
      return next;
    });
    const target = resources.find(r => r.id === resourceId);
    if (target) {
      setDoc(doc(db, 'resources', resourceId), { downloadsCount: (target.downloadsCount || 0) + 1 }, { merge: true }).catch(() => {});
    }
  };

  const recordTelegramClick = (resourceId?: string) => {
    if (resourceId) {
      setResources(prev =>
        prev.map(r => (r.id === resourceId ? { ...r, telegramClicksCount: r.telegramClicksCount + 1 } : r))
      );
      const target = resources.find(r => r.id === resourceId);
      if (target) {
        setDoc(doc(db, 'resources', resourceId), { telegramClicksCount: (target.telegramClicksCount || 0) + 1 }, { merge: true }).catch(() => {});
      }
    }
    setAnalytics(prev => {
      const next = { ...prev, telegramClicks: prev.telegramClicks + 1 };
      syncSettingsDoc('analytics', next);
      return next;
    });
  };

  // Resource Actions
  const addResource = async (newResData: Omit<Resource, 'id' | 'createdAt' | 'downloadsCount' | 'telegramClicksCount'>) => {
    const id = `res-${Date.now()}`;
    const newRes: Resource = {
      ...newResData,
      id,
      createdAt: new Date().toISOString().split('T')[0],
      downloadsCount: 0,
      telegramClicksCount: 0
    };
    setResources(prev => [newRes, ...prev]);
    showToast(`Added new resource: ${newRes.title}`);
    try {
      await setDoc(doc(db, 'resources', id), newRes);
    } catch (err) {
      console.error('Error saving resource to Firestore:', err);
    }
  };

  const updateResource = async (id: string, updated: Partial<Resource>) => {
    setResources(prev => prev.map(r => (r.id === id ? { ...r, ...updated } : r)));
    showToast('Resource updated successfully!');
    try {
      await setDoc(doc(db, 'resources', id), updated, { merge: true });
    } catch (err) {
      console.error('Error updating resource in Firestore:', err);
    }
  };

  const deleteResource = async (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
    showToast('Resource deleted.');
    try {
      await deleteDoc(doc(db, 'resources', id));
    } catch (err) {
      console.error('Error deleting resource from Firestore:', err);
    }
  };

  const cloneResource = async (id: string) => {
    const found = resources.find(r => r.id === id);
    if (!found) return;
    const cloneId = `res-${Date.now()}`;
    const clone: Resource = {
      ...found,
      id: cloneId,
      title: `${found.title} (Copy)`,
      createdAt: new Date().toISOString().split('T')[0],
      downloadsCount: 0,
      telegramClicksCount: 0
    };
    setResources(prev => [clone, ...prev]);
    showToast(`Cloned resource: ${clone.title}`);
    try {
      await setDoc(doc(db, 'resources', cloneId), clone);
    } catch (err) {
      console.error('Error cloning resource to Firestore:', err);
    }
  };

  // Category Actions
  const updateCategory = (id: ResourceCategory, updated: Partial<CategoryItem>) => {
    setCategories(prev => {
      const next = prev.map(c => (c.id === id ? { ...c, ...updated } : c));
      syncSettingsDoc('categories', next);
      return next;
    });
    showToast('Category updated.');
  };

  const addCategory = (cat: CategoryItem) => {
    setCategories(prev => {
      const next = [...prev, cat];
      syncSettingsDoc('categories', next);
      return next;
    });
    showToast(`Added category: ${cat.name}`);
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => {
      const next = prev.filter(c => c.id !== id);
      syncSettingsDoc('categories', next);
      return next;
    });
    showToast('Category removed.');
  };

  // Settings Actions
  const updateSiteSettings = (settings: Partial<SiteSettings>) => {
    setSiteSettings(prev => {
      const next = { ...prev, ...settings };
      syncSettingsDoc('siteSettings', next);
      return next;
    });
    showToast('Website Settings Saved!');
  };

  const updateHomepageBuilder = (builder: Partial<HomepageBuilderSettings>) => {
    setHomepageBuilder(prev => {
      const next = { ...prev, ...builder };
      syncSettingsDoc('homepageBuilder', next);
      return next;
    });
    showToast('Homepage Layout Saved!');
  };

  const updateSplashSettings = (splash: Partial<SplashLoaderSettings>) => {
    setSplashSettings(prev => {
      const next = { ...prev, ...splash };
      syncSettingsDoc('splashSettings', next);
      return next;
    });
    showToast('Splash Loader Settings Saved!');
  };

  const updateMobileNavSettings = (mobileNav: Partial<MobileNavSettings>) => {
    setMobileNavSettings(prev => {
      const next = { ...prev, ...mobileNav };
      syncSettingsDoc('mobileNavSettings', next);
      return next;
    });
    showToast('Mobile Navigation Settings Saved!');
  };

  const updateAds = (newAds: Advertisement[]) => {
    setAds(newAds);
    syncSettingsDoc('ads', newAds);
    showToast('Advertisements Saved!');
  };

  const updateSEO = (newSeo: Partial<SEOConfig>) => {
    setSeo(prev => {
      const next = { ...prev, ...newSeo };
      syncSettingsDoc('seo', next);
      return next;
    });
    showToast('SEO Configuration Saved!');
  };

  // Inquiry & Contact Manager Handlers (Chats / User inputs)
  const addInquiry = async (inquiryData: Omit<Inquiry, 'id' | 'createdAt' | 'status'>) => {
    const id = `inq-${Date.now()}`;
    const newInquiry: Inquiry = {
      ...inquiryData,
      id,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'unread'
    };
    setInquiries(prev => [newInquiry, ...prev]);
    showToast('Your message has been sent and saved to Firebase!');
    try {
      await setDoc(doc(db, 'inquiries', id), newInquiry);
    } catch (err) {
      console.error('Error saving inquiry/message to Firestore:', err);
    }
  };

  const deleteInquiry = async (id: string) => {
    setInquiries(prev => prev.filter(i => i.id !== id));
    showToast('Inquiry deleted.');
    try {
      await deleteDoc(doc(db, 'inquiries', id));
    } catch (err) {
      console.error('Error deleting inquiry from Firestore:', err);
    }
  };

  const updateInquiryStatus = async (id: string, status: 'unread' | 'read' | 'replied') => {
    setInquiries(prev => prev.map(i => (i.id === id ? { ...i, status } : i)));
    try {
      await setDoc(doc(db, 'inquiries', id), { status }, { merge: true });
    } catch (err) {
      console.error('Error updating inquiry status in Firestore:', err);
    }
  };

  const updateContactSettings = (settings: Partial<ContactPageSettings>) => {
    setContactSettings(prev => {
      const next = { ...prev, ...settings };
      syncSettingsDoc('contactSettings', next);
      return next;
    });
    showToast('Contact Page Settings Updated!');
  };

  const addSocialButton = (btn: Omit<SocialButton, 'id'>) => {
    const newBtn: SocialButton = {
      ...btn,
      id: `soc-${Date.now()}`
    };
    setContactSettings(prev => {
      const next = { ...prev, socialButtons: [...prev.socialButtons, newBtn] };
      syncSettingsDoc('contactSettings', next);
      return next;
    });
    showToast(`Added ${newBtn.title} social button!`);
  };

  const updateSocialButton = (id: string, updated: Partial<SocialButton>) => {
    setContactSettings(prev => {
      const next = {
        ...prev,
        socialButtons: prev.socialButtons.map(b => (b.id === id ? { ...b, ...updated } : b))
      };
      syncSettingsDoc('contactSettings', next);
      return next;
    });
    showToast('Social button updated.');
  };

  const deleteSocialButton = (id: string) => {
    setContactSettings(prev => {
      const next = {
        ...prev,
        socialButtons: prev.socialButtons.filter(b => b.id !== id)
      };
      syncSettingsDoc('contactSettings', next);
      return next;
    });
    showToast('Social button removed.');
  };

  const addFaq = (faq: Omit<FAQItem, 'id'>) => {
    const newFaq: FAQItem = {
      ...faq,
      id: `faq-${Date.now()}`
    };
    setContactSettings(prev => {
      const next = { ...prev, faqs: [...prev.faqs, newFaq] };
      syncSettingsDoc('contactSettings', next);
      return next;
    });
    showToast('New FAQ added.');
  };

  const updateFaq = (id: string, updated: Partial<FAQItem>) => {
    setContactSettings(prev => {
      const next = {
        ...prev,
        faqs: prev.faqs.map(f => (f.id === id ? { ...f, ...updated } : f))
      };
      syncSettingsDoc('contactSettings', next);
      return next;
    });
    showToast('FAQ updated.');
  };

  const deleteFaq = (id: string) => {
    setContactSettings(prev => {
      const next = {
        ...prev,
        faqs: prev.faqs.filter(f => f.id !== id)
      };
      syncSettingsDoc('contactSettings', next);
      return next;
    });
    showToast('FAQ removed.');
  };

  // Floating Buttons Actions
  const updateFloatingButtonsSettings = (settings: Partial<FloatingButtonsSettings>) => {
    setFloatingButtonsSettings(prev => {
      const next = { ...prev, ...settings };
      syncSettingsDoc('floatingButtonsSettings', next);
      return next;
    });
    showToast('Floating Buttons Settings Updated!');
  };

  const addFloatingButton = (btn: Omit<FloatingButton, 'id' | 'order'>) => {
    setFloatingButtonsSettings(prev => {
      const maxOrder = prev.buttons.length > 0 ? Math.max(...prev.buttons.map(b => b.order || 0)) : 0;
      const newBtn: FloatingButton = {
        ...btn,
        id: `fb-${Date.now()}`,
        order: maxOrder + 1
      };
      const next = {
        ...prev,
        buttons: [...prev.buttons, newBtn]
      };
      syncSettingsDoc('floatingButtonsSettings', next);
      return next;
    });
    showToast('New floating button added!');
  };

  const updateFloatingButton = (id: string, updated: Partial<FloatingButton>) => {
    setFloatingButtonsSettings(prev => {
      const next = {
        ...prev,
        buttons: prev.buttons.map(b => (b.id === id ? { ...b, ...updated } : b))
      };
      syncSettingsDoc('floatingButtonsSettings', next);
      return next;
    });
    showToast('Floating button updated!');
  };

  const deleteFloatingButton = (id: string) => {
    setFloatingButtonsSettings(prev => {
      const next = {
        ...prev,
        buttons: prev.buttons.filter(b => b.id !== id)
      };
      syncSettingsDoc('floatingButtonsSettings', next);
      return next;
    });
    showToast('Floating button removed!');
  };

  const moveFloatingButton = (id: string, direction: 'up' | 'down') => {
    setFloatingButtonsSettings(prev => {
      const sorted = [...prev.buttons].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex(b => b.id === id);
      if (index === -1) return prev;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= sorted.length) return prev;

      // Swap order properties
      const tempOrder = sorted[index].order;
      sorted[index].order = sorted[targetIndex].order;
      sorted[targetIndex].order = tempOrder;

      const next = {
        ...prev,
        buttons: sorted
      };
      syncSettingsDoc('floatingButtonsSettings', next);
      return next;
    });
    showToast(`Moved button ${direction === 'up' ? 'towards top' : 'towards bottom'}`);
  };

  const resetToDefaults = () => {
    setResources(initialResources);
    setCategories(initialCategories);
    setSiteSettings(initialSiteSettings);
    setHomepageBuilder(initialHomepageBuilder);
    setSplashSettings(initialSplashSettings);
    setMobileNavSettings(initialMobileNavSettings);
    setAds(initialAds);
    setSeo(initialSEO);
    setAnalytics(initialAnalytics);
    setInquiries(initialInquiries);
    setContactSettings(initialContactSettings);
    setFloatingButtonsSettings(initialFloatingButtonsSettings);

    // Push initial resources & configurations to Firestore
    initialResources.forEach((res) => {
      setDoc(doc(db, 'resources', res.id), res, { merge: true }).catch(() => {});
    });
    syncSettingsDoc('categories', initialCategories);
    syncSettingsDoc('siteSettings', initialSiteSettings);
    syncSettingsDoc('homepageBuilder', initialHomepageBuilder);
    syncSettingsDoc('splashSettings', initialSplashSettings);
    syncSettingsDoc('mobileNavSettings', initialMobileNavSettings);
    syncSettingsDoc('ads', initialAds);
    syncSettingsDoc('seo', initialSEO);
    syncSettingsDoc('analytics', initialAnalytics);
    syncSettingsDoc('contactSettings', initialContactSettings);
    syncSettingsDoc('floatingButtonsSettings', initialFloatingButtonsSettings);

    showToast('All settings & demo products reset to default content!');
  };

  const triggerSplashLoaderPreview = () => {
    setIsSplashLoaderVisible(true);
  };

  return (
    <AppContext.Provider
      value={{
        resources,
        categories,
        siteSettings,
        homepageBuilder,
        splashSettings,
        mobileNavSettings,
        ads,
        seo,
        analytics,
        inquiries,
        contactSettings,
        floatingButtonsSettings,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        activeTag,
        setActiveTag,
        sortBy,
        setSortBy,
        activeResourceModal,
        setActiveResourceModal,
        isSearchModalOpen,
        setIsSearchModalOpen,
        isContactModalOpen,
        setIsContactModalOpen,
        telegramDownloadModalResource,
        setTelegramDownloadModalResource,
        isAdminOpen,
        setIsAdminOpen,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        toastMessage,
        showToast,
        isNotFound,
        recordDownload,
        recordTelegramClick,
        addResource,
        updateResource,
        deleteResource,
        cloneResource,
        updateCategory,
        addCategory,
        deleteCategory,
        updateSiteSettings,
        updateHomepageBuilder,
        updateSplashSettings,
        updateMobileNavSettings,
        updateAds,
        updateSEO,
        addInquiry,
        deleteInquiry,
        updateInquiryStatus,
        updateContactSettings,
        addSocialButton,
        updateSocialButton,
        deleteSocialButton,
        addFaq,
        updateFaq,
        deleteFaq,
        updateFloatingButtonsSettings,
        addFloatingButton,
        updateFloatingButton,
        deleteFloatingButton,
        moveFloatingButton,
        resetToDefaults,
        triggerSplashLoaderPreview,
        isSplashLoaderVisible,
        setIsSplashLoaderVisible
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
