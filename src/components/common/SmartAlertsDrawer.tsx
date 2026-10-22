import React from 'react';
import { 
  AlertTriangle, 
  Flame, 
  HeartCrack, 
  CalendarX, 
  Clock, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  ShieldAlert, 
  PhoneCall,
  Activity
} from 'lucide-react';
import { SmartAlert } from '../../types';

interface SmartAlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: SmartAlert[];
  onSelectPatient: (patientId: string) => void;
  onResolveAlert?: (alertId: string) => void;
}

export const SmartAlertsDrawer: React.FC<SmartAlertsDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  onSelectPatient,
  onResolveAlert,
}) => {
  if (!isOpen) return null;

  const criticalCount = alerts.filter((a) => a.severity === 'critica').length;
  const highCount = alerts.filter((a) => a.severity === 'alta').length;

  const getAlertIcon = (type: SmartAlert['type']) => {
    switch (type) {
      case 'riesgo_suicida':
      case 'crisis_activa':
        return <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />;
      case 'phq9_severo':
        return <HeartCrack className="w-5 h-5 text-amber-400" />;
      case 'gad7_severo':
        return <Activity className="w-5 h-5 text-amber-400" />;
      case 'burnout_pastoral':
        return <Flame className="w-5 h-5 text-orange-400" />;
      case 'sin_seguimiento':
        return <Clock className="w-5 h-5 text-blue-400" />;
      case 'inasistencias':
        return <CalendarX className="w-5 h-5 text-purple-400" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getSeverityBadge = (sev: SmartAlert['severity']) => {
    switch (sev) {
      case 'critica':
        return (
          <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full animate-pulse">
            Crítica
          </span>
        );
      case 'alta':
        return (
          <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
            Alta Prioridad
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-full">
            Seguimiento
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl overflow-hidden animate-slideLeft">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-rose-950/30 via-slate-900 to-slate-900 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Centro de Alertas Clínicas</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                  {alerts.length}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {criticalCount > 0 ? `${criticalCount} críticas que requieren atención inmediata` : 'Detección proactiva de riesgos'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Severity Summary Bar */}
        <div className="px-5 py-2.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>{criticalCount} Críticas</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>{highCount} Altas</span>
            </span>
          </div>
          <span className="text-[11px] text-slate-500">Protocolo DSM-5 & Consejería</span>
        </div>

        {/* List of alerts */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {alerts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-400/60" />
              <p className="text-sm font-semibold text-slate-300">Sin Alertas Activas</p>
              <p className="text-xs text-slate-500 max-w-xs">
                Todos los consultantes se encuentran con seguimiento regular y sin riesgo vital detectado.
              </p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition shadow-sm ${
                  alert.severity === 'critica'
                    ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500/60'
                    : alert.severity === 'alta'
                    ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-500/60'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    {getAlertIcon(alert.type)}
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">
                        {alert.summary}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {alert.patientName} &bull; {alert.patientCode}
                      </p>
                    </div>
                  </div>
                  {getSeverityBadge(alert.severity)}
                </div>

                <p className="text-xs text-slate-300 mb-2 leading-relaxed bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  {alert.triggerDetail}
                </p>

                <div className="text-[11px] text-indigo-300 bg-indigo-950/30 border border-indigo-500/20 p-2 rounded-lg mb-3">
                  <strong className="block text-indigo-200 mb-0.5">Acción Recomendada:</strong>
                  {alert.suggestedAction}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-500">
                    {new Date(alert.detectedAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex items-center space-x-2">
                    {onResolveAlert && (
                      <button
                        onClick={() => onResolveAlert(alert.id)}
                        className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/30 rounded-md transition"
                      >
                        Marcar Atendida
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onSelectPatient(alert.patientId);
                        onClose();
                      }}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1 shadow-sm transition"
                    >
                      <span>Expediente</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            PastoralMente Proactive Risk Sentinel
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
