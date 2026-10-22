import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Save, 
  History, 
  AlertTriangle, 
  CheckCircle2, 
  Printer, 
  Calendar, 
  User, 
  BookOpen,
  Send,
  Loader2,
  Plus
} from 'lucide-react';
import { Patient, SoapNote, UserProfile } from '../../types';
import { callGeminiApi } from '../../services/geminiService';

interface EvolutionNotesModuleProps {
  user: UserProfile;
  patients: Patient[];
  notes: SoapNote[];
  selectedPatientId?: string;
  onSaveNote: (note: SoapNote) => void;
}

export const EvolutionNotesModule: React.FC<EvolutionNotesModuleProps> = ({
  user,
  patients,
  notes,
  selectedPatientId,
  onSaveNote,
}) => {
  const [currentPatientId, setCurrentPatientId] = useState<string>(
    selectedPatientId || patients[0]?.id || ''
  );

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sessionNumber, setSessionNumber] = useState<number>(1);
  const [subjective, setSubjective] = useState<string>('');
  const [objective, setObjective] = useState<string>('');
  const [assessment, setAssessment] = useState<string>('');
  const [plan, setPlan] = useState<string>('');
  const [spiritualDimension, setSpiritualDimension] = useState<string>('');
  const [riskFlag, setRiskFlag] = useState<boolean>(false);

  // AI draft assistant state
  const [rawRoughNotes, setRawRoughNotes] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

  const patientNotes = notes.filter((n) => n.patientId === currentPatientId);
  const currentPatient = patients.find((p) => p.id === currentPatientId);

  // Auto-increment session number based on existing notes for this patient
  React.useEffect(() => {
    if (patientNotes.length > 0) {
      const maxSession = Math.max(...patientNotes.map((n) => n.sessionNumber));
      setSessionNumber(maxSession + 1);
    } else {
      setSessionNumber(1);
    }
  }, [currentPatientId, notes]);

  const handleGenerateAiSoap = async () => {
    if (!rawRoughNotes.trim()) {
      alert('Por favor escribe algunas notas o ideas de la sesión para que la IA pueda estructurarlas.');
      return;
    }

    setIsAiLoading(true);
    setAiSuccessMessage(null);

    const prompt = `Actúa como un psicólogo clínico y consejero pastoral experimentado. 
Sintetiza y estructura las siguientes notas informales de la sesión de consejería en una nota formal SOAP-S (Subjetivo, Objetivo, Análisis, Plan, y Dimensión Espiritual).

Paciente: ${currentPatient?.fullName}
Motivo de consulta: ${currentPatient?.primaryReason}
Notas en bruto del consejero/pastor:
"${rawRoughNotes}"

Entrega el formato con lenguaje clínico riguroso pero con profunda sensibilidad pastoral cristiana.`;

    const result = await callGeminiApi(prompt);
    setIsAiLoading(false);

    // Extract or populate sections
    const text = result.text;
    
    // Quick heuristic parsing if structured, or distribute
    if (text.includes('**S (Subjetivo):**') || text.includes('Subjetivo:')) {
      const sMatch = text.match(/(?:Subjetivo|S):?\s*([\s\S]*?)(?=(?:Objetivo|O):|$)/i);
      const oMatch = text.match(/(?:Objetivo|O):?\s*([\s\S]*?)(?=(?:Análisis|A):|$)/i);
      const aMatch = text.match(/(?:Análisis|A):?\s*([\s\S]*?)(?=(?:Plan|P):|$)/i);
      const pMatch = text.match(/(?:Plan|P):?\s*([\s\S]*?)(?=(?:Dimensión Espiritual|Espiritual|S):|$)/i);
      const spMatch = text.match(/(?:Dimensión Espiritual|Espiritual):?\s*([\s\S]*?)$/i);

      if (sMatch) setSubjective(sMatch[1].trim());
      if (oMatch) setObjective(oMatch[1].trim());
      if (aMatch) setAssessment(aMatch[1].trim());
      if (pMatch) setPlan(pMatch[1].trim());
      if (spMatch) setSpiritualDimension(spMatch[1].trim());
    } else {
      // Direct assignment if format varies
      setSubjective(rawRoughNotes);
      setAssessment(text.slice(0, 400));
      setPlan('Continuar con tareas acordadas y seguimiento quincenal.');
      setSpiritualDimension('Pasaje de meditación: Filipenses 4:6-7. Oración por fortaleza.');
    }

    setAiSuccessMessage('¡Nota estructurada con IA exitosamente! Revisa los campos y presiona Guardar.');
    setTimeout(() => setAiSuccessMessage(null), 6000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPatientId || !subjective) {
      alert('Completa al menos el relato subjetivo y selecciona el paciente.');
      return;
    }

    const newNote: SoapNote = {
      id: `soap-${Date.now()}`,
      patientId: currentPatientId,
      date,
      sessionNumber,
      subjective,
      objective: objective || 'Contacto visual preservado, cooperador, lenguaje coherente.',
      assessment: assessment || 'Evolución dentro de lo previsto.',
      plan: plan || 'Seguimiento en la próxima sesión programada.',
      spiritualDimension: spiritualDimension || 'Enfoque en la gracia de Dios y perseverancia en la oración.',
      riskFlag,
      therapistSignature: `${user.name}, ${user.licenseNumber || user.title}`,
    };

    onSaveNote(newNote);
    alert('Nota de evolución SOAP-S guardada con éxito en el expediente.');
    // Reset inputs
    setSubjective('');
    setObjective('');
    setAssessment('');
    setPlan('');
    setSpiritualDimension('');
    setRawRoughNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-400" />
            <span>Notas de Evolución Clínica y Pastoral (SOAP-S)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro formal estandarizado con campo exclusivo para la dimensión y disciplinas espirituales.
          </p>
        </div>

        {/* Patient Selector */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
          <User className="w-4 h-4 text-amber-400 ml-2" />
          <select
            value={currentPatientId}
            onChange={(e) => setCurrentPatientId(e.target.value)}
            className="bg-transparent text-xs text-white font-semibold focus:outline-none pr-3 cursor-pointer"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                {p.fullName} ({p.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Editor on Left, Note History on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* AI Drafting Assistant Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> Asistente de Síntesis SOAP-S con IA
              </span>
              <span className="text-[10px] text-slate-400">Pega notas rápidas o dictado de voz</span>
            </div>

            <textarea
              rows={2}
              value={rawRoughNotes}
              onChange={(e) => setRawRoughNotes(e.target.value)}
              placeholder="Ejemplo: Carlos vino más tranquilo, durmió 6 horas porque apagó el celular. Sigue con culpa por no predicar en la vigilia. Oramos por 1 Reyes 19 cuando Dios le da pan a Elías. El GAD bajó a 8..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />

            <div className="flex items-center justify-between">
              <p className="text-[10px] text-slate-400">
                La IA transformará esto en las 5 secciones estructuradas con terminología clínica y bíblica.
              </p>
              <button
                type="button"
                onClick={handleGenerateAiSoap}
                disabled={isAiLoading}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
              >
                {isAiLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sintetizando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Sintetizar en SOAP-S</span>
                  </>
                )}
              </button>
            </div>

            {aiSuccessMessage && (
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{aiSuccessMessage}</span>
              </div>
            )}
          </div>

          {/* SOAP-S Form */}
          <form onSubmit={handleSave} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
            {/* Meta Row: Date, Session #, Risk Flag */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-medium">Fecha:</span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-white"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-medium">Sesión Nº:</span>
                  <input
                    type="number"
                    value={sessionNumber}
                    onChange={(e) => setSessionNumber(parseInt(e.target.value) || 1)}
                    className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-white"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                <input
                  type="checkbox"
                  checked={riskFlag}
                  onChange={(e) => setRiskFlag(e.target.checked)}
                  className="accent-rose-500 rounded"
                />
                <span className={`text-[11px] font-semibold ${riskFlag ? 'text-rose-400' : 'text-slate-400'}`}>
                  Bandera de Riesgo Ético
                </span>
              </label>
            </div>

            {/* S: Subjetivo */}
            <div>
              <label className="block text-slate-200 font-bold mb-1 flex items-center justify-between">
                <span>S - Subjetivo (Relato del consultante, quejas, vivencias) *</span>
                <span className="text-[10px] text-slate-500">¿Qué verbaliza el paciente?</span>
              </label>
              <textarea
                required
                rows={3}
                value={subjective}
                onChange={(e) => setSubjective(e.target.value)}
                placeholder="El paciente refiere..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* O: Objetivo */}
            <div>
              <label className="block text-slate-200 font-bold mb-1 flex items-center justify-between">
                <span>O - Objetivo (Observación clínica, afecto, escalas aplicadas)</span>
                <span className="text-[10px] text-slate-500">Conducta no verbal, apariencia, puntajes</span>
              </label>
              <textarea
                rows={2}
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="Paciente orientado, lenguaje fluido, afecto congruente..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* A: Análisis */}
            <div>
              <label className="block text-slate-200 font-bold mb-1 flex items-center justify-between">
                <span>A - Análisis (Conceptualización psicoclínica y de evolución)</span>
                <span className="text-[10px] text-slate-500">Diagnóstico funcional, avances o retrocesos</span>
              </label>
              <textarea
                rows={2}
                value={assessment}
                onChange={(e) => setAssessment(e.target.value)}
                placeholder="Evolución favorable en sintomatología ansiosa..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* P: Plan */}
            <div>
              <label className="block text-slate-200 font-bold mb-1 flex items-center justify-between">
                <span>P - Plan Terapéutico (Tareas intersesión y derivaciones)</span>
                <span className="text-[10px] text-slate-500">Acuerdos, ejercicios prácticos, próxima fecha</span>
              </label>
              <textarea
                rows={2}
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                placeholder="1. Registro diario de respiración... 2. Próxima sesión en 14 días."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* S: Dimensión Espiritual (Destacada) */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
              <label className="block text-amber-300 font-bold flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>S - Dimensión Espiritual (Pasaje Bíblico, Intercesión y Disciplinas)</span>
              </label>
              <textarea
                rows={2}
                value={spiritualDimension}
                onChange={(e) => setSpiritualDimension(e.target.value)}
                placeholder="Pasaje reflexionado: Salmo 34:18. Motivo de oración eclesial..."
                className="w-full bg-slate-950 border border-amber-500/30 rounded-xl p-3 text-amber-100 font-serif-bible focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Signature & Submit button */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-[11px] text-slate-400">
                Firma: <strong className="text-slate-200">{user.name}</strong> ({user.title})
              </p>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Nota en Expediente</span>
              </button>
            </div>
          </form>
        </div>

        {/* History of notes for this patient (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <History className="w-4 h-4 text-amber-400" />
              <span>Historial del Paciente ({patientNotes.length})</span>
            </h3>

            {patientNotes.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No hay notas previas para este expediente.
              </p>
            ) : (
              <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                {patientNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-400">Sesión #{note.sessionNumber}</span>
                      <span className="text-[10px] text-slate-400">{note.date}</span>
                    </div>

                    <p className="text-slate-300 text-[11px] line-clamp-3">
                      <strong>S:</strong> {note.subjective}
                    </p>

                    {note.spiritualDimension && (
                      <p className="text-amber-300/80 text-[10px] font-serif-bible line-clamp-2 border-t border-slate-800/80 pt-1">
                        <strong>Espiritual:</strong> {note.spiritualDimension}
                      </p>
                    )}

                    <div className="text-[9px] text-slate-500 pt-1 flex justify-between items-center">
                      <span>Firma registrada</span>
                      {note.riskFlag && (
                        <span className="text-rose-400 font-bold">Riesgo</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
