import React, { useState } from 'react';
import { Lock, ShieldAlert, KeyRound, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SecurityLockModal: React.FC = () => {
  const { isLocked, unlockSession, currentUser, logout } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isLocked) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (unlockSession(pin)) {
      setPin('');
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl relative">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-2xl">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
            Seguridad Clínica & Secreto Pastoral
          </span>
          <h2 className="text-xl font-extrabold text-white mt-2">
            Sesión Protegida por Inactividad
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Hola, <strong>{currentUser.name}</strong>. Para salvaguardar la confidencialidad de los expedientes, ingresa tu clave o PIN de desbloqueo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              autoFocus
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(false);
              }}
              placeholder="Ingresa PIN o contraseña (mínimo 4 caracteres)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-center text-sm text-white tracking-widest placeholder-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-400 font-semibold">
              PIN no válido. Por favor ingresa al menos 4 caracteres.
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <span>Desbloquear Pantalla</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={logout}
            className="text-xs text-slate-400 hover:text-rose-400 font-semibold transition-colors"
          >
            Cerrar Sesión Definitivamente
          </button>
        </div>
      </div>
    </div>
  );
};
