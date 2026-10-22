import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Brain, 
  HelpCircle, 
  ListOrdered, 
  LineChart, 
  Copy, 
  Check, 
  Loader2, 
  Save, 
  Send,
  HeartHandshake
} from 'lucide-react';
import { Patient, UserProfile } from '../../types';
import { callGeminiApi } from '../../services/geminiService';

interface AiStudioModuleProps {
  user: UserProfile;
  patients: Patient[];
}

export const AiStudioModule: React.FC<AiStudioModuleProps> = ({ user, patients }) => {
  const [activeTab, setActiveTab] = useState<'plan' | 'questions' | 'patterns'>('plan');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [promptInput, setPromptInput] = useState<string>('');
  const [generatedOutput, setGeneratedOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const currentPatient = patients.find(p => p.id === selectedPatientId);

  const handleGenerate = async () => {
    setIsLoading(true);
    let prompt = '';

    if (activeTab === 'plan') {
      prompt = `Actúa como un psicólogo clínico cristiano y consejero pastoral experimentado.
Diseña un Plan de Intervención Psico-Pastoral Integral para el siguiente consultante:
Nombre: ${currentPatient?.fullName}
Motivo: ${currentPatient?.primaryReason}
Detalles adicionales o solicitudes específicas: ${promptInput || 'Intervención integral basada en evidencia y gracia bíblica.'}

Incluye:
1. Definición del Problema Clínico-Pastoral.
2. Objetivos a Corto Plazo (Semanas 1-4).
3. Objetivos a Mediano y Largo Plazo (Meses 2-6).
4. Técnicas Clínicas Específicas (CBT, ACT, etc.).
5. Protocolo de Acompañamiento Espiritual y Disciplinas.`;
    } else if (activeTab === 'questions') {
      prompt = `Actúa como un terapeuta familiar y director de consejería pastoral.
Genera un banco de 8 a 10 preguntas terapéuticas y de discernimiento espiritual profundo para abordar la siguiente situación:
Situación / Caso: ${promptInput || currentPatient?.primaryReason}
Consultante: ${currentPatient?.fullName}

Las preguntas deben:
- Distinguir entre culpa neurótica/autoimpuesta y convicción del Espíritu Santo.
- Explorar cómo la persona percibe el carácter de Dios en medio del dolor.
- Facilitar la introspección sin caer en acusaciones moralistas.`;
    } else {
      prompt = `Actúa como un supervisor clínico de salud mental en contextos eclesiales.
Analiza patrones clínicos, emocionales y de carga ministerial para el caso de:
${currentPatient?.fullName} - ${currentPatient?.primaryReason}
Detalles del patrón o síntomas observados: ${promptInput || 'Agotamiento recurrente en períodos de alta demanda congregacional y dificultad para desconectarse.'}

Genera un informe analítico de patrones con recomendaciones preventivas para evitar recaídas y burnout ministerial.`;
    }

    const res = await callGeminiApi(prompt);
    setGeneratedOutput(res.text);
    setIsLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
          <Bot className="w-6 h-6 text-amber-400" />
          <span>Laboratorio de IA Clínica & Discernimiento Pastoral</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Herramientas avanzadas de inteligencia artificial para diseño de intervenciones, formulación de preguntas y análisis de patrones.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setActiveTab('plan'); setGeneratedOutput(''); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'plan'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          <span>Planes de Intervención</span>
        </button>

        <button
          onClick={() => { setActiveTab('questions'); setGeneratedOutput(''); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'questions'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Preguntas Terapéuticas</span>
        </button>

        <button
          onClick={() => { setActiveTab('patterns'); setGeneratedOutput(''); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'patterns'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <LineChart className="w-4 h-4" />
          <span>Análisis de Patrones Clínicos</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Consultante de Referencia</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {activeTab === 'plan' && 'Foco de la Intervención o Necesidades Específicas'}
              {activeTab === 'questions' && 'Área del Conflicto o Nudo Emocional a Desatar'}
              {activeTab === 'patterns' && 'Síntomas, Conductas o Períodos Observados'}
            </label>
            <textarea
              rows={4}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Escribe observaciones adicionales o déjalo en blanco para basarse en el motivo de consulta del expediente..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-200/90 leading-relaxed font-serif-bible">
            "Donde no hay dirección sabia, caerá el pueblo; mas en la multitud de consejeros hay seguridad." — Proverbios 11:14
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generando con IA...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>Generar Análisis con IA</span>
              </>
            )}
          </button>
        </div>

        {/* Output Viewer (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-bold text-slate-300 uppercase tracking-wider">
              Resultado Generado
            </span>
            {generatedOutput && (
              <button
                onClick={handleCopy}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar Texto'}</span>
              </button>
            )}
          </div>

          {generatedOutput ? (
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 leading-relaxed whitespace-pre-wrap font-sans text-xs max-h-[550px] overflow-y-auto">
              {generatedOutput}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">
              <Bot className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p>Selecciona una función y presiona "Generar Análisis con IA" para procesar el caso clínico-pastoral.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
