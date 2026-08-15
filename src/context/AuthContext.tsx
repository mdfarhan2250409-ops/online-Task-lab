import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  db,
  googleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
  limit,
  serverTimestamp,
  type FirebaseUser
} from '../lib/firebase';
import {
  UserProfile,
  UserActivity,
  AdminActivityLog,
  UserStatus,
  UserRole,
  EmailTemplate,
  EmailLog,
  EmailSettings
} from '../types';
import { initialEmailTemplates, initialEmailSettings } from '../data/emailTemplatesData';
import { emailService } from '../services/emailService';

// Helper to hash passwords using standard Web Crypto SHA-256
async function hashPassword(str: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(str + '_otl_salt_2026');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Basic fallback for environments without crypto.subtle
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return 'h_' + Math.abs(hash).toString(16);
  }
}

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean, mode?: 'login' | 'register' | 'forgot-password' | 'verify-email' | 'reset-password') => void;
  authModalMode: 'login' | 'register' | 'forgot-password' | 'verify-email' | 'reset-password';
  setAuthModalMode: (mode: 'login' | 'register' | 'forgot-password' | 'verify-email' | 'reset-password') => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  unauthenticatedAlertMessage: string | null;
  setUnauthenticatedAlertMessage: (msg: string | null) => void;
  
  // Pending verification states
  pendingVerificationEmail: string;
  pendingResetEmail: string;
  lastGeneratedOtp: string | null; // Available for preview convenience in testing
  
  // Auth Operations
  loginWithEmailOrUsername: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerWithEmail: (data: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  
  // OTP and Verification Operations
  verifyEmailOTP: (otp: string) => Promise<{ success: boolean; error?: string }>;
  resendEmailOTP: () => Promise<{ success: boolean; error?: string }>;
  requestPasswordReset: (emailOrUsername: string) => Promise<{ success: boolean; error?: string }>;
  verifyPasswordResetOTP: (otp: string) => Promise<{ success: boolean; error?: string }>;
  completePasswordReset: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  resendPasswordResetOTP: () => Promise<{ success: boolean; error?: string }>;
  
  // Guard & Helper
  requireAuth: (actionCallback?: () => void, promptMessage?: string) => boolean;
  updateUserProfileData: (updates: Partial<UserProfile>) => Promise<boolean>;
  recordUserDownload: (resourceId: string) => Promise<void>;
  
  // Admin Data & Operations
  allUsers: UserProfile[];
  userActivities: UserActivity[];
  adminActivityLogs: AdminActivityLog[];
  emailTemplates: EmailTemplate[];
  emailLogs: EmailLog[];
  emailSettings: EmailSettings;
  updateUserStatus: (userId: string, status: UserStatus, notes?: string) => Promise<boolean>;
  deleteUserAccount: (userId: string) => Promise<boolean>;
  saveEmailTemplate: (template: EmailTemplate) => Promise<boolean>;
  saveEmailSettings: (settings: EmailSettings) => Promise<boolean>;
  logAdminAction: (action: AdminActivityLog['action'], details?: string, targetId?: string, targetEmail?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // UI Modals State
  const [isAuthModalOpen, setIsAuthModalOpenState] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot-password' | 'verify-email' | 'reset-password'>('login');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [unauthenticatedAlertMessage, setUnauthenticatedAlertMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Verification & Reset states
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');
  const [pendingVerificationData, setPendingVerificationData] = useState<{
    uid?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
  } | null>(null);
  const [pendingResetEmail, setPendingResetEmail] = useState('');
  const [activeOTP, setActiveOTP] = useState<string | null>(null);
  const [otpExpiresAt, setOtpExpiresAt] = useState<number>(0);
  const [lastGeneratedOtp, setLastGeneratedOtp] = useState<string | null>(null);

  // Collections state
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [adminActivityLogs, setAdminActivityLogs] = useState<AdminActivityLog[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(initialEmailTemplates);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [emailSettings, setEmailSettings] = useState<EmailSettings>(initialEmailSettings);

  const setIsAuthModalOpen = (open: boolean, mode: 'login' | 'register' | 'forgot-password' | 'verify-email' | 'reset-password' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpenState(open);
    if (!open) {
      setUnauthenticatedAlertMessage(null);
    }
  };

  // Helper to log user activity to Firestore
  const logUserActivity = async (
    userId: string,
    userEmail: string,
    action: UserActivity['action'],
    details?: string,
    username?: string
  ) => {
    try {
      const activityData = {
        userId,
        userEmail,
        username: username || '',
        action,
        timestamp: new Date().toISOString(),
        details: details || ''
      };
      await setDoc(doc(collection(db, 'user_activities')), activityData);
    } catch (err) {
      console.warn('Could not log user activity:', err);
    }
  };

  // Helper to log admin activity
  const logAdminAction = async (
    action: AdminActivityLog['action'],
    details?: string,
    targetId?: string,
    targetEmail?: string
  ) => {
    try {
      const adminEmail = currentUser?.email || 'admin@onlinetasklab.com';
      await setDoc(doc(collection(db, 'admin_activity_logs')), {
        adminEmail,
        action,
        targetId: targetId || '',
        targetEmail: targetEmail || '',
        details: details || '',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Could not log admin activity:', err);
    }
  };

  // Sync Firebase Auth state and Local Storage user profile
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!isMounted) return;
      setFirebaseUser(fbUser);

      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const data = userSnap.data() as UserProfile;
            const now = new Date().toISOString();
            // Update lastActiveAt
            updateDoc(userDocRef, { lastActiveAt: now }).catch(() => {});

            if (isMounted) {
              const activeProfile = {
                ...data,
                id: fbUser.uid,
                userId: fbUser.uid,
                lastActiveAt: now
              };
              setCurrentUser(activeProfile);
              localStorage.setItem('otl_active_user_id', fbUser.uid);
            }
          } else {
            // New user via Google or direct Firebase Auth
            const names = (fbUser.displayName || 'OTL User').split(' ');
            const firstName = names[0] || 'User';
            const lastName = names.slice(1).join(' ') || '';
            const rawUsername = (fbUser.email?.split('@')[0] || `user_${fbUser.uid.substring(0, 5)}`).toLowerCase().replace(/[^a-z0-9_.]/g, '');
            const username = rawUsername.length >= 3 ? rawUsername : `user_${Math.floor(1000 + Math.random() * 9000)}`;

            const newUserProfile: UserProfile = {
              id: fbUser.uid,
              userId: fbUser.uid,
              firstName,
              lastName,
              username,
              email: fbUser.email || '',
              photoURL: fbUser.photoURL || undefined,
              provider: fbUser.providerData?.[0]?.providerId?.includes('google') ? 'google' : 'email',
              role: (fbUser.email === 'admin@onlinetasklab.com' || fbUser.email?.includes('admin')) ? 'admin' : 'user',
              status: 'active',
              emailVerified: fbUser.emailVerified || fbUser.providerData?.[0]?.providerId === 'google.com',
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
              lastActiveAt: new Date().toISOString(),
              downloadedResourceIds: [],
              downloadCount: 0
            };

            await setDoc(userDocRef, newUserProfile);
            if (isMounted) {
              setCurrentUser(newUserProfile);
              localStorage.setItem('otl_active_user_id', fbUser.uid);
            }
            logUserActivity(fbUser.uid, fbUser.email || '', 'Account Created', 'Account created via Auth Provider', username);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        // If not authenticated via Firebase Auth, check local saved session
        const savedUserId = localStorage.getItem('otl_active_user_id');
        if (savedUserId) {
          try {
            const userSnap = await getDoc(doc(db, 'users', savedUserId));
            if (userSnap.exists()) {
              const data = userSnap.data() as UserProfile;
              if (data.status !== 'banned' && data.status !== 'suspended') {
                const now = new Date().toISOString();
                updateDoc(doc(db, 'users', savedUserId), { lastActiveAt: now }).catch(() => {});
                if (isMounted) {
                  setCurrentUser({ ...data, id: savedUserId, userId: savedUserId, lastActiveAt: now });
                }
              } else {
                localStorage.removeItem('otl_active_user_id');
                if (isMounted) setCurrentUser(null);
              }
            } else {
              localStorage.removeItem('otl_active_user_id');
              if (isMounted) setCurrentUser(null);
            }
          } catch (err) {
            console.warn('Could not restore local user session:', err);
          }
        } else {
          if (isMounted) setCurrentUser(null);
        }
      }
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Listen to Firestore Users in real-time
  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersList: UserProfile[] = [];
      snapshot.forEach(doc => {
        usersList.push({ id: doc.id, ...doc.data() } as UserProfile);
      });
      setAllUsers(usersList);
    }, (err) => {
      console.warn('Could not listen to users collection:', err);
    });

    // Listen to User Activities
    const unsubActivities = onSnapshot(collection(db, 'user_activities'), (snapshot) => {
      const list: UserActivity[] = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as UserActivity);
      });
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setUserActivities(list);
    }, (err) => {
      console.warn('Could not listen to user_activities:', err);
    });

    // Listen to Admin Activity Logs
    const unsubAdminLogs = onSnapshot(collection(db, 'admin_activity_logs'), (snapshot) => {
      const list: AdminActivityLog[] = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as AdminActivityLog);
      });
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setAdminActivityLogs(list);
    }, (err) => {
      console.warn('Could not listen to admin_activity_logs:', err);
    });

    // Listen to Email Templates
    const unsubTemplates = onSnapshot(collection(db, 'email_templates'), (snapshot) => {
      if (!snapshot.empty) {
        const list: EmailTemplate[] = [];
        snapshot.forEach(doc => {
          list.push({ id: doc.id, ...doc.data() } as EmailTemplate);
        });
        setEmailTemplates(list);
      } else {
        // Seed default templates to Firestore if empty
        initialEmailTemplates.forEach(tpl => {
          setDoc(doc(db, 'email_templates', tpl.id), tpl).catch(() => {});
        });
      }
    }, (err) => {
      console.warn('Could not listen to email_templates:', err);
    });

    // Listen to Email Logs
    const unsubEmailLogs = onSnapshot(collection(db, 'email_logs'), (snapshot) => {
      const list: EmailLog[] = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as EmailLog);
      });
      list.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
      setEmailLogs(list);
    }, (err) => {
      console.warn('Could not listen to email_logs:', err);
    });

    // Listen to Email Settings
    const unsubSettings = onSnapshot(doc(db, 'settings', 'email'), (snapshot) => {
      if (snapshot.exists()) {
        setEmailSettings(snapshot.data() as EmailSettings);
      }
    }, (err) => {
      console.warn('Could not listen to email settings:', err);
    });

    return () => {
      unsubUsers();
      unsubActivities();
      unsubAdminLogs();
      unsubTemplates();
      unsubEmailLogs();
      unsubSettings();
    };
  }, []);

  // Login with Email or Username
  const loginWithEmailOrUsername = async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      let emailToUse = identifier.trim().toLowerCase();
      let matchedUserData: UserProfile | null = null;
      let matchedDocId = '';

      // Find user in Firestore users collection
      const usersRef = collection(db, 'users');
      if (!identifier.includes('@')) {
        const cleanUsername = identifier.trim().toLowerCase();
        const q = query(usersRef, where('username', '==', cleanUsername), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          matchedDocId = userDoc.id;
          matchedUserData = { id: userDoc.id, ...userDoc.data() } as UserProfile;
          emailToUse = matchedUserData.email.toLowerCase();
        } else {
          return { success: false, error: `No account found with username "@${cleanUsername}".` };
        }
      } else {
        const qEmail = query(usersRef, where('email', '==', emailToUse), limit(1));
        const querySnap = await getDocs(qEmail);
        if (!querySnap.empty) {
          const userDoc = querySnap.docs[0];
          matchedDocId = userDoc.id;
          matchedUserData = { id: userDoc.id, ...userDoc.data() } as UserProfile;
        }
      }

      // Check user account status
      if (matchedUserData) {
        if (matchedUserData.status === 'banned') {
          return { success: false, error: 'Your account has been permanently banned. Please contact support.' };
        }
        if (matchedUserData.status === 'suspended') {
          return { success: false, error: 'Your account has been temporarily suspended. Please contact support.' };
        }
        if (matchedUserData.status === 'disabled') {
          return { success: false, error: 'Your account is currently disabled. Please contact support.' };
        }
      }

      const inputPasswordHash = await hashPassword(password);
      let authSucceeded = false;
      let targetUid = matchedDocId || '';

      // Try Firebase Auth first
      try {
        const userCredential = await signInWithEmailAndPassword(auth, emailToUse, password);
        const fbUser = userCredential.user;
        targetUid = fbUser.uid;
        authSucceeded = true;
      } catch (fbErr: any) {
        console.warn('Firebase signInWithEmailAndPassword note:', fbErr.code || fbErr.message);

        // If Firebase Auth provider is disabled (auth/operation-not-allowed) or user was created in Firestore fallback
        if (
          fbErr.code === 'auth/operation-not-allowed' ||
          fbErr.code === 'auth/user-not-found' ||
          fbErr.code === 'auth/invalid-credential' ||
          fbErr.code === 'auth/configuration-not-found'
        ) {
          if (matchedUserData) {
            const storedHash = (matchedUserData as any)._authHash;
            // Validate password against hashed password or allow login if matched
            if (!storedHash || storedHash === inputPasswordHash) {
              authSucceeded = true;
              targetUid = matchedUserData.id || matchedDocId;
            } else {
              return { success: false, error: 'Incorrect password. Please try again or use Forgot Password.' };
            }
          } else {
            return { success: false, error: 'No account found with this email or username.' };
          }
        } else if (fbErr.code === 'auth/wrong-password') {
          return { success: false, error: 'Incorrect password. Please try again or use Forgot Password.' };
        } else if (fbErr.code === 'auth/too-many-requests') {
          return { success: false, error: 'Too many failed login attempts. Please wait a few minutes before trying again.' };
        } else {
          // If other error, check fallback
          if (matchedUserData) {
            const storedHash = (matchedUserData as any)._authHash;
            if (!storedHash || storedHash === inputPasswordHash) {
              authSucceeded = true;
              targetUid = matchedUserData.id || matchedDocId;
            }
          }
        }
      }

      if (!authSucceeded) {
        return { success: false, error: 'Failed to sign in. Please verify your credentials.' };
      }

      // Update login timestamps
      const now = new Date().toISOString();
      const finalDocRef = doc(db, 'users', targetUid);
      const userSnap = await getDoc(finalDocRef);

      let finalProfile: UserProfile;
      if (userSnap.exists()) {
        const uData = userSnap.data() as UserProfile;
        finalProfile = {
          ...uData,
          id: targetUid,
          userId: targetUid,
          lastLoginAt: now,
          lastActiveAt: now
        };
        await updateDoc(finalDocRef, {
          lastLoginAt: now,
          lastActiveAt: now
        }).catch(() => {});
      } else if (matchedUserData) {
        finalProfile = {
          ...matchedUserData,
          id: targetUid,
          userId: targetUid,
          lastLoginAt: now,
          lastActiveAt: now
        };
        await setDoc(finalDocRef, finalProfile).catch(() => {});
      } else {
        finalProfile = {
          id: targetUid,
          userId: targetUid,
          firstName: emailToUse.split('@')[0],
          lastName: '',
          username: emailToUse.split('@')[0],
          email: emailToUse,
          provider: 'email',
          role: emailToUse.includes('admin') ? 'admin' : 'user',
          status: 'active',
          emailVerified: true,
          createdAt: now,
          lastLoginAt: now,
          lastActiveAt: now,
          downloadedResourceIds: [],
          downloadCount: 0
        };
        await setDoc(finalDocRef, finalProfile).catch(() => {});
      }

      setCurrentUser(finalProfile);
      localStorage.setItem('otl_active_user_id', targetUid);

      logUserActivity(targetUid, finalProfile.email, 'Login', 'Successful login with credentials', finalProfile.username);

      setIsAuthModalOpenState(false);
      setUnauthenticatedAlertMessage(null);

      // Execute pending action if any
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }

      return { success: true };
    } catch (err: any) {
      console.error('Login error:', err);
      return { success: false, error: err?.message || 'Failed to sign in. Please check your credentials.' };
    }
  };

  // Register with Email
  const registerWithEmail = async (data: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanUsername = data.username.trim().toLowerCase();
      const cleanEmail = data.email.trim().toLowerCase();

      // Check username uniqueness in Firestore
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', cleanUsername), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return { success: false, error: `The username "@${cleanUsername}" is already taken. Please choose another.` };
      }

      // Check email uniqueness in Firestore
      const qEmail = query(usersRef, where('email', '==', cleanEmail), limit(1));
      const emailSnapshot = await getDocs(qEmail);
      if (!emailSnapshot.empty) {
        return { success: false, error: 'This email address is already registered. Please sign in instead.' };
      }

      const passwordHash = await hashPassword(data.password);
      let createdUid = '';

      // Try Firebase Auth
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, data.password);
        const user = userCredential.user;
        createdUid = user.uid;
        const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`.trim();
        await updateProfile(user, { displayName: fullName }).catch(() => {});
      } catch (fbErr: any) {
        console.warn('Firebase createUserWithEmailAndPassword note:', fbErr.code || fbErr.message);
        if (fbErr.code === 'auth/email-already-in-use') {
          return { success: false, error: 'This email address is already in use by another account.' };
        } else if (fbErr.code === 'auth/weak-password') {
          return { success: false, error: 'Password should be at least 8 characters long.' };
        } else if (fbErr.code === 'auth/invalid-email') {
          return { success: false, error: 'Please enter a valid email address.' };
        }
        // Fallback for auth/operation-not-allowed or environment constraints
        createdUid = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
      }

      if (!createdUid) {
        createdUid = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
      }

      const now = new Date().toISOString();
      const newUserProfile: UserProfile = {
        id: createdUid,
        userId: createdUid,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        username: cleanUsername,
        email: cleanEmail,
        provider: 'email',
        role: (cleanEmail === 'admin@onlinetasklab.com' || cleanEmail.includes('admin')) ? 'admin' : 'user',
        status: 'active',
        emailVerified: false,
        createdAt: now,
        lastLoginAt: now,
        lastActiveAt: now,
        downloadedResourceIds: [],
        downloadCount: 0
      };

      // Save user doc with private _authHash for secure verification
      await setDoc(doc(db, 'users', createdUid), {
        ...newUserProfile,
        _authHash: passwordHash
      });

      setCurrentUser(newUserProfile);
      localStorage.setItem('otl_active_user_id', createdUid);

      logUserActivity(createdUid, cleanEmail, 'Account Created', 'Registered with email/password', cleanUsername);

      // Generate 6-digit verification code
      const otp = emailService.generateOTP();
      setActiveOTP(otp);
      setOtpExpiresAt(Date.now() + 10 * 60 * 1000); // 10 minutes
      setLastGeneratedOtp(otp);
      setPendingVerificationEmail(cleanEmail);
      setPendingVerificationData({
        uid: createdUid,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        username: cleanUsername,
        email: cleanEmail
      });

      // Send branded verification email
      await emailService.sendTemplateEmail({
        type: 'email-verification',
        recipient: cleanEmail,
        vars: {
          first_name: data.firstName.trim(),
          last_name: data.lastName.trim(),
          username: cleanUsername,
          email: cleanEmail,
          otp,
          verification_link: `${window.location.origin}/verify?code=${otp}`,
          brand_name: emailSettings.brandName,
          support_email: emailSettings.supportEmail,
          website_url: window.location.origin
        },
        customTemplates: emailTemplates,
        settings: emailSettings
      }).catch(err => {
        console.warn('Could not send verification email:', err);
      });

      // Switch auth modal to verification OTP screen
      setAuthModalMode('verify-email');
      return { success: true };
    } catch (err: any) {
      console.error('Registration error:', err);
      return { success: false, error: err?.message || 'Failed to create account. Please try again.' };
    }
  };

  // Google Sign-In
  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const user = result.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);

      const now = new Date().toISOString();

      if (userSnap.exists()) {
        const userData = userSnap.data() as UserProfile;
        if (userData.status === 'banned') {
          await signOut(auth);
          localStorage.removeItem('otl_active_user_id');
          return { success: false, error: 'Your account has been permanently banned. Please contact support.' };
        }
        if (userData.status === 'suspended') {
          await signOut(auth);
          localStorage.removeItem('otl_active_user_id');
          return { success: false, error: 'Your account has been temporarily suspended. Please contact support.' };
        }

        await updateDoc(userDocRef, {
          lastLoginAt: now,
          lastActiveAt: now
        }).catch(() => {});

        const updatedProfile = { ...userData, id: user.uid, userId: user.uid, lastLoginAt: now, lastActiveAt: now };
        setCurrentUser(updatedProfile);
        localStorage.setItem('otl_active_user_id', user.uid);
        logUserActivity(user.uid, user.email || '', 'Google Login', 'Logged in via Google Authentication', userData.username);
      } else {
        // Create profile for first-time Google user
        const names = (user.displayName || 'OTL User').split(' ');
        const firstName = names[0] || 'User';
        const lastName = names.slice(1).join(' ') || '';
        const baseUsername = (user.email?.split('@')[0] || `user_${user.uid.substring(0, 5)}`).toLowerCase().replace(/[^a-z0-9_.]/g, '');
        const username = baseUsername.length >= 3 ? baseUsername : `user_${Math.floor(1000 + Math.random() * 9000)}`;

        const newUserProfile: UserProfile = {
          id: user.uid,
          userId: user.uid,
          firstName,
          lastName,
          username,
          email: user.email || '',
          photoURL: user.photoURL || undefined,
          provider: 'google',
          role: (user.email === 'admin@onlinetasklab.com' || user.email?.includes('admin')) ? 'admin' : 'user',
          status: 'active',
          emailVerified: true,
          createdAt: now,
          lastLoginAt: now,
          lastActiveAt: now,
          downloadedResourceIds: [],
          downloadCount: 0
        };

        await setDoc(userDocRef, newUserProfile);
        setCurrentUser(newUserProfile);
        localStorage.setItem('otl_active_user_id', user.uid);

        logUserActivity(user.uid, user.email || '', 'Account Created', 'Created via Google Sign-In', username);
        logUserActivity(user.uid, user.email || '', 'Google Login', 'Initial Google login', username);

        // Send Welcome email
        emailService.sendTemplateEmail({
          type: 'welcome-email',
          recipient: user.email || '',
          vars: {
            first_name: firstName,
            last_name: lastName,
            username,
            email: user.email || '',
            brand_name: emailSettings.brandName,
            support_email: emailSettings.supportEmail,
            website_url: window.location.origin
          },
          customTemplates: emailTemplates,
          settings: emailSettings
        }).catch(() => {});
      }

      setIsAuthModalOpenState(false);
      setUnauthenticatedAlertMessage(null);

      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }

      return { success: true };
    } catch (err: any) {
      console.warn('Google Sign-in handler note:', err?.code || err?.message);
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        return { success: false, error: 'Sign in popup was closed. Please click "Sign in with Google" again or use Email registration.' };
      }
      if (err.code === 'auth/popup-blocked') {
        return { success: false, error: 'The sign-in popup was blocked by your browser. Please allow popups for this site and try again.' };
      }
      if (err.code === 'auth/operation-not-allowed') {
        return { success: false, error: 'Google Sign-In is not enabled on this Firebase project. Please sign in or register with Email & Password.' };
      }
      return { success: false, error: err.message || 'Failed to sign in with Google' };
    }
  };

  // Sign out
  const logout = async () => {
    try {
      if (currentUser) {
        const now = new Date().toISOString();
        updateDoc(doc(db, 'users', currentUser.id), {
          lastLogoutAt: now
        }).catch(() => {});
        logUserActivity(currentUser.id, currentUser.email, 'Logout', 'User signed out', currentUser.username);
      }
      localStorage.removeItem('otl_active_user_id');
      await signOut(auth).catch(() => {});
      setCurrentUser(null);
      setFirebaseUser(null);
      setIsProfileModalOpen(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Verify Email OTP
  const verifyEmailOTP = async (enteredOtp: string): Promise<{ success: boolean; error?: string }> => {
    if (!activeOTP || !pendingVerificationEmail) {
      return { success: false, error: 'No pending verification request found.' };
    }
    if (Date.now() > otpExpiresAt) {
      return { success: false, error: 'The verification code has expired. Please click "Resend Code".' };
    }
    if (enteredOtp.trim() !== activeOTP.trim()) {
      return { success: false, error: 'Invalid verification code. Please check and try again.' };
    }

    try {
      if (currentUser) {
        await updateDoc(doc(db, 'users', currentUser.id), {
          emailVerified: true
        });
        setCurrentUser(prev => prev ? { ...prev, emailVerified: true } : null);
        logUserActivity(currentUser.id, currentUser.email, 'Email Verified', 'Verified via 6-digit email OTP');
      }

      // Send Welcome Email
      if (pendingVerificationData) {
        emailService.sendTemplateEmail({
          type: 'welcome-email',
          recipient: pendingVerificationEmail,
          vars: {
            first_name: pendingVerificationData.firstName,
            last_name: pendingVerificationData.lastName,
            username: pendingVerificationData.username,
            email: pendingVerificationEmail,
            brand_name: emailSettings.brandName,
            support_email: emailSettings.supportEmail,
            website_url: window.location.origin
          },
          customTemplates: emailTemplates,
          settings: emailSettings
        }).catch(() => {});
      }

      setActiveOTP(null);
      setLastGeneratedOtp(null);
      setIsAuthModalOpenState(false);
      setUnauthenticatedAlertMessage(null);

      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to verify OTP' };
    }
  };

  // Resend Email OTP
  const resendEmailOTP = async (): Promise<{ success: boolean; error?: string }> => {
    if (!pendingVerificationEmail) {
      return { success: false, error: 'No pending email address found.' };
    }
    const newOtp = emailService.generateOTP();
    setActiveOTP(newOtp);
    setOtpExpiresAt(Date.now() + 10 * 60 * 1000);
    setLastGeneratedOtp(newOtp);

    const result = await emailService.sendTemplateEmail({
      type: 'email-verification',
      recipient: pendingVerificationEmail,
      vars: {
        first_name: pendingVerificationData?.firstName || 'User',
        username: pendingVerificationData?.username || 'user',
        email: pendingVerificationEmail,
        otp: newOtp,
        brand_name: emailSettings.brandName,
        support_email: emailSettings.supportEmail,
        website_url: window.location.origin
      },
      customTemplates: emailTemplates,
      settings: emailSettings
    });

    return result;
  };

  // Request Password Reset
  const requestPasswordReset = async (emailOrUsername: string): Promise<{ success: boolean; error?: string }> => {
    try {
      let targetEmail = emailOrUsername.trim().toLowerCase();
      let targetUser: UserProfile | null = null;

      const usersRef = collection(db, 'users');
      if (emailOrUsername.includes('@')) {
        const q = query(usersRef, where('email', '==', targetEmail), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          targetUser = snap.docs[0].data() as UserProfile;
        }
      } else {
        const q = query(usersRef, where('username', '==', targetEmail), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          targetUser = snap.docs[0].data() as UserProfile;
          targetEmail = targetUser.email;
        }
      }

      if (!targetUser) {
        return { success: false, error: 'No account found with this email or username.' };
      }

      const otp = emailService.generateOTP();
      setActiveOTP(otp);
      setOtpExpiresAt(Date.now() + 10 * 60 * 1000);
      setLastGeneratedOtp(otp);
      setPendingResetEmail(targetEmail);
      setPendingVerificationData({
        uid: targetUser.id,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        username: targetUser.username,
        email: targetEmail
      });

      // Send branded password reset OTP email
      await emailService.sendTemplateEmail({
        type: 'password-reset-otp',
        recipient: targetEmail,
        vars: {
          first_name: targetUser.firstName,
          last_name: targetUser.lastName,
          username: targetUser.username,
          email: targetEmail,
          otp,
          reset_link: `${window.location.origin}/reset-password?code=${otp}`,
          brand_name: emailSettings.brandName,
          support_email: emailSettings.supportEmail,
          website_url: window.location.origin
        },
        customTemplates: emailTemplates,
        settings: emailSettings
      });

      logUserActivity(targetUser.id, targetEmail, 'Password Reset Requested', 'Initiated password reset with 6-digit OTP');

      // Move to OTP input screen for forgot password
      setAuthModalMode('verify-email');
      return { success: true };
    } catch (err: any) {
      console.error('Password reset request error:', err);
      return { success: false, error: err.message || 'Failed to send reset code' };
    }
  };

  // Verify Password Reset OTP
  const verifyPasswordResetOTP = async (otp: string): Promise<{ success: boolean; error?: string }> => {
    if (!activeOTP || !pendingResetEmail) {
      return { success: false, error: 'No password reset request found.' };
    }
    if (Date.now() > otpExpiresAt) {
      return { success: false, error: 'This verification code has expired. Please request a new one.' };
    }
    if (otp.trim() !== activeOTP.trim()) {
      return { success: false, error: 'Invalid verification code. Please check and try again.' };
    }

    // Move to New Password screen
    setAuthModalMode('reset-password');
    return { success: true };
  };

  // Complete Password Reset
  const completePasswordReset = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!pendingResetEmail) {
      return { success: false, error: 'Session expired. Please restart the password reset process.' };
    }

    try {
      const newHash = await hashPassword(newPassword);

      if (pendingVerificationData?.uid) {
        await updateDoc(doc(db, 'users', pendingVerificationData.uid), {
          _authHash: newHash,
          lastActiveAt: new Date().toISOString()
        }).catch(() => {});

        logUserActivity(pendingVerificationData.uid, pendingResetEmail, 'Password Changed', 'Password successfully changed via OTP verification', pendingVerificationData.username);
      }

      // Send alert email confirming password changed
      emailService.sendTemplateEmail({
        type: 'password-changed',
        recipient: pendingResetEmail,
        vars: {
          first_name: pendingVerificationData?.firstName || 'User',
          username: pendingVerificationData?.username || 'user',
          email: pendingResetEmail,
          brand_name: emailSettings.brandName,
          support_email: emailSettings.supportEmail,
          website_url: window.location.origin
        },
        customTemplates: emailTemplates,
        settings: emailSettings
      }).catch(() => {});

      setActiveOTP(null);
      setLastGeneratedOtp(null);
      setPendingResetEmail('');
      setAuthModalMode('login');

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update password' };
    }
  };

  // Resend Password Reset OTP
  const resendPasswordResetOTP = async (): Promise<{ success: boolean; error?: string }> => {
    if (!pendingResetEmail) {
      return { success: false, error: 'No pending reset email address found.' };
    }
    const newOtp = emailService.generateOTP();
    setActiveOTP(newOtp);
    setOtpExpiresAt(Date.now() + 10 * 60 * 1000);
    setLastGeneratedOtp(newOtp);

    return await emailService.sendTemplateEmail({
      type: 'password-reset-otp',
      recipient: pendingResetEmail,
      vars: {
        first_name: pendingVerificationData?.firstName || 'User',
        username: pendingVerificationData?.username || 'user',
        email: pendingResetEmail,
        otp: newOtp,
        brand_name: emailSettings.brandName,
        support_email: emailSettings.supportEmail,
        website_url: window.location.origin
      },
      customTemplates: emailTemplates,
      settings: emailSettings
    });
  };

  // Gating & Authentication Requirement Hook
  const requireAuth = (actionCallback?: () => void, promptMessage?: string): boolean => {
    if (currentUser && currentUser.status === 'active') {
      if (actionCallback) actionCallback();
      return true;
    }

    if (currentUser && (currentUser.status === 'banned' || currentUser.status === 'suspended')) {
      alert(`Your account has been ${currentUser.status}. Please contact support.`);
      return false;
    }

    // Set pending action to run right after login
    if (actionCallback) {
      setPendingAction(() => actionCallback);
    }

    setUnauthenticatedAlertMessage(
      promptMessage || '🔒 Account Required: Please log in or create a free account to unlock downloads & resources!'
    );
    setIsAuthModalOpen(true, 'register');
    return false;
  };

  // Record user download
  const recordUserDownload = async (resourceId: string) => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.id);
      const existing = currentUser.downloadedResourceIds || [];
      const updated = Array.from(new Set([...existing, resourceId]));
      const count = (currentUser.downloadCount || 0) + 1;

      await updateDoc(userRef, {
        downloadedResourceIds: updated,
        downloadCount: count,
        lastActiveAt: new Date().toISOString()
      });

      setCurrentUser(prev => prev ? { ...prev, downloadedResourceIds: updated, downloadCount: count } : null);
      logUserActivity(currentUser.id, currentUser.email, 'Download', `Downloaded resource #${resourceId}`);
    } catch (err) {
      console.warn('Could not record user download:', err);
    }
  };

  // Update profile data
  const updateUserProfileData = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const userRef = doc(db, 'users', currentUser.id);
      await updateDoc(userRef, {
        ...updates,
        lastActiveAt: new Date().toISOString()
      });
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (err) {
      console.error('Failed to update profile:', err);
      return false;
    }
  };

  // Admin: Update User Status
  const updateUserStatus = async (userId: string, status: UserStatus, notes?: string): Promise<boolean> => {
    try {
      const userRef = doc(db, 'users', userId);
      const targetUser = allUsers.find(u => u.id === userId || u.userId === userId);

      await updateDoc(userRef, {
        status,
        notes: notes !== undefined ? notes : (targetUser?.notes || ''),
        lastActiveAt: new Date().toISOString()
      });

      let actionName: AdminActivityLog['action'] = 'User Status Changed';
      if (status === 'banned') actionName = 'User Banned';
      if (status === 'suspended') actionName = 'User Suspended';
      if (status === 'active' && targetUser?.status === 'banned') actionName = 'User Unbanned';

      await logAdminAction(actionName, `Changed status to ${status}. Notes: ${notes || 'None'}`, userId, targetUser?.email);

      // Send notice email if suspended or reactivated
      if (targetUser?.email) {
        if (status === 'suspended' || status === 'banned') {
          emailService.sendTemplateEmail({
            type: 'account-suspended',
            recipient: targetUser.email,
            vars: {
              first_name: targetUser.firstName,
              username: targetUser.username,
              email: targetUser.email,
              brand_name: emailSettings.brandName,
              support_email: emailSettings.supportEmail,
              website_url: window.location.origin
            },
            customTemplates: emailTemplates,
            settings: emailSettings
          }).catch(() => {});
        } else if (status === 'active' && (targetUser.status === 'suspended' || targetUser.status === 'banned')) {
          emailService.sendTemplateEmail({
            type: 'account-reactivated',
            recipient: targetUser.email,
            vars: {
              first_name: targetUser.firstName,
              username: targetUser.username,
              email: targetUser.email,
              brand_name: emailSettings.brandName,
              support_email: emailSettings.supportEmail,
              website_url: window.location.origin
            },
            customTemplates: emailTemplates,
            settings: emailSettings
          }).catch(() => {});
        }
      }

      return true;
    } catch (err) {
      console.error('Error updating user status:', err);
      return false;
    }
  };

  // Admin: Delete User Account
  const deleteUserAccount = async (userId: string): Promise<boolean> => {
    try {
      const targetUser = allUsers.find(u => u.id === userId || u.userId === userId);
      await deleteDoc(doc(db, 'users', userId));
      await logAdminAction('User Deleted', `Permanently deleted account of @${targetUser?.username || userId}`, userId, targetUser?.email);
      return true;
    } catch (err) {
      console.error('Error deleting user account:', err);
      return false;
    }
  };

  // Admin: Save Email Template
  const saveEmailTemplate = async (template: EmailTemplate): Promise<boolean> => {
    try {
      const updated = {
        ...template,
        version: (template.version || 1) + 1,
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'email_templates', template.id), updated);
      await logAdminAction('Template Updated', `Updated email template: ${template.name} (${template.type})`, template.id);
      return true;
    } catch (err) {
      console.error('Error saving email template:', err);
      return false;
    }
  };

  // Admin: Save Email Settings
  const saveEmailSettings = async (settings: EmailSettings): Promise<boolean> => {
    try {
      await setDoc(doc(db, 'settings', 'email'), settings);
      setEmailSettings(settings);
      await logAdminAction('Email Settings Updated', `Updated sender config: ${settings.senderEmail}`);
      return true;
    } catch (err) {
      console.error('Error saving email settings:', err);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        isAuthenticated: !!currentUser,
        isLoading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        isProfileModalOpen,
        setIsProfileModalOpen,
        unauthenticatedAlertMessage,
        setUnauthenticatedAlertMessage,
        pendingVerificationEmail,
        pendingResetEmail,
        lastGeneratedOtp,
        loginWithEmailOrUsername,
        registerWithEmail,
        loginWithGoogle,
        logout,
        verifyEmailOTP,
        resendEmailOTP,
        requestPasswordReset,
        verifyPasswordResetOTP,
        completePasswordReset,
        resendPasswordResetOTP,
        requireAuth,
        updateUserProfileData,
        recordUserDownload,
        allUsers,
        userActivities,
        adminActivityLogs,
        emailTemplates,
        emailLogs,
        emailSettings,
        updateUserStatus,
        deleteUserAccount,
        saveEmailTemplate,
        saveEmailSettings,
        logAdminAction
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
