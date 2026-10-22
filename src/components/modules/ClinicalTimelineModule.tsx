import React, { useState } from 'react';
import { 
  Clock, 
  FileText, 
  Paperclip, 
  Activity, 
  Calendar, 
  PenTool, 
  Upload, 
  CheckCircle2, 
  ShieldCheck, 
  Image as ImageIcon,
  User,
  Plus
} from 'lucide-react';
import { Patient, SoapNote, AssessmentResult, PatientAttachment } from '../../types';
import { DigitalSignaturePad } from '../common/DigitalSignaturePad';

interface ClinicalTimelineModuleProps {
  patients: Patient[];
  notes: SoapNote[];
  assessments: AssessmentResult[];
  onAddAttachment: (patientId: string, attachment: PatientAttachment) => void;
  onSaveConsentSignature: (patientId: string, signatureUrl: string) => void;
}

export const ClinicalTimelineModule: React.FC<ClinicalTimelineModuleProps> = ({
  patients,
  notes,
  assessments,
  onAddAttachment,
  onSaveConsentSignature,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [isSigning, setIsSigning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentType, setAttachmentType] = useState<PatientAttachment['type']>('informe_medico');

  const patient = patients.find(p => p.id === selectedPatientId);
  const patientNotes = notes.filter(n => n.patientId === selectedPatientId);
  const patientAssessments = assessments.filter(a => a.patientId === selectedPatientId);

  // Merge events into a chronological timeline
  const timelineEvents: {
    id: string;
    date: string;
    title: string;
    type: 'soap' | 'assessment' | 'attachment' | 'consent';
    summary: string;
    details?: string;
  }[] = [
    ...patientNotes.map(n => ({
      id: n.id,
      date: n.date,
      title: `Nota de Evolución SOAP-S (Sesión #${n.sessionNumber})`,
      type: 'soap' as const,
      summary: n.assessment,
      details: n.spiritualDimension,
    })),
    ...patientAssessments.map(a => ({
      id: a.id,
      date: a.date,
      title: `Evaluación Psicométrica: ${a.title}`,
      type: 'assessment' as const,
      summary: `Puntaje: ${a.score}/${a.maxScore} pts - ${a.severity}`,
      details: a.pastoralRecommendation,
    })),
    ...(patient?.attachments || []).map(att => ({
      id: att.id,
      date: att.dateUploaded,
      title: `Documento Adjunto: ${att.name}`,
      type: 'attachment' as const,
      summary: `Tipo: ${att.type} (${att.fileSize})`,
      details: att.notes,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSaveAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachmentName.trim() || !patient) return;

    const newAtt: PatientAttachment = {
      id: `att-${Date.now()}`,
      name: attachmentName,
      type: attachmentType,
      dateUploaded: new Date().toISOString().split('T')[0],
      fileSize: '1.4 MB',
      notes: 'Documento verificado y archivado con cifrado.',
    };

    onAddAttachment(patient.id, newAtt);
    setAttachmentName('');
    setIsUploading(false);
  };

  const handleSignatureComplete = (dataUrl: string) => {
    if (patient) {
      onSaveConsentSignature(patient.id, dataUrl);
      setIsSigning(false);
      alert('¡Firma digital de consentimiento informada guardada en el expediente!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Cronología Clínica & Auditoría
            </span>
            <span className="text-xs text-slate-400">Trazabilidad Longitudinal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1 flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-400" />
            <span>Timeline Clínico, Adjuntos & Firma Digital</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Evolución cronológica de sesiones, pruebas psicométricas, documentos escaneados y consentimientos informados.
          </p>
        </div>

        {/* Patient Picker & Action buttons */}
        <div className="flex items-center gap-3">
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white cursor-pointer"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.fullName} ({p.code})</option>
            ))}
          </select>

          <button
            onClick={() => setIsUploading(true)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
            <span>Adjuntar Archivo</span>
          </button>

          <button
            onClick={() => setIsSigning(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Firmar Consentimiento</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Timeline (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-bold text-white">
            <span>Línea de Tiempo Longitudinal ({timelineEvents.length} eventos registrados)</span>
            <span className="text-slate-400 font-normal">Expediente: {patient?.code}</span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
            {timelineEvents.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No hay registros cronológicos para este consultante.</p>
            ) : (
              timelineEvents.map((evt) => (
                <div key={evt.id} className="relative group text-xs">
                  {/* Dot */}
                  <div className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-slate-900 ${
                    evt.type === 'soap' ? 'bg-amber-400' : evt.type === 'assessment' ? 'bg-rose-400' : 'bg-cyan-400'
                  }`} />

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 hover:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-white text-xs">{evt.title}</span>
                      <span className="text-slate-400 font-mono">{evt.date}</span>
                    </div>

                    <p className="text-slate-300 leading-relaxed">{evt.summary}</p>

                    {evt.details && (
                      <p className="text-[11px] text-amber-300/80 font-serif-bible pt-1 border-t border-slate-900">
                        {evt.details}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Consent & Documents Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-4 text-xs">
          {/* Digital Signature Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Consentimiento Informado & Ética</span>
            </h3>

            {patient?.digitalSignatureUrl ? (
              <div className="space-y-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                  ✓ Firma Digital Verificada
                </span>
                <img
                  src={patient.digitalSignatureUrl}
                  alt="Firma del paciente"
                  className="max-h-20 mx-auto filter invert brightness-200"
                />
                <p className="text-[10px] text-slate-500">
                  Firmado digitalmente: {patient.signedConsentDate || '2026-10-14'}
                </p>
              </div>
            ) : (
              <div className="p-4 bg-slate-950 rounded-xl border border-dashed border-slate-800 text-center text-slate-500 space-y-2">
                <p className="text-[11px]">No se ha registrado aún la firma de consentimiento informado.</p>
                <button
                  onClick={() => setIsSigning(true)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  Solicitar Firma Ahora
                </button>
              </div>
            )}
          </div>

          {/* Attachments Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-1.5">
                <Paperclip className="w-4 h-4 text-cyan-400" />
                <span>Expedientes Escaneados ({patient?.attachments?.length || 0})</span>
              </h3>
              <button
                onClick={() => setIsUploading(true)}
                className="text-amber-400 hover:underline text-[11px] font-semibold"
              >
                + Subir
              </button>
            </div>

            <div className="space-y-2">
              {(patient?.attachments || []).length === 0 ? (
                <p className="text-slate-500 text-[11px] italic py-2">Sin documentos adjuntos.</p>
              ) : (
                patient?.attachments?.map(att => (
                  <div key={att.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-200">{att.name}</p>
                      <p className="text-slate-500 text-[10px]">{att.dateUploaded} • {att.fileSize}</p>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 font-mono">
                      PDF
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Signature Pad Modal */}
      {isSigning && (
        <DigitalSignaturePad
          title={`Firma de Consentimiento - ${patient?.fullName}`}
          onSaveSignature={handleSignatureComplete}
          onCancel={() => setIsSigning(false)}
        />
      )}

      {/* Upload Modal */}
      {isUploading && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>Adjuntar Documento al Expediente</span>
            </h3>

            <form onSubmit={handleSaveAttachment} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre o Título del Documento *</label>
                <input
                  type="text"
                  required
                  value={attachmentName}
                  onChange={(e) => setAttachmentName(e.target.value)}
                  placeholder="Ej. Resumen de Psiquiatría Tratante Dr. Gómez"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tipo de Archivo</label>
                <select
                  value={attachmentType}
                  onChange={(e) => setAttachmentType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  <option value="informe_medico">Informe Médico / Psiquiátrico</option>
                  <option value="consentimiento_firmado">Consentimiento Firmado Escaneado</option>
                  <option value="prueba_laboratorio">Pruebas o Análisis de Laboratorio</option>
                  <option value="fotografia">Fotografía de Registro</option>
                  <option value="otro">Otro Documento de Relevancia</option>
                </select>
              </div>

              <div className="p-4 border-2 border-dashed border-slate-700 rounded-xl bg-slate-950 text-center text-slate-400">
                <Upload className="w-6 h-6 text-slate-500 mx-auto mb-1" />
                <p>Archivo simulado listo para vincular</p>
                <span className="text-[10px] text-slate-500">Formatos permitidos: PDF, JPG, PNG (máx 15MB)</span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploading(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-md shadow-cyan-600/20"
                >
                  Guardar Archivo en Expediente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
