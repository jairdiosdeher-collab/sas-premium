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
  HeartHandshake
} from 'lucide-react';
import { Patient, SoapNote, AssessmentResult, UserProfile } from '../../types';

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
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    preselectedPatientId || patients[0]?.id || ''
  );

  const [reportTitle, setReportTitle] = useState('INFORME CLÍNICO Y DE EVOLUCIÓN PASTORAL');
  const [reportPurpose, setReportPurpose] = useState('Seguimiento Interdisciplinar y Expediente Confidencial');

  const patient = patients.find(p => p.id === selectedPatientId);
  const patientNotes = notes.filter(n => n.patientId === selectedPatientId);
  const patientAssessments = assessments.filter(a => a.patientId === selectedPatientId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Screen Controls Header (Hidden in Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <Printer className="w-6 h-6 text-amber-400" />
            <span>Generador de Informes Profesionales (PDF / Imprimible)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Documento formal con membrete institucional, resultados psicométricos, evolución y firma legal.
          </p>
        </div>

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
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Guardar como PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet (Standard A4 / Letter format style) */}
      <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-2xl border border-slate-200 max-w-4xl mx-auto space-y-6">
        {/* Institutional Letterhead */}
        <div className="flex justify-between items-start pb-6 border-b-2 border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900 font-cinzel">✝️ PASTORALMENTE</span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                Clínica & Pastoral
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-700 mt-1">{user.institution}</p>
            <p className="text-[11px] text-slate-500">
              Departamento de Cuidado Integral y Salud Mental • {user.email}
            </p>
          </div>

          <div className="text-right text-xs">
            <p className="font-bold text-slate-800">{user.name}</p>
            <p className="text-slate-600">{user.title}</p>
            <p className="text-slate-500 text-[10px] mt-0.5">Reg. Prof: {user.licenseNumber || 'AACC-2026'}</p>
            <p className="text-slate-400 text-[10px] mt-1 font-mono">
              Fecha de Emisión: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center pt-2">
          <h2 className="text-lg font-bold text-slate-900 tracking-wide uppercase">{reportTitle}</h2>
          <p className="text-xs text-slate-500 mt-0.5">Propósito: {reportPurpose}</p>
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
                    <span>{a.title}</span>
                    <span className="text-amber-800">{a.score} / {a.maxScore} pts</span>
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
              <p className="font-serif-bible text-slate-800 pt-1 border-t border-slate-200">
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
              <span className="font-serif italic text-slate-400 text-lg">Dr. David Benítez</span>
            </div>
            <div className="border-t border-slate-400 pt-1">
              <p className="font-bold text-slate-800">{user.name}</p>
              <p className="text-slate-600 text-[11px]">{user.title}</p>
              <p className="text-slate-400 text-[10px]">Firma del Terapeuta / Consejero</p>
            </div>
          </div>

          <div>
            <div className="h-14 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-amber-600/40 text-amber-800 flex items-center justify-center text-[9px] font-bold uppercase tracking-widest rotate-[-12deg]">
                SELLO OFICIAL
              </div>
            </div>
            <div className="border-t border-slate-400 pt-1">
              <p className="font-bold text-slate-800">{user.institution}</p>
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
