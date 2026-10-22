import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  BookMarked, 
  Sparkles, 
  ExternalLink, 
  Bookmark, 
  Copy, 
  Check, 
  X, 
  Clock, 
  ChevronRight,
  Shield,
  Layers
} from 'lucide-react';
import { LibraryDomain, LibraryResourceItem } from '../../types';
import { useToast } from '../../context/ToastContext';

export const ClinicalLibraryModule: React.FC = () => {
  const { showSuccess, showInfo } = useToast();
  const [selectedDomain, setSelectedDomain] = useState<LibraryDomain | 'todos'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeResource, setActiveResource] = useState<LibraryResourceItem | null>(null);
  const [copiedQuote, setCopiedQuote] = useState(false);

  // 7 dominios especializados requeridos por el usuario
  const domains: { id: LibraryDomain | 'todos'; label: string; icon: string }[] = [
    { id: 'todos', label: 'Todos los Dominios', icon: '📚' },
    { id: 'psicologia', label: 'Psicología Clínica', icon: '🧠' },
    { id: 'teologia', label: 'Teología Bíblica', icon: '✝️' },
    { id: 'consejeria', label: 'Consejería Pastoral', icon: '🤝' },
    { id: 'discipulado', label: 'Discipulado', icon: '🌱' },
    { id: 'homiletica', label: 'Homilética & Predicación', icon: '🎙️' },
    { id: 'liderazgo', label: 'Liderazgo & Salud Mental', icon: '🛡️' },
    { id: 'devocional', label: 'Material Devocional', icon: '🕊️' },
  ];

  // Base curada de recursos clínico-pastorales de excelencia
  const libraryResources: LibraryResourceItem[] = [
    {
      id: 'lib-1',
      title: 'Integración de Terapia Cognitivo-Conductual y Gracia Bíblica',
      domain: 'consejeria',
      author: 'Dr. Larry Crabb & Dr. David Powlison',
      publicationYear: '2024',
      summary: 'Marco epistemológico y práctico para abordar distorsiones cognitivas como el catastrofismo y la sobregeneralización sin comprometer la suficiencia de la gracia de Cristo.',
      keyThemes: ['Reestructuración Cognitiva', 'Justificación por Fe', 'Culpa Neurótica vs Convicción del Espíritu', 'Límites'],
      clinicalPastoralApplication: 'Útil para consultantes con ansiedad de escrupulosidad religiosa y miedo obsesivo al rechazo divino.',
      suggestedScriptures: ['Romanos 8:1-2', '2 Timoteo 1:7', 'Filipenses 4:6-9'],
      contentExcerpt: 'La gracia divina no es una excusa para la pasividad ni una condena por la debilidad humana. En la consejería cristiana, enseñamos al consultante a someter cada pensamiento cautivo a la obediencia de Cristo no como un ejercicio de castigo mental, sino como una liberación amorosa de las mentiras del desamparo.',
      readingTimeMinutes: 12,
      tags: ['TCC', 'Gracia', 'Escrupulosidad', 'Ansiedad']
    },
    {
      id: 'lib-2',
      title: 'Trastornos del Estado de Ánimo: Criterios DSM-5-TR para Pastores y Líderes',
      domain: 'psicologia',
      author: 'Asociación Americana de Psiquiatría (APA)',
      publicationYear: '2023',
      summary: 'Guía de tamizaje diferencial para distinguir entre tristeza circunstancial reactiva, duelo normativo y un Episodio Depresivo Mayor que amerita tratamiento interdisciplinario.',
      keyThemes: ['DSM-5-TR', 'Depresión Mayor', 'Anhedonia', 'Ideación Suicida', 'Neurobiología'],
      clinicalPastoralApplication: 'Permite al pastor identificar banderas rojas clínicas para referir a tiempo con psicología y psiquiatría.',
      suggestedScriptures: ['Salmos 88:1-18', '1 Reyes 19:4-8', '2 Corintios 1:8-10'],
      contentExcerpt: 'El duelo y la angustia existencial no son automáticamente pecado. El profeta Elías experimentó agotamiento físico y neurovegetativo severo; la respuesta de Dios no fue una reprensión doctrinal, sino alimento, descanso y el silbo apacible de su presencia.',
      readingTimeMinutes: 15,
      tags: ['DSM-5', 'Depresión', 'Criterios', 'Urgencias']
    },
    {
      id: 'lib-3',
      title: 'Exégesis del Dolor: Teodicea y Consuelo en el Libro de Job y los Salmos de Lamento',
      domain: 'teologia',
      author: 'Timothy Keller & N.T. Wright',
      publicationYear: '2022',
      summary: 'Estudio bíblico y hermenéutico sobre cómo el dolor inocente no descalifica la soberanía bondadosa de Dios. Pautas para evitar la teología tóxica de la retribución.',
      keyThemes: ['Lamento Bíblico', 'Teodicea', 'Job', 'Duelo Complicado', 'Esperanza Escatológica'],
      clinicalPastoralApplication: 'Fundamental para acompañar pérdidas traumáticas sin caer en clichés destructivos como "todo pasa por algo".',
      suggestedScriptures: ['Job 42:1-6', 'Salmos 13:1-6', 'Romanos 8:26-28'],
      contentExcerpt: 'Más del 40% de los Salmos son lamentos. La Biblia nos otorga un lenguaje legítimo para llorar ante Dios. La consejería pastoral debe brindar un espacio seguro donde el consultante pueda expresar su dolor sin temor a ser juzgado como carente de fe.',
      readingTimeMinutes: 10,
      tags: ['Lamento', 'Job', 'Salmos', 'Teología del Dolor']
    },
    {
      id: 'lib-4',
      title: 'Prevención del Burnout Ministerial y Fatiga por Compasión',
      domain: 'liderazgo',
      author: 'Dr. Archibald Hart & Pete Scazzero',
      publicationYear: '2024',
      summary: 'Estrategias clínicas y espirituales para líderes eclesiales sobrecargados. Análisis de la neurobiología de la adrenalina y la necesidad del reposo sabático.',
      keyThemes: ['Burnout', 'Emocionalmente Sano', 'Sabbath', 'Límites Ministeriales', 'Agotamiento Adrenal'],
      clinicalPastoralApplication: 'Herramienta de autodiagnóstico y prevención para pastores en riesgo de colapso.',
      suggestedScriptures: ['Éxodo 20:8-11', 'Marcos 6:31', 'Mateo 11:28-30'],
      contentExcerpt: 'No puedes tener un ministerio espiritualmente fructífero con un cuerpo y una mente crónicamente quebrantados. El reposo sabático es un mandamiento moral y un acto de confianza en que Dios sigue reinando mientras nosotros dormimos.',
      readingTimeMinutes: 14,
      tags: ['Burnout', 'Liderazgo', 'Límites', 'Salud Emocional']
    },
    {
      id: 'lib-5',
      title: 'Manual de Homilética Expositiva y Relevancia Psico-Espiritual',
      domain: 'homiletica',
      author: 'Haddon Robinson & Bryan Chapell',
      publicationYear: '2023',
      summary: 'Metodología para construir sermones cristocéntricos que conecten la profundidad exegética del texto original con las luchas emocionales reales de la congregación.',
      keyThemes: ['Bosquejo Homilético', 'Exégesis Griega y Hebrea', 'Aplicación Contemporánea', 'Ilustraciones'],
      clinicalPastoralApplication: 'Ayuda a estructurar predicaciones que sanen heridas del alma en lugar de generar culpa paralizante.',
      suggestedScriptures: ['Nehemías 8:8', 'Efesios 4:11-16', 'Hebreos 4:12'],
      contentExcerpt: 'La predicación bíblica no es una lección abstracta de gramática histórica; es el encuentro entre el corazón eterno de Dios y el dolor actual de su pueblo.',
      readingTimeMinutes: 18,
      tags: ['Homilética', 'Exégesis', 'Predicación', 'Cristocéntrico']
    },
    {
      id: 'lib-6',
      title: 'Discipulado Transformador y Formación del Carácter en Tiempos de Crisis',
      domain: 'discipulado',
      author: 'Dallas Willard & Richard Foster',
      publicationYear: '2021',
      summary: 'El papel de las disciplinas espirituales clásicas (silencio, soledad, ayuno y meditación) en la reconfiguración neural y emocional del creyente.',
      keyThemes: ['Disciplinas Espirituales', 'Neuroplasticidad', 'Silencio y Soledad', 'Hábito y Virtud'],
      clinicalPastoralApplication: 'Prescripción de rutinas espirituales adaptadas a consultantes en recuperación de adicciones o crisis existencial.',
      suggestedScriptures: ['Gálatas 4:19', 'Colosenses 3:12-17', 'Lucas 5:16'],
      contentExcerpt: 'El discipulado cristiano no consiste simplemente en acumular información bíblica, sino en permitir que los ritmos del Espíritu Santo transformen los automatismos de nuestro cerebro y corazón.',
      readingTimeMinutes: 11,
      tags: ['Discipulado', 'Disciplinas', 'Carácter', 'Formación']
    },
    {
      id: 'lib-7',
      title: 'Guía Devocional para Pacientes con Ansiedad y Ataques de Pánico',
      domain: 'devocional',
      author: 'PastoralMente Clinical Team',
      publicationYear: '2026',
      summary: 'Secuencia de 7 días de reflexiones y ejercicios somáticos de respiración basados en pasajes de paz y protección divina.',
      keyThemes: ['Pánico', 'Paz de Dios', 'Salmos de Confianza', 'Grounding Somático'],
      clinicalPastoralApplication: 'Material para imprimir o compartir directamente por el Portal del Paciente.',
      suggestedScriptures: ['Salmos 23:1-6', 'Salmos 91:1-4', 'Isaías 26:3'],
      contentExcerpt: 'Cuando el cuerpo tiembla, recuerda: tu fe no se mide por la calma de tus nervios, sino por la fidelidad de la Roca que te sostiene en medio de la tormenta.',
      readingTimeMinutes: 8,
      tags: ['Devocional', 'Ansiedad', 'Pánico', 'Salmos']
    }
  ];

  const filteredResources = libraryResources.filter((res) => {
    const matchesDomain = selectedDomain === 'todos' || res.domain === selectedDomain;
    const matchesSearch =
      res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesDomain && matchesSearch;
  });

  const handleCopyQuote = (quote: string) => {
    navigator.clipboard.writeText(quote);
    setCopiedQuote(true);
    showSuccess('Cita Copiada', 'Texto copiado al portapapeles para insertar en la nota o sermón.');
    setTimeout(() => setCopiedQuote(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-900/40 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">Biblioteca Clínica y Pastoral</h2>
              <span className="px-2.5 py-0.5 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
                7 Dominios Especializados
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Tratados científicos, marcos teológicos, guías DSM-5 y recursos devocionales para enriquecer tu práctica.
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por tema, autor, DSM-5, pasaje..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Domain Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {domains.map((dom) => (
          <button
            key={dom.id}
            onClick={() => setSelectedDomain(dom.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition ${
              selectedDomain === dom.id
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>{dom.icon}</span>
            <span>{dom.label}</span>
          </button>
        ))}
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredResources.map((res) => (
          <div
            key={res.id}
            className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-lg transition cursor-pointer"
            onClick={() => setActiveResource(res)}
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  {res.domain}
                </span>
                <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{res.readingTimeMinutes} min de lectura</span>
                </span>
              </div>

              <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">
                {res.title}
              </h3>

              <p className="text-xs text-slate-400 font-mono">
                {res.author} ({res.publicationYear})
              </p>

              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                {res.summary}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 pt-1">
                {res.tags.map((t, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-0.5 bg-slate-950 text-slate-400 rounded-md border border-slate-800">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-emerald-400 font-semibold">
              <span>Leer Tratado Clínico</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Reader Modal */}
      {activeResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  {activeResource.domain}
                </span>
                <h3 className="text-base font-bold text-white mt-1">{activeResource.title}</h3>
                <p className="text-xs text-slate-400">{activeResource.author} &bull; {activeResource.publicationYear}</p>
              </div>
              <button
                onClick={() => setActiveResource(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 flex-1 overflow-y-auto space-y-5 text-xs">
              {/* Summary */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
                  Sinopsis del Marco Teórico:
                </span>
                <p className="text-slate-300 leading-relaxed text-xs">{activeResource.summary}</p>
              </div>

              {/* Main Excerpt */}
              <div className="space-y-2">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
                  Extracto Doctrinal & Metodológico:
                </span>
                <blockquote className="p-5 bg-gradient-to-br from-emerald-950/20 to-slate-950 rounded-2xl border-l-4 border-emerald-500 text-slate-200 text-sm italic font-serif leading-relaxed">
                  "{activeResource.contentExcerpt}"
                </blockquote>
              </div>

              {/* Clinical & Pastoral Application */}
              <div className="p-4 bg-slate-950 rounded-xl border border-emerald-500/30 space-y-2">
                <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px] flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Aplicación en el Box de Consejería:</span>
                </span>
                <p className="text-slate-300 leading-relaxed">{activeResource.clinicalPastoralApplication}</p>
              </div>

              {/* Suggested Scriptures */}
              <div className="space-y-2">
                <span className="font-bold text-purple-300 uppercase tracking-wider text-[10px] block">
                  Fundamento Bíblico Recomendado:
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeResource.suggestedScriptures.map((sc, idx) => (
                    <span key={idx} className="px-3 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-lg font-serif">
                      {sc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <button
                onClick={() => handleCopyQuote(activeResource.contentExcerpt)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
              >
                {copiedQuote ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedQuote ? '¡Cita Copiada!' : 'Copiar Cita para Nota / Sermón'}</span>
              </button>

              <button
                onClick={() => setActiveResource(null)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition"
              >
                Cerrar Tratado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
