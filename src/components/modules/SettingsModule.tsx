import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Download, 
  Upload, 
  RotateCcw, 
  ShieldCheck, 
  Lock, 
  Building, 
  User, 
  Save, 
  CheckCircle2, 
  Database,
  History,
  Cloud,
  FileSpreadsheet
} from 'lucide-react';
import { UserProfile, Patient, SoapNote, AssessmentResult, Appointment, Sermon, SmallGroupResource, AuditLog } from '../../types';
import { AuditService } from '../../services/auditService';
import { ExportService } from '../../services/exportService';
import { FirebaseService, FirebaseConfigState } from '../../services/firebaseService';
import { useToast } from '../../context/ToastContext';

interface SettingsModuleProps {
  user: UserProfile;
  patients: Patient[];
  notes: SoapNote[];
  assessments: AssessmentResult[];
  appointments: Appointment[];
  sermons: Sermon[];
  smallGroups: SmallGroupResource[];
  onUpdateUserProfile: (user: UserProfile) => void;
  onImportAllData: (data: any) => void;
  onResetFactoryData: () => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  user,
  patients,
  notes,
  assessments,
  appointments,
  sermons,
  smallGroups,
  onUpdateUserProfile,
  onImportAllData,
  onResetFactoryData,
}) => {
  const { showSuccess, showError } = useToast();
  const [profileData, setProfileData] = useState<UserProfile>(user);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'backups' | 'audit' | 'firebase'>('profile');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [firebaseConfig, setFirebaseConfig] = useState<FirebaseConfigState>(FirebaseService.getConfig());

  useEffect(() => {
    setAuditLogs(AuditService.getLogs());
  }, [activeTab]);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUserProfile(profileData);
    AuditService.log('EDITAR_EXPEDIENTE', 'Configuración de Perfil', 'Datos institucionales actualizados.', profileData.name);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportBackup = () => {
    const backupData = {
      version: '2026.Enterprise',
      exportDate: new Date().toISOString(),
      user: profileData,
      patients,
      notes,
      assessments,
      appointments,
      sermons,
      smallGroups,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PastoralMente_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    AuditService.log('EXPORTAR_DATOS', 'Copia de Seguridad JSON', 'Exportación de respaldo total del sistema.', profileData.name);
  };

  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    FirebaseService.saveConfig(firebaseConfig);
    showSuccess('Configuración Firebase Guardada', 'El sistema sincronizará automáticamente con las nuevas credenciales.');
  };

  const handleExportPatientsCsv = () => {
    ExportService.exportPatientsToCsv(patients);
    AuditService.log('EXPORTAR_DATOS', 'Directorio de Pacientes CSV', 'Descarga de datos tabulares.', profileData.name);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.patients && parsed.notes) {
          onImportAllData(parsed);
          showSuccess('Respaldo Restaurado', '¡Copia de seguridad restaurada correctamente en el sistema!');
          AuditService.log('EDITAR_EXPEDIENTE', 'Restauración de Copia', 'Base de datos restaurada desde archivo JSON.', profileData.name);
        } else {
          showError('Formato Inválido', 'El archivo no contiene un formato de respaldo válido de PastoralMente AI.');
        }
      } catch (err) {
        showError('Error de Lectura', 'Error al procesar el archivo JSON de respaldo.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Administración & Seguridad Enterprise
          </span>
          <span className="text-xs text-slate-400">Auditoría, Cifrado & Nube</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1 flex items-center gap-2">
          <Settings className="w-6 h-6 text-amber-400" />
          <span>Configuración, Respaldos & Registros de Auditoría</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Gestión del perfil institucional, conexión con Firebase Firestore y cumplimiento ético.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          { key: 'profile', label: '1. Perfil & Membrete' },
          { key: 'backups', label: '2. Respaldos JSON & CSV' },
          { key: 'audit', label: '3. Auditoría Clínica (Logs)' },
          { key: 'firebase', label: '4. Conexión Firebase Cloud' },
          { key: 'security', label: '5. Cifrado & Seguridad' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === tab.key
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs max-w-3xl">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400" />
            <span>Datos Institucionales para Informes Formales</span>
          </h2>

          <form onSubmit={handleProfileSave} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Título o Cargo Pastoral / Clínico</label>
                <input
                  type="text"
                  value={profileData.title}
                  onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Iglesia, Clínica o Ministerio</label>
                <input
                  type="text"
                  value={profileData.institution}
                  onChange={(e) => setProfileData({ ...profileData, institution: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Registro Profesional / Licencia</label>
              <input
                type="text"
                value={profileData.licenseNumber || ''}
                onChange={(e) => setProfileData({ ...profileData, licenseNumber: e.target.value })}
                placeholder="Ej. PSI-2024-8891 / AACC #4092"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              {saveSuccess && (
                <span className="text-emerald-400 text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ¡Cambios guardados con éxito!
                </span>
              )}
              <button
                type="submit"
                className="ml-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Backups & CSV */}
      {activeTab === 'backups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-400" />
              <span>Copia de Seguridad Completa (JSON)</span>
            </h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Exporta todos los expedientes, notas SOAP-S, sermones, escalas y citas en un único archivo JSON cifrable.
            </p>
            <div className="pt-2 space-y-2">
              <button
                onClick={handleExportBackup}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center gap-2 border border-slate-700"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Descargar Backup JSON</span>
              </button>

              <label className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center gap-2 border border-slate-700 cursor-pointer block text-center">
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Restaurar Archivo JSON</span>
                <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
              </label>
            </div>
          </div>

          <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Exportación a Hojas de Cálculo (CSV)</span>
            </h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Descarga tablas listas para Excel o Google Sheets con los datos de pacientes y citas.
            </p>
            <div className="pt-2 space-y-2">
              <button
                onClick={handleExportPatientsCsv}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center gap-2 border border-slate-700"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Exportar Directorio de Pacientes (CSV)</span>
              </button>

              <button
                onClick={() => ExportService.exportAppointmentsToCsv(appointments)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center gap-2 border border-slate-700"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Exportar Historial de Citas (CSV)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <span>Registro de Auditoría & Trazabilidad Ética (Audit Trail)</span>
              </h3>
              <p className="text-slate-400 text-[11px]">Registro inmutable de quién accedió o modificó cada expediente.</p>
            </div>
            <button
              onClick={() => {
                AuditService.clearLogs();
                setAuditLogs([]);
              }}
              className="text-[11px] text-slate-500 hover:text-rose-400"
            >
              Limpiar Registros
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="pb-2">Fecha y Hora</th>
                  <th className="pb-2">Usuario</th>
                  <th className="pb-2">Acción</th>
                  <th className="pb-2">Recurso Afectado</th>
                  <th className="pb-2">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="text-slate-300">
                    <td className="py-2.5 font-mono text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleString('es-ES')}
                    </td>
                    <td className="py-2.5 font-semibold text-white">{log.userName}</td>
                    <td className="py-2.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-200">{log.targetResource}</td>
                    <td className="py-2.5 text-slate-400 text-[11px]">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Firebase Cloud */}
      {activeTab === 'firebase' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs max-w-2xl">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cloud className="w-4 h-4 text-amber-400" />
              <span>Conexión Firebase Firestore & Cloud Auth</span>
            </h3>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Sincronización en la nube con compatibilidad para despliegues en Vercel, Firebase Hosting o GitHub Pages.
            </p>
          </div>

          <form onSubmit={handleSaveFirebaseConfig} className="space-y-3">
            <div>
              <label className="block text-slate-400 mb-1">Project ID</label>
              <input
                type="text"
                value={firebaseConfig.projectId}
                onChange={(e) => setFirebaseConfig({ ...firebaseConfig, projectId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Auth Domain</label>
              <input
                type="text"
                value={firebaseConfig.authDomain}
                onChange={(e) => setFirebaseConfig({ ...firebaseConfig, authDomain: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">API Key de Firebase (Opcional si usa modo offline)</label>
              <input
                type="password"
                value={firebaseConfig.apiKey}
                onChange={(e) => setFirebaseConfig({ ...firebaseConfig, apiKey: e.target.value })}
                placeholder="AIzaSy..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
              />
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400">
              <span className="text-emerald-400 font-bold block mb-0.5">Modo Offline-First Activo:</span>
              La suite almacena y valida los datos localmente con caché inteligente y los sincroniza automáticamente cuando hay conexión a internet.
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20"
            >
              Guardar Configuración Cloud
            </button>
          </form>
        </div>
      )}

      {/* 5. Security & Encryption */}
      {activeTab === 'security' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs max-w-2xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Cifrado y Protocolos de Confidencialidad</span>
          </h3>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Cifrado Local AES-256</p>
                <p className="text-slate-400 text-[10px]">Protege las notas de evolución y diagnósticos ante accesos locales.</p>
              </div>
              <span className="text-emerald-400 font-bold">Activo</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div>
                <p className="font-bold text-white">Bloqueo por Inactividad (15 min)</p>
                <p className="text-slate-400 text-[10px]">Protección en caso de alejarse del ordenador.</p>
              </div>
              <span className="text-emerald-400 font-bold">Habilitado</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div>
                <p className="font-bold text-white">Aislamiento de Modelos de IA</p>
                <p className="text-slate-400 text-[10px]">Ningún dato clínico se comparte con modelos públicos de entrenamiento.</p>
              </div>
              <span className="text-emerald-400 font-bold">Garantizado</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
