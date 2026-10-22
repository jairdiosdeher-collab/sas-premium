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
  onAuthStateChanged,
} from "../firebase";

import type { User as FirebaseAuthUser } from "firebase/auth";

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
  type Firestore,
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import type {
  UserProfile,
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
  | "local_mode";

type PendingSyncItem = {
  action: "syncCollection";
  collection: (typeof OFFICIAL_COLLECTIONS)[number];
  data: CollectionItem[];
  ownerUid: string;
};

type CollectionItem = { id?: string; [key: string]: unknown };

const CONFIG_KEY = "pm_firebase_config";
const USER_PROFILE_KEY = "pm_user_profile";
const BACKUP_LOG_KEY = "pm_backups_log";
const PENDING_QUEUE_KEY = "pm_firebase_pending_queue";

const OFFICIAL_COLLECTIONS = [
  "users",
  "patients",
  "sessions",
  "assessments",
  "appointments",
  "notes",
  "tasks",
  "documents",
  "sermons",
  "journal",
  "reports",
  "backups",
] as const;

function browserIsOnline(): boolean {
  return typeof navigator === "undefined" ? false : navigator.onLine;
}

function canUseLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readLocal<T>(key: string, fallback: T): T {
  if (!canUseLocalStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch (error) {
    console.warn(`No se pudo leer la caché local "${key}".`, error);
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T): boolean {
  if (!canUseLocalStorage()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`No se pudo guardar la caché local "${key}".`, error);
    return false;
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Adapta perfiles de versiones anteriores sin depender de campos opcionales. */
function profileRecord(user: UserProfile | null | undefined): Record<string, unknown> {
  return user && typeof user === "object"
    ? (user as unknown as Record<string, unknown>)
    : {};
}

function profileString(
  user: UserProfile | null | undefined,
  ...keys: string[]
): string {
  const record = profileRecord(user);
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function profileName(user: UserProfile | null | undefined): string {
  return (
    profileString(user, "name", "displayName", "nombre") ||
    profileString(user, "email") ||
    "Usuario"
  );
}

function profileUid(user: UserProfile | null | undefined): string {
  return profileString(user, "uid", "id");
}

function profileRole(user: UserProfile | null | undefined): UserProfile["role"] {
  const role = profileString(user, "role");
  return (role || "Psicólogo") as UserProfile["role"];
}

function profileEmail(user: UserProfile | null | undefined): string | null {
  const email = profileString(user, "email");
  return email || null;
}

function isOfficialCollection(name: string): name is (typeof OFFICIAL_COLLECTIONS)[number] {
  return (OFFICIAL_COLLECTIONS as readonly string[]).includes(name);
}

function readPendingQueue(): PendingSyncItem[] {
  const stored = readLocal<unknown>(PENDING_QUEUE_KEY, []);
  if (!Array.isArray(stored)) return [];

  // Se descartan elementos antiguos sin UID para impedir sincronizar datos
  // de una sesión anterior bajo la cuenta de otro usuario.
  return stored.filter((value): value is PendingSyncItem => {
    if (!value || typeof value !== "object") return false;
    const item = value as Partial<PendingSyncItem>;
    return (
      item.action === "syncCollection" &&
      typeof item.collection === "string" &&
      isOfficialCollection(item.collection) &&
      Array.isArray(item.data) &&
      typeof item.ownerUid === "string" &&
      item.ownerUid.length > 0
    );
  });
}

function getViteConfig(): FirebaseConfigState {
  const env = import.meta.env;
  const projectId = env.VITE_FIREBASE_PROJECT_ID ?? "";

  return {
    apiKey: env.VITE_FIREBASE_API_KEY ?? "",
    authDomain:
      env.VITE_FIREBASE_AUTH_DOMAIN ??
      (projectId ? `${projectId}.firebaseapp.com` : ""),
    projectId,
    storageBucket:
      env.VITE_FIREBASE_STORAGE_BUCKET ??
      (projectId ? `${projectId}.firebasestorage.app` : ""),
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: env.VITE_FIREBASE_APP_ID ?? "",
    isConfigured: false,
  };
}

export class FirebaseService {
  private static status: SyncStatus = isFirebaseConfigured
    ? browserIsOnline()
      ? "cloud_connected"
      : "offline"
    : "local_mode";

  private static listeners: Array<(metrics: FirebaseSyncMetrics) => void> = [];
  private static migrationInProgress = false;
  private static lastSyncTime: string | null = null;
  private static pendingQueue: PendingSyncItem[] = readPendingQueue();
  private static activeUser: UserProfile | null = readLocal<UserProfile | null>(
    USER_PROFILE_KEY,
    null,
  );
  private static activeUid: string | null = auth?.currentUser?.uid ?? null;
  private static authUnsubscribe: (() => void) | null = null;

  static {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        this.status = isFirebaseConfigured ? "syncing" : "local_mode";
        this.notifyListeners();
        void this.processPendingQueue();
      });

      window.addEventListener("offline", () => {
        this.status = "offline";
        this.notifyListeners();
      });
    }
  }

  /**
   * Recupera configuración guardada por el usuario o variables Vite.
   * La validación de configuración guardada es deliberadamente simple,
   * tal como requiere el contrato existente: apiKey + projectId + appId.
   */
  public static getConfig(): FirebaseConfigState {
    if (canUseLocalStorage()) {
      try {
        const saved = window.localStorage.getItem(CONFIG_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as FirebaseConfigState;
          if (
            parsed.apiKey &&
            parsed.projectId &&
            parsed.appId
          ) {
            return parsed;
          }
        }
      } catch (error) {
        console.warn("Error leyendo la configuración de Firebase.", error);
      }
    }

    const config = getViteConfig();
    const configured = Boolean(
      config.apiKey.trim() &&
        config.projectId.trim() &&
        config.appId.trim() &&
        config.authDomain.trim() &&
        config.storageBucket.trim() &&
        config.messagingSenderId.trim(),
    );

    return { ...config, isConfigured: configured };
  }

  public static saveConfig(config: FirebaseConfigState): void {
    const normalized: FirebaseConfigState = {
      apiKey: config.apiKey.trim(),
      authDomain: config.authDomain.trim(),
      projectId: config.projectId.trim(),
      storageBucket: config.storageBucket.trim(),
      messagingSenderId: config.messagingSenderId.trim(),
      appId: config.appId.trim(),
      isConfigured: Boolean(
        config.apiKey.trim() &&
          config.projectId.trim() &&
          config.appId.trim(),
      ),
    };

    if (!normalized.isConfigured) {
      throw new Error("La configuración requiere apiKey, projectId y appId.");
    }

    if (!writeLocal(CONFIG_KEY, normalized)) {
      throw new Error("No fue posible guardar la configuración en este navegador.");
    }
  }

  /**
   * Escucha el estado real de Firebase Authentication.
   * No considera authenticated a un UID almacenado localmente.
   */
  public static initializeAuthListener(
    onUserChanged?: (user: FirebaseAuthUser | null) => void,
  ): () => void {
    if (!auth) {
      this.activeUid = null;
      this.activeUser = null;
      this.status = "local_mode";
      this.notifyListeners();
      throw new Error("Firebase Authentication no está inicializado.");
    }

    this.authUnsubscribe?.();

    this.authUnsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        this.activeUid = firebaseUser?.uid ?? null;

        if (!firebaseUser) {
          this.activeUser = null;
          this.status = browserIsOnline() ? "cloud_connected" : "offline";
          this.notifyListeners();
          onUserChanged?.(null);
          return;
        }

        const storedProfile = readLocal<UserProfile | null>(USER_PROFILE_KEY, null);
        const cached = profileUid(storedProfile) === firebaseUser.uid ? storedProfile : null;
        this.activeUser = {
          ...(cached ?? {}),
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          name: profileName(cached) !== "Usuario"
            ? profileName(cached)
            : firebaseUser.displayName ?? firebaseUser.email ?? "Usuario",
          displayName: firebaseUser.displayName ?? profileName(cached),
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified,
          role: profileRole(cached),
        } as unknown as UserProfile;

        this.status = browserIsOnline() ? "cloud_connected" : "offline";
        this.notifyListeners();
        onUserChanged?.(firebaseUser);
        void this.processPendingQueue();
      },
      (error) => {
        this.activeUid = null;
        this.activeUser = null;
        this.status = browserIsOnline() ? "local_mode" : "offline";
        console.error("Error real del listener de Authentication:", error);
        this.notifyListeners();
      },
    );

    return () => {
      this.authUnsubscribe?.();
      this.authUnsubscribe = null;
    };
  }

  public static getMetrics(): FirebaseSyncMetrics {
    const isOnline = browserIsOnline();
    const authenticated = Boolean(auth?.currentUser && this.activeUid === auth.currentUser.uid);

    let connectionStatus: FirebaseSyncMetrics["connectionStatus"] = "offline";
    let authStatus: FirebaseSyncMetrics["authStatus"] = "unauthenticated";
    let firestoreStatus: FirebaseSyncMetrics["firestoreStatus"] = "offline";
    let storageStatus: FirebaseSyncMetrics["storageStatus"] = "offline";

    if (isOnline && isFirebaseConfigured) {
      connectionStatus = this.status === "syncing" ? "syncing" : "connected";
      firestoreStatus = firestore ? "healthy" : "offline";
      storageStatus = storage ? "healthy" : "offline";
    }

    if (authenticated) authStatus = "authenticated";

    return {
      connectionStatus,
      authStatus,
      firestoreStatus,
      storageStatus,
      lastSyncTime: this.lastSyncTime,
      pendingSyncCount: this.pendingQueue.length,
      activeUserEmail: auth?.currentUser?.email ?? null,
      activeUserUid: authenticated ? auth?.currentUser?.uid ?? null : null,
      activeRole: authenticated ? profileRole(this.activeUser) : ("Psicólogo" as UserProfile["role"]),
      isOnline,
    };
  }

  public static getStatus(): SyncStatus {
    if (!isFirebaseConfigured) return "local_mode";
    if (!browserIsOnline()) return "offline";
    return this.status;
  }

  /**
   * Esto informa disponibilidad de SDK/configuración, no garantiza permisos
   * ni que una operación de red haya sido aceptada por Firebase.
   */
  public static isCloudConnected(): boolean {
    return Boolean(isFirebaseConfigured && firestore && auth && storage && browserIsOnline());
  }

  public static getStatusLabel(): {
    label: string;
    mode: "cloud" | "local" | "offline";
    color: string;
    dot: string;
  } {
    switch (this.getStatus()) {
      case "cloud_connected":
        return {
          label: "🟢 Firebase configurado",
          mode: "cloud",
          color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
          dot: "🟢",
        };
      case "syncing":
        return {
          label: "🟡 Sincronizando",
          mode: "cloud",
          color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
          dot: "🟡",
        };
      case "offline":
        return {
          label: "🔴 Sin conexión",
          mode: "offline",
          color: "text-rose-400 bg-rose-500/10 border-rose-500/30",
          dot: "🔴",
        };
      default:
        return {
          label: "🔴 Firebase no configurado",
          mode: "local",
          color: "text-rose-400 bg-rose-500/10 border-rose-500/30",
          dot: "🔴",
        };
    }
  }

  public static subscribe(listener: (metrics: FirebaseSyncMetrics) => void): () => void {
    this.listeners.push(listener);
    listener(this.getMetrics());
    return () => {
      this.listeners = this.listeners.filter((item) => item !== listener);
    };
  }

  private static notifyListeners(): void {
    const metrics = this.getMetrics();
    for (const listener of this.listeners) {
      try {
        listener(metrics);
      } catch (error) {
        console.warn("Error dentro de un listener de métricas.", error);
      }
    }
  }

  private static updateStatus(status: SyncStatus): void {
    this.status = status;
    if (status === "cloud_connected") this.lastSyncTime = new Date().toISOString();
    this.notifyListeners();
  }

  private static requireFirestore(): Firestore {
    if (!firestore || !isFirebaseConfigured) {
      throw new Error("Firestore no está configurado o inicializado.");
    }
    return firestore;
  }

  private static requireAuthenticatedUid(): string {
    const uid = auth?.currentUser?.uid;
    if (!uid || uid !== this.activeUid) {
      throw new Error("Se requiere una sesión válida de Firebase Authentication.");
    }
    return uid;
  }

  public static async saveUserProfile(user: UserProfile): Promise<boolean> {
    try {
      const db = this.requireFirestore();
      const uid = this.requireAuthenticatedUid();

      const suppliedUid = profileUid(user);
      if (suppliedUid && suppliedUid !== uid) {
        throw new Error("El perfil no corresponde al usuario autenticado.");
      }

      const userFields = profileRecord(user);
      const displayName = profileName(user);
      const profile = {
        uid,
        id: uid,
        nombre: displayName,
        name: displayName,
        displayName,
        email: auth?.currentUser?.email ?? profileEmail(user),
        role: profileRole(user),
        title: userFields.title,
        institution: userFields.institution,
        plan: userFields.plan,
        credits: userFields.credits,
        emailVerified: auth?.currentUser?.emailVerified ?? false,
        updatedAt: serverTimestamp(),
      };

      this.updateStatus("syncing");
      await setDoc(doc(db, "users", uid), profile, { merge: true });

      this.activeUser = {
        ...user,
        id: uid,
        uid,
        name: displayName,
        displayName,
        email: profile.email,
      } as unknown as UserProfile;
      writeLocal(USER_PROFILE_KEY, this.activeUser);

      await this.recordBackup(
        "auto_backup",
        "users",
        1,
        { uid, name: displayName, role: profileRole(user) },
        uid,
        displayName,
      );

      this.updateStatus("cloud_connected");
      return true;
    } catch (error) {
      console.error("No se pudo guardar el perfil en Firestore:", error);
      this.updateStatus(browserIsOnline() ? "local_mode" : "offline");
      return false;
    }
  }

  public static subscribeToCollection<T extends CollectionItem>(
    collectionName: string,
    userId: string,
    onData: (items: T[]) => void,
    onError?: (error: Error) => void,
  ): () => void {
    let db: Firestore;
    let uid: string;

    try {
      if (!isOfficialCollection(collectionName)) {
        throw new Error(`Colección no permitida: ${collectionName}`);
      }
      db = this.requireFirestore();
      uid = this.requireAuthenticatedUid();
      if (userId && userId !== uid) {
        throw new Error("No se puede escuchar información de otro usuario.");
      }
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error(String(error)));
      return () => undefined;
    }

    const targetRef = doc(db, collectionName, uid);
    return onSnapshot(
      targetRef,
      (snapshot) => {
        const data = snapshot.data();
        const items = snapshot.exists() && Array.isArray(data?.items)
          ? (data.items as T[])
          : [];
        writeLocal(`pm_${collectionName}`, items);
        onData(items);
        this.lastSyncTime = new Date().toISOString();
        this.updateStatus("cloud_connected");
      },
      (error) => {
        console.error(`Error de onSnapshot en ${collectionName}:`, error);
        onError?.(error);
      },
    );
  }

  public static async syncCollection<T extends CollectionItem>(
    collectionName: string,
    items: T[],
    userId?: string,
  ): Promise<boolean> {
    if (!isOfficialCollection(collectionName)) {
      throw new Error(`Colección no permitida: ${collectionName}`);
    }
    writeLocal(`pm_${collectionName}`, items);

    const signedInUid = auth?.currentUser?.uid;
    if (!isFirebaseConfigured || !firestore || !browserIsOnline() || !signedInUid) {
      if (signedInUid && isOfficialCollection(collectionName)) {
        this.enqueue({
          action: "syncCollection",
          collection: collectionName,
          data: items,
          ownerUid: signedInUid,
        });
      }
      this.updateStatus(browserIsOnline() ? "local_mode" : "offline");
      return false;
    }

    try {
      const uid = this.requireAuthenticatedUid();
      if (userId && userId !== uid) {
        throw new Error("No se puede sincronizar información de otro usuario.");
      }

      this.updateStatus("syncing");
      await setDoc(
        doc(this.requireFirestore(), collectionName, uid),
        {
          userId: uid,
          items,
          total: items.length,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      this.updateStatus("cloud_connected");
      return true;
    } catch (error) {
      console.error(`Error sincronizando ${collectionName}:`, error);
      // Nunca reasignar a la sesión actual datos que la llamada identificó
      // explícitamente como pertenecientes a otro UID.
      if (!userId || userId === signedInUid) {
        this.enqueue({
          action: "syncCollection",
          collection: collectionName,
          data: items,
          ownerUid: signedInUid,
        });
      }
      this.updateStatus(browserIsOnline() ? "local_mode" : "offline");
      return false;
    }
  }

  public static async loadCollection<T>(
    collectionName: string,
    fallback: T[],
    userId?: string,
  ): Promise<T[]> {
    if (!isOfficialCollection(collectionName)) {
      throw new Error(`Colección no permitida: ${collectionName}`);
    }
    if (isFirebaseConfigured && firestore && browserIsOnline() && auth?.currentUser) {
      try {
        const uid = this.requireAuthenticatedUid();
        if (userId && userId !== uid) {
          throw new Error("No se puede leer información de otro usuario.");
        }

        const snapshot = await getDoc(doc(this.requireFirestore(), collectionName, uid));
        const items = snapshot.exists() ? snapshot.data().items : undefined;

        if (Array.isArray(items)) {
          writeLocal(`pm_${collectionName}`, items);
          this.lastSyncTime = new Date().toISOString();
          return items as T[];
        }

        // No hay documento cloud; se usa caché como respaldo temporal.
      } catch (error) {
        console.error(`No se pudo cargar ${collectionName} desde Firestore:`, error);
      }
    }

    const cached = readLocal<T[] | null>(`pm_${collectionName}`, null);
    return cached ?? fallback;
  }

  public static async recordBackup(
    action: BackupRecord["action"],
    collectionName: string,
    recordCount: number,
    snapshotData: unknown,
    userId?: string,
    userName?: string,
  ): Promise<string> {
    const uid = auth?.currentUser?.uid ?? null;
    if (userId && uid && userId !== uid) {
      throw new Error("No se puede crear un respaldo para otro usuario.");
    }
    const backupId = `bkp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const backupItem: BackupRecord = {
      id: backupId,
      timestamp: new Date().toISOString(),
      action,
      userId: userId ?? uid ?? "system",
      userName: userName ?? profileName(this.activeUser),
      collectionName,
      recordCount,
      snapshotData:
        snapshotData !== null && typeof snapshotData === "object"
          ? snapshotData
          : { value: snapshotData },
      status: "success",
    };

    const localBackups = readLocal<BackupRecord[]>(BACKUP_LOG_KEY, []);
    writeLocal(BACKUP_LOG_KEY, [backupItem, ...localBackups].slice(0, 50));

    if (firestore && isFirebaseConfigured && browserIsOnline() && uid) {
      try {
        await setDoc(doc(firestore, "backups", backupId), {
          ...backupItem,
          ownerUid: uid,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        console.error("No se pudo guardar el respaldo en Firestore:", error);
      }
    }

    return backupId;
  }

  public static async getRecentBackups(limitCount = 10): Promise<BackupRecord[]> {
    const safeLimit = Math.max(1, Math.min(Math.floor(limitCount), 100));

    if (firestore && isFirebaseConfigured && browserIsOnline()) {
      try {
        const uid = this.requireAuthenticatedUid();
        const backupsQuery = query(
          collection(firestore, "backups"),
          where("ownerUid", "==", uid),
          orderBy("createdAt", "desc"),
          limit(safeLimit),
        );
        const snapshot = await getDocs(backupsQuery);
        return snapshot.docs.map((item) => item.data() as BackupRecord);
      } catch (error) {
        console.error("No se pudieron leer respaldos de Firestore:", error);
      }
    }

    const currentUid = auth?.currentUser?.uid;
    const localBackups = readLocal<BackupRecord[]>(BACKUP_LOG_KEY, []);
    return localBackups
      .filter((backup) => currentUid !== undefined && backup.userId === currentUid)
      .slice(0, safeLimit);
  }

  public static async migrateLocalStorageToFirestore(
    user: UserProfile,
  ): Promise<{ success: boolean; migratedCollections: string[]; totalRecords: number }> {
    if (!isFirebaseConfigured || !firestore || !browserIsOnline() || this.migrationInProgress) {
      return { success: false, migratedCollections: [], totalRecords: 0 };
    }

    let uid: string;
    try {
      uid = this.requireAuthenticatedUid();
    } catch (error) {
      console.error("Migración cancelada: no hay usuario autenticado.", error);
      return { success: false, migratedCollections: [], totalRecords: 0 };
    }

    const suppliedUid = profileUid(user);
    if (suppliedUid && suppliedUid !== uid) {
      console.error("Migración cancelada: el perfil no corresponde al usuario autenticado.");
      return { success: false, migratedCollections: [], totalRecords: 0 };
    }

    const migrationKey = `pm_cloud_synced_v2_${uid}`;
    if (canUseLocalStorage() && window.localStorage.getItem(migrationKey) === "true") {
      return { success: true, migratedCollections: ["already_synced"], totalRecords: 0 };
    }

    this.migrationInProgress = true;
    this.updateStatus("syncing");

    const migrated: string[] = [];
    let totalRecords = 0;
    let migrationHadInvalidSource = false;

    const mapping: Array<{ key: string; collectionName: string }> = [
      { key: "pm_patients", collectionName: "patients" },
      { key: "pm_sessions", collectionName: "sessions" },
      { key: "pm_soap_notes", collectionName: "notes" },
      { key: "pm_notes", collectionName: "notes" },
      { key: "pm_appointments", collectionName: "appointments" },
      { key: "pm_assessments", collectionName: "assessments" },
      { key: "pm_sermons", collectionName: "sermons" },
      { key: "pm_reports", collectionName: "reports" },
      { key: "pm_journal", collectionName: "journal" },
      { key: "pm_small_groups", collectionName: "journal" },
      { key: "pm_tasks", collectionName: "tasks" },
      { key: "pm_documents", collectionName: "documents" },
    ];

    try {
      await setDoc(
        doc(this.requireFirestore(), "users", uid),
        {
          uid,
          id: uid,
          name: profileName(user),
          displayName: profileName(user),
          email: auth?.currentUser?.email ?? profileEmail(user),
          role: profileRole(user),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      migrated.push("users");

      const grouped = new Map<string, { keys: string[]; entries: CollectionItem[] }>();
      for (const item of mapping) {
        const raw = canUseLocalStorage() ? window.localStorage.getItem(item.key) : null;
        if (!raw) continue;

        let parsed: unknown;
        try {
          parsed = JSON.parse(raw) as unknown;
        } catch (error) {
          console.error(`JSON inválido en ${item.key}; se conserva el origen.`, error);
          migrationHadInvalidSource = true;
          continue;
        }

        if (!Array.isArray(parsed) || parsed.length === 0) continue;
        const group = grouped.get(item.collectionName) ?? { keys: [], entries: [] };
        group.keys.push(item.key);
        for (const value of parsed) {
          if (value && typeof value === "object" && !Array.isArray(value)) {
            group.entries.push(value as CollectionItem);
          }
        }
        grouped.set(item.collectionName, group);
      }

      for (const [collectionName, group] of grouped) {
        const deduplicated = new Map<string, CollectionItem>();
        for (const entry of group.entries) {
          const identity = entry.id !== undefined && entry.id !== null
            ? String(entry.id)
            : JSON.stringify(entry);
          if (!deduplicated.has(identity)) deduplicated.set(identity, entry);
        }

        const items = [...deduplicated.values()];
        const destination = doc(this.requireFirestore(), collectionName, uid);
        await setDoc(
          destination,
          {
            userId: uid,
            ownerUid: uid,
            items,
            total: items.length,
            migratedFromLocal: true,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );

        const verification = await getDoc(destination);
        const cloudItems: unknown = verification.data()?.items;
        if (
          !verification.exists() ||
          !Array.isArray(cloudItems) ||
          cloudItems.length !== items.length
        ) {
          throw new Error(`No se pudo verificar la migración de ${collectionName}.`);
        }

        await this.recordBackup(
          "auto_backup",
          collectionName,
          items.length,
          { verified: true, count: items.length },
          uid,
          profileName(user),
        );

        migrated.push(collectionName);
        totalRecords += items.length;
        for (const key of group.keys) writeLocal(`${key}_cloud_verified`, true);
      }

      if (migrationHadInvalidSource) {
        throw new Error(
          "La migración quedó incompleta porque uno o más registros locales contienen JSON inválido. Los datos originales se conservaron; corrige esos registros y vuelve a intentarlo.",
        );
      }

      writeLocal(migrationKey, true);
      this.updateStatus("cloud_connected");
      return { success: true, migratedCollections: migrated, totalRecords };
    } catch (error) {
      console.error("Falló la migración a Firestore; se conservan los datos locales:", error);
      this.updateStatus(browserIsOnline() ? "local_mode" : "offline");
      return { success: false, migratedCollections: migrated, totalRecords };
    } finally {
      this.migrationInProgress = false;
    }
  }

  private static enqueue(item: PendingSyncItem): void {
    // Evita duplicados idénticos en la cola persistente.
    const signature = JSON.stringify([item.ownerUid, item.collection, item.data]);
    const alreadyQueued = this.pendingQueue.some(
      (queued) => JSON.stringify([queued.ownerUid, queued.collection, queued.data]) === signature,
    );
    if (!alreadyQueued) this.pendingQueue.push(item);
    writeLocal(PENDING_QUEUE_KEY, this.pendingQueue);
    this.notifyListeners();
  }

  private static async processPendingQueue(): Promise<void> {
    const uid = auth?.currentUser?.uid;
    if (
      this.pendingQueue.length === 0 ||
      !uid ||
      !browserIsOnline() ||
      !isFirebaseConfigured ||
      !firestore ||
      uid !== this.activeUid
    ) {
      return;
    }

    const currentUserItems = this.pendingQueue.filter((item) => item.ownerUid === uid);
    this.pendingQueue = this.pendingQueue.filter((item) => item.ownerUid !== uid);
    writeLocal(PENDING_QUEUE_KEY, this.pendingQueue);

    for (const item of currentUserItems) {
      const success = await this.syncCollection(
        item.collection,
        item.data,
        item.ownerUid,
      );
      if (!success) {
        // syncCollection vuelve a encolar solo si hay una sesión autenticada.
        continue;
      }
    }

    writeLocal(PENDING_QUEUE_KEY, this.pendingQueue);
    this.notifyListeners();
  }

  public static async forceManualSync(): Promise<{ success: boolean; message: string }> {
    if (!browserIsOnline()) {
      return { success: false, message: "No hay conexión a internet activa." };
    }

    if (!isFirebaseConfigured || !firestore || !auth) {
      return { success: false, message: "Firebase no está configurado correctamente." };
    }

    if (!auth.currentUser) {
      return { success: false, message: "Inicia sesión con Firebase Authentication antes de sincronizar." };
    }

    try {
      this.updateStatus("syncing");
      await this.processPendingQueue();

      if (this.activeUser) {
        const saved = await this.saveUserProfile(this.activeUser);
        if (!saved) {
          return { success: false, message: "No se pudo guardar el perfil en Firestore." };
        }
      }

      this.lastSyncTime = new Date().toISOString();
      if (this.pendingQueue.length > 0) {
        this.updateStatus("local_mode");
        return {
          success: false,
          message: `La sincronización terminó parcialmente. Quedan ${this.pendingQueue.length} operaciones pendientes.`,
        };
      }

      this.updateStatus("cloud_connected");
      return {
        success: true,
        message: "Sincronización finalizada sin operaciones pendientes.",
      };
    } catch (error) {
      const message = getErrorMessage(error);
      console.error("Error durante sincronización manual:", error);
      this.updateStatus("local_mode");
      return { success: false, message };
    }
  }

  /**
   * Sube un archivo a Cloud Storage y devuelve su URL de descarga.
   * La ruta queda separada por UID para facilitar las reglas de seguridad.
   */
  public static async uploadFile(
    file: File,
    path: string,
  ): Promise<{ fullPath: string; downloadURL: string }> {
    if (!storage) throw new Error("Firebase Storage no está inicializado.");
    const uid = this.requireAuthenticatedUid();
    const safePath = path.trim().replace(/^\/+/, "");
    const segments = safePath.split("/");
    if (
      !safePath ||
      segments.some((segment) => !segment || segment === "." || segment === "..")
    ) {
      throw new Error("La ruta del archivo no es válida.");
    }
    const fileRef = ref(storage, `users/${uid}/${safePath}`);
    const result = await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(result.ref);
    return { fullPath: result.ref.fullPath, downloadURL };
  }

  /**
   * CRUD genérico para documentos individuales de una colección.
   * No crea colecciones vacías: Firestore las materializa al escribir.
   */
  public static async createRecord(
    collectionName: (typeof OFFICIAL_COLLECTIONS)[number],
    data: Record<string, unknown>,
  ): Promise<string> {
    const db = this.requireFirestore();
    const uid = this.requireAuthenticatedUid();
    const recordRef = await addDoc(collection(db, collectionName), {
      ...data,
      ownerUid: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    const verification = await getDoc(recordRef);
    if (!verification.exists()) {
      throw new Error(`No se pudo verificar ${collectionName}/${recordRef.id}.`);
    }
    return recordRef.id;
  }

  public static async updateRecord(
    collectionName: (typeof OFFICIAL_COLLECTIONS)[number],
    recordId: string,
    changes: Record<string, unknown>,
  ): Promise<void> {
    const db = this.requireFirestore();
    const uid = this.requireAuthenticatedUid();
    const recordRef = doc(db, collectionName, recordId);
    const snapshot = await getDoc(recordRef);

    if (!snapshot.exists()) {
      throw new Error("El registro que intentas actualizar no existe.");
    }
    if (snapshot.data().ownerUid !== uid) {
      throw new Error("No tienes permiso para modificar este registro.");
    }

    // Evita que el cliente pueda cambiar el propietario del registro.
    const safeChanges = { ...changes };
    delete safeChanges.ownerUid;
    delete safeChanges.createdAt;

    await updateDoc(recordRef, {
      ...safeChanges,
      updatedAt: serverTimestamp(),
    });
  }

  public static async deleteRecord(
    collectionName: (typeof OFFICIAL_COLLECTIONS)[number],
    recordId: string,
  ): Promise<void> {
    const db = this.requireFirestore();
    const uid = this.requireAuthenticatedUid();
    const recordRef = doc(db, collectionName, recordId);
    const snapshot = await getDoc(recordRef);

    if (!snapshot.exists()) {
      throw new Error("El registro que intentas eliminar no existe.");
    }
    if (snapshot.data().ownerUid !== uid) {
      throw new Error("No tienes permiso para eliminar este registro.");
    }

    await deleteDoc(recordRef);
  }
}
