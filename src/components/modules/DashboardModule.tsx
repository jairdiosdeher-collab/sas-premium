import React from 'react';
import { 
  Users, 
  FileText, 
  Activity, 
  Calendar, 
  BookOpen, 
  AlertTriangle, 
  TrendingUp, 
  Sparkles, 
  Plus, 
  ArrowUpRight,
  ShieldAlert,
  HeartPulse,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Patient, SoapNote, AssessmentResult, Appointment, Sermon, UserProfile } from '../../types';
import { ModuleKey } from '../Sidebar';

interface DashboardModuleProps {
  user: UserProfile;
  patients: Patient[];
  notes: SoapNote[];
  assessments: AssessmentResult[];
  appointments: Appointment[];
  sermons: Sermon[];
  onNavigate: (module: ModuleKey) => void;
  onQuickAction: () => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  user,
  patients,
  notes,
  assessments,
  appointments,
  sermons,
  onNavigate,
  onQuickAction,
}) => {
  const crisisPatients = patients.filter(p => p.riskLevel === 'alto' || p.riskLevel === 'urgente' || p.status === 'en_crisis');
  const upcomingApts = appointments.filter(a => a.status === 'programada').slice(0, 3);
  const recentNotes = notes.slice(0, 3);

  // Compute stats
  const activePatientsCount = patients.filter(p => p.status === 'activo').length;
  const highBurnoutCount = assessments.filter(a => a.type === 'BURNOUT_MBI' && a.score > 35).length;

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Panel Clínico-Pastoral
            </span>
            <span className="text-xs text-slate-400">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            Paz y gracia, {user.name}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            {user.institution} • {user.title}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('sermons')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Preparar Sermón</span>
          </button>
          <button
            onClick={onQuickAction}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Nueva Nota SOAP-S</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigate('patients')}
          className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Casos Activos</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">{activePatientsCount}</p>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
            <span>{patients.length} en total en CRM</span>
          </p>
        </div>

        <div 
          onClick={() => onNavigate('evolution')}
          className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Notas SOAP-S</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">{notes.length}</p>
          <p className="text-[11px] text-blue-300 flex items-center gap-1 mt-1">
            <span>Evolución clínica completa</span>
          </p>
        </div>

        <div 
          onClick={() => onNavigate('assessments')}
          className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Escalas & Psico</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">{assessments.length}</p>
          <p className="text-[11px] text-rose-300 flex items-center gap-1 mt-1">
            <span>{highBurnoutCount} en riesgo de burnout</span>
          </p>
        </div>

        <div 
          onClick={() => onNavigate('sermons')}
          className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Sermones & Series</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">{sermons.length}</p>
          <p className="text-[11px] text-emerald-300 flex items-center gap-1 mt-1">
            <span>Bosquejos exegéticos con IA</span>
          </p>
        </div>
      </div>

      {/* Urgent Crisis Protocol Alert (if any) */}
      {crisisPatients.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-bold text-rose-300">
              Protocolo Ético de Alerta: {crisisPatients.length} caso(s) en seguimiento prioritario
            </p>
            <p className="text-rose-200/80 mt-0.5">
              Pacientes con riesgo moderado/alto identificados por escalas o motivo de consulta. Recuerde activar red de apoyo y no administrar consejería en aislamiento.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {crisisPatients.map(p => (
                <button
                  key={p.id}
                  onClick={() => onNavigate('patients')}
                  className="px-2.5 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 font-semibold text-[11px] transition-colors border border-rose-700"
                >
                  {p.fullName} ({p.riskLevel}) →
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Upcoming Agenda + Recent Evolution Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Appointments with WhatsApp direct trigger */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Próximas Sesiones Agendadas</span>
            </h2>
            <button
              onClick={() => onNavigate('calendar')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              <span>Ver Agenda</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {upcomingApts.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No hay sesiones pendientes.</p>
            ) : (
              upcomingApts.map((apt) => {
                const dateObj = new Date(apt.dateTime);
                const timeStr = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                const dateStr = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

                return (
                  <div
                    key={apt.id}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                        <span className="block text-[10px] uppercase font-bold text-amber-400">{dateStr}</span>
                        <span className="block text-xs font-extrabold text-white">{timeStr}</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">{apt.patientName}</p>
                        <p className="text-[11px] text-slate-400 capitalize">
                          {apt.modality} • {apt.type} ({apt.durationMinutes} min)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {apt.reminderSent ? (
                        <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" /> Recordado
                        </span>
                      ) : (
                        <button
                          onClick={() => onNavigate('calendar')}
                          className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold transition-colors"
                        >
                          WhatsApp →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Evolution Notes (SOAP-S) */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Últimas Notas SOAP-S Registradas</span>
            </h2>
            <button
              onClick={() => onNavigate('evolution')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              <span>Todas las Notas</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentNotes.map((note) => {
              const patient = patients.find(p => p.id === note.patientId);
              return (
                <div
                  key={note.id}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">
                      {patient?.fullName || 'Consultante'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Sesión #{note.sessionNumber} • {note.date}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] line-clamp-2">
                    <strong className="text-slate-300">S:</strong> {note.subjective}
                  </p>
                  <p className="text-amber-300/90 text-[11px] font-serif-bible line-clamp-1">
                    <strong className="text-amber-400">Espiritual:</strong> {note.spiritualDimension}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Launchpad to Core Features */}
      <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Accesos Rápidos de Productividad Ministerial
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate('sermons')}
            className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left transition-all"
          >
            <BookOpen className="w-4 h-4 text-amber-400 mb-1" />
            <p className="text-xs font-bold text-white">Generar Sermón</p>
            <p className="text-[10px] text-slate-400">Exégesis en 3 puntos</p>
          </button>

          <button
            onClick={() => onNavigate('assessments')}
            className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left transition-all"
          >
            <Activity className="w-4 h-4 text-cyan-400 mb-1" />
            <p className="text-xs font-bold text-white">Aplicar PHQ-9 / GAD</p>
            <p className="text-[10px] text-slate-400">Escalas psicométricas</p>
          </button>

          <button
            onClick={() => onNavigate('smallgroups')}
            className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left transition-all"
          >
            <Users className="w-4 h-4 text-emerald-400 mb-1" />
            <p className="text-xs font-bold text-white">Guía de Célula</p>
            <p className="text-[10px] text-slate-400">Estudios y preguntas</p>
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left transition-all"
          >
            <FileText className="w-4 h-4 text-purple-400 mb-1" />
            <p className="text-xs font-bold text-white">Informe PDF Formal</p>
            <p className="text-[10px] text-slate-400">Membrete y firma</p>
          </button>
        </div>
      </div>
    </div>
  );
};
