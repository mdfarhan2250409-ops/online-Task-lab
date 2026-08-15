import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  limit,
  orderBy,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  updatePassword,
  sendPasswordResetEmail,
  type User as FirebaseUser
} from 'firebase/auth';
import firebaseConfigJson from '../../firebase-applet-config.json';

// User provided config fallback or system provisioned config
const userProvidedConfig = {
  apiKey: "AIzaSyDKzTOCV6OPpBj83XKS79VI1dgqSiGwr_8",
  authDomain: "online-task-lab-1aba5.firebaseapp.com",
  projectId: "online-task-lab-1aba5",
  storageBucket: "online-task-lab-1aba5.firebasestorage.app",
  messagingSenderId: "569090408704",
  appId: "1:569090408704:web:c5d402e9c347989371f3e5",
  measurementId: "G-V7ZPK29YMH"
};

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey || userProvidedConfig.apiKey,
  authDomain: firebaseConfigJson.authDomain || userProvidedConfig.authDomain,
  projectId: firebaseConfigJson.projectId || userProvidedConfig.projectId,
  storageBucket: firebaseConfigJson.storageBucket || userProvidedConfig.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId || userProvidedConfig.messagingSenderId,
  appId: firebaseConfigJson.appId || userProvidedConfig.appId,
  measurementId: firebaseConfigJson.measurementId || userProvidedConfig.measurementId
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
export const db = firebaseConfigJson.firestoreDatabaseId && firebaseConfigJson.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfigJson.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

export {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  limit,
  orderBy,
  serverTimestamp,
  increment,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  updatePassword,
  sendPasswordResetEmail
};
export type { FirebaseUser };

