import React, { useState, useEffect } from 'react';
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
  ChevronLeft,
  BookMarked,
  Clock,
  User,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  Radio
} from 'lucide-react';
import { Sermon, SermonType, UserProfile, HomileticSlide } from '../../types';
import { SermonGeneratorService } from '../../services/sermonGeneratorService';
import { GeminiService, GeminiApiStatus } from '../../services/geminiService';
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
  const { showSuccess, showInfo } = useToast();
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(sermons[0] || null);
  const [aiStatus, setAiStatus] = useState<GeminiApiStatus | null>(null);

  useEffect(() => {
    GeminiService.checkApiStatus()
      .then(setAiStatus)
      .catch((e) => console.warn('No se pudo verificar estado de IA:', e));
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'bosquejo' | 'exegesis' | 'celulas' | 'devocional' | 'diapositivas'>('bosquejo');

  // Slide Deck Presenter state
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreenSlides, setIsFullscreenSlides] = useState(false);

  // Generator inputs - Formulario Homilético Completo
  const [mainPassage, setMainPassage] = useState('Efesios 2:1-10');
  const [theme, setTheme] = useState('La Gracia de Dios que Transforma el Corazón');
  const [sermonType, setSermonType] = useState<SermonType>('expositivo');
  const [seriesName, setSeriesName] = useState('Fundamentos de la Fe');
  const [targetAudience, setTargetAudience] = useState('Congregación General y Nuevos Creyentes');
  const [objective, setObjective] = useState('Que la congregación descanse en la suficiencia de la gracia de Dios y viva con gratitud activa.');
  const [theologicalFocus, setTheologicalFocus] = useState('Justificación por fe y soberanía bondadosa de Cristo');
  const [bibleTranslation, setBibleTranslation] = useState('RVR1960');
  const [estimatedDurationMinutes, setEstimatedDurationMinutes] = useState(35);
  const [isLoading, setIsLoading] = useState(false);

  const filteredSermons = sermons.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.mainPassage.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.tags && s.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))) ||
    (s.sermonType && s.sermonType.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Generador de diapositivas dinámicas basadas en los puntos reales del sermón seleccionado
  const generateSlides = (sermon: Sermon): HomileticSlide[] => {
    return [
      {
        slideNumber: 1,
        title: sermon.title,
        subtitle: `Tipo: ${(sermon.sermonType || 'Expositivo').toUpperCase()} • ${sermon.series || 'Mensaje Bíblico'}`,
        scriptureReference: sermon.mainPassage,
        contentBulletPoints: [
          `Pasaje: ${sermon.mainPassage}`,
          `Propósito: ${sermon.objective}`,
          `Versión: ${sermon.bibleTranslation || 'RVR1960'}`
        ],
        speakerNotes: 'Introducción del tema y captura de la atención de la congregación.'
      },
      {
        slideNumber: 2,
        title: 'Idea Homilética Central',
        subtitle: 'Proposición Teológica',
        scriptureReference: sermon.mainPassage,
        contentBulletPoints: [
          `"${sermon.homileticalIdea}"`
        ],
        speakerNotes: 'Declarar la proposición central con convicción y claridad.'
      },
      ...sermon.points.map((pt, idx) => ({
        slideNumber: idx + 3,
        title: pt.title,
        subtitle: `Punto ${idx + 1}`,
        scriptureReference: sermon.mainPassage,
        contentBulletPoints: [
          `Exégesis: ${pt.scriptureExplanation.substring(0, 160)}${pt.scriptureExplanation.length > 160 ? '...' : ''}`,
          `Ilustración: ${pt.contemporaryIllustration.substring(0, 140)}${pt.contemporaryIllustration.length > 140 ? '...' : ''}`,
          `Aplicación: ${pt.practicalApplication.substring(0, 140)}${pt.practicalApplication.length > 140 ? '...' : ''}`
        ],
        speakerNotes: `Énfasis pastoral en la aplicación concreta para la vida diaria.`
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
        speakerNotes: 'Llamado al altar y oración de entrega comunitaria.'
      }
    ];
  };

  const slides = selectedSermon ? generateSlides(selectedSermon) : [];

  const handleGenerateAiSermon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme.trim() || !mainPassage.trim()) {
      return;
    }
    setIsLoading(true);

    try {
      const generated = await SermonGeneratorService.generateSermon({
        theme: theme.trim(),
        mainPassage: mainPassage.trim(),
        sermonType,
        seriesName: seriesName.trim(),
        targetAudience: targetAudience.trim(),
        objective: objective.trim(),
        theologicalFocus: theologicalFocus.trim(),
        bibleTranslation,
        estimatedDurationMinutes: Number(estimatedDurationMinutes) || 35,
      });

      onAddSermon(generated);
      setSelectedSermon(generated);
      setIsGeneratorOpen(false);
      setCurrentSlideIndex(0);

      const sourceLabel = generated.generationSource === 'gemini-live' 
        ? 'IA Gemini en Vivo' 
        : 'Motor Hermenéutico Contextual';

      showSuccess(
        'Sermón Generado Exitosamente',
        `"${generated.title}" creado con puntos y exégesis específicos (${sourceLabel}).`
      );
    } catch (err: any) {
      console.error('Error generando sermón:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySermon = () => {
    if (!selectedSermon) return;
    const text = `TÍTULO: ${selectedSermon.title}
PASAJE: ${selectedSermon.mainPassage} (${selectedSermon.bibleTranslation || 'RVR1960'})
GÉNERO / TIPO: ${(selectedSermon.sermonType || 'expositivo').toUpperCase()}
SERIE: ${selectedSermon.series || 'General'}
DURACIÓN: ${selectedSermon.estimatedDurationMinutes || 35} minutos

IDEA HOMILÉTICA CENTRAL:
"${selectedSermon.homileticalIdea}"

OBJETIVO ESPIRITUAL:
${selectedSermon.objective}

CONTEXTO HISTÓRICO Y LITERARIO:
${selectedSermon.historicalContext || 'Contextualizado según el texto bíblico.'}

INTRODUCCIÓN:
${selectedSermon.introduction}

DESARROLLO HOMILÉTICO:
${selectedSermon.points.map((p) => `${p.title}\n- Exégesis Bíblica: ${p.scriptureExplanation}\n- Ilustración Contemporánea: ${p.contemporaryIllustration}\n- Aplicación Práctica del Lunes: ${p.practicalApplication}`).join('\n\n')}

CONCLUSIÓN CRISTOCÉNTRICA:
${selectedSermon.conclusion}

LLAMADO AL ALTAR:
${selectedSermon.callToAction}

PASAJES DE APOYO:
${(selectedSermon.supportingPassages || []).join(', ')}`;

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
              Productor Homilético 10.0 &bull; Exégesis Real y Contextual
            </span>
            <span className="text-xs text-slate-400">Sin plantillas fijas &bull; Adaptado al Pasaje</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2 mt-1">
            <BookOpen className="w-6 h-6 text-amber-400" />
            <span>Productor de Sermones & Biblioteca Homilética</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Generador bíblico con exégesis en griego/hebreo, ilustraciones originales, preguntas para grupos pequeños y diapositivas de proyección.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {aiStatus && (
            <div
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center gap-2 ${
                aiStatus.configured
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/25'
              }`}
              title={aiStatus.message}
            >
              <span className={`w-2 h-2 rounded-full ${aiStatus.configured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span>{aiStatus.configured ? `IA Gemini Conectada (${aiStatus.activeModel})` : 'Motor Contextual Local'}</span>
            </div>
          )}

          <button
            onClick={() => setIsGeneratorOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>Generar Nuevo Sermón con IA</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Library on Left, Selected Sermon on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Search & Sermon Catalog (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por pasaje, tema, tipo o etiqueta..."
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

          <div className="space-y-2 max-h-[660px] overflow-y-auto pr-1">
            {filteredSermons.map((sermon) => {
              const isSelected = selectedSermon?.id === sermon.id;
              return (
                <div
                  key={sermon.id}
                  onClick={() => {
                    setSelectedSermon(sermon);
                    setCurrentSlideIndex(0);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border-amber-500/50 shadow-md'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-semibold text-amber-400 uppercase tracking-wider">
                      {sermon.sermonType || sermon.series || 'Expositivo'}
                    </span>
                    <span className="font-mono text-slate-500">{sermon.dateCreated}</span>
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
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
              {/* Top Sermon Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Género: {(selectedSermon.sermonType || 'Expositivo').toUpperCase()}
                    </span>
                    {selectedSermon.generationSource && (
                      <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                        selectedSermon.generationSource === 'gemini-live'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      }`}>
                        {selectedSermon.generationSource === 'gemini-live' 
                          ? `✓ Generado con IA en Vivo (${selectedSermon.generationModel || 'Gemini 3.8 Flash'})` 
                          : '⚠️ Motor Contextual Local'}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-extrabold text-white mt-1">
                    {selectedSermon.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="font-mono text-cyan-300 font-semibold">{selectedSermon.mainPassage}</span>
                    <span>&bull;</span>
                    <span>Versión: {selectedSermon.bibleTranslation || 'RVR1960'}</span>
                    <span>&bull;</span>
                    <span>Audiencia: {selectedSermon.targetAudience}</span>
                    {selectedSermon.estimatedDurationMinutes && (
                      <>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>{selectedSermon.estimatedDurationMinutes} min</span>
                        </span>
                      </>
                    )}
                  </div>

                  {selectedSermon.generationSource === 'local-engine' && selectedSermon.generationError && (
                    <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-xs text-amber-200 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-300">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Generado con Motor Contextual Local</span>
                      </div>
                      <p className="text-[11px] text-amber-200/90 pl-5">
                        <strong>Causa:</strong> {selectedSermon.generationError}
                      </p>
                      {selectedSermon.generationErrorHint && (
                        <p className="text-[10px] text-amber-300/80 pl-5">
                          💡 <strong>Sugerencia:</strong> {selectedSermon.generationErrorHint}
                        </p>
                      )}
                    </div>
                  )}
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

              {/* TAB 1: BOSQUEJO HOMILÉTICO (DINÁMICO SEGÚN EL SERMÓN) */}
              {activeTab === 'bosquejo' && (
                <div className="space-y-5 animate-fadeIn">
                  {/* Homiletical Proposition */}
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block mb-1">
                      Idea Homilética Central (Proposición Teológica)
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-amber-100 font-serif leading-relaxed">
                      "{selectedSermon.homileticalIdea}"
                    </p>
                  </div>

                  {/* Objective & Spiritual Purpose */}
                  {selectedSermon.objective && (
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Objetivo Formativo y Pastoral:
                      </span>
                      <p className="text-slate-300">{selectedSermon.objective}</p>
                    </div>
                  )}

                  {/* Introduction */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Introducción & Conexión Cultural
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                      {selectedSermon.introduction}
                    </p>
                  </div>

                  {/* Main Points - 100% Dynamic from selectedSermon.points */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Desarrollo Homilético ({selectedSermon.points.length} Puntos Específicos)
                    </h3>

                    {selectedSermon.points.map((pt, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                        <p className="font-extrabold text-sm text-white flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <span>{pt.title}</span>
                        </p>

                        <div className="space-y-2 pl-7">
                          <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80">
                            <span className="text-[10px] uppercase font-bold text-cyan-400 block mb-0.5">
                              Exégesis Bíblica del Pasaje:
                            </span>
                            <p className="text-slate-300 leading-relaxed">{pt.scriptureExplanation}</p>
                          </div>

                          <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80">
                            <span className="text-[10px] uppercase font-bold text-amber-400 block mb-0.5">
                              Ilustración Contemporánea:
                            </span>
                            <p className="text-slate-300 italic leading-relaxed">"{pt.contemporaryIllustration}"</p>
                          </div>

                          <div className="p-2.5 bg-emerald-950/20 rounded-lg border border-emerald-500/20">
                            <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-0.5">
                              Aplicación del Lunes por la Mañana:
                            </span>
                            <p className="text-emerald-200/90 font-medium leading-relaxed">{pt.practicalApplication}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Supporting Passages */}
                  {selectedSermon.supportingPassages && selectedSermon.supportingPassages.length > 0 && (
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Referencias Bíblicas Complementarias:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedSermon.supportingPassages.map((p, i) => (
                          <span key={i} className="px-2.5 py-1 bg-slate-900 text-cyan-300 border border-slate-800 rounded-md font-mono text-[11px]">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Conclusion & Altarcall */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                      <h4 className="font-bold text-slate-200 mb-1">Conclusión Cristocéntrica</h4>
                      <p className="text-slate-400 leading-relaxed">{selectedSermon.conclusion}</p>
                    </div>
                    <div className="p-3.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                      <h4 className="font-bold text-amber-400 mb-1">Llamado al Altar & Ministración</h4>
                      <p className="text-amber-200/90 leading-relaxed font-serif">{selectedSermon.callToAction}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: EXÉGESIS & CONTEXTO HISTÓRICO (DINÁMICO DEL PASAJE) */}
              {activeTab === 'exegesis' && (
                <div className="space-y-4 text-xs animate-fadeIn">
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <h4 className="font-bold text-amber-400 text-sm">
                      Contexto Histórico y Literario de {selectedSermon.mainPassage}
                    </h4>
                    <p className="text-slate-300 leading-relaxed">
                      {selectedSermon.historicalContext || `Análisis contextualizado del pasaje ${selectedSermon.mainPassage} para ${selectedSermon.title}.`}
                    </p>
                  </div>

                  {/* Original Languages Exegesis */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-cyan-300 text-xs uppercase tracking-wider">
                      Vocabulario y Raíces Exegéticas en Idiomas Originales:
                    </h4>

                    {selectedSermon.exegesisOriginalLanguages && selectedSermon.exegesisOriginalLanguages.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedSermon.exegesisOriginalLanguages.map((w, idx) => (
                          <div key={idx} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-base font-bold text-white font-serif">{w.word}</span>
                              <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                                {w.language} ({w.transliteration || ''})
                              </span>
                            </div>
                            <p className="text-slate-300 text-[11px]"><strong className="text-slate-400">Definición:</strong> {w.definition}</p>
                            <p className="text-cyan-300 text-[11px]"><strong className="text-cyan-400">Impacto en el Púlpito:</strong> {w.homileticImpact}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-400 text-xs">
                        Este sermón aborda el texto de {selectedSermon.mainPassage} mediante análisis de términos clave y teología bíblica aplicada a {selectedSermon.title}.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: GRUPOS PEQUEÑOS / CÉLULAS (DINÁMICO DEL SERMÓN) */}
              {activeTab === 'celulas' && (
                <div className="space-y-4 text-xs animate-fadeIn">
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                    <h4 className="font-bold text-amber-400 text-sm">
                      Guía de Diálogo para Grupos Pequeños: {selectedSermon.title}
                    </h4>
                    <p className="text-slate-400">
                      Preguntas diseñadas para conectar la enseñanza de {selectedSermon.mainPassage} con la vida diaria en comunidad.
                    </p>

                    <ol className="space-y-3 list-decimal list-inside text-slate-200">
                      {(selectedSermon.smallGroupQuestions && selectedSermon.smallGroupQuestions.length > 0
                        ? selectedSermon.smallGroupQuestions
                        : [
                            `¿De qué manera el pasaje de ${selectedSermon.mainPassage} desafía tus pensamientos cotidianos sobre ${selectedSermon.title}?`,
                            `En tu experiencia personal, ¿cuál ha sido el obstáculo más grande para aplicar este principio en tu familia o trabajo?`,
                            `¿Qué acción concreta te comprometes a realizar esta semana como respuesta a lo que Dios te habló a través de este mensaje?`
                          ]
                      ).map((q, idx) => (
                        <li key={idx} className="p-3 bg-slate-900 rounded-lg leading-relaxed">
                          {q}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}

              {/* TAB 4: PLAN DEVOCIONAL 3 DÍAS (DINÁMICO DEL SERMÓN) */}
              {activeTab === 'devocional' && (
                <div className="space-y-3 text-xs animate-fadeIn">
                  {(selectedSermon.devotionalPlan && selectedSermon.devotionalPlan.length > 0
                    ? selectedSermon.devotionalPlan
                    : [
                        { day: 1, title: `Profundizando en ${selectedSermon.mainPassage}`, passage: selectedSermon.mainPassage, meditation: `Medita en la proposición: "${selectedSermon.homileticalIdea}".`, prayerPrompt: `Señor, abre mi entendimiento para caminar en la verdad de este pasaje.` },
                        { day: 2, title: 'Renovación y Entrega', passage: selectedSermon.supportingPassages[0] || selectedSermon.mainPassage, meditation: 'Examina qué actitudes de tu corazón necesitan alinearse con la voluntad divina.', prayerPrompt: 'Padre, transforma mis motivaciones y lléname de tu paz.' },
                        { day: 3, title: 'Fruto en Acción', passage: selectedSermon.supportingPassages[1] || selectedSermon.mainPassage, meditation: 'Permite que la palabra escuchada se traduzca en amor y servicio al prójimo.', prayerPrompt: 'Usa mi testimonio hoy para edificar a quienes me rodean.' },
                      ]
                  ).map((dev, idx) => (
                    <div key={idx} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-amber-400 font-bold">
                        <span>Día {dev.day}: {dev.title}</span>
                        <span className="font-mono text-cyan-300 text-[11px]">{dev.passage}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{dev.meditation}</p>
                      <div className="pt-1 text-[11px] text-purple-300 flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-purple-400" />
                        <span><strong>Oración:</strong> {dev.prayerPrompt}</span>
                      </div>
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

      {/* Modal: AI Sermon Generator (Formulario Homilético Completo) */}
      {isGeneratorOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Generador Homilético 10.0 con IA</h2>
                  <p className="text-[11px] text-slate-400">Contenido exegético 100% individualizado para cada pasaje y tema</p>
                </div>
              </div>
              <button onClick={() => setIsGeneratorOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Test Scenarios Buttons */}
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Casos de Prueba Rápida (Auditoría Homilética):
              </span>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setTheme('La gracia soberana y salvación');
                    setMainPassage('Efesios 2:1-10');
                    setSermonType('expositivo');
                    setTargetAudience('Congregación General');
                    setObjective('Comprender la suficiencia de la gracia inmerecida y desarmar el legalismo.');
                    setTheologicalFocus('Soberanía de la gracia y regeneración por el Espíritu');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium transition"
                >
                  ⚡ Prueba A: Gracia (Ef. 2:1-10)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTheme('La perseverancia en la prueba');
                    setMainPassage('Santiago 1:2-8');
                    setSermonType('expositivo');
                    setTargetAudience('Creyentes en sufrimiento');
                    setObjective('Hallar gozo y sabiduría divina en medio de las tribulaciones.');
                    setTheologicalFocus('Madurez de carácter forjada por la fe perseverante');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium transition"
                >
                  ⚡ Prueba B: Pruebas (Stgo. 1:2-8)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTheme('Cuidado y confianza en Dios');
                    setMainPassage('Salmo 23');
                    setSermonType('pastoral');
                    setTargetAudience('Personas en ansiedad o fatiga');
                    setObjective('Descansar en el pastoreo divino y la provisión abundante en medio del valle.');
                    setTheologicalFocus('Provisión del pacto, consuelo y fidelidad eterna');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium transition"
                >
                  ⚡ Prueba C: Pastor (Salmo 23)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTheme('La verdadera espiritualidad ante Dios');
                    setMainPassage('Miqueas 6:6-8');
                    setSermonType('tematico');
                    setTargetAudience('Comunidad de creyentes');
                    setObjective('Practicar la justicia, amar la misericordia y humillarse ante el Señor.');
                    setTheologicalFocus('Justicia profética y adoración sincera');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium transition"
                >
                  ⚡ Prueba D: Profetas (Miqueas 6:6-8)
                </button>
              </div>
            </div>

            <form onSubmit={handleGenerateAiSermon} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tema / Asunto Central *</label>
                  <input
                    type="text"
                    required
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="Ej. La gracia soberana de Dios ante la culpa"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Pasaje Bíblico Principal *</label>
                  <input
                    type="text"
                    required
                    value={mainPassage}
                    onChange={(e) => setMainPassage(e.target.value)}
                    placeholder="Ej. Efesios 2:1-10, Santiago 1:2-8, Colosenses 3:12-15"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tipo de Sermón</label>
                  <select
                    value={sermonType}
                    onChange={(e) => setSermonType(e.target.value as SermonType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="expositivo">Expositivo (Verso a verso)</option>
                    <option value="textual">Textual (Estructura del texto)</option>
                    <option value="tematico">Temático (Síntesis bíblica)</option>
                    <option value="pastoral">Pastoral (Cuidado y sanidad)</option>
                    <option value="evangelistico">Evangelístico (Salvación en Cristo)</option>
                    <option value="doctrinal">Doctrinal (Fundamento teológico)</option>
                    <option value="devocional">Devocional (Inspiracional)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Audiencia Objetivo</label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="Ej. Jóvenes, familias, congregación"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Versión Bíblica</label>
                  <select
                    value={bibleTranslation}
                    onChange={(e) => setBibleTranslation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="RVR1960">Reina Valera 1960</option>
                    <option value="NVI">Nueva Versión Internacional</option>
                    <option value="NTV">Nueva Traducción Viviente</option>
                    <option value="LBLA">La Biblia de las Américas</option>
                    <option value="DHH">Dios Habla Hoy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Propósito / Objetivo Formativo y Espiritual</label>
                <input
                  type="text"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Ej. Llevar a la congregación a descansar en la gracia y perdonar a quienes los ofendieron"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Enfoque Teológico / Pastoral</label>
                  <input
                    type="text"
                    value={theologicalFocus}
                    onChange={(e) => setTheologicalFocus(e.target.value)}
                    placeholder="Ej. Cristocéntrico, consolador, desafiante"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Duración Estimada (Minutos)</label>
                  <select
                    value={estimatedDurationMinutes}
                    onChange={(e) => setEstimatedDurationMinutes(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value={25}>25 Minutos (Breve / Devocional)</option>
                    <option value={35}>35 Minutos (Estándar Dominical)</option>
                    <option value={45}>45 Minutos (Profundo / Exegético)</option>
                    <option value={60}>60 Minutos (Seminario / Escuela)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-2.5 text-[11px] text-amber-200">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Garantía Anti-Plantillas:</strong> El motor construirá puntos, exégesis, raíces griegas/hebreas e ilustraciones diseñadas exclusivamente para <strong>{mainPassage || 'el pasaje indicado'}</strong>.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsGeneratorOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Elaborando Sermón Exegético...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 fill-slate-950" />
                      <span>Generar Sermón con IA</span>
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
