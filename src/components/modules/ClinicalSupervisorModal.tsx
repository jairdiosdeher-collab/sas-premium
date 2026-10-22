import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  BookOpen, 
  Target, 
  Stethoscope, 
  RefreshCw, 
  X, 
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';
import { SoapNote, Patient, ClinicalSupervisorReview } from '../../types';
import { ClinicalSupervisorService } from '../../services/clinicalSupervisorService';

interface ClinicalSupervisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Partial<SoapNote>;
  patient?: Patient;
  onApplyRecommendations?: (enriched: Partial<SoapNote>) => void;
}

export const ClinicalSupervisorModal: React.FC<ClinicalSupervisorModalProps> = ({
  isOpen,
  onClose,
  note,
  patient,
  onApplyRecommendations,
}) => {
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState<ClinicalSupervisorReview | null>(() => {
    return ClinicalSupervisorService.generateHeuristicReview(note, patient);
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunAiAudit = async () => {
    setLoading(true);
    try {
      const res = await ClinicalSupervisorService.reviewSoapNote(note, patient);
      setReview(res);
    } catch (e) {
      console.warn('Audit error', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleApplyToPlanAndSpiritual = () => {
    if (!review || !onApplyRecommendations) return;

    const interventionsText = review.suggestedClinicalInterventions
      .map((i, idx) => `${idx + 1}. [${i.approach}] ${i.technique}: ${i.rationale}`)
      .join('\n');

    const pastoralText = review.pastoralRecommendations
      .map((p) => `Pasaje: ${p.biblicalPassage}\nAcción Pastoral: ${p.pastoralAction}\nConsejo: ${p.spiritualIntegrationTip}`)
      .join('\n\n');

    onApplyRecommendations({
      plan: note.plan ? `${note.plan}\n\n--- Recomendaciones del Supervisor Clínico ---\n${interventionsText}` : interventionsText,
      spiritualDimension: note.spiritualDimension ? `${note.spiritualDimension}\n\n--- Integración Pastoral Sugerida ---\n${pastoralText}` : pastoralText
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white">IA Supervisora Clínica & Pastoral</h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                  Auditoría Ética & DSM-5
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Auditoría en tiempo real para el expediente de <strong className="text-slate-200">{patient?.fullName || 'Consultante'}</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRunAiAudit}
              disabled={loading}
              className="px-3.5 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Auditando...' : 'Reauditar con IA'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {review && (
            <>
              {/* Score & Risk Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Confidence score */}
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center space-x-4">
                  <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={`${
                          review.clinicalConfidenceScore >= 80
                            ? 'text-emerald-500'
                            : review.clinicalConfidenceScore >= 60
                            ? 'text-amber-500'
                            : 'text-rose-500'
                        } transition-all duration-1000`}
                        strokeDasharray={`${review.clinicalConfidenceScore}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-sm font-bold text-white font-mono">
                      {review.clinicalConfidenceScore}%
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-300">Confianza Clínica</h4>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Basado en coherencia diagnóstica, completitud y evidencia documental.
                    </p>
                  </div>
                </div>

                {/* Overall Risk */}
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center space-x-3">
                  <div className={`p-3 rounded-xl shrink-0 ${
                    review.overallRiskLevel === 'urgente' || review.overallRiskLevel === 'alto'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : review.overallRiskLevel === 'moderado'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-300">Nivel de Riesgo Global</h4>
                    <span className={`inline-block mt-0.5 text-xs font-bold uppercase ${
                      review.overallRiskLevel === 'urgente' || review.overallRiskLevel === 'alto'
                        ? 'text-rose-400'
                        : review.overallRiskLevel === 'moderado'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}>
                      {review.overallRiskLevel}
                    </span>
                  </div>
                </div>

                {/* Quick Status */}
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center space-x-3">
                  <div className="p-3 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-300">Estado de Supervisión</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2">
                      {review.clinicalRisksDetected.length > 0
                        ? `${review.clinicalRisksDetected.length} riesgos detectados`
                        : 'Sin contradicciones críticas'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contradicciones y Riesgos */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Detección de Inconsistencias y Riesgos Clínicos</span>
                </h4>

                {review.diagnosticContradictions.map((contra, idx) => (
                  <div key={idx} className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-start space-x-2.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                    <span>{contra}</span>
                  </div>
                ))}

                {review.clinicalRisksDetected.map((risk, idx) => (
                  <div key={idx} className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase tracking-wider text-[11px] text-rose-300">
                        Riesgo: {risk.type.replace('_', ' ')} ({risk.severity})
                      </span>
                    </div>
                    <p className="text-slate-300"><strong className="text-slate-100">Evidencia:</strong> {risk.evidence}</p>
                    <p className="text-rose-300 font-semibold"><strong className="text-rose-200">Protocolo:</strong> {risk.protocolRecommendation}</p>
                  </div>
                ))}
              </div>

              {/* Síntomas Omitidos DSM-5 */}
              {review.omittedSymptomsDsm5.length > 0 && (
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <Stethoscope className="w-4 h-4 text-indigo-400" />
                    <span>Síntomas o Factores DSM-5 Sugeridos para Explorar en Próxima Sesión</span>
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-400 list-disc list-inside">
                    {review.omittedSymptomsDsm5.map((sym, idx) => (
                      <li key={idx} className="text-slate-300">{sym}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Intervenciones Sugeridas & Objetivos Terapéuticos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Intervenciones */}
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span>Intervenciones Clínicas Sugeridas</span>
                  </h4>
                  <div className="space-y-2.5">
                    {review.suggestedClinicalInterventions.map((item, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs space-y-1">
                        <div className="flex items-center justify-between text-emerald-400 font-semibold">
                          <span>[{item.approach}] {item.technique}</span>
                        </div>
                        <p className="text-slate-400 text-[11px]">{item.rationale}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recomendaciones Pastorales */}
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    <span>Integración Pastoral & Escritural</span>
                  </h4>
                  <div className="space-y-2.5">
                    {review.pastoralRecommendations.map((item, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs space-y-1">
                        <div className="font-bold text-purple-300 font-serif">
                          {item.biblicalPassage}
                        </div>
                        <p className="text-slate-300 text-[11px]">{item.pastoralAction}</p>
                        <p className="text-slate-500 text-[10px] italic">{item.spiritualIntegrationTip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Nota del Supervisor */}
              <div className="p-3.5 bg-indigo-950/30 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 leading-relaxed">
                <strong className="block text-indigo-200 mb-1">Dictamen del Supervisor Clínico:</strong>
                {review.supervisorNotes}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            PastoralMente Clinical Supervisor &bull; Cumplimiento Estándar APA / ACA
          </div>
          <div className="flex items-center space-x-2">
            {onApplyRecommendations && (
              <button
                onClick={handleApplyToPlanAndSpiritual}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Aplicar al Plan de la Nota</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
