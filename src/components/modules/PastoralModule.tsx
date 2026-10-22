import React, { useState } from 'react';
import { 
  Heart, 
  BookOpen, 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  Flame, 
  HelpCircle, 
  User, 
  Calendar,
  Cross,
  Send,
  Loader2
} from 'lucide-react';
import { Patient, PrayerRequest, SpiritualMilestone, UserProfile } from '../../types';
import { callGeminiApi } from '../../services/geminiService';

interface PastoralModuleProps {
  user: UserProfile;
  patients: Patient[];
  onAddPrayerRequest: (patientId: string, prayer: PrayerRequest) => void;
  onAddMilestone: (patientId: string, milestone: SpiritualMilestone) => void;
}

export const PastoralModule: React.FC<PastoralModuleProps> = ({
  user,
  patients,
  onAddPrayerRequest,
  onAddMilestone,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'spiritual_file' | 'prayers' | 'discipleship' | 'bible_school'>('spiritual_file');

  // Prayer form
  const [isPrayerModalOpen, setIsPrayerModalOpen] = useState(false);
  const [newPrayerText, setNewPrayerText] = useState('');
  const [prayerPrivate, setPrayerPrivate] = useState(false);

  // Bible school AI generator
  const [bibleTopic, setBibleTopic] = useState('Fundamentos del Discipulado: Gracia vs Rendimiento Legalista');
  const [targetLevel, setTargetLevel] = useState('Líderes y nuevos creyentes');
  const [generatedLesson, setGeneratedLesson] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const patient = patients.find(p => p.id === selectedPatientId);

  const handleSavePrayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrayerText.trim() || !patient) return;

    const newRequest: PrayerRequest = {
      id: `pr-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      request: newPrayerText,
      status: 'activa',
      isPrivate: prayerPrivate,
    };

    onAddPrayerRequest(patient.id, newRequest);
    setNewPrayerText('');
    setIsPrayerModalOpen(false);
  };

  const handleGenerateBibleLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingAi(true);

    const prompt = `Actúa como un decano de seminario teológico y pastor formador de líderes.
Diseña una lección estructurada para Escuela Bíblica / Taller de Discipulado:
Tema: ${bibleTopic}
Público objetivo: ${targetLevel}

Estructura requerida:
1. Título y Pasaje Central.
2. Objetivo de Aprendizaje Teológico y Afectivo.
3. Bosquejo de Enseñanza en 3 Secciones con Preguntas de Discusión.
4. Desafío Práctico de Formación de Hábitos Espirituales.
5. Oración de Consagración.`;

    const res = await callGeminiApi(prompt);
    setGeneratedLesson(res.text);
    setIsLoadingAi(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Dirección Espiritual & Discipulado
            </span>
            <span className="text-xs text-slate-400">Pastoral Integral</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1 flex items-center gap-2">
            <Heart className="w-6 h-6 text-amber-400" />
            <span>Ficha Espiritual, Oración & Escuela Bíblica</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Acompañamiento del crecimiento del alma, peticiones de intercesión y currículo formativo.
          </p>
        </div>

        {/* Patient Switcher */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
          <User className="w-4 h-4 text-amber-400 ml-2" />
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="bg-transparent text-xs text-white font-semibold focus:outline-none pr-3 cursor-pointer"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                {p.fullName} ({p.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          { key: 'spiritual_file', label: '1. Ficha Espiritual' },
          { key: 'prayers', label: '2. Peticiones de Oración' },
          { key: 'discipleship', label: '3. Metas de Discipulado' },
          { key: 'bible_school', label: '4. Generador de Escuela Bíblica' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === tab.key
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. Ficha Espiritual */}
      {activeTab === 'spiritual_file' && patient && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
              <Cross className="w-4 h-4" />
              <span>Perfil de Fe & Trayectoria Eclesial</span>
            </h3>

            <div className="space-y-2 text-slate-300">
              <p><strong>Tradición / Creencia:</strong> {patient.spiritualBackground.faithBelief}</p>
              <p><strong>Frecuencia Eclesial:</strong> {patient.spiritualBackground.churchAttendance}</p>
              <p><strong>Etapa de Discipulado:</strong> {patient.spiritualBackground.discipleshipStage || 'Creyente en consolidación'}</p>
              <p><strong>Ministerio / Rol:</strong> {patient.spiritualBackground.ministryInvolvement}</p>
              <p><strong>Dones Espirituales:</strong> {patient.spiritualBackground.spiritualGifts || 'Enseñanza, Servicio, Alabanza'}</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="font-bold text-cyan-400 text-sm">Luchas y Sanidad Interior</h3>
            <p className="text-slate-300 italic font-serif-bible leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              "{patient.spiritualBackground.spiritualStruggles}"
            </p>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-200">
              <strong>Guía Pastoral:</strong> Priorizar la gracia incondicional y acompañar sin juzgar dudas teológicas o momentos de cansancio.
            </div>
          </div>
        </div>
      )}

      {/* 2. Peticiones de Oración */}
      {activeTab === 'prayers' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Cadena de Oración e Intercesión Confidencial</h3>
              <p className="text-slate-400 text-[11px]">Seguimiento de motivos activos y respuestas a la oración.</p>
            </div>
            <button
              onClick={() => setIsPrayerModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Añadir Motivo de Oración</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {[
              { id: '1', date: '2026-10-18', text: 'Paz en el hogar y restauración de la comunicación conyugal sin rencores.', status: 'activa' },
              { id: '2', date: '2026-10-12', text: 'Sanidad de insomnio crónico y descanso reparador.', status: 'contestada' },
            ].map(pr => (
              <div key={pr.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold ${
                      pr.status === 'contestada' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {pr.status === 'contestada' ? '✓ Oración Contestada' : 'En Intercesión Activa'}
                    </span>
                    <span className="text-[10px] text-slate-500">{pr.date}</span>
                  </div>
                  <p className="text-slate-200 mt-1 font-serif-bible">{pr.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Discipulado */}
      {activeTab === 'discipleship' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white">Metas de Formación y Hábitos Espirituales</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold text-amber-400 uppercase">1. Vida Devocional</span>
              <p className="font-bold text-slate-100">15 min diarios de Lectio Divina</p>
              <p className="text-slate-400 text-[11px]">Enfoque en los Salmos de lamento y esperanza.</p>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold text-cyan-400 uppercase">2. Salud Relacional</span>
              <p className="font-bold text-slate-100">Cita Semanal con Cónyuge</p>
              <p className="text-slate-400 text-[11px]">Sin hablar de problemas ministeriales ni de trabajo.</p>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold text-emerald-400 uppercase">3. Día de Descanso</span>
              <p className="font-bold text-slate-100">Shabbat Sagrado Semanal</p>
              <p className="text-slate-400 text-[11px]">Desconexión digital total a partir de las 8:00 PM.</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Generador de Escuela Bíblica */}
      {activeTab === 'bible_school' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Generador de Currículo para Escuela Bíblica con IA</span>
            </h3>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Crea lecciones completas, bosquejos pedagógicos y dinámicas de grupo con solidez teológica.
            </p>
          </div>

          <form onSubmit={handleGenerateBibleLesson} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tema de la Lección</label>
              <input
                type="text"
                required
                value={bibleTopic}
                onChange={(e) => setBibleTopic(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Público / Nivel de Formación</label>
              <input
                type="text"
                value={targetLevel}
                onChange={(e) => setTargetLevel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={isLoadingAi}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-2 shadow-md shadow-amber-500/20 disabled:opacity-50"
              >
                {isLoadingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 fill-slate-950" />}
                <span>{isLoadingAi ? 'Generando Lección...' : 'Generar Lección con IA'}</span>
              </button>
            </div>
          </form>

          {generatedLesson && (
            <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
              {generatedLesson}
            </div>
          )}
        </div>
      )}

      {/* Modal: New Prayer */}
      {isPrayerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-amber-400" />
              <span>Añadir Petición de Oración</span>
            </h3>

            <form onSubmit={handleSavePrayer} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Motivo de Oración *</label>
                <textarea
                  required
                  rows={3}
                  value={newPrayerText}
                  onChange={(e) => setNewPrayerText(e.target.value)}
                  placeholder="Escribe la petición de intercesión..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={prayerPrivate}
                  onChange={(e) => setPrayerPrivate(e.target.checked)}
                  className="accent-amber-500 rounded"
                />
                <span>Petición Confidencial (Sólo visible para el pastor/consejero)</span>
              </label>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPrayerModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                >
                  Guardar Motivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
