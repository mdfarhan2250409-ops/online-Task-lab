import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  increment
} from 'firebase/firestore';
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
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
// If firestoreDatabaseId exists in config and is custom, specify it, else default
export const db = firebaseConfigJson.firestoreDatabaseId && firebaseConfigJson.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfigJson.firestoreDatabaseId)
  : getFirestore(app);

export {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  increment
};
