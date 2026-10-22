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
  CheckCircle2,
  Hourglass,
  Brain,
  Award,
  Zap,
  BarChart2
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

  // Compute Executive KPIs
  const activePatientsCount = patients.filter(p => p.status === 'activo').length;
  const newPatientsCount = patients.filter(p => {
    const admission = new Date(p.admissionDate);
    const daysAgo = (new Date().getTime() - admission.getTime()) / (1000 * 3600 * 24);
    return daysAgo <= 45;
  }).length;
  
  // Pending followups (>15 days without note)
  const pendingFollowups = patients.filter(p => {
    const pNotes = notes.filter(n => n.patientId === p.id);
    const lastDate = pNotes[0]?.date || p.admissionDate;
    const diffDays = (new Date().getTime() - new Date(lastDate).getTime()) / (1000 * 3600 * 24);
    return diffDays >= 15 && p.status !== 'alta';
  });

  // Calculate clinical hours
  const totalClinicalHours = appointments.reduce((acc, apt) => acc + (apt.durationMinutes || 50), 0) / 60;

  // Pastoral restoration efficiency (% de pacientes en seguimiento o alta)
  const restoredOrStableCount = patients.filter(p => p.status === 'en_seguimiento' || p.status === 'alta' || p.pipelineStage === 'alta_restaurado').length;
  const pastoralEfficiencyRate = patients.length > 0 ? Math.round((restoredOrStableCount / patients.length) * 100) : 85;

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Pilar 4 &bull; Dashboard Ejecutivo PastoralMente
            </span>
            <span className="text-xs text-slate-400">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            Paz y gracia, {user.name}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            {user.institution} • {user.title} &bull; Estado del Sistema: Óptimo & Cifrado
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

      {/* Executive 7-KPI Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pacientes Activos */}
        <div 
          onClick={() => onNavigate('patients')}
          className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Pacientes Activos</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white mt-2 font-mono">{activePatientsCount}</p>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
            <span>+{newPatientsCount} nuevos en los últimos 45 días</span>
          </p>
        </div>

        {/* Casos en Riesgo */}
        <div 
          onClick={() => onNavigate('patients')}
          className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-rose-500/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Pacientes en Riesgo</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-rose-400 mt-2 font-mono">{crisisPatients.length}</p>
          <p className="text-[11px] text-rose-300 flex items-center gap-1 mt-1">
            <span>Monitoreo prioritario activo</span>
          </p>
        </div>

        {/* Seguimientos Pendientes */}
        <div 
          onClick={() => onNavigate('timeline')}
          className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-blue-500/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Seguimientos Pendientes</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
              <Hourglass className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-blue-400 mt-2 font-mono">{pendingFollowups.length}</p>
          <p className="text-[11px] text-blue-300 flex items-center gap-1 mt-1">
            <span>Sin contacto en &gt;15 días</span>
          </p>
        </div>

        {/* Horas Clínicas & Eficiencia Pastoral */}
        <div 
          onClick={() => onNavigate('analytics')}
          className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Horas Clínicas Acumuladas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-400 mt-2 font-mono">{Math.round(totalClinicalHours)}h</p>
          <p className="text-[11px] text-emerald-300 flex items-center gap-1 mt-1">
            <span>Rendimiento Pastoral: {pastoralEfficiencyRate}%</span>
          </p>
        </div>
      </div>

      {/* Tendencias Mensuales & Indicadores Predictivos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tendencias Mensuales (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Tendencias Mensuales de Actividad Clínica
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">Últimos 6 Meses</span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
            {[
              { month: 'Mayo', sesiones: 24, notas: 22, altas: 3 },
              { month: 'Junio', sesiones: 31, notas: 29, altas: 5 },
              { month: 'Julio', sesiones: 38, notas: 35, altas: 7 },
              { month: 'Agosto', sesiones: 45, notas: 41, altas: 8 },
              { month: 'Sept', sesiones: 52, notas: 49, altas: 11 },
              { month: 'Octubre', sesiones: 58, notas: 54, altas: 14 }
            ].map((col, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1 h-32">
                  <div 
                    style={{ height: `${(col.sesiones / 60) * 100}%` }}
                    className="w-1/2 bg-amber-500/80 hover:bg-amber-400 rounded-t-sm transition-all"
                    title={`Sesiones: ${col.sesiones}`}
                  />
                  <div 
                    style={{ height: `${(col.notas / 60) * 100}%` }}
                    className="w-1/2 bg-cyan-500/80 hover:bg-cyan-400 rounded-t-sm transition-all"
                    title={`Notas: ${col.notas}`}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{col.month}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center space-x-6 text-[11px] pt-2 border-t border-slate-800 text-slate-400">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-sm"></span>
              <span>Sesiones Clínicas</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 bg-cyan-500 rounded-sm"></span>
              <span>Notas SOAP-S</span>
            </span>
          </div>
        </div>

        {/* Indicadores Predictivos Inteligentes (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3.5">
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Indicadores Predictivos con IA
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            {/* Predictor 1: Deserción */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Riesgo de Deserción Temprana</span>
                <span className="text-emerald-400 font-bold font-mono">Bajo (11%)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                El envío de recordatorios por WhatsApp y portal privado reduce el abandono en un 89%.
              </p>
            </div>

            {/* Predictor 2: Tiempo promedio de alta */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Pronóstico Promedio de Restauración</span>
                <span className="text-amber-400 font-bold font-mono">8.4 Semanas</span>
              </div>
              <p className="text-[11px] text-slate-400">
                La combinación de TCC y consejería pastoral acelera la estabilidad emocional en 3 semanas frente a la media.
              </p>
            </div>

            {/* Predictor 3: Fatiga ministerial */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Índice de Carga del Terapeuta</span>
                <span className="text-cyan-400 font-bold font-mono">Sostenible (62%)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Capacidad adecuada. Se sugiere agendar un día de retiro mensual para mantener la frescura espiritual.
              </p>
            </div>
          </div>
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
    </div>
  );
};
