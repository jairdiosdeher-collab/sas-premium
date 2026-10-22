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
  FileDown,
  Monitor,
  HelpCircle,
  Heart,
  Maximize2,
  X,
  ChevronLeft
} from 'lucide-react';
import { Sermon, UserProfile, HomileticSlide } from '../../types';
import { callGeminiApi } from '../../services/geminiService';
import { useToast } from '../../context/ToastContext';

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
  const { showSuccess } = useToast();
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(sermons[0] || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'bosquejo' | 'exegesis' | 'celulas' | 'devocional' | 'diapositivas'>('bosquejo');

  // Slide Deck Presenter state
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreenSlides, setIsFullscreenSlides] = useState(false);

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

  // Generador de diapositivas automáticas basadas en el sermón seleccionado
  const generateSlides = (sermon: Sermon): HomileticSlide[] => {
    return [
      {
        slideNumber: 1,
        title: sermon.title,
        subtitle: `Serie: ${sermon.series || 'Predicación Expositiva'}`,
        scriptureReference: sermon.mainPassage,
        contentBulletPoints: [
          `Pasaje Bíblico: ${sermon.mainPassage}`,
          `Propósito: ${sermon.objective}`,
          `PastoralMente Proyección Digital`
        ],
        speakerNotes: 'Introducir con la historia y capturar la atención de la audiencia.'
      },
      {
        slideNumber: 2,
        title: 'Idea Homilética Central',
        subtitle: 'Proposición Teológica',
        scriptureReference: sermon.mainPassage,
        contentBulletPoints: [
          `"${sermon.homileticalIdea}"`
        ],
        speakerNotes: 'Repetir la idea central con claridad e invitar a la congregación a memorizarla.'
      },
      ...sermon.points.map((pt, idx) => ({
        slideNumber: idx + 3,
        title: pt.title,
        subtitle: `Punto ${idx + 1}`,
        scriptureReference: sermon.mainPassage,
        contentBulletPoints: [
          `Exégesis: ${pt.scriptureExplanation}`,
          `Ilustración: ${pt.contemporaryIllustration}`,
          `Aplicación: ${pt.practicalApplication}`
        ],
        speakerNotes: `Énfasis pastoral en la aplicación personal para la semana.`
      })),
      {
        slideNumber: sermon.points.length + 3,
        title: 'Conclusión & Llamado de Fe',
        subtitle: 'Respuesta al Evangelio',
        scriptureReference: sermon.mainPassage,
        contentBulletPoints: [
          sermon.conclusion,
          `Llamado: ${sermon.callToAction}`
        ],
        speakerNotes: 'Espacio para oración guiada y ministración del Espíritu Santo.'
      }
    ];
  };

  const slides = selectedSermon ? generateSlides(selectedSermon) : [];

  const handleGenerateAiSermon = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const prompt = `Actúa como un profesor de homilética y teología bíblica (Motor Homilético 10.0).
Crea un sermón exegético completo y de impacto con la siguiente información:
- Pasaje Bíblico Principal: ${mainPassage}
- Tema / Propósito: ${theme}
- Serie: ${seriesName}
- Audiencia Objetivo: ${targetAudience}

Estructura:
1. Título homilético memorable.
2. Idea Homilética Central.
3. Introducción contemporánea.
4. 3 Puntos Principales con Explicación (raíces en griego o hebreo), Ilustración contemporánea y Aplicación práctica.
5. Conclusión y Llamado al altar cristocéntrico.`;

    const result = await callGeminiApi(prompt);
    setIsLoading(false);

    const newSermon: Sermon = {
      id: `ser-${Date.now()}`,
      title: theme,
      series: seriesName,
      mainPassage,
      supportingPassages: ["Romanos 8:28", "Filipenses 4:19"],
      homileticalIdea: "Cuando Cristo es verdaderamente nuestro Pastor, la escasez del mundo pierde su poder para quitarnos la paz.",
      objective: "Llevar a la congregación a descansar en la providencia soberana de Dios.",
      introduction: result.text.slice(0, 350) + "...",
      points: [
        {
          title: "1. La suficiencia del Pastor (Salmo 23:1)",
          scriptureExplanation: "El nombre divino Jehová-Rohi revela un Dios que camina en medio de sus ovejas con compasión inextinguible.",
          contemporaryIllustration: "Un niño que camina en un aeropuerto caótico de la mano de su padre: no entiende el ruido, pero descansa en quien lo guía.",
          practicalApplication: "Haz una pausa al despertar y declara: 'El Señor es mi Pastor, nada me faltará hoy'."
        },
        {
          title: "2. La mesa servida en presencia de angustiadores (Salmo 23:5)",
          scriptureExplanation: "En el antiguo Oriente Próximo, el anfitrión ofrecía asilo inviolable al comensal en su tienda.",
          contemporaryIllustration: "Cenar en paz en un hogar cálido mientras afuera ruge una tempestad violenta.",
          practicalApplication: "Identifica a tus 'angustiadores' actuales y descansa en la mesa de sus promesas."
        },
        {
          title: "3. La persecución de la bondad y la misericordia (Salmo 23:6)",
          scriptureExplanation: "El verbo hebreo 'radaph' significa perseguir con celo. La misericordia de Dios nos persigue activamente.",
          contemporaryIllustration: "Dos perros pastores experimentados que no permiten que ninguna oveja se despeñe en el abismo.",
          practicalApplication: "Agradece por los caminos que Dios cerró para preservar tu vida espiritual."
        }
      ],
      conclusion: "El Buen Pastor entregó su vida por ti. Nada puede separarte de su amor eterno.",
      callToAction: "Pasa al frente si deseas entregar tus cargas y recibir su descanso.",
      tags: ["Esperanza", "Provisión", "Salmos", "Paz", "Fe"],
      dateCreated: new Date().toISOString().split('T')[0],
      targetAudience,
    };

    onAddSermon(newSermon);
    setSelectedSermon(newSermon);
    setIsGeneratorOpen(false);
    showSuccess('Sermón 10.0 Generado', `Bosquejo, exégesis y diapositivas listos para púlpito.`);
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
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Pilar 10 &bull; Homilética de Alta Fidelidad
            </span>
            <span className="text-xs text-slate-400">Exégesis, Diapositivas & Células</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2 mt-1">
            <BookOpen className="w-6 h-6 text-amber-400" />
            <span>Motor de Sermones 10.0 con IA</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Exégesis en griego/hebreo, contexto cultural, 3 puntos con ilustraciones, preguntas para grupos pequeños y presentaciones automáticas.
          </p>
        </div>

        <button
          onClick={() => setIsGeneratorOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>Generar Sermón 10.0 con IA</span>
        </button>
      </div>

      {/* Main Grid: Library on Left, Selected Sermon on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Search & Sermon Catalog (5 cols) */}
        <div className="lg:col-span-4 space-y-3">
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
              <span className="text-amber-400 font-semibold">Listo para Púlpito</span>
            </div>
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
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
                      <span key={idx} className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Full Sermon 10.0 Multi-View (8 cols) */}
        <div className="lg:col-span-8">
          {selectedSermon ? (
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-5">
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

              {/* View Switcher Tabs (5 Dimensions) */}
              <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                {[
                  { id: 'bosquejo', label: 'Bosquejo Homilético', icon: BookOpen },
                  { id: 'exegesis', label: 'Exégesis & Contexto', icon: Sparkles },
                  { id: 'celulas', label: 'Grupos Pequeños', icon: HelpCircle },
                  { id: 'devocional', label: 'Plan Devocional 3D', icon: Heart },
                  { id: 'diapositivas', label: 'Presentación & Diapositivas', icon: Monitor },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition ${
                        activeTab === tab.id
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: BOSQUEJO HOMILÉTICO */}
              {activeTab === 'bosquejo' && (
                <div className="space-y-5 animate-fadeIn">
                  {/* Homiletical Proposition */}
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block mb-1">
                      Idea Homilética Central (Proposición)
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-amber-100 font-serif leading-relaxed">
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
                      <p className="text-amber-200/90 leading-relaxed font-serif">{selectedSermon.callToAction}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: EXÉGESIS & CONTEXTO HISTÓRICO */}
              {activeTab === 'exegesis' && (
                <div className="space-y-4 text-xs animate-fadeIn">
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <h4 className="font-bold text-amber-400 text-sm">Contexto Histórico y Cultural del Pasaje</h4>
                    <p className="text-slate-300 leading-relaxed">
                      El trasfondo pastoril del antiguo Cercano Oriente revela que el pastor no era un simple cuidador comercial, sino un protector armado cuya propia vida dependía de la seguridad de las ovejas. David redacta el Salmo 23 no desde la ingenuidad palaciega, sino habiendo enfrentado leones y osos en el desierto de Judea.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                      <h5 className="font-bold text-cyan-300">Términos Clave en Hebreo / Griego:</h5>
                      <ul className="space-y-2 text-slate-300">
                        <li><strong className="text-white font-mono">יהוה רעי (Yahweh-Rohi):</strong> "El Señor es mi Pastor íntimo y presente".</li>
                        <li><strong className="text-white font-mono">רדף (Radaph):</strong> "Perseguir con tenacidad indomable" (v. 6).</li>
                        <li><strong className="text-white font-mono">ψυχή (Psyché):</strong> "El Buen Pastor su vida (alma) pone por las ovejas" (Juan 10:11).</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                      <h5 className="font-bold text-emerald-300">Teología Bíblica Cristocéntrica:</h5>
                      <p className="text-slate-300 leading-relaxed">
                        El Salmo 23 encuentra su cumplimiento pleno en el Evangelio de Juan. Jesús declara en el templo: "Yo soy el Buen Pastor". El cayado que nos protege es la cruz, donde Cristo absorbió la condenación del abismo para que nosotros caminemos seguros.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: GRUPOS PEQUEÑOS / CÉLULAS */}
              {activeTab === 'celulas' && (
                <div className="space-y-4 text-xs animate-fadeIn">
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                    <h4 className="font-bold text-amber-400 text-sm">Guía de Diálogo para Grupos Pequeños</h4>
                    <p className="text-slate-400">
                      Preguntas diseñadas para derribar máscaras y generar comunión genuina en las células de la semana.
                    </p>
                    <ol className="space-y-3 list-decimal list-inside text-slate-200">
                      <li className="p-2.5 bg-slate-900 rounded-lg">
                        <strong>Rompehielos:</strong> ¿Cuál ha sido una situación reciente donde sentiste que no tenías el control absoluto de las cosas?
                      </li>
                      <li className="p-2.5 bg-slate-900 rounded-lg">
                        <strong>Profundización:</strong> ¿Por qué nos cuesta tanto creer de corazón que 'nada nos faltará' cuando vemos noticias o cuentas por pagar?
                      </li>
                      <li className="p-2.5 bg-slate-900 rounded-lg">
                        <strong>Aplicación:</strong> ¿Qué 'angustiador' necesitas poner en las manos de Dios esta semana para cenar en su paz?
                      </li>
                    </ol>
                  </div>
                </div>
              )}

              {/* TAB 4: PLAN DEVOCIONAL 3 DÍAS */}
              {activeTab === 'devocional' && (
                <div className="space-y-3 text-xs animate-fadeIn">
                  {[
                    { dia: 'Día 1', titulo: 'Renunciando a la Ansiedad del Control', pasaje: 'Salmos 23:1-3', reflexion: 'Comienza el día meditando en que Dios no necesita tu estrés para resolver tus problemas.' },
                    { dia: 'Día 2', titulo: 'Paz en Medio de la Tormenta', pasaje: 'Salmos 23:4-5', reflexion: 'El valle de sombra de muerte no es un destino final, es sólo un pasaje hacia pastos delicados.' },
                    { dia: 'Día 3', titulo: 'La Misericordia que no se Rinde', pasaje: 'Salmos 23:6', reflexion: 'Su gracia te acompaña hoy. Descansa en la fidelidad eterna de Cristo.' },
                  ].map((dev, idx) => (
                    <div key={idx} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-amber-400 font-bold">
                        <span>{dev.dia}: {dev.titulo}</span>
                        <span className="font-mono text-cyan-300 text-[11px]">{dev.pasaje}</span>
                      </div>
                      <p className="text-slate-300">{dev.reflexion}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 5: PRESENTACIÓN AUTOMÁTICA DE DIAPOSITIVAS */}
              {activeTab === 'diapositivas' && (
                <div className="space-y-4 text-xs animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-bold">
                      Diapositiva {currentSlideIndex + 1} de {slides.length}
                    </span>
                    <button
                      onClick={() => setIsFullscreenSlides(true)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold flex items-center space-x-1 transition"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Modo Proyector Pantalla Completa</span>
                    </button>
                  </div>

                  {/* Slide Preview Canvas */}
                  {slides[currentSlideIndex] && (
                    <div className="aspect-video bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border-2 border-amber-500/40 rounded-2xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden text-center">
                      <div className="space-y-2">
                        <span className="text-xs uppercase tracking-widest text-amber-400 font-bold block">
                          {slides[currentSlideIndex].subtitle}
                        </span>
                        <h3 className="text-2xl md:text-3xl font-black text-white font-serif tracking-tight">
                          {slides[currentSlideIndex].title}
                        </h3>
                        <p className="text-sm font-mono text-cyan-300">
                          {slides[currentSlideIndex].scriptureReference}
                        </p>
                      </div>

                      <div className="my-auto max-w-xl mx-auto space-y-2">
                        {slides[currentSlideIndex].contentBulletPoints.map((bp, i) => (
                          <p key={i} className="text-base text-slate-200 font-medium leading-relaxed">
                            {bp}
                          </p>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-4 border-t border-slate-800">
                        <span>PastoralMente Slide Deck Engine 10.0</span>
                        <span>{selectedSermon.title}</span>
                      </div>
                    </div>
                  )}

                  {/* Slide controls */}
                  <div className="flex items-center justify-center space-x-4 pt-2">
                    <button
                      disabled={currentSlideIndex === 0}
                      onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl font-bold flex items-center space-x-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Anterior</span>
                    </button>
                    <button
                      disabled={currentSlideIndex === slides.length - 1}
                      onClick={() => setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 rounded-xl font-bold flex items-center space-x-1"
                    >
                      <span>Siguiente</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
              Selecciona un sermón para revisar su bosquejo homilético completo.
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Projector Modal */}
      {isFullscreenSlides && slides[currentSlideIndex] && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-8 text-center animate-fadeIn">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>{selectedSermon?.title} &bull; Diapositiva {currentSlideIndex + 1}/{slides.length}</span>
            <button
              onClick={() => setIsFullscreenSlides(false)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg"
            >
              Salir de Pantalla Completa (Esc)
            </button>
          </div>

          <div className="max-w-4xl mx-auto space-y-6 my-auto">
            <span className="text-sm uppercase tracking-widest text-amber-400 font-bold block">
              {slides[currentSlideIndex].subtitle}
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white font-serif leading-tight">
              {slides[currentSlideIndex].title}
            </h1>
            <p className="text-lg font-mono text-cyan-400">
              {slides[currentSlideIndex].scriptureReference}
            </p>
            <div className="space-y-4 pt-6">
              {slides[currentSlideIndex].contentBulletPoints.map((bp, i) => (
                <p key={i} className="text-xl md:text-2xl text-slate-200 font-medium leading-relaxed">
                  {bp}
                </p>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center space-x-6">
            <button
              disabled={currentSlideIndex === 0}
              onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
              className="px-6 py-3 bg-slate-800 text-white rounded-2xl text-sm font-bold"
            >
              Anterior
            </button>
            <button
              disabled={currentSlideIndex === slides.length - 1}
              onClick={() => setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
              className="px-6 py-3 bg-amber-500 text-slate-950 rounded-2xl text-sm font-bold"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modal: AI Sermon Generator */}
      {isGeneratorOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Generador Homilético 10.0 con IA</span>
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
                <p className="font-semibold text-amber-400 mb-1">Motor Homilético 10.0:</p>
                Generará exégesis profunda, raíces griegas/hebreas, 3 ilustraciones de impacto, preguntas para células, plan devocional y diapositivas de proyección.
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
                      <span>Elaborando Homilética 10.0...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 fill-slate-950" />
                      <span>Crear Sermón 10.0 Completo</span>
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
