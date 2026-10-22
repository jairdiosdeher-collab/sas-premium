import React, { useState } from 'react';
import { X, Lock, Mail, User, ArrowRight, Loader2, Globe, Cloud, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'login' }) => {
  if (!isOpen) return null;

  const { login, register, sendPasswordReset, socialLogin, isCloudConnected } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(defaultMode);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('psicologo');
  const [institution, setInstitution] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (mode === 'login') {
      const res = await login(email, password);
      setIsLoading(false);
      if (res.success) {
        onClose();
      } else {
        setErrorMessage(res.error || 'Credenciales no válidas.');
      }
    } else if (mode === 'register') {
      const res = await register(fullName, email, password, role, institution);
      setIsLoading(false);
      if (res.success) {
        onClose();
      } else {
        setErrorMessage(res.error || 'Error al crear la cuenta.');
      }
    } else {
      const res = await sendPasswordReset(email);
      setIsLoading(false);
      if (res.success) {
        setSuccessMessage(res.message);
      } else {
        setErrorMessage(res.message);
      }
    }
  };

  const handleSocial = async (provider: 'google' | 'microsoft' | 'github') => {
    setIsLoading(true);
    setErrorMessage(null);
    const res = await socialLogin(provider);
    setIsLoading(false);
    if (res.success) {
      onClose();
    } else if (res.error) {
      setErrorMessage(res.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-5 my-8 text-xs relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto text-xl font-bold mb-2">
            ✝️
          </div>
          <h2 className="text-xl font-extrabold text-white">
            {mode === 'login' && 'Iniciar Sesión en PastoralMente AI'}
            {mode === 'register' && 'Crear Cuenta Profesional Enterprise'}
            {mode === 'forgot' && 'Recuperar Contraseña'}
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Suite clínica y pastoral con Firebase Auth & Firestore.
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px]">
            {isCloudConnected ? (
              <>
                <Cloud className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">🟢 Nube conectada</span>
              </>
            ) : (
              <>
                <Globe className="w-3 h-3 text-rose-400" />
                <span className="text-rose-400 font-semibold">🔴 Modo local</span>
              </>
            )}
          </div>
        </div>

        {/* Tab switch */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => { setMode('login'); setErrorMessage(null); }}
              className={`py-1.5 rounded-lg font-bold transition-all ${
                mode === 'login' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => { setMode('register'); setErrorMessage(null); }}
              className={`py-1.5 rounded-lg font-bold transition-all ${
                mode === 'register' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Registrarse Gratis
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-semibold">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nombre y Apellidos</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej. Dr. Samuel Ortiz"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pastor@ministerio.org"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-semibold">Contraseña</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setErrorMessage(null); }}
                    className="text-amber-400 hover:text-amber-300 text-[11px]"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Rol Principal</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white"
                  >
                    <option value="psicologo">Psicólogo Clínico</option>
                    <option value="pastor">Pastor Principal</option>
                    <option value="supervisor">Supervisor Clínico</option>
                    <option value="administrador">Administrador del Sistema</option>
                    <option value="invitado">Invitado / Demo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Institución</label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="Iglesia o Centro"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Autenticando con Firebase...</span>
              </>
            ) : (
              <>
                <span>
                  {mode === 'login' && 'Acceder a la Suite'}
                  {mode === 'register' && 'Crear Cuenta y Probar Gratis'}
                  {mode === 'forgot' && 'Enviar Correo de Recuperación'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Social Logins */}
        {mode !== 'forgot' && (
          <div className="space-y-3 pt-2">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[10px] text-slate-500 uppercase font-bold tracking-wider relative">
                O continuar con
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSocial('google')}
                className="py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 font-semibold text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer hover:border-amber-500/40"
              >
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocial('microsoft')}
                className="py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 font-semibold text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer hover:border-amber-500/40"
              >
                <span>Microsoft</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocial('github')}
                className="py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 font-semibold text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer hover:border-amber-500/40"
              >
                <span>GitHub</span>
              </button>
            </div>
          </div>
        )}

        {mode === 'forgot' && (
          <div className="text-center pt-2">
            <button
              onClick={() => { setMode('login'); setErrorMessage(null); setSuccessMessage(null); }}
              className="text-xs text-amber-400 hover:underline cursor-pointer"
            >
              ← Volver a Iniciar Sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
