import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserRole } from '../types';
import { initialUserProfile } from '../data/initialData';
import { AuditService } from '../services/auditService';
import { FirebaseService } from '../services/firebaseService';
import { 
  auth, 
  firestore, 
  googleProvider, 
  isFirebaseConfigured,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  onAuthStateChanged,
  doc,
  getDoc,
  COLLECTIONS,
  FirebaseUser
} from '../firebase';

interface AuthContextType {
  currentUser: UserProfile;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLocked: boolean;
  isCloudConnected: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, pass: string, role: UserRole, institution: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  unlockSession: (pinOrPass: string) => boolean;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  socialLogin: (provider: 'google' | 'microsoft' | 'github') => Promise<{ success: boolean; error?: string }>;
  updateUser: (updated: Partial<UserProfile>) => Promise<void>;
  resetInactivityTimer: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutos de inactividad clínica

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('pm_user_profile');
      return saved ? JSON.parse(saved) : initialUserProfile;
    } catch {
      return initialUserProfile;
    }
  });

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('pm_auth_active') === 'true';
  });

  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(FirebaseService.isCloudConnected());

  const getRoleTitle = (role: UserRole) => {
    switch (role) {
      case 'administrador': return 'Administrador General de la Plataforma';
      case 'psicologo': return 'Psicólogo Clínico Cristiano';
      case 'pastor': return 'Pastor Principal';
      case 'supervisor': return 'Supervisor Clínico & Ministerial';
      case 'invitado': return 'Usuario Invitado / Acceso Demo';
      default: return 'Consejero Pastoral Certificado';
    }
  };

  // Mantener actualizado el usuario activo en FirebaseService
  useEffect(() => {
    FirebaseService.setActiveUser(currentUser, currentUser.id || null);
  }, [currentUser]);

  // Suscribirse a cambios en el estado de sincronización (Nube / Local / Offline)
  useEffect(() => {
    const unsubscribe = FirebaseService.subscribe(() => {
      setIsCloudConnected(FirebaseService.isCloudConnected());
    });
    return () => unsubscribe();
  }, []);

  // Escuchar cambios de autenticación en tiempo real con Firebase Auth
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        setIsAuthenticated(true);
        localStorage.setItem('pm_auth_active', 'true');

        // Intentar leer datos enriquecidos desde la colección 'users/{uid}'
        if (firestore) {
          try {
            const userDocRef = doc(firestore, COLLECTIONS.USERS, fbUser.uid);
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
              const cloudProfile = userSnap.data() as Partial<UserProfile>;
              setCurrentUser((prev) => {
                const updated: UserProfile = {
                  ...prev,
                  ...cloudProfile,
                  id: fbUser.uid,
                  email: fbUser.email || prev.email,
                  name: fbUser.displayName || cloudProfile.name || prev.name,
                };
                localStorage.setItem('pm_user_profile', JSON.stringify(updated));
                FirebaseService.setActiveUser(updated, fbUser.uid);
                return updated;
              });
            } else {
              // Si no existe aún en Firestore, guardamos el perfil inicial
              const profileToSave: UserProfile = {
                ...currentUser,
                id: fbUser.uid,
                email: fbUser.email || currentUser.email,
                name: fbUser.displayName || currentUser.name,
                emailVerified: fbUser.emailVerified,
              };
              await FirebaseService.saveUserProfile(profileToSave);
              FirebaseService.setActiveUser(profileToSave, fbUser.uid);
            }

            // Disparar migración automática con deduplicación y verificación
            FirebaseService.migrateLocalStorageToFirestore(currentUser);
          } catch (e) {
            console.warn('Error sincronizando documento de usuario en Firestore:', e);
          }
        }
      } else {
        setFirebaseUser(null);
        FirebaseService.setActiveUser(null, null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Temporizador de inactividad clínica (15 minutos)
  useEffect(() => {
    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timer);
      if (isAuthenticated && !isLocked) {
        timer = setTimeout(() => {
          setIsLocked(true);
          AuditService.log('LOGOUT', 'Sesión Bloqueada', 'Bloqueo automático de pantalla por inactividad clínica.', currentUser.name, currentUser.id);
        }, INACTIVITY_TIMEOUT);
      }
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(evt => window.addEventListener(evt, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach(evt => window.removeEventListener(evt, resetTimer));
    };
  }, [isAuthenticated, isLocked, currentUser]);

  /**
   * Inicio de Sesión: Autentica contra Firebase Auth si está disponible,
   * o utiliza sesión local si está en modo offline / sin configurar.
   */
  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !pass) return { success: false, error: 'Por favor ingrese correo y contraseña.' };

    if (isFirebaseConfigured && auth && navigator.onLine) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        const fbUser = userCredential.user;
        setFirebaseUser(fbUser);
        setIsAuthenticated(true);
        setIsLocked(false);
        localStorage.setItem('pm_auth_active', 'true');

        const updatedUser: UserProfile = {
          ...currentUser,
          id: fbUser.uid,
          email: fbUser.email || email,
          name: fbUser.displayName || currentUser.name,
          emailVerified: fbUser.emailVerified,
          lastLogin: new Date().toISOString(),
        };

        setCurrentUser(updatedUser);
        await FirebaseService.saveUserProfile(updatedUser);
        FirebaseService.migrateLocalStorageToFirestore(updatedUser);

        AuditService.log('LOGIN', 'Autenticación Firebase', `Inicio de sesión en la nube exitoso para ${email}`, updatedUser.name, fbUser.uid);
        return { success: true };
      } catch (err: any) {
        console.warn('Error en Firebase Auth signIn:', err);
        const errorCode = err?.code;
        let errorMsg = 'Error al iniciar sesión.';
        if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found') {
          errorMsg = 'Correo o contraseña incorrectos. Verifique sus credenciales.';
        } else if (errorCode === 'auth/too-many-requests') {
          errorMsg = 'Acceso bloqueado temporalmente por múltiples intentos fallidos. Intente más tarde.';
        } else if (errorCode === 'auth/invalid-email') {
          errorMsg = 'El formato del correo electrónico no es válido.';
        }
        return { success: false, error: errorMsg };
      }
    }

    // Modo local / contingencia
    await new Promise(r => setTimeout(r, 500));
    setIsAuthenticated(true);
    setIsLocked(false);
    localStorage.setItem('pm_auth_active', 'true');
    AuditService.log('LOGIN', 'Autenticación Local', `Inicio de sesión en Modo Local para ${email}`, currentUser.name, currentUser.id);
    return { success: true };
  };

  /**
   * Registro: Crea el usuario en Firebase Authentication y genera
   * automáticamente el documento en la colección 'users' con sus metadatos.
   */
  const register = async (
    name: string, 
    email: string, 
    pass: string, 
    role: UserRole, 
    institution: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!name || !email || !pass) {
      return { success: false, error: 'Por favor complete todos los campos obligatorios.' };
    }
    if (pass.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
    }

    if (isFirebaseConfigured && auth && navigator.onLine) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const fbUser = userCredential.user;
        setFirebaseUser(fbUser);
        setIsAuthenticated(true);
        setIsLocked(false);
        localStorage.setItem('pm_auth_active', 'true');

        const newUser: UserProfile = {
          ...currentUser,
          id: fbUser.uid,
          name,
          email,
          role,
          title: getRoleTitle(role),
          institution: institution || 'Ministerio Local',
          emailVerified: fbUser.emailVerified,
          plan: 'profesional',
          credits: 50,
          lastLogin: new Date().toISOString(),
        };

        setCurrentUser(newUser);

        // Crear automáticamente documento en users/{uid}
        await FirebaseService.saveUserProfile(newUser);
        // Disparar migración progresiva de datos previos a Firestore
        FirebaseService.migrateLocalStorageToFirestore(newUser);

        AuditService.log('LOGIN', 'Registro Firebase', `Nuevo usuario creado en Firebase Auth & Firestore (${email})`, name, fbUser.uid);
        return { success: true };
      } catch (err: any) {
        console.warn('Error en Firebase Auth signUp:', err);
        const errorCode = err?.code;
        let errorMsg = 'Error al registrar la cuenta.';
        if (errorCode === 'auth/email-already-in-use') {
          errorMsg = 'Este correo electrónico ya está registrado. Por favor inicie sesión.';
        } else if (errorCode === 'auth/weak-password') {
          errorMsg = 'La contraseña debe tener al menos 6 caracteres seguros.';
        } else if (errorCode === 'auth/invalid-email') {
          errorMsg = 'El correo electrónico ingresado no es válido.';
        }
        return { success: false, error: errorMsg };
      }
    }

    // Modo local / contingencia
    await new Promise(r => setTimeout(r, 600));
    const newUser: UserProfile = {
      ...currentUser,
      id: `local_${Date.now()}`,
      name,
      email,
      role,
      title: getRoleTitle(role),
      institution: institution || 'Ministerio Local',
      emailVerified: true,
      lastLogin: new Date().toISOString(),
    };

    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setIsLocked(false);
    localStorage.setItem('pm_user_profile', JSON.stringify(newUser));
    localStorage.setItem('pm_auth_active', 'true');
    AuditService.log('LOGIN', 'Registro Local', `Usuario registrado en Modo Local (${email})`, name);
    return { success: true };
  };

  /**
   * Cierre de sesión real en Firebase Auth y desautorización local
   */
  const logout = async (): Promise<void> => {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.warn('Error cerrando sesión en Firebase:', e);
      }
    }

    setFirebaseUser(null);
    setIsAuthenticated(false);
    setIsLocked(false);
    localStorage.setItem('pm_auth_active', 'false');
    AuditService.log('LOGOUT', 'Cierre de Sesión', 'Cierre de sesión seguro y cierre de sesión en Firebase.', currentUser.name, currentUser.id);
  };

  const unlockSession = (pinOrPass: string): boolean => {
    if (pinOrPass.length >= 4) {
      setIsLocked(false);
      AuditService.log('LOGIN', 'Desbloqueo de Sesión', 'Pantalla clínica desbloqueada exitosamente.', currentUser.name, currentUser.id);
      return true;
    }
    return false;
  };

  /**
   * Recuperación de contraseña real mediante Firebase Auth
   */
  const sendPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
    if (!email) {
      return { success: false, message: 'Por favor ingrese su correo electrónico.' };
    }

    if (isFirebaseConfigured && auth && navigator.onLine) {
      try {
        await sendPasswordResetEmail(auth, email);
        AuditService.log('EDITAR_EXPEDIENTE', 'Recuperar Contraseña', `Correo de restablecimiento de contraseña enviado a ${email}`, currentUser.name);
        return { 
          success: true, 
          message: `Enlace de restablecimiento enviado exitosamente a ${email}. Revise su bandeja de entrada o spam.` 
        };
      } catch (err: any) {
        console.warn('Error enviando reset email:', err);
        let msg = 'No se pudo enviar el correo de recuperación.';
        if (err?.code === 'auth/user-not-found') {
          msg = 'No se encontró ninguna cuenta registrada con este correo.';
        }
        return { success: false, message: msg };
      }
    }

    // Modo local
    await new Promise(r => setTimeout(r, 500));
    AuditService.log('EDITAR_EXPEDIENTE', 'Recuperar Contraseña', `Simulación de recuperación enviada a ${email}`, currentUser.name);
    return { 
      success: true, 
      message: `Enlace de recuperación simulado para ${email} (Modo Local).` 
    };
  };

  /**
   * Login federado con Google u otros proveedores
   */
  const socialLogin = async (provider: 'google' | 'microsoft' | 'github'): Promise<{ success: boolean; error?: string }> => {
    if (provider === 'google' && isFirebaseConfigured && auth && googleProvider && navigator.onLine) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const fbUser = result.user;
        setFirebaseUser(fbUser);
        setIsAuthenticated(true);
        setIsLocked(false);
        localStorage.setItem('pm_auth_active', 'true');

        const updated: UserProfile = {
          ...currentUser,
          id: fbUser.uid,
          name: fbUser.displayName || currentUser.name,
          email: fbUser.email || currentUser.email,
          emailVerified: fbUser.emailVerified,
          avatarUrl: fbUser.photoURL || currentUser.avatarUrl,
          lastLogin: new Date().toISOString(),
        };

        setCurrentUser(updated);
        await FirebaseService.saveUserProfile(updated);
        FirebaseService.migrateLocalStorageToFirestore(updated);

        AuditService.log('LOGIN', 'Google OAuth', `Acceso autenticado con Google (${fbUser.email})`, updated.name, fbUser.uid);
        return { success: true };
      } catch (err: any) {
        console.warn('Error en Google Sign-In:', err);
        return { 
          success: false, 
          error: err?.message || 'Error al autenticar con Google. Verifique la configuración del dominio en Firebase.' 
        };
      }
    }

    // Simulación en modo local / proveedores alternativos
    await new Promise(r => setTimeout(r, 600));
    setIsAuthenticated(true);
    setIsLocked(false);
    localStorage.setItem('pm_auth_active', 'true');
    AuditService.log('LOGIN', 'OAuth Social', `Acceso federado simulado mediante ${provider.toUpperCase()}`, currentUser.name);
    return { success: true };
  };

  const updateUser = async (updated: Partial<UserProfile>): Promise<void> => {
    const merged: UserProfile = { ...currentUser, ...updated };
    setCurrentUser(merged);
    await FirebaseService.saveUserProfile(merged);
  };

  const resetInactivityTimer = () => {
    setIsLocked(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        isAuthenticated,
        isLocked,
        isCloudConnected,
        login,
        register,
        logout,
        unlockSession,
        sendPasswordReset,
        socialLogin,
        updateUser,
        resetInactivityTimer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
