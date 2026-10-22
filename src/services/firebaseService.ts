/**
 * FirebaseService para PastoralMente AI
 * Firebase v10+, React, Vite y TypeScript strict.
 *
 * Nota: este servicio conserva la caché local como respaldo temporal.
 * La autenticación siempre depende de Firebase Authentication.
 * Los datos clínicos deben protegerse con reglas Firestore por UID.
 */

import {
  auth,
  firestore,
  storage,
  isFirebaseConfigured,
  COLLECTIONS,
  onAuthStateChanged,
  type FirebaseUser,
  type Firestore,
} from "../firebase";

import {
  doc,
  collection,
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
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import type {
  UserProfile,
  UserRole,
  BackupRecord,
  FirebaseSyncMetrics,
} from "../types";

export interface FirebaseConfigState {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  isConfigured: boolean;
}

export type SyncStatus =
  | "cloud_connected"
  | "syncing"
  | "offline"
