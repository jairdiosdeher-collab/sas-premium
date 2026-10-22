import React from 'react';
import { 
  Sparkles, 
  Crown, 
  UserCircle2, 
  Globe2, 
  LayoutDashboard, 
  Flame, 
  Bell,
  Search,
  Plus
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface NavbarProps {
  user: UserProfile;
  activeView: 'landing' | 'app';
  setActiveView: (view: 'landing' | 'app') => void;
  onOpenBilling: () => void;
  onQuickAction: () => void;
  onChangeRole: (role: UserRole) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeView,
  setActiveView,
  onOpenBilling,
  onQuickAction,
  onChangeRole,
  onOpenAuth,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setActiveView('landing')} 
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform font-bold text-lg">
              ✝️
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent">
                  PastoralMente
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  AI Premium
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wide hidden sm:block">
                Suite Clínica, Pastoral y Homilética
              </p>
            </div>
          </div>

          {/* Mode Switcher pill */}
          <div className="hidden md:flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs ml-4">
            <button
              onClick={() => setActiveView('landing')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
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
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
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
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick AI Credits */}
          <div 
            onClick={onOpenBilling}
            title="Créditos mensuales de IA disponibles"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-amber-300 cursor-pointer hover:border-amber-500/40 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="font-semibold">{user.credits}</span>
            <span className="text-slate-400 text-[11px]">créditos</span>
          </div>

          {/* Plan badge & Upgrade CTA */}
          <button
            onClick={onOpenBilling}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/40 text-amber-300 text-xs font-semibold hover:border-amber-400 hover:bg-amber-500/30 transition-all shadow-sm"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span className="capitalize hidden xs:inline">{user.plan}</span>
            <span className="text-[10px] bg-amber-400/20 px-1 py-0.2 rounded text-amber-200">
              {user.plan === 'basico' ? '$19/m' : user.plan === 'profesional' ? '$49/m' : '$99/m'}
            </span>
          </button>

          {/* Quick Action Button */}
          {activeView === 'app' && (
            <button
              onClick={onQuickAction}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden sm:inline">Nueva Consulta / Nota</span>
            </button>
          )}

          {/* Role selector dropdown */}
          <div className="relative group">
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs group-hover:border-amber-500 transition-colors">
                {user.role === 'psicologo' ? 'PSI' : user.role === 'pastor' ? 'PAS' : 'CON'}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-slate-200 leading-none truncate max-w-[130px]">
                  {user.name}
                </p>
                <p className="text-[10px] text-amber-400 capitalize mt-0.5">
                  {user.role}
                </p>
              </div>
            </div>

            {/* Quick role change menu */}
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 hidden group-hover:block transition-all z-50">
              <p className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 tracking-wider">
                Cambiar Rol en el Sistema
              </p>
              <button
                onClick={() => onChangeRole('psicologo')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                  user.role === 'psicologo' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>Psicólogo Clínico Cristiano</span>
                {user.role === 'psicologo' && <span className="text-[10px] text-amber-400 font-bold">✓</span>}
              </button>
              <button
                onClick={() => onChangeRole('pastor')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                  user.role === 'pastor' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>Pastor Principal</span>
                {user.role === 'pastor' && <span className="text-[10px] text-amber-400 font-bold">✓</span>}
              </button>
              <button
                onClick={() => onChangeRole('consejero')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                  user.role === 'consejero' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>Consejero Matrimonial / Familiar</span>
                {user.role === 'consejero' && <span className="text-[10px] text-amber-400 font-bold">✓</span>}
              </button>
              <div className="border-t border-slate-800 my-1 pt-1 space-y-1">
                <button
                  onClick={onOpenAuth}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-cyan-300 hover:bg-cyan-500/10 font-medium flex items-center gap-1.5"
                >
                  <UserCircle2 className="w-3.5 h-3.5" />
                  Cuenta & Autenticación Firebase
                </button>
                <button
                  onClick={onOpenBilling}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-amber-400 hover:bg-amber-500/10 font-medium flex items-center gap-1.5"
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
