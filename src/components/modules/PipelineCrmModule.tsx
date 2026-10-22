import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  ArrowRight, 
  Phone, 
  MessageSquare, 
  Tag, 
  Filter, 
  Clock, 
  ChevronRight,
  CheckCircle2,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { Patient, PipelineStage, InteractionLog } from '../../types';

interface PipelineCrmModuleProps {
  patients: Patient[];
  onUpdatePatientStage: (patientId: string, newStage: PipelineStage) => void;
  onAddInteraction: (patientId: string, interaction: InteractionLog) => void;
  onOpenPatientDetail: (patientId: string) => void;
}

export const PipelineCrmModule: React.FC<PipelineCrmModuleProps> = ({
  patients,
  onUpdatePatientStage,
  onAddInteraction,
  onOpenPatientDetail,
}) => {
  const [tagFilter, setTagFilter] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientForLog, setSelectedPatientForLog] = useState<Patient | null>(null);
  const [interactionType, setInteractionType] = useState<InteractionLog['type']>('llamada');
  const [interactionSummary, setInteractionSummary] = useState('');

  const stages: { key: PipelineStage; label: string; color: string; badgeBg: string }[] = [
    { key: 'prospecto', label: '1. Primer Contacto', color: 'border-slate-700', badgeBg: 'bg-slate-800 text-slate-300' },
    { key: 'evaluacion_inicial', label: '2. Evaluación Inicial', color: 'border-amber-500/40', badgeBg: 'bg-amber-500/10 text-amber-300' },
    { key: 'en_consejeria', label: '3. En Consejería Activa', color: 'border-blue-500/40', badgeBg: 'bg-blue-500/10 text-blue-300' },
    { key: 'en_seguimiento', label: '4. En Seguimiento', color: 'border-cyan-500/40', badgeBg: 'bg-cyan-500/10 text-cyan-300' },
    { key: 'alta_restaurado', label: '5. Alta / Restaurado', color: 'border-emerald-500/40', badgeBg: 'bg-emerald-500/10 text-emerald-300' },
  ];

  const handleStageMove = (patientId: string, nextStage: PipelineStage) => {
    onUpdatePatientStage(patientId, nextStage);
  };

  const handleSaveInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientForLog || !interactionSummary.trim()) return;

    const newLog: InteractionLog = {
      id: `int-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: interactionType,
      summary: interactionSummary,
      ministerName: 'Consejero Asignado',
    };

    onAddInteraction(selectedPatientForLog.id, newLog);
    setSelectedPatientForLog(null);
    setInteractionSummary('');
  };

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = tagFilter === 'todos' || (p.tags && p.tags.includes(tagFilter));
    return matchesSearch && matchesTag;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              CRM & Funnel de Restauración
            </span>
            <span className="text-xs text-slate-400">Pipeline Visual de 5 Fases</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1 flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            <span>Embudo Clínico-Pastoral & Gestión de Interacciones</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Acompaña el progreso de cada miembro o consultante desde el primer contacto hasta el alta integral.
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar en pipeline..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Visual Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 overflow-x-auto pb-4">
        {stages.map((stage, stageIdx) => {
          const stagePatients = filteredPatients.filter(p => (p.pipelineStage || 'en_consejeria') === stage.key);

          return (
            <div key={stage.key} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between min-w-[230px]">
              <div>
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${stage.badgeBg}`}>
                    {stage.label}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {stagePatients.length}
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
                  {stagePatients.length === 0 ? (
                    <div className="p-6 text-center text-[10px] text-slate-600 border border-dashed border-slate-800 rounded-xl">
                      Sin casos en esta fase
                    </div>
                  ) : (
                    stagePatients.map((pat) => (
                      <div
                        key={pat.id}
                        className="p-3 bg-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-xl text-xs space-y-2 shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p 
                              onClick={() => onOpenPatientDetail(pat.id)}
                              className="font-bold text-slate-200 hover:text-amber-300 cursor-pointer text-xs"
                            >
                              {pat.fullName}
                            </p>
                            <span className="text-[10px] text-slate-500 font-mono">{pat.code}</span>
                          </div>

                          <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
                            pat.riskLevel === 'urgente' || pat.riskLevel === 'alto'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {pat.riskLevel}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {pat.primaryReason}
                        </p>

                        {/* Quick action buttons */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                          <button
                            onClick={() => setSelectedPatientForLog(pat)}
                            className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Interacción</span>
                          </button>

                          {/* Move to next stage button */}
                          {stageIdx < stages.length - 1 && (
                            <button
                              onClick={() => handleStageMove(pat.id, stages[stageIdx + 1].key)}
                              title={`Avanzar a ${stages[stageIdx + 1].label}`}
                              className="p-1 rounded bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-400 text-[10px] flex items-center gap-0.5 transition-colors"
                            >
                              <span>Avanzar</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: New Interaction Log */}
      {selectedPatientForLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>Registrar Interacción con {selectedPatientForLog.fullName}</span>
            </h3>

            <form onSubmit={handleSaveInteraction} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Tipo de Interacción</label>
                <select
                  value={interactionType}
                  onChange={(e) => setInteractionType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  <option value="llamada">Llamada Telefónica</option>
                  <option value="whatsapp">Mensaje de WhatsApp</option>
                  <option value="sesion">Sesión Presencial / Virtual</option>
                  <option value="oracion">Tiempo de Intercesión y Oración</option>
                  <option value="visita_hospital">Visita Hospitalaria / Hogar</option>
                  <option value="correo">Correo Electrónico</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Resumen del Contacto *</label>
                <textarea
                  required
                  rows={3}
                  value={interactionSummary}
                  onChange={(e) => setInteractionSummary(e.target.value)}
                  placeholder="Ej. Llamada de seguimiento de 10 min. Reporta haber dormido mejor. Se oró por su paz en el trabajo..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPatientForLog(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                >
                  Guardar en Historial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
