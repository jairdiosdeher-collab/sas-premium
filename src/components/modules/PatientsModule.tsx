import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  UserPlus, 
  FileText, 
  Activity, 
  AlertCircle, 
  Phone, 
  Mail, 
  ShieldAlert, 
  Check, 
  X, 
  Edit3, 
  ChevronRight,
  BookOpen,
  Heart
} from 'lucide-react';
import { Patient, RiskLevel } from '../../types';

interface PatientsModuleProps {
  patients: Patient[];
  onAddPatient: (patient: Patient) => void;
  onSelectPatientForSoap: (patientId: string) => void;
  onSelectPatientForReport: (patientId: string) => void;
}

export const PatientsModule: React.FC<PatientsModuleProps> = ({
  patients,
  onAddPatient,
  onSelectPatientForSoap,
  onSelectPatientForReport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patients[0] || null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for New Patient
  const [formData, setFormData] = useState<Partial<Patient>>({
    fullName: '',
    age: 35,
    gender: 'masculino',
    phone: '',
    email: '',
    maritalStatus: 'casado',
    occupation: '',
    status: 'activo',
    riskLevel: 'bajo',
    primaryReason: '',
    clinicalDiagnosis: '',
    spiritualBackground: {
      faithBelief: 'Cristiano Evangélico',
      churchAttendance: 'Semanal',
      spiritualMaturity: 'Creyente activo',
      ministryInvolvement: 'Miembro congregacional',
      spiritualStruggles: ''
    },
    medicalHistory: {
      psychiatricHistory: 'Sin antecedentes conocidos',
      currentMedication: 'Ninguna',
      emergencyContact: '',
      emergencyPhone: ''
    }
  });

  const filteredPatients = patients.filter((p) => {
    const matchesSearch = 
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.primaryReason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSavePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.primaryReason) return;

    const newId = `pat-${Date.now()}`;
    const newCode = `EXP-${new Date().getFullYear()}-${String(patients.length + 1).padStart(3, '0')}`;

    const newPatient: Patient = {
      id: newId,
      code: newCode,
      fullName: formData.fullName || '',
      age: Number(formData.age) || 30,
      gender: formData.gender as any || 'masculino',
      phone: formData.phone || '',
      email: formData.email || '',
      maritalStatus: formData.maritalStatus as any || 'casado',
      occupation: formData.occupation || 'No especificado',
      admissionDate: new Date().toISOString().split('T')[0],
      status: (formData.status as any) || 'activo',
      riskLevel: (formData.riskLevel as RiskLevel) || 'bajo',
      primaryReason: formData.primaryReason || '',
      clinicalDiagnosis: formData.clinicalDiagnosis || 'Pendiente de evaluación',
      spiritualBackground: {
        faithBelief: formData.spiritualBackground?.faithBelief || 'Cristiano',
        churchAttendance: formData.spiritualBackground?.churchAttendance || 'Regular',
        spiritualMaturity: formData.spiritualBackground?.spiritualMaturity || 'En crecimiento',
        ministryInvolvement: formData.spiritualBackground?.ministryInvolvement || 'Asistente',
        spiritualStruggles: formData.spiritualBackground?.spiritualStruggles || 'Ninguna descrita'
      },
      medicalHistory: {
        psychiatricHistory: formData.medicalHistory?.psychiatricHistory || 'Ninguno',
        currentMedication: formData.medicalHistory?.currentMedication || 'Ninguna',
        emergencyContact: formData.medicalHistory?.emergencyContact || 'Familiar',
        emergencyPhone: formData.medicalHistory?.emergencyPhone || ''
      }
    };

    onAddPatient(newPatient);
    setSelectedPatient(newPatient);
    setIsModalOpen(false);
  };

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'urgente':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'alto':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'moderado':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            <span>Historias Clínicas & CRM de Consejería</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Gestión confidencial de expedientes clínico-pastorales, historia biopsicosocial y espiritual.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          <span>Apertura de Nuevo Expediente</span>
        </button>
      </div>

      {/* Main Split Layout: Patient List (Left) + Detail File View (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Search, Filter, Patient List */}
        <div className="lg:col-span-5 space-y-3">
          {/* Search and Filters */}
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre, código o motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
              {['todos', 'activo', 'en_seguimiento', 'en_crisis', 'alta'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap capitalize transition-colors ${
                    statusFilter === st
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredPatients.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800">
                No se encontraron expedientes con los criterios seleccionados.
              </div>
            ) : (
              filteredPatients.map((patient) => {
                const isSelected = selectedPatient?.id === patient.id;
                return (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border-amber-500/50 shadow-md'
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-200">{patient.fullName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{patient.code}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{patient.primaryReason}</p>
                      </div>

                      <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold border ${getRiskBadge(patient.riskLevel)}`}>
                        {patient.riskLevel}
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{patient.occupation} • {patient.age} años</span>
                      <span className="capitalize text-amber-400/80 font-medium">{patient.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Selected Patient Full Record */}
        <div className="lg:col-span-7">
          {selectedPatient ? (
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-5">
              {/* Patient Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg font-bold text-white">{selectedPatient.fullName}</h2>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {selectedPatient.code}
                    </span>
                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold border ${getRiskBadge(selectedPatient.riskLevel)}`}>
                      Riesgo {selectedPatient.riskLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Ingreso: {selectedPatient.admissionDate} • {selectedPatient.age} años • {selectedPatient.maritalStatus} • {selectedPatient.occupation}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectPatientForSoap(selectedPatient.id)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Crear Nota SOAP-S</span>
                  </button>
                  <button
                    onClick={() => onSelectPatientForReport(selectedPatient.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                  >
                    Informe PDF
                  </button>
                </div>
              </div>

              {/* Contact info quick bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{selectedPatient.phone || 'No registrado'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{selectedPatient.email || 'No registrado'}</span>
                </div>
              </div>

              {/* Motivo de Consulta & Diagnóstico Clínico */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                    Motivo de Consulta Principal
                  </h3>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {selectedPatient.primaryReason}
                  </p>
                </div>

                {selectedPatient.clinicalDiagnosis && (
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
                      Impresión Diagnóstica Clínica (CIE-11 / DSM-5)
                    </h3>
                    <p className="text-xs text-slate-200 leading-relaxed font-mono text-[11px]">
                      {selectedPatient.clinicalDiagnosis}
                    </p>
                  </div>
                )}
              </div>

              {/* Spiritual Assessment & Background */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" /> Dimensión Espiritual & Eclesial
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Creencia / Fe:</span>
                    <span className="font-semibold text-slate-200">{selectedPatient.spiritualBackground.faithBelief}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Asistencia a la Iglesia:</span>
                    <span className="font-semibold text-slate-200">{selectedPatient.spiritualBackground.churchAttendance}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Involucramiento Ministerial:</span>
                    <span className="font-semibold text-slate-200">{selectedPatient.spiritualBackground.ministryInvolvement}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Madurez Espiritual:</span>
                    <span className="font-semibold text-slate-200">{selectedPatient.spiritualBackground.spiritualMaturity}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400 text-[11px] block">Luchas Espirituales & Dudas Teológicas:</span>
                  <p className="text-xs text-slate-300 mt-1 italic font-serif-bible leading-relaxed">
                    "{selectedPatient.spiritualBackground.spiritualStruggles}"
                  </p>
                </div>
              </div>

              {/* Medical & Emergency History */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Historial Médico & Contacto de Emergencia
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Antecedentes Psiquiátricos:</span>
                    <p className="text-[11px] text-slate-300">{selectedPatient.medicalHistory.psychiatricHistory}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Medicación Actual:</span>
                    <p className="text-[11px] text-slate-300">{selectedPatient.medicalHistory.currentMedication}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Contacto de Emergencia:</span>
                    <p className="text-[11px] text-slate-300">{selectedPatient.medicalHistory.emergencyContact} ({selectedPatient.medicalHistory.emergencyPhone})</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
              Selecciona un paciente del directorio para ver su expediente completo.
            </div>
          )}
        </div>
      </div>

      {/* Modal: New Patient File */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <span>Apertura de Expediente Clínico-Pastoral</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePatient} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Ej. Roberto Morales Sánchez"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Edad</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Teléfono (WhatsApp)</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+52 55..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="paciente@correo.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nivel de Riesgo Ético</label>
                  <select
                    value={formData.riskLevel}
                    onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="bajo">Bajo (Seguimiento regular)</option>
                    <option value="moderado">Moderado (Monitoreo)</option>
                    <option value="alto">Alto (Atención prioritaria)</option>
                    <option value="urgente">Urgente (Crisis aguda)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Motivo de Consulta Principal *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.primaryReason}
                  onChange={(e) => setFormData({ ...formData, primaryReason: e.target.value })}
                  placeholder="Descripción detallada de la situación, dolor o conflicto..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <p className="font-bold text-amber-400">Contexto Eclesial y Espiritual</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Denominación / Creencia</label>
                    <input
                      type="text"
                      value={formData.spiritualBackground?.faithBelief}
                      onChange={(e) => setFormData({
                        ...formData,
                        spiritualBackground: { ...formData.spiritualBackground!, faithBelief: e.target.value }
                      })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Involucramiento Eclesial</label>
                    <input
                      type="text"
                      value={formData.spiritualBackground?.ministryInvolvement}
                      onChange={(e) => setFormData({
                        ...formData,
                        spiritualBackground: { ...formData.spiritualBackground!, ministryInvolvement: e.target.value }
                      })}
                      placeholder="Ej. Líder de jóvenes, asistente, pastor"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20 transition-all"
                >
                  Guardar Expediente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
