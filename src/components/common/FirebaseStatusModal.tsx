import React, { useState, useEffect } from 'react';
import { 
  X, 
  Cloud, 
  Database, 
  HardDrive, 
  ShieldCheck, 
  RefreshCw, 
  UserCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Wifi, 
  WifiOff, 
  Activity,
  Layers,
  Archive,
  Clock,
  ArrowRight
} from 'lucide-react';
import { FirebaseService } from '../../services/firebaseService';
import { FirebaseSyncMetrics, BackupRecord, UserProfile } from '../../types';
import { useToast } from '../../context/ToastContext';

interface FirebaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

export const FirebaseStatusModal: React.FC<FirebaseStatusModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  if (!isOpen) return null;

  const { showSuccess, showError, showInfo } = useToast();
  const [metrics, setMetrics] = useState<FirebaseSyncMetrics>(FirebaseService.getMetrics());
  const [recentBackups, setRecentBackups] = useState<BackupRecord[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  useEffect(() => {
    const unsubscribe = FirebaseService.subscribe((updated) => {
      setMetrics(updated);
    });
    FirebaseService.getRecentBackups(5).then(setRecentBackups);
    return () => unsubscribe();
  }, []);

  const handleForceSync = async () => {
    setIsSyncing(true);
    const result = await FirebaseService.forceManualSync();
    setIsSyncing(false);
    if (result.success) {
      showSuccess('Sincronización Exitosa', result.message);
      setMetrics(FirebaseService.getMetrics());
    } else {
      showError('Error de Sincronización', result.message);
    }
  };

  const handleCreateInstantBackup = async () => {
    setIsCreatingBackup(true);
    try {
      const backupId = await FirebaseService.recordBackup(
        'manual_backup',
        'full_snapshot',
        1,
        { trigger: 'manual_ui_action', user: currentUser.email },
        currentUser.id,
        currentUser.name
      );
      showSuccess('Respaldo Registrado', `Punto de restauración creado: ${backupId}`);
      const updated = await FirebaseService.getRecentBackups(5);
      setRecentBackups(updated);
    } catch (e: any) {
      showError('Error creando respaldo', e?.message || 'Fallo desconocido.');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const formatTime = (iso?: string | null) => {
    if (!iso) return 'No registrado aún';
    try {
      const date = new Date(iso);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 text-xs relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xl font-bold shadow-lg shadow-amber-500/10">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <span>Panel de Estado Firebase & Nube</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                SaaS Enterprise
              </span>
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Monitoreo en tiempo real de Firestore, Authentication, Storage, roles y respaldos.
            </p>
          </div>
        </div>

        {/* Traffic Light Grid (Verde / Amarillo / Rojo) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Conexión Firebase */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="font-semibold text-[11px]">Conexión Nube</span>
              <Cloud className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">
                {metrics.connectionStatus === 'connected' ? '🟢' : metrics.connectionStatus === 'syncing' ? '🟡' : '🔴'}
              </span>
              <div>
                <p className="font-bold text-white text-xs capitalize">
                  {metrics.connectionStatus === 'connected' ? 'Conectado' : metrics.connectionStatus === 'syncing' ? 'Sincronizando' : 'Desconectado'}
                </p>
                <p className="text-[10px] text-slate-400">
                  {metrics.isOnline ? 'Internet Activo' : 'Sin Red'}
                </p>
              </div>
            </div>
          </div>

          {/* Autenticación */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="font-semibold text-[11px]">Autenticación</span>
              <UserCheck className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">
                {metrics.authStatus === 'authenticated' ? '🟢' : metrics.authStatus === 'local_fallback' ? '🟡' : '🔴'}
              </span>
              <div>
                <p className="font-bold text-white text-xs">
                  {metrics.authStatus === 'authenticated' ? 'Firebase Auth' : 'Sesión Local'}
                </p>
                <p className="text-[10px] text-slate-400 truncate max-w-[80px]">
                  {currentUser.role}
                </p>
              </div>
            </div>
          </div>

          {/* Firestore */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="font-semibold text-[11px]">Firestore DB</span>
              <Database className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">
                {metrics.firestoreStatus === 'healthy' ? '🟢' : metrics.firestoreStatus === 'read_only' ? '🟡' : '🔴'}
              </span>
              <div>
                <p className="font-bold text-white text-xs capitalize">
                  {metrics.firestoreStatus === 'healthy' ? 'Tiempo Real' : 'Modo Caché'}
                </p>
                <p className="text-[10px] text-slate-400">12 Colecciones</p>
              </div>
            </div>
          </div>

          {/* Storage */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="font-semibold text-[11px]">Cloud Storage</span>
              <HardDrive className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">
                {metrics.storageStatus === 'healthy' ? '🟢' : '🔴'}
              </span>
              <div>
                <p className="font-bold text-white text-xs">
                  {metrics.storageStatus === 'healthy' ? 'Operativo' : 'Inactivo'}
                </p>
                <p className="text-[10px] text-slate-400">PDFs, Audios, Docs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Session & Sync Card */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                Usuario Conectado
              </p>
              <p className="font-bold text-white text-xs flex items-center gap-1.5 mt-0.5">
                <span>{currentUser.name}</span>
                <span className="text-amber-400">({currentUser.email})</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                UID: {currentUser.id || metrics.activeUserUid || 'usr_local_anonymous'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold capitalize text-[11px]">
                Rol: {currentUser.role}
              </span>
              <span className="px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold capitalize text-[11px]">
                Plan: {currentUser.plan}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px]">
            <div>
              <p className="text-slate-400">Última Sincronización:</p>
              <p className="font-semibold text-emerald-400 mt-0.5">
                {formatTime(metrics.lastSyncTime)}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Sincronizaciones Pendientes:</p>
              <p className="font-semibold text-amber-400 mt-0.5">
                {metrics.pendingSyncCount === 0 ? 'Al día (0 en cola)' : `${metrics.pendingSyncCount} pendientes`}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-slate-400">Detección de Red:</p>
              <p className="font-semibold text-cyan-400 mt-0.5 flex items-center gap-1">
                {metrics.isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3 text-rose-400" />}
                <span>{metrics.isOnline ? 'Online con auto-reconexión' : 'Offline (almacenamiento local)'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Colecciones Empresariales Registradas */}
        <div className="space-y-2">
          <p className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Colecciones Activas en Firestore</span>
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-[10px]">
            {[
              'users', 'patients', 'sessions', 'assessments', 
              'appointments', 'notes', 'tasks', 'documents', 
              'sermons', 'journal', 'reports', 'backups'
            ].map((col) => (
              <div 
                key={col} 
                className="px-2.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 font-mono flex items-center justify-between"
              >
                <span>{col}</span>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Registro Reciente de Respaldos de Auditoría */}
        {recentBackups.length > 0 && (
          <div className="space-y-2">
            <p className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
              <Archive className="w-4 h-4 text-cyan-400" />
              <span>Historial de Respaldos Automáticos y Auditoría</span>
            </p>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {recentBackups.map((bkp) => (
                <div 
                  key={bkp.id} 
                  className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-[11px]"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="font-mono text-amber-300">{bkp.id}</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-200 capitalize font-medium">{bkp.action.replace('_', ' ')}</span>
                    <span className="text-slate-500 text-[10px]">({bkp.collectionName})</span>
                  </div>
                  <span className="text-emerald-400 font-semibold text-[10px] shrink-0">
                    {formatTime(bkp.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={handleForceSync}
            disabled={isSyncing}
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Forzar Sincronización Manual'}</span>
          </button>

          <button
            onClick={handleCreateInstantBackup}
            disabled={isCreatingBackup}
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isCreatingBackup ? 'Registrando...' : 'Crear Respaldo Clínico'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
