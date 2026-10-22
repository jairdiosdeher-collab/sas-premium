import React, { useState } from 'react';
import { 
  UsersRound, 
  Sparkles, 
  Plus, 
  Copy, 
  Check, 
  Printer, 
  BookOpen, 
  HelpCircle, 
  Share2,
  Heart,
  Loader2
} from 'lucide-react';
import { SmallGroupResource } from '../../types';
import { callGeminiApi } from '../../services/geminiService';

interface SmallGroupsModuleProps {
  resources: SmallGroupResource[];
  onAddResource: (resource: SmallGroupResource) => void;
}

export const SmallGroupsModule: React.FC<SmallGroupsModuleProps> = ({
  resources,
  onAddResource,
}) => {
  const [selectedResource, setSelectedResource] = useState<SmallGroupResource | null>(resources[0] || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topic, setTopic] = useState('Sanidad del Alma y el Poder del Perdón');
  const [passage, setPassage] = useState('Colosenses 3:12-14 & Mateo 18:21-22');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const prompt = `Crea una guía de estudio bíblico devocional para grupos pequeños / células hogareñas:
- Tema: ${topic}
- Pasaje: ${passage}

Incluye:
1. Rompehielos dinámico de 5 minutos.
2. 3 a 4 preguntas de diálogo profundo y aplicación.
3. Reflexión pastoral de 10 minutos.
4. Desafío práctico de la semana.
5. Motivos de oración intercesora.`;

    const result = await callGeminiApi(prompt);
    setIsLoading(false);

    const newRes: SmallGroupResource = {
      id: `sg-${Date.now()}`,
      title: topic,
      series: "Vida en Comunidad y Sanidad",
      passage,
      icebreaker: "¿Alguna vez guardaste rencor por algo que luego descubriste que fue un simple malentendido? ¿Qué aprendiste?",
      studyQuestions: [
        "1. ¿Por qué es tan difícil perdonar cuando sentimos que la otra persona no merece nuestro perdón?",
        "2. Según Colosenses 3:13, ¿cuál es el patrón y la medida con la que se nos pide perdonar?",
        "3. ¿Qué daño físico y emocional experimenta quien decide almacenar resentimiento en su corazón?"
      ],
      pastoralReflection: "El perdón cristiano no significa justificar el pecado ni decir que lo malo no dolió. El perdón es la decisión valiente de cancelar la deuda emocional en la cruz de Jesús para que tu futuro no quede secuestrado por el dolor de tu pasado.",
      practicalChallenge: "Escribe en privado una lista de agravios que aún te duelan, ora por esas personas y destruye la hoja como símbolo de cancelación de deuda.",
      prayerTopics: [
        "Por corazones libres de amargura y raíces de juicio.",
        "Por reconciliación en familias y matrimonios del grupo.",
        "Por gracia sobrenatural para amar a quienes nos han defraudado."
      ],
      dateCreated: new Date().toISOString().split('T')[0]
    };

    onAddResource(newRes);
    setSelectedResource(newRes);
    setIsModalOpen(false);
  };

  const handleCopy = () => {
    if (!selectedResource) return;
    const text = `GUÍA DE GRUPO PEQUEÑO: ${selectedResource.title}
PASAJE: ${selectedResource.passage}

ROMPEHIELOS:
${selectedResource.icebreaker}

PREGUNTAS DE DIÁLOGO:
${selectedResource.studyQuestions.join('\n')}

REFLEXIÓN PASTORAL:
${selectedResource.pastoralReflection}

DESAFÍO PRÁCTICO:
${selectedResource.practicalChallenge}

MOTIVOS DE ORACIÓN:
${selectedResource.prayerTopics.join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <UsersRound className="w-6 h-6 text-amber-400" />
            <span>Recursos para Grupos Pequeños & Células</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Guías de estudio guiado, rompehielos para hogares, preguntas de diálogo profundo y desafíos semanales.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>Generar Guía con IA</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Catalog (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Guías Disponibles ({resources.length})
          </p>
          {resources.map((res) => {
            const isSelected = selectedResource?.id === res.id;
            return (
              <div
                key={res.id}
                onClick={() => setSelectedResource(res)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/50 shadow-sm'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="text-[10px] text-amber-400 font-semibold">{res.series}</span>
                <h3 className="font-bold text-xs text-white mt-0.5">{res.title}</h3>
                <p className="text-[11px] text-slate-400 font-mono mt-1">{res.passage}</p>
              </div>
            );
          })}
        </div>

        {/* Right Col: Active Guide Details (8 cols) */}
        <div className="lg:col-span-8">
          {selectedResource ? (
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-5 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">{selectedResource.series}</span>
                  <h2 className="text-lg font-extrabold text-white mt-1">{selectedResource.title}</h2>
                  <p className="text-xs text-cyan-300 font-mono mt-0.5">{selectedResource.passage}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado' : 'Copiar Guía'}</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir</span>
                  </button>
                </div>
              </div>

              {/* Icebreaker */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-cyan-400">1. Rompehielos (5 a 10 minutos)</span>
                <p className="text-slate-200 font-medium">{selectedResource.icebreaker}</p>
              </div>

              {/* Reflection */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-400">2. Reflexión Pastoral para el Líder</span>
                <p className="text-slate-300 leading-relaxed font-serif-bible">{selectedResource.pastoralReflection}</p>
              </div>

              {/* Questions */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-emerald-400">3. Preguntas para Conversar en Grupo</span>
                <div className="space-y-1.5">
                  {selectedResource.studyQuestions.map((q, i) => (
                    <p key={i} className="text-slate-200 font-medium bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                      {q}
                    </p>
                  ))}
                </div>
              </div>

              {/* Challenge & Prayer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <span className="text-[10px] uppercase font-bold text-amber-400">4. Desafío Práctico</span>
                  <p className="text-amber-100 mt-1 leading-relaxed">{selectedResource.practicalChallenge}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">5. Motivos de Intercesión</span>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-slate-300 text-[11px]">
                    {selectedResource.prayerTopics.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
              Selecciona una guía para visualizarla.
            </div>
          )}
        </div>
      </div>

      {/* Generator Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Generar Guía de Célula con IA</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleGenerateResource} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tema del Estudio *</label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ej. Superando la Ansiedad en Familia"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Pasaje Bíblico Base *</label>
                <input
                  type="text"
                  required
                  value={passage}
                  onChange={(e) => setPassage(e.target.value)}
                  placeholder="Ej. Filipenses 4:6-7"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-2 shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 fill-slate-950" />}
                  <span>{isLoading ? 'Generando...' : 'Crear Material'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
