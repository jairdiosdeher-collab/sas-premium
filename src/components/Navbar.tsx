import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Crown, 
  UserCircle2, 
  Globe2, 
  LayoutDashboard, 
  Plus,
  Menu,
  Activity,
  ShieldCheck,
  AlertTriangle,
  Mic
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { FirebaseService } from '../services/firebaseService';

interface NavbarProps {
  user: UserProfile;
  activeView: 'landing' | 'app';
  setActiveView: (view: 'landing' | 'app') => void;
  onOpenBilling: () => void;
  onQuickAction: () => void;
  onChangeRole: (role: UserRole) => void;
  onOpenAuth: () => void;
  onOpenFirebaseStatus?: () => void;
  onToggleMobileMenu?: () => void;
  onOpenAlerts?: () => void;
  activeAlertsCount?: number;
  onOpenVoiceDictation?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeView,
  setActiveView,
  onOpenBilling,
  onQuickAction,
  onChangeRole,
  onOpenAuth,
  onOpenFirebaseStatus,
  onToggleMobileMenu,
  onOpenAlerts,
  activeAlertsCount = 0,
  onOpenVoiceDictation,
}) => {
  const [syncInfo, setSyncInfo] = useState(FirebaseService.getStatusLabel());

  useEffect(() => {
    const unsubscribe = FirebaseService.subscribe(() => {
      setSyncInfo(FirebaseService.getStatusLabel());
    });
    return () => unsubscribe();
  }, []);

  const handleStatusClick = () => {
    if (onOpenFirebaseStatus) {
      onOpenFirebaseStatus();
    } else {
      onOpenAuth();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-4 lg:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
        {/* Left side: Mobile menu toggle + Logo and Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          {activeView === 'app' && onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white md:hidden cursor-pointer"
              title="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div 
            onClick={() => setActiveView('landing')} 
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform font-bold text-base sm:text-lg">
              ✝️
            </div>
            <div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent">
                  PastoralMente
                </span>
                <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  AI Premium
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wide hidden lg:block">
                Suite Clínica, Pastoral y Homilética
              </p>
            </div>
          </div>

          {/* Mode Switcher pill */}
          <div className="hidden lg:flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs ml-3">
            <button
              onClick={() => setActiveView('landing')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'landing'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              Landing Comercial
            </button>
            <button
              onClick={() => setActiveView('app')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'app'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Plataforma SaaS
            </button>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Indicador de Estado Visual: 🟢 Nube conectada o 🔴 Modo local */}
          <button
            onClick={handleStatusClick}
            title="Panel de Estado Firebase. Haga clic para ver métricas en tiempo real."
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all hover:scale-102 cursor-pointer shadow-sm ${syncInfo.color}`}
          >
            <span className="font-semibold tracking-tight text-[11px] sm:text-xs">{syncInfo.label}</span>
          </button>

          {/* Quick AI Credits */}
          <div 
            onClick={onOpenBilling}
            title="Créditos mensuales de IA disponibles"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-amber-300 cursor-pointer hover:border-amber-500/40 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="font-semibold">{user.credits}</span>
            <span className="text-slate-400 text-[11px] hidden md:inline">créditos</span>
          </div>

          {/* Plan badge & Upgrade CTA */}
          <button
            onClick={onOpenBilling}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/40 text-amber-300 text-xs font-semibold hover:border-amber-400 hover:bg-amber-500/30 transition-all shadow-sm cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="capitalize hidden md:inline">{user.plan}</span>
            <span className="text-[10px] bg-amber-400/20 px-1 py-0.2 rounded text-amber-200">
              {user.plan === 'basico' ? '$19/m' : user.plan === 'profesional' ? '$49/m' : '$99/m'}
            </span>
          </button>

          {/* Voice Dictation Button */}
          {activeView === 'app' && onOpenVoiceDictation && (
            <button
              onClick={onOpenVoiceDictation}
              title="Dictado Clínico por Voz (Speech-to-Text SOAP-S)"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span className="hidden lg:inline">Voz SOAP</span>
            </button>
          )}

          {/* Smart Alerts Drawer Button */}
          {activeView === 'app' && onOpenAlerts && (
            <button
              onClick={onOpenAlerts}
              title="Centro de Alertas Clínicas y Pastorales"
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-sm cursor-pointer ${
                activeAlertsCount > 0
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30 animate-pulse'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span className="font-bold">{activeAlertsCount}</span>
              <span className="hidden lg:inline text-[11px]">Alertas</span>
            </button>
          )}

          {/* Quick Action Button */}
          {activeView === 'app' && (
            <button
              onClick={onQuickAction}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden md:inline">Nueva Consulta</span>
            </button>
          )}

          {/* Role selector dropdown & User menu */}
          <div className="relative group">
            <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-800 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-[11px] group-hover:border-amber-500 transition-colors uppercase">
                {user.role === 'administrador' ? 'ADM' : user.role === 'psicologo' ? 'PSI' : user.role === 'pastor' ? 'PAS' : user.role === 'supervisor' ? 'SUP' : 'INV'}
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-xs font-semibold text-slate-200 leading-none truncate max-w-[120px]">
                  {user.name}
                </p>
                <p className="text-[10px] text-amber-400 capitalize mt-0.5">
                  {user.role}
                </p>
              </div>
            </div>

            {/* Quick role change menu with all 5 enterprise levels */}
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2.5 hidden group-hover:block transition-all z-50 animate-in fade-in slide-in-from-top-2">
              <p className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 tracking-wider">
                Control de Acceso por Roles (RBAC)
              </p>

              <button
                onClick={() => onChangeRole('administrador')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer ${
                  user.role === 'administrador' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>👑 Administrador del Sistema</span>
                {user.role === 'administrador' && <span className="text-[10px] text-amber-400 font-bold">✓</span>}
              </button>

              <button
                onClick={() => onChangeRole('psicologo')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer ${
                  user.role === 'psicologo' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>🧠 Psicólogo Clínico</span>
                {user.role === 'psicologo' && <span className="text-[10px] text-amber-400 font-bold">✓</span>}
              </button>

              <button
                onClick={() => onChangeRole('pastor')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer ${
                  user.role === 'pastor' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>✝️ Pastor Principal</span>
                {user.role === 'pastor' && <span className="text-[10px] text-amber-400 font-bold">✓</span>}
              </button>

              <button
                onClick={() => onChangeRole('supervisor')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer ${
                  user.role === 'supervisor' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>🔍 Supervisor Clínico / Ministerial</span>
                {user.role === 'supervisor' && <span className="text-[10px] text-amber-400 font-bold">✓</span>}
              </button>

              <button
                onClick={() => onChangeRole('invitado')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer ${
                  user.role === 'invitado' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>👤 Invitado / Demo</span>
                {user.role === 'invitado' && <span className="text-[10px] text-amber-400 font-bold">✓</span>}
              </button>

              <div className="border-t border-slate-800 my-1.5 pt-1.5 space-y-1">
                {onOpenFirebaseStatus && (
                  <button
                    onClick={onOpenFirebaseStatus}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-emerald-300 hover:bg-emerald-500/10 font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    Panel de Estado Firebase Nube
                  </button>
                )}
                <button
                  onClick={onOpenAuth}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-cyan-300 hover:bg-cyan-500/10 font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <UserCircle2 className="w-3.5 h-3.5" />
                  Cuenta & Autenticación
                </button>
                <button
                  onClick={onOpenBilling}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-amber-400 hover:bg-amber-500/10 font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <Crown className="w-3.5 h-3.5" />
                  Gestionar Suscripción Stripe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
