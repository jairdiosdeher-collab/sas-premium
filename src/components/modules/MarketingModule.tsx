import React, { useState } from 'react';
import { 
  TrendingUp, 
  Target, 
  Mail, 
  CheckSquare, 
  Video, 
  Share2, 
  Copy, 
  Check, 
  Flame, 
  Users, 
  Layers, 
  DollarSign, 
  BarChart3,
  Sparkles,
  Play
} from 'lucide-react';
import { MarketingStrategy } from '../../types';

interface MarketingModuleProps {
  strategy: MarketingStrategy;
}

export const MarketingModule: React.FC<MarketingModuleProps> = ({ strategy }) => {
  const [activeTab, setActiveTab] = useState<'acquisition' | 'funnel' | 'emails' | 'onboarding' | 'tiktok' | 'youtube' | 'facebook'>('acquisition');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Onboarding checklist state
  const [completedOnboardingSteps, setCompletedOnboardingSteps] = useState<number[]>([0, 1]);

  const toggleOnboardingStep = (idx: number) => {
    setCompletedOnboardingSteps(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 3000);
  };

  const onboardingSteps = [
    { day: "Día 1", title: "Registrar tu primer expediente de paciente / miembro", desc: "Digitaliza un caso real o de prueba en el CRM para comprobar el cifrado y estructura." },
    { day: "Día 2", title: "Crear tu primera nota de evolución SOAP-S con IA", desc: "Usa el asistente de síntesis para convertir notas informales en un registro clínico formal." },
    { day: "Día 3", title: "Aplicar la Escala Maslach de Burnout o PHQ-9", desc: "Evalúa el estado emocional del liderazgo y familiarízate con las alertas de riesgo ético." },
    { day: "Día 4", title: "Generar un bosquejo homilético para el domingo", desc: "Prueba el generador con un pasaje bíblico y personaliza los 3 puntos con sus ilustraciones." },
    { day: "Día 5", title: "Configurar un recordatorio automático por WhatsApp", desc: "Programa una cita y envía una notificación cordial con un solo clic." },
    { day: "Día 6", title: "Descargar un informe profesional con membrete en PDF", desc: "Imprime una ficha clínica lista para archivo legal o interconsulta médica." },
    { day: "Día 7", title: "Activar el cupón REINO30 y asegurar la suscripción", desc: "Bloquea tu tarifa fundadora del 30% de descuento recurrente de por vida." },
  ];

  const onboardingProgress = Math.round((completedOnboardingSteps.length / onboardingSteps.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Estrategia de Crecimiento & Go-To-Market
          </span>
          <span className="text-xs text-slate-400">Objetivo: Ingresos reales desde el mes 1</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-amber-400" />
          <span>Manual Estratégico de Marketing, Embudos y Adquisición</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Estrategia completa para escalar PastoralMente AI B2B en iglesias, seminarios y profesionales cristianos.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          { key: 'acquisition', label: '1. Adquisición B2B', icon: Target },
          { key: 'funnel', label: '2. Embudo de Ventas', icon: Layers },
          { key: 'emails', label: '3. Correos Automáticos', icon: Mail },
          { key: 'onboarding', label: '4. Secuencia Onboarding', icon: CheckSquare },
          { key: 'tiktok', label: '5. TikTok & Reels', icon: Video },
          { key: 'youtube', label: '6. YouTube Authority', icon: Play },
          { key: 'facebook', label: '7. Meta Ads (FB & IG)', icon: Share2 },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                activeTab === tab.key
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Panes */}

      {/* 1. Adquisición */}
      {activeTab === 'acquisition' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
            <h2 className="text-sm font-bold text-white mb-2">Canales Clave de Adquisición B2B (CAC y LTV Proyectados)</h2>
            <p className="text-xs text-slate-400 mb-4">
              A diferencia del B2C de bajo ticket, el nicho pastoral eclesial posee una retención altísima (churn &lt; 2.5% anual) debido al costo de cambiar expedientes clínicos y biblioteca homilética.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {strategy.acquisitionChannels.map((c, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                  <h3 className="font-bold text-amber-400 text-sm">{c.channel}</h3>
                  <p className="text-slate-300 leading-relaxed">{c.strategy}</p>
                  <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px]">
                    <p><strong className="text-slate-400">Público:</strong> {c.targetAudience}</p>
                    <p className="text-emerald-400 font-semibold">{c.expectedCac}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Embudo */}
      {activeTab === 'funnel' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
            <h2 className="text-sm font-bold text-white mb-2">Estructura del Embudo de Conversión (TOFU → MOFU → BOFU)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {strategy.salesFunnelSteps.map((s, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-amber-400 text-sm">Paso {i + 1}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold">
                      {s.stage}
                    </span>
                  </div>
                  <p className="text-slate-200 font-semibold">{s.action}</p>
                  <p className="text-slate-400 text-[11px]"><strong className="text-slate-300">Activo:</strong> {s.asset}</p>
                  <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-bold">
                    Meta: {s.conversionGoal}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Correos */}
      {activeTab === 'emails' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
            <h2 className="text-sm font-bold text-white mb-1">Secuencia de Correos Automáticos de Nutrición y Conversión</h2>
            <p className="text-xs text-slate-400 mb-4">
              Correos redactados con alta empatía pastoral para activar usuarios durante los 14 días de prueba.
            </p>

            <div className="space-y-3">
              {strategy.emailSequences.map((email, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded mr-2">
                        {email.day}
                      </span>
                      <strong className="text-white text-sm">{email.subject}</strong>
                    </div>
                    <button
                      onClick={() => handleCopy(`email-${i}`, `Asunto: ${email.subject}\n\n${email.body}`)}
                      className="self-start sm:self-auto px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                    >
                      {copiedKey === `email-${i}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === `email-${i}` ? 'Copiado' : 'Copiar Email'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-cyan-300 font-medium">Objetivo: {email.purpose}</p>
                  <div className="p-3 bg-slate-900 rounded-lg text-slate-300 text-[11px] whitespace-pre-line leading-relaxed font-mono">
                    {email.body}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Onboarding */}
      {activeTab === 'onboarding' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm font-bold text-white">Checklist de Onboarding Interactivo de 7 Días</h2>
                <p className="text-xs text-slate-400">
                  Garantiza la primera victoria en 5 minutos para maximizar retención y reducir el churn al mínimo.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xl font-extrabold text-amber-400">{onboardingProgress}%</span>
                <span className="text-xs text-slate-400 block">Completado</span>
              </div>
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-6">
              <div 
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-300" 
                style={{ width: `${onboardingProgress}%` }} 
              />
            </div>

            <div className="space-y-2.5">
              {onboardingSteps.map((step, idx) => {
                const isChecked = completedOnboardingSteps.includes(idx);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleOnboardingStep(idx)}
                    className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-colors ${
                      isChecked
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 accent-emerald-500 rounded"
                    />
                    <div className="text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mr-2">
                        {step.day}
                      </span>
                      <strong className="text-slate-100">{step.title}</strong>
                      <p className="text-slate-400 text-[11px] mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. TikTok & Reels */}
      {activeTab === 'tiktok' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
            <h2 className="text-sm font-bold text-white mb-1">Guiones para TikTok, Reels y Shorts (Hooks de Alto Retención)</h2>
            <p className="text-xs text-slate-400 mb-4">
              Estructura probada: 0-3s Gancho visceral, 4-30s Demostración del software, 31-45s Llamado a la acción claro.
            </p>

            <div className="space-y-4">
              {strategy.tiktokScripts.map((tk, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-sm">{tk.title}</h3>
                    <span className="text-[10px] bg-slate-800 text-cyan-300 px-2 py-0.5 rounded font-mono">
                      {tk.duration}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-200 font-semibold">
                    <span className="text-[10px] uppercase font-bold text-rose-400 block mb-0.5">Gancho Visual y Verbal (0-3s):</span>
                    "{tk.hook}"
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 text-slate-300 leading-relaxed">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Desarrollo en Pantalla (4-35s):</span>
                    {tk.development}
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-semibold">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-0.5">Llamado a la Acción (36-45s):</span>
                    "{tk.cta}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. YouTube */}
      {activeTab === 'youtube' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
            <h2 className="text-sm font-bold text-white mb-1">Estrategia de Autoridad en YouTube (Long-Form)</h2>
            <p className="text-xs text-slate-400 mb-4">
              Videos de 15 a 25 minutos con posicionamiento orgánico en búsqueda ("Burnout pastoral", "Cómo hacer notas de consejería").
            </p>

            {strategy.youtubeFramework.map((yt, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-amber-400 text-sm">{yt.title}</h3>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">{yt.duration}</span>
                </div>

                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px] text-slate-300">
                  <strong className="text-slate-400">Concepto de Miniatura:</strong> {yt.thumbnailConcept}
                </div>

                <div>
                  <strong className="text-slate-300 text-[11px] block mb-1">Estructura del Contenido:</strong>
                  <ul className="space-y-1 text-slate-400 text-[11px]">
                    {yt.structure.map((item, idx) => (
                      <li key={idx} className="bg-slate-900/50 p-1.5 rounded">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Meta Ads */}
      {activeTab === 'facebook' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
            <h2 className="text-sm font-bold text-white mb-1">Campañas de Meta Ads (Facebook & Instagram B2B)</h2>
            <p className="text-xs text-slate-400 mb-4">
              Copys persuasivos validados para audiencias de habla hispana en Estados Unidos, México, Colombia y España.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {strategy.facebookAds.map((ad, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                        Ángulo: {ad.angle}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold">{ad.roasTarget}</span>
                    </div>

                    <h3 className="font-bold text-white text-sm mb-2">{ad.headline}</h3>

                    <div className="p-3 bg-slate-900 rounded-lg text-slate-300 text-[11px] whitespace-pre-line leading-relaxed font-mono">
                      {ad.copy}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                    <strong className="text-slate-300">Segmentación:</strong> {ad.targeting}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
