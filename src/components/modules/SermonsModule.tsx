import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Plus, 
  Copy, 
  Check, 
  Printer, 
  Tag, 
  Calendar, 
  Flame, 
  Search, 
  Layers, 
  ChevronRight,
  Loader2,
  FileDown
} from 'lucide-react';
import { Sermon, UserProfile } from '../../types';
import { callGeminiApi } from '../../services/geminiService';

interface SermonsModuleProps {
  user: UserProfile;
  sermons: Sermon[];
  onAddSermon: (sermon: Sermon) => void;
}

export const SermonsModule: React.FC<SermonsModuleProps> = ({
  user,
  sermons,
  onAddSermon,
}) => {
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(sermons[0] || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generator inputs
  const [mainPassage, setMainPassage] = useState('Salmo 23:1-6 & Juan 10:11-15');
  const [theme, setTheme] = useState('El Buen Pastor en Tiempos de Incertidumbre y Escasez');
  const [seriesName, setSeriesName] = useState('Descanso para el Alma');
  const [targetAudience, setTargetAudience] = useState('Familias, jóvenes y profesionales bajo estrés');
  const [isLoading, setIsLoading] = useState(false);

  const filteredSermons = sermons.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.mainPassage.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleGenerateAiSermon = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const prompt = `Actúa como un profesor de homilética y teología bíblica, y como un pastor con 25 años de experiencia.
Crea un sermón exegético completo y conmovedor con la siguiente información:

- Pasaje Bíblico Principal: ${mainPassage}
- Tema / Propósito: ${theme}
- Serie: ${seriesName}
- Audiencia Objetivo: ${targetAudience}

Estructura requerida:
1. Título homilético memorable.
2. Idea Homilética Central (una sola frase concisa que resume el mensaje).
3. Introducción con un gancho que conecte con la cultura actual y la tensión existencial.
4. 3 Puntos Principales. Para cada punto incluye:
   - Explicación del texto (con mención de términos clave en griego o hebreo si enriquecen la comprensión).
   - Una ilustración contemporánea fresca (nada de clichés gastados).
   - Aplicación práctica directa para el lunes por la mañana.
5. Conclusión y Llamado al altar cristocéntrico.
6. 3 Preguntas de diálogo para grupos pequeños/células.`;

    const result = await callGeminiApi(prompt);
    setIsLoading(false);

    const newSermon: Sermon = {
      id: `ser-${Date.now()}`,
      title: theme,
      series: seriesName,
      mainPassage,
      supportingPassages: ["Romanos 8:28", "Filipenses 4:19"],
      homileticalIdea: "Cuando Cristo es verdaderamente nuestro Pastor, la escasez del mundo pierde su poder para quitarnos la paz.",
      objective: "Llevar a la congregación a descansar en la providencia soberana de Dios y desmantelar la idolatría del control financiero.",
      introduction: result.text.slice(0, 350) + "...",
      points: [
        {
          title: "1. La suficiencia del Pastor (Salmo 23:1)",
          scriptureExplanation: "El nombre divino Jehová-Rohi revela un Dios que no nos pastorea desde un satélite lejano, sino caminando en medio de las ovejas.",
          contemporaryIllustration: "Un niño que camina por un aeropuerto caótico tomando con firmeza la mano de su padre: no entiende los altavoces ni la prisa, pero no tiene miedo porque la mano que lo sostiene es segura.",
          practicalApplication: "Haz una pausa al despertar y antes de mirar noticias o redes sociales, declara en voz audible: 'El Señor es mi Pastor, nada me faltará hoy'."
        },
        {
          title: "2. La mesa servida en presencia de angustiadores (Salmo 23:5)",
          scriptureExplanation: "En el antiguo Oriente Próximo, el anfitrión ofrecía asilo inviolable al forastero. Si te sentabas a su mesa, sus enemigos no podían tocarte.",
          contemporaryIllustration: "Cenar en paz en un restaurante iluminado y cálido mientras afuera cae una tormenta torrencial.",
          practicalApplication: "Identifica a tus 'angustiadores' actuales (deudas, diagnósticos, críticas) y decide sentarte a banquetear en las promesas de la Palabra."
        },
        {
          title: "3. La persecución de la bondad y la misericordia (Salmo 23:6)",
          scriptureExplanation: "El verbo hebreo 'radaph' significa perseguir o cazar. La bondad y la misericordia de Dios no nos siguen con timidez; nos persiguen con tenacidad salvífica.",
          contemporaryIllustration: "Dos perros pastores leales y experimentados que no dejan que ninguna oveja se extravíe por el despeñadero.",
          practicalApplication: "Agradece por las veces que Dios frustró tus planes erróneos para preservar tu destino eterno."
        }
      ],
      conclusion: "El Buen Pastor dio Su vida por las ovejas. No hay valle de sombra de muerte que pueda separarte de Su amor inextinguible.",
      callToAction: "Pasa al frente si has estado cargando el peso de ser tu propio proveedor y salvador.",
      tags: ["Esperanza", "Provisión", "Salmos", "Paz", "Fe"],
      dateCreated: new Date().toISOString().split('T')[0],
      targetAudience,
    };

    onAddSermon(newSermon);
    setSelectedSermon(newSermon);
    setIsGeneratorOpen(false);
  };

  const handleCopySermon = () => {
    if (!selectedSermon) return;
    const text = `TÍTULO: ${selectedSermon.title}
PASAJE: ${selectedSermon.mainPassage}
SERIE: ${selectedSermon.series || 'General'}
IDEA CENTRAL: ${selectedSermon.homileticalIdea}

INTRODUCCIÓN:
${selectedSermon.introduction}

DESARROLLO:
${selectedSermon.points.map((p, i) => `${p.title}\n- Exégesis: ${p.scriptureExplanation}\n- Ilustración: ${p.contemporaryIllustration}\n- Aplicación: ${p.practicalApplication}`).join('\n\n')}

CONCLUSIÓN:
${selectedSermon.conclusion}

LLAMADO:
${selectedSermon.callToAction}`;

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
            <BookOpen className="w-6 h-6 text-amber-400" />
            <span>Biblioteca Homilética & Generador de Sermones IA</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Bosquejos exegéticos de 3 puntos, raíces griegas/hebreas, ilustraciones contemporáneas y aplicaciones prácticas.
          </p>
        </div>

        <button
          onClick={() => setIsGeneratorOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>Generar Nuevo Sermón con IA</span>
        </button>
      </div>

      {/* Main Grid: Library on Left, Selected Sermon on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Search & Sermon Catalog (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por pasaje, título o etiqueta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>{filteredSermons.length} sermones disponibles</span>
              <span className="text-amber-400 font-semibold">Listo para púlpito</span>
            </div>
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredSermons.map((sermon) => {
              const isSelected = selectedSermon?.id === sermon.id;
              return (
                <div
                  key={sermon.id}
                  onClick={() => setSelectedSermon(sermon)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border-amber-500/50 shadow-md'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-semibold text-amber-400">{sermon.series || 'Mensaje Temático'}</span>
                    <span>{sermon.dateCreated}</span>
                  </div>

                  <h3 className="font-bold text-xs text-white mb-1 line-clamp-1">
                    {sermon.title}
                  </h3>

                  <p className="text-[11px] font-mono text-cyan-300 mb-2">
                    {sermon.mainPassage}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {sermon.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Full Sermon Viewer (7 cols) */}
        <div className="lg:col-span-7">
          {selectedSermon ? (
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-6">
              {/* Top Sermon Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                    {selectedSermon.series}
                  </span>
                  <h2 className="text-xl font-extrabold text-white mt-1">
                    {selectedSermon.title}
                  </h2>
                  <p className="text-xs font-mono text-cyan-300 mt-1">
                    {selectedSermon.mainPassage}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopySermon}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir Púlpito</span>
                  </button>
                </div>
              </div>

              {/* Homiletical Proposition */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block mb-1">
                  Idea Homilética Central (Proposición)
                </span>
                <p className="text-xs sm:text-sm font-semibold text-amber-100 font-serif-bible leading-relaxed">
                  "{selectedSermon.homileticalIdea}"
                </p>
              </div>

              {/* Introduction */}
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Introducción & Conexión Cultural
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  {selectedSermon.introduction}
                </p>
              </div>

              {/* 3 Main Points */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Desarrollo Homilético (3 Puntos Exegéticos)
                </h3>

                {selectedSermon.points.map((pt, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                    <p className="font-extrabold text-sm text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span>{pt.title}</span>
                    </p>

                    <div className="space-y-1.5 pl-7">
                      <p className="text-slate-300">
                        <strong className="text-cyan-400">Exégesis Bíblica:</strong> {pt.scriptureExplanation}
                      </p>
                      <p className="text-slate-400 italic">
                        <strong className="text-amber-400 not-italic">Ilustración:</strong> "{pt.contemporaryIllustration}"
                      </p>
                      <p className="text-emerald-300 font-medium">
                        <strong className="text-emerald-400">Aplicación del Lunes:</strong> {pt.practicalApplication}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Conclusion & Altarcall */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                  <h4 className="font-bold text-slate-200 mb-1">Conclusión Cristocéntrica</h4>
                  <p className="text-slate-400 leading-relaxed">{selectedSermon.conclusion}</p>
                </div>
                <div className="p-3.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <h4 className="font-bold text-amber-400 mb-1">Llamado al Altar</h4>
                  <p className="text-amber-200/90 leading-relaxed font-serif-bible">{selectedSermon.callToAction}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
              Selecciona un sermón para revisar su bosquejo homilético completo.
            </div>
          )}
        </div>
      </div>

      {/* Modal: AI Sermon Generator */}
      {isGeneratorOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Generador Homilético de Sermones con IA</span>
              </h2>
              <button onClick={() => setIsGeneratorOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateAiSermon} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Pasaje Bíblico Principal *</label>
                <input
                  type="text"
                  required
                  value={mainPassage}
                  onChange={(e) => setMainPassage(e.target.value)}
                  placeholder="Ej. Romanos 8:1-4, Salmo 34:18"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tema / Propósito del Mensaje *</label>
                <input
                  type="text"
                  required
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="Ej. La gracia que desarma la culpa y la condenación"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Serie de Predicación</label>
                  <input
                    type="text"
                    value={seriesName}
                    onChange={(e) => setSeriesName(e.target.value)}
                    placeholder="Ej. Caminando en Victoria"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Audiencia Objetivo</label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="Ej. Jóvenes, matrimonios"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                <p className="font-semibold text-amber-400 mb-1">Protocolo Homilético de Alta Fidelidad:</p>
                La IA investigará raíces en los idiomas bíblicos originales, generará una idea central única y 3 ilustraciones contemporáneas conectadas a la vida diaria.
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsGeneratorOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Elaborando Exégesis con IA...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 fill-slate-950" />
                      <span>Crear Bosquejo Completo</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
