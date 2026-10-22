import React, { useState } from 'react';
import { 
  Printer, 
  FileDown, 
  ShieldCheck, 
  Award, 
  User, 
  Calendar, 
  FileText,
  Activity,
  HeartHandshake,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Patient, SoapNote, AssessmentResult, UserProfile } from '../../types';
import { ExportService } from '../../services/exportService';
import { useToast } from '../../context/ToastContext';

interface ReportsModuleProps {
  user: UserProfile;
  patients: Patient[];
  notes: SoapNote[];
  assessments: AssessmentResult[];
  preselectedPatientId?: string;
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({
  user,
  patients,
  notes,
  assessments,
  preselectedPatientId,
}) => {
  const { showSuccess, showInfo } = useToast();
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    preselectedPatientId || patients[0]?.id || ''
  );

  const [reportTitle, setReportTitle] = useState('INFORME CLÍNICO Y DE EVOLUCIÓN PASTORAL');
  const [reportPurpose, setReportPurpose] = useState('Seguimiento Interdisciplinar y Expediente Confidencial');

  const patient = patients.find(p => p.id === selectedPatientId) || patients[0];
  const patientNotes = notes.filter(n => n.patientId === selectedPatientId);
  const patientAssessments = assessments.filter(a => a.patientId === selectedPatientId);

  const handlePrint = () => {
    window.print();
  };

  const handleExportWord = () => {
    if (!patient) return;

    const scalesHtml = patientAssessments.length > 0
      ? `<h3>IV. Batería Psicométrica y Escalas Estandarizadas</h3>
         <ul>
           ${patientAssessments.map(a => `<li><strong>${a.title} (${a.type}):</strong> ${a.score}/${a.maxScore} pts - ${a.severity}. ${a.interpretation}</li>`).join('')}
         </ul>`
      : '';

    const notesHtml = patientNotes.length > 0
      ? `<h3>V. Síntesis de Evolución y Dimensión Espiritual</h3>
         <p><strong>Última Evaluación Clínica:</strong> ${patientNotes[0].assessment}</p>
         <p><strong>Dimensión Espiritual y Disciplinas:</strong> ${patientNotes[0].spiritualDimension}</p>`
      : '';

    const bodyHtml = `
      <div class="section-title">I. Datos Generales del Caso</div>
      <p><strong>Nº Expediente:</strong> ${patient.code} | <strong>Fecha de Ingreso:</strong> ${patient.admissionDate}</p>
      
      <div class="section-title">II. Motivo de Consulta & Demanda Pastoral</div>
      <p>${patient.primaryReason}</p>

      <div class="section-title">III. Impresión Diagnóstica (DSM-5 / CIE-11)</div>
      <p><strong>Diagnóstico:</strong> ${patient.clinicalDiagnosis || 'En evaluación psicoclínica'}</p>
      <p><strong>Antecedentes:</strong> ${patient.medicalHistory?.psychiatricHistory || 'Sin antecedentes reportados'}</p>

      ${scalesHtml}
      ${notesHtml}

      <div class="section-title">VI. Plan de Acción y Sugerencias</div>
      <ul>
        <li>Continuidad de sesiones quincenales de psicoterapia y consejería pastoral.</li>
        <li>Monitoreo de higiene del sueño y activación de red vincular de apoyo.</li>
        <li>Acompañamiento en oración de consuelo y gracia sin imposición de culpa.</li>
      </ul>
    `;

    ExportService.exportToWordDoc({
      title: reportTitle,
      patient,
      institution: user.institution || 'PastoralMente AI - Centro Clínico Pastoral',
      therapistName: user.name,
      therapistTitle: user.title,
      licenseNumber: user.licenseNumber || 'MP-2026-PAST',
      bodyHtml,
      caseCode: patient.code
    });

    showSuccess('Descargando Word (.doc)', `Informe de ${patient.fullName} exportado.`);
  };

  const handleExportExcel = () => {
    if (!patient) return;

    const headers = ['Tipo Registro', 'Fecha', 'Detalle / Escala', 'Puntaje', 'Severidad / Hallazgo', 'Dimensión Espiritual'];
    const rows: (string | number)[][] = [];

    // Add assessments
    patientAssessments.forEach((a) => {
      rows.push(['Escala Psicométrica', a.date, a.title, `${a.score}/${a.maxScore}`, a.severity, a.pastoralRecommendation]);
    });

    // Add SOAP notes
    patientNotes.forEach((n) => {
      rows.push(['Nota SOAP-S', n.date, `Sesión #${n.sessionNumber}`, n.riskFlag ? 'Riesgo' : 'Normal', n.assessment, n.spiritualDimension]);
    });

    ExportService.exportToExcelCsv(`Historial_Clinico_${patient.code}`, headers, rows);
    showSuccess('Descargando Excel (.csv)', `Historial consolidado de ${patient.code} exportado.`);
  };

  return (
    <div className="space-y-6">
      {/* Screen Controls Header (Hidden in Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-900/40 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Pilar 6 &bull; Generador Profesional de Informes
            </span>
            <span className="text-xs text-slate-400">PDF, Word & Excel Multi-formato</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2 mt-1">
            <Printer className="w-6 h-6 text-purple-400" />
            <span>Informes Clínicos & Historial Consolidado</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Emisión formal con membrete corporativo, código de caso, firma digital y encriptación.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white cursor-pointer focus:outline-none focus:border-purple-500"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.fullName} ({p.code})</option>
            ))}
          </select>

          {/* Word Export */}
          <button
            onClick={handleExportWord}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-sm"
            title="Descargar en formato Microsoft Word (.doc/.docx)"
          >
            <FileDown className="w-4 h-4" />
            <span>Word (.doc)</span>
          </button>

          {/* Excel Export */}
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-sm"
            title="Exportar a Excel / CSV estructurado"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel (.csv)</span>
          </button>

          {/* PDF / Print */}
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet (Standard A4 / Letter format style) */}
      <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-2xl border border-slate-200 max-w-4xl mx-auto space-y-6">
        {/* Institutional Letterhead */}
        <div className="flex justify-between items-start pb-6 border-b-2 border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900 font-serif">✝️ PASTORALMENTE</span>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                Clínica & Pastoral
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-700 mt-1">{user.institution || 'PastoralMente AI - Centro Clínico Pastoral'}</p>
            <p className="text-[11px] text-slate-500">
              Departamento de Cuidado Integral y Salud Mental • {user.email}
            </p>
          </div>

          <div className="text-right text-xs">
            <p className="font-bold text-slate-800">{user.name}</p>
            <p className="text-slate-600">{user.title}</p>
            <p className="text-slate-500 text-[10px] mt-0.5">Reg. Prof / Licencia: {user.licenseNumber || 'AACC-2026-PAST'}</p>
            <p className="text-slate-400 text-[10px] mt-1 font-mono">
              Fecha de Emisión: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center pt-2">
          <h2 className="text-lg font-bold text-slate-900 tracking-wide uppercase font-serif">{reportTitle}</h2>
          <p className="text-xs text-slate-500 mt-0.5">Propósito: {reportPurpose} &bull; Código de Caso: <strong>{patient?.code}</strong></p>
        </div>

        {/* Patient Demographics Box */}
        {patient && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 pb-1 border-b border-slate-200">
              I. Datos Generales del Consultante
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700">
              <div>
                <span className="text-slate-500 text-[10px] block">Nombre Completo:</span>
                <span className="font-bold text-slate-900">{patient.fullName}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Nº de Expediente:</span>
                <span className="font-mono font-bold text-slate-900">{patient.code}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Edad / Estado Civil:</span>
                <span>{patient.age} años • {patient.maritalStatus}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Fecha de Ingreso:</span>
                <span>{patient.admissionDate}</span>
              </div>
            </div>
          </div>
        )}

        {/* Motivo de Consulta & Diagnóstico Clínico */}
        {patient && (
          <div className="space-y-3 text-xs text-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
                II. Motivo de Consulta & Demanda Pastoral
              </h3>
              <p className="text-slate-700 leading-relaxed bg-slate-50/60 p-3 rounded-lg border border-slate-200">
                {patient.primaryReason}
              </p>
            </div>

            {patient.clinicalDiagnosis && (
              <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
                  III. Impresión Diagnóstica Clínica (CIE-11 / DSM-5)
                </h3>
                <p className="font-mono text-slate-800 bg-slate-50/60 p-2.5 rounded-lg border border-slate-200 text-[11px]">
                  {patient.clinicalDiagnosis}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Psychometric Scales Summary */}
        <div className="text-xs text-slate-800 space-y-2">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
            IV. Batería Psicométrica y Escalas Estandarizadas
          </h3>
          {patientAssessments.length === 0 ? (
            <p className="text-slate-500 italic">No se han registrado escalas cuantitativas para este período.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {patientAssessments.map((a) => (
                <div key={a.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{a.title} ({a.type})</span>
                    <span className="text-purple-800 font-mono">{a.score} / {a.maxScore} pts</span>
                  </div>
                  <p className="text-slate-600 font-semibold text-[11px] mt-0.5">{a.severity}</p>
                  <p className="text-slate-500 text-[10px] mt-1 leading-snug">{a.interpretation}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Evolution Summary & Spiritual Dimension */}
        <div className="text-xs text-slate-800 space-y-2">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
            V. Síntesis de Evolución y Dimensión Espiritual
          </h3>
          {patientNotes.length > 0 ? (
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-slate-700 leading-relaxed">
              <p>
                <strong>Observaciones de las últimas {patientNotes.length} sesiones:</strong> {patientNotes[0].assessment}
              </p>
              <p className="font-serif text-slate-800 pt-1 border-t border-slate-200">
                <strong>Enfoque Bíblico y Disciplinas Asignadas:</strong> {patientNotes[0].spiritualDimension}
              </p>
            </div>
          ) : (
            <p className="text-slate-500 italic">Expediente en fase diagnóstica inicial.</p>
          )}
        </div>

        {/* Plan and Recommendations */}
        <div className="text-xs text-slate-800 space-y-1">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
            VI. Plan de Acción y Sugerencias Interdisciplinarias
          </h3>
          <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
            <li>Continuidad de sesiones de acompañamiento psicopastoral con frecuencia quincenal.</li>
            <li>Monitoreo de la higiene de descanso y ritmo circadiano.</li>
            <li>Fomento de espacios de mentoreo espiritual no evaluativo.</li>
          </ul>
        </div>

        {/* Signatures & Seal */}
        <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="h-14 flex items-end justify-center">
              <span className="font-serif italic text-slate-600 text-lg">{user.name}</span>
            </div>
            <div className="border-t border-slate-400 pt-1">
              <p className="font-bold text-slate-800">{user.name}</p>
              <p className="text-slate-600 text-[11px]">{user.title}</p>
              <p className="text-slate-400 text-[10px]">Firma Electrónica Verificada</p>
            </div>
          </div>

          <div>
            <div className="h-14 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-purple-600/40 text-purple-800 flex items-center justify-center text-[9px] font-bold uppercase tracking-widest rotate-[-12deg]">
                SELLO OFICIAL
              </div>
            </div>
            <div className="border-t border-slate-400 pt-1">
              <p className="font-bold text-slate-800">{user.institution || 'PastoralMente AI'}</p>
              <p className="text-slate-500 text-[10px]">Cuidado Pastoral & Clínico</p>
            </div>
          </div>
        </div>

        {/* Confidentiality Notice */}
        <div className="pt-4 border-t border-slate-200 text-[9px] text-slate-400 text-center leading-tight">
          DOCUMENTO CONFIDENCIAL: Este informe contiene información protegida por el secreto profesional, pastoral y la legislación de protección de datos personales. Queda estrictamente prohibida su difusión o reproducción sin autorización expresa del titular o mandamiento judicial competente.
        </div>
      </div>
    </div>
  );
};
