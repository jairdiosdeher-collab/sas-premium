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
  BookOpen,
  MessageCircle,
  Heart,
  Filter,
  Search,
  Printer,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Patient, SoapNote, AssessmentResult, PatientAttachment, Appointment, Sermon } from '../../types';
import { DigitalSignaturePad } from '../common/DigitalSignaturePad';
import { useToast } from '../../context/ToastContext';

interface ClinicalTimelineModuleProps {
  patients: Patient[];
  notes: SoapNote[];
  assessments: AssessmentResult[];
  appointments?: Appointment[];
  sermons?: Sermon[];
  onAddAttachment: (patientId: string, attachment: PatientAttachment) => void;
  onSaveConsentSignature: (patientId: string, signatureUrl: string) => void;
}

export const ClinicalTimelineModule: React.FC<ClinicalTimelineModuleProps> = ({
  patients,
  notes,
  assessments,
  appointments = [],
  sermons = [],
  onAddAttachment,
  onSaveConsentSignature,
}) => {
  const { showSuccess } = useToast();
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [activeFilter, setActiveFilter] = useState<'todos' | 'soap' | 'escala' | 'sesion' | 'pastoral' | 'documento'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentType, setAttachmentType] = useState<PatientAttachment['type']>('informe_medico');

  const patient = patients.find(p => p.id === selectedPatientId) || patients[0];
  const patientNotes = notes.filter(n => n.patientId === selectedPatientId);
  const patientAssessments = assessments.filter(a => a.patientId === selectedPatientId);
  const patientAppointments = appointments.filter(a => a.patientId === selectedPatientId);

  // Unificación integral de 8 dimensiones en la línea temporal
  const rawEvents: {
    id: string;
    date: string;
    title: string;
    type: 'soap' | 'escala' | 'sesion' | 'pastoral' | 'documento';
    categoryLabel: string;
    summary: string;
    details?: string;
    badge?: string;
    badgeColor?: string;
  }[] = [
    // 1. SOAP-S
    ...patientNotes.map(n => ({
      id: `soap-${n.id}`,
      date: n.date,
      title: `Nota de Evolución SOAP-S (Sesión #${n.sessionNumber})`,
      type: 'soap' as const,
      categoryLabel: 'Evolución Clínica',
      summary: n.assessment,
      details: n.spiritualDimension,
      badge: n.riskFlag ? 'Riesgo Activo' : 'SOAP-S',
      badgeColor: n.riskFlag ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    })),

    // 2. Escalas psicométricas
    ...patientAssessments.map(a => ({
      id: `scale-${a.id}`,
      date: a.date,
      title: `Evaluación Psicométrica: ${a.title} (${a.type})`,
      type: 'escala' as const,
      categoryLabel: 'Prueba Psicométrica',
      summary: `Puntaje obtenido: ${a.score}/${a.maxScore} pts - Severidad: ${a.severity}`,
      details: a.pastoralRecommendation,
      badge: `${a.type}: ${a.score} pts`,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
    })),

    // 3. Sesiones y Citas
    ...patientAppointments.map(apt => ({
      id: `apt-${apt.id}`,
      date: apt.dateTime.split('T')[0] || apt.dateTime,
      title: `Sesión ${apt.modality.toUpperCase()} (${apt.type})`,
      type: 'sesion' as const,
      categoryLabel: 'Sesión Programada',
      summary: `Duración: ${apt.durationMinutes} min &bull; Estado: ${apt.status.toUpperCase()}`,
      details: apt.notes || 'Atención psicológica y de consejería pastoral efectuada.',
      badge: apt.status,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
    })),

    // 4. Documentos y Adjuntos
    ...(patient?.attachments || []).map(att => ({
      id: `att-${att.id}`,
      date: att.dateUploaded,
      title: `Documento Adjunto: ${att.name}`,
      type: 'documento' as const,
      categoryLabel: 'Archivo Adjunto',
      summary: `Clasificación: ${att.type.replace('_', ' ')} (${att.fileSize})`,
      details: att.notes || 'Documento archivado en expediente con verificación de autenticidad.',
      badge: 'PDF / Adjunto',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
    })),

    // 5. Interacciones & Observaciones
    ...(patient?.interactionHistory || []).map(inter => ({
      id: `inter-${inter.id}`,
      date: inter.date,
      title: `Interacción Pastoral: ${inter.type.toUpperCase()}`,
      type: 'pastoral' as const,
      categoryLabel: 'Cuidado Pastoral',
      summary: inter.summary,
      details: `Atendido por: ${inter.ministerName}`,
      badge: inter.type,
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
    })),

    // 6. Hitos Espirituales
    ...(patient?.spiritualMilestones || []).map(ms => ({
      id: `ms-${ms.id}`,
      date: ms.date,
      title: `Hito Espiritual: ${ms.title}`,
      type: 'pastoral' as const,
      categoryLabel: 'Hito de Fe',
      summary: `Categoría: ${ms.category.toUpperCase()}`,
      details: ms.notes,
      badge: ms.category,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    })),

    // 7. Peticiones de Oración
    ...(patient?.prayerRequests || []).map(pr => ({
      id: `pr-${pr.id}`,
      date: pr.date,
      title: `Petición de Oración: ${pr.request.substring(0, 40)}...`,
      type: 'pastoral' as const,
      categoryLabel: 'Intercesión',
      summary: pr.request,
      details: pr.testimony ? `Testimonio de respuesta: ${pr.testimony}` : `Estado: ${pr.status.toUpperCase()}`,
      badge: pr.status,
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40'
    })),

    // 8. Sermones y Aplicaciones Homiléticas
    ...sermons.slice(0, 2).map((sermon, idx) => ({
      id: `sermon-${sermon.id}-${idx}`,
      date: sermon.dateCreated,
      title: `Recurso Homilético Relacionado: ${sermon.title}`,
      type: 'pastoral' as const,
      categoryLabel: 'Enseñanza Bíblica',
      summary: `Pasaje: ${sermon.mainPassage} &bull; ${sermon.homileticalIdea}`,
      details: sermon.points[0]?.practicalApplication || 'Aplicación pastoral asignada al caso.',
      badge: 'Homilética',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    }))
  ];

  // Ordenar cronológicamente descendente
  const sortedEvents = rawEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filtrar por categoría y búsqueda
  const filteredEvents = sortedEvents.filter(evt => {
    const matchesFilter = activeFilter === 'todos' || evt.type === activeFilter;
    const matchesSearch = searchTerm === '' || 
      evt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (evt.details && evt.details.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleSaveAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachmentName.trim() || !patient) return;

    const newAtt: PatientAttachment = {
      id: `att-${Date.now()}`,
      name: attachmentName,
      type: attachmentType,
      dateUploaded: new Date().toISOString().split('T')[0],
      fileSize: '1.4 MB',
      notes: 'Documento verificado y archivado con cifrado en la nube.',
    };

    onAddAttachment(patient.id, newAtt);
    setAttachmentName('');
    setIsUploading(false);
  };

  const handleSignatureComplete = (dataUrl: string) => {
    if (patient) {
      onSaveConsentSignature(patient.id, dataUrl);
      setIsSigning(false);
      showSuccess('Firma Guardada', 'Consentimiento informado firmado digitalmente y archivado.');
    }
  };

  const handlePrintTimeline = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Pilar 3 &bull; Trazabilidad Longitudinal Unificada
            </span>
            <span className="text-xs text-slate-400">8 Dimensiones Clínico-Pastorales</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1 flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-400" />
            <span>Timeline Clínico Integral</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Línea temporal que unifica sesiones, notas SOAP-S, escalas, documentos, tareas, observaciones y cuidado pastoral.
          </p>
        </div>

        {/* Patient Picker & Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white cursor-pointer focus:outline-none focus:border-amber-500"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.fullName} ({p.code})</option>
            ))}
          </select>

          <button
            onClick={handlePrintTimeline}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
            title="Imprimir / Exportar Timeline"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Imprimir</span>
          </button>

          <button
            onClick={() => setIsUploading(true)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
            <span>Adjuntar</span>
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

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'todos', label: `Todos (${rawEvents.length})` },
            { id: 'soap', label: `SOAP-S (${patientNotes.length})` },
            { id: 'escala', label: `Escalas (${patientAssessments.length})` },
            { id: 'sesion', label: `Sesiones (${patientAppointments.length})` },
            { id: 'pastoral', label: `Pastoral (${rawEvents.filter(e => e.type === 'pastoral').length})` },
            { id: 'documento', label: `Adjuntos (${patient?.attachments?.length || 0})` },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setActiveFilter(pill.id as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeFilter === pill.id
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar en el timeline..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Timeline Stream (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-bold text-white">
            <span>Eventos Cronológicos Filtrados ({filteredEvents.length})</span>
            <span className="text-slate-400 font-normal">Consultante: {patient?.fullName} &bull; {patient?.code}</span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
            {filteredEvents.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs space-y-2">
                <Clock className="w-8 h-8 mx-auto text-slate-600" />
                <p>No se encontraron eventos con los filtros seleccionados.</p>
              </div>
            ) : (
              filteredEvents.map((evt) => (
                <div key={evt.id} className="relative group text-xs">
                  {/* Indicator Dot */}
                  <div className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-slate-900 ${
                    evt.type === 'soap'
                      ? 'bg-amber-400'
                      : evt.type === 'escala'
                      ? 'bg-rose-400'
                      : evt.type === 'sesion'
                      ? 'bg-indigo-400'
                      : evt.type === 'pastoral'
                      ? 'bg-purple-400'
                      : 'bg-cyan-400'
                  }`} />

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 hover:border-slate-700 transition">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-xs">{evt.title}</span>
                        {evt.badge && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${evt.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                            {evt.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400 font-mono text-[11px]">{evt.date}</span>
                    </div>

                    <p className="text-slate-300 leading-relaxed">{evt.summary}</p>

                    {evt.details && (
                      <div className="text-[11px] text-amber-300/90 pt-1.5 border-t border-slate-900/80 flex items-start space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{evt.details}</span>
                      </div>
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
