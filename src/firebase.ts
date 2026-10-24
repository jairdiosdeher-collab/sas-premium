
import {
  initializeApp,
  getApps,
  getApp,
  type FirebaseApp,
  type FirebaseOptions,
} from "firebase/app";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  type User as FirebaseUser,
  type Auth,
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
  serverTimestamp,
  type Firestore,
} from "firebase/firestore";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  type FirebaseStorage,
} from "firebase/storage";

import {
  getAnalytics,
  isSupported,
  type Analytics,
} from "firebase/analytics";

/* =========================================================
   CONFIGURACIÓN
   Proyecto: pastoralmente-ai
   Requiere Vite y variables VITE_FIREBASE_*.
   No lee configuración de localStorage.
   ========================================================= */

const env = import.meta.env;

const firebaseConfig: FirebaseOptions = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
};

const requiredConfigFields: Array<keyof FirebaseOptions> = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
];

const missingConfigFields = requiredConfigFields.filter((field) => {
  const value = firebaseConfig[field];
  return typeof value !== "string" || value.trim() === "";
});

export const isFirebaseConfigured = missingConfigFields.length === 0;

/* =========================================================
   INSTANCIAS Y ERRORES REALES
   ========================================================= */

export let app: FirebaseApp | null = null;
export let auth: Auth | null = null;
export let firestore: Firestore | null = null;
export let storage: FirebaseStorage | null = null;
export let analytics: Analytics | null = null;
export let googleProvider: GoogleAuthProvider | null = null;

export let firebaseInitializationError: string | null = null;

if (!isFirebaseConfigured) {
  firebaseInitializationError =
    `Configuración Firebase incompleta. Faltan: ${missingConfigFields.join(", ")}. ` +
    "Configura las variables VITE_FIREBASE_* y vuelve a compilar.";
} else {
  try {
    app = getApps().some((item) => item.name === "[DEFAULT]")
      ? getApp()
      : initializeApp(firebaseConfig);

    auth = getAuth(app);
    firestore = getFirestore(app);
    storage = getStorage(app);

    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: "select_account",
    });

    // Analytics es opcional y no determina si Firebase funciona.
    void isSupported()
      .then((supported) => {
        if (supported && app) {
          analytics = getAnalytics(app);
        }
      })
      .catch((error: unknown) => {
        console.warn("Firebase Analytics no disponible:", error);
      });
  } catch (error: unknown) {
    firebaseInitializationError =
      error instanceof Error
        ? error.message
        : String(error);

    // No se oculta el error ni se cambia a modo local.
    console.error(
      "Error real inicializando Firebase:",
      error
    );

    app = null;
    auth = null;
    firestore = null;
    storage = null;
    googleProvider = null;
  }
}

/* =========================================================
   COLECCIONES
   Declarar un nombre aquí NO crea una colección en Firestore.
   Firestore crea las colecciones al guardar documentos.
   ========================================================= */

export const COLLECTIONS = {
  USERS: "users",
  PATIENTS: "patients",
  SESSIONS: "sessions",
  NOTES: "notes",
  SOAP_NOTES: "notes",
  ASSESSMENTS: "assessments",
  APPOINTMENTS: "appointments",
  DOCUMENTS: "documents",
  SERMONS: "sermons",
  JOURNAL: "journal",
  REPORTS: "reports",
  TASKS: "tasks",
  BACKUPS: "backups",
} as const;

/* =========================================================
   VALIDACIÓN DE SERVICIOS
   Comprueba la inicialización del SDK.
   No sustituye las pruebas de red ni de permisos.
   ========================================================= */

function requireAuth(): Auth {
  if (!auth) {
    throw new Error(
      firebaseInitializationError ??
      "Firebase Authentication no está inicializado."
    );
  }

  return auth;
}

function requireFirestore(): Firestore {
  if (!firestore) {
    throw new Error(
      firebaseInitializationError ??
      "Cloud Firestore no está inicializado."
    );
  }

  return firestore;
}

function requireStorage(): FirebaseStorage {
  if (!storage) {
    throw new Error(
      firebaseInitializationError ??
      "Cloud Storage no está inicializado."
    );
  }

  return storage;
}

/* =========================================================
   PACIENTES
   Requiere un usuario autenticado.
   Verifica que el documento escrito pueda recuperarse.
   ========================================================= */

export async function createPatient(
  patientData: Record<string, unknown>
): Promise<string> {
  const database = requireFirestore();
  const currentUser = requireAuth().currentUser;

  if (!currentUser) {
    throw new Error(
      "No hay una sesión autenticada. Inicia sesión antes de crear pacientes."
    );
  }

  const patientRef = await addDoc(
    collection(database, COLLECTIONS.PATIENTS),
    {
      ...patientData,
      ownerUid: currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  );

  // Lectura posterior para verificar que el documento es recuperable.
  const verification = await getDoc(patientRef);

  if (!verification.exists()) {
    throw new Error(
      `Firestore no permitió verificar el paciente ${patientRef.id}.`
    );
  }

  return patientRef.id;
}

export async function listPatients(): Promise<
  Array<Record<string, unknown> & { id: string }>
> {
  const database = requireFirestore();
  const currentUser = requireAuth().currentUser;

  if (!currentUser) {
    throw new Error(
      "Debes iniciar sesión para consultar pacientes."
    );
  }

  const patientsQuery = query(
    collection(database, COLLECTIONS.PATIENTS),
    where("ownerUid", "==", currentUser.uid)
  );

  const snapshot = await getDocs(patientsQuery);

  return snapshot.docs.map((patientDoc) => ({
    id: patientDoc.id,
    ...patientDoc.data(),
  }));
}

/* =========================================================
   COMPROBACIÓN DE LECTURA DE FIRESTORE
   Intenta leer un documento conocido.
   Puede fallar si las reglas deniegan la lectura.
   ========================================================= */

export async function checkFirestoreRead(): Promise<void> {
  const database = requireFirestore();

  await getDoc(
    doc(database, "system", "connection_check")
  );
}

/* =========================================================
   EXPORTACIONES COMPATIBLES CON EL MÓDULO ORIGINAL
   ========================================================= */

export {
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
  getDownloadURL,
};

export type {
  FirebaseUser,
  Firestore,
  FirebaseApp,
  Auth,
  FirebaseStorage,
  Analytics,
};
