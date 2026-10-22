import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged,
  User as FirebaseUser,
  Auth
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc,
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  limit,
  onSnapshot,
  Firestore,
  serverTimestamp
} from "firebase/firestore";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import { getStorage, FirebaseStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Configuración de Firebase para pastoralmente-ai
// Solo se activa si existen variables válidas en import.meta.env o configuradas por el usuario
const getRuntimeConfig = () => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('pm_firebase_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.apiKey &&
          parsed.apiKey !== 'AIzaSyB2oH8QDyiLGW7AD6OlSSLXMc4SNjSwdpY' &&
          parsed.apiKey !== 'MY_FIREBASE_API_KEY' &&
          parsed.apiKey !== 'AIzaSyYourApiKeyHere' &&
          !parsed.apiKey.includes('YourApiKey') &&
          parsed.apiKey.length > 20
        ) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
  }

  const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_API_KEY) || "";
  const envProj = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_PROJECT_ID) || "";

  return {
    apiKey: envKey,
    authDomain: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN) || (envProj ? `${envProj}.firebaseapp.com` : ""),
    projectId: envProj,
    storageBucket: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET) || (envProj ? `${envProj}.firebasestorage.app` : ""),
    messagingSenderId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID) || "",
    appId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_APP_ID) || "",
    measurementId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID) || ""
  };
};

const firebaseConfig = getRuntimeConfig();

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.apiKey !== 'MY_FIREBASE_API_KEY' &&
  firebaseConfig.apiKey !== 'AIzaSyYourApiKeyHere' &&
  firebaseConfig.apiKey !== 'AIzaSyB2oH8QDyiLGW7AD6OlSSLXMc4SNjSwdpY' &&
  !firebaseConfig.apiKey.includes('YourApiKey') &&
  firebaseConfig.apiKey.length > 20
);

// Instancias de Firebase
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let analytics: Analytics | null = null;
let storage: FirebaseStorage | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    firestore = getFirestore(app);
    storage = getStorage(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (err) {
    console.warn('Aviso inicializando Firebase SDK (se usará modo local):', err);
  }
} else {
  console.info('PastoralMente AI: Variables Firebase VITE no detectadas. Operando en Modo Local Seguro (Offline First) con persistencia local.');
}

// Nombres de colecciones oficiales según especificación empresarial:
// users, patients, sessions, assessments, appointments, notes, tasks, documents, sermons, journal, reports, backups
export const COLLECTIONS = {
  USERS: 'users',
  PATIENTS: 'patients',
  SESSIONS: 'sessions',
  ASSESSMENTS: 'assessments',
  APPOINTMENTS: 'appointments',
  NOTES: 'notes',
  SOAP_NOTES: 'notes',
  TASKS: 'tasks',
  DOCUMENTS: 'documents',
  SERMONS: 'sermons',
  JOURNAL: 'journal',
  REPORTS: 'reports',
  BACKUPS: 'backups',
  AUDIT_LOGS: 'auditLogs',
  CLINICAL_SCALES: 'assessments',
  DEVOTIONALS: 'sermons',
} as const;

export { 
  app, 
  auth, 
  firestore, 
  analytics, 
  storage, 
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  ref,
  uploadBytes,
  getDownloadURL
};
export type { FirebaseUser, Firestore, FirebaseApp, Auth, FirebaseStorage, Analytics };
