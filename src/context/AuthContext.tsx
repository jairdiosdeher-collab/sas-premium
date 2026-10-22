import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserRole } from '../types';
import { initialUserProfile } from '../data/initialData';
import { AuditService } from '../services/auditService';

interface AuthContextType {
  currentUser: UserProfile;
  isAuthenticated: boolean;
  isLocked: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, pass: string, role: UserRole, institution: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  unlockSession: (pinOrPass: string) => boolean;
  sendPasswordReset: (email: string) => Promise<boolean>;
  socialLogin: (provider: 'google' | 'microsoft' | 'github') => Promise<void>;
  updateUser: (updated: Partial<UserProfile>) => void;
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

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('pm_auth_active') === 'true';
  });

  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Inactivity timer
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

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise(r => setTimeout(r, 600)); // Simulación de latencia de red segura
    if (!email || !pass) return { success: false, error: 'Credenciales incompletas.' };

    setIsAuthenticated(true);
    setIsLocked(false);
    localStorage.setItem('pm_auth_active', 'true');
    AuditService.log('LOGIN', 'Autenticación', `Inicio de sesión exitoso como ${email}`, currentUser.name, currentUser.id);
    return { success: true };
  };

  const register = async (name: string, email: string, pass: string, role: UserRole, institution: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise(r => setTimeout(r, 700));
    if (!name || !email || !pass) return { success: false, error: 'Por favor complete todos los campos obligatorios.' };

    const newUser: UserProfile = {
      ...currentUser,
      name,
      email,
      role,
      institution: institution || 'Ministerio Local',
      emailVerified: true,
      lastLogin: new Date().toISOString(),
    };

    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setIsLocked(false);
    localStorage.setItem('pm_user_profile', JSON.stringify(newUser));
    localStorage.setItem('pm_auth_active', 'true');
    AuditService.log('LOGIN', 'Registro Nuevo', `Usuario registrado exitosamente (${email}) con rol ${role}`, name);
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsLocked(false);
    localStorage.setItem('pm_auth_active', 'false');
    AuditService.log('LOGOUT', 'Cierre de Sesión', 'Cierre de sesión manual voluntario.', currentUser.name, currentUser.id);
  };

  const unlockSession = (pinOrPass: string): boolean => {
    if (pinOrPass.length >= 4) {
      setIsLocked(false);
      AuditService.log('LOGIN', 'Desbloqueo de Sesión', 'Pantalla clínica desbloqueada exitosamente.', currentUser.name, currentUser.id);
      return true;
    }
    return false;
  };

  const sendPasswordReset = async (email: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 500));
    AuditService.log('EDITAR_EXPEDIENTE', 'Recuperar Contraseña', `Enlace de recuperación enviado a ${email}`, currentUser.name);
    return true;
  };

  const socialLogin = async (provider: 'google' | 'microsoft' | 'github') => {
    await new Promise(r => setTimeout(r, 600));
    setIsAuthenticated(true);
    setIsLocked(false);
    localStorage.setItem('pm_auth_active', 'true');
    AuditService.log('LOGIN', 'OAuth Social', `Acceso federado mediante ${provider.toUpperCase()}`, currentUser.name);
  };

  const updateUser = (updated: Partial<UserProfile>) => {
    setCurrentUser(prev => {
      const merged = { ...prev, ...updated };
      localStorage.setItem('pm_user_profile', JSON.stringify(merged));
      return merged;
    });
  };

  const resetInactivityTimer = () => {
    setIsLocked(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isLocked,
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
