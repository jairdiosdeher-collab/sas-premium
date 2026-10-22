import React, { useState } from 'react';
import { 
  Sparkles, 
  Crown, 
  CheckCircle2, 
  ShieldCheck, 
  BookOpen, 
  Activity, 
  HeartHandshake, 
  Zap, 
  ArrowRight, 
  Clock, 
  Users, 
  Star, 
  ChevronDown, 
  Lock,
  Play,
  Calculator,
  Flame,
  Award,
  Globe2
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { PlanType } from '../../types';

interface LandingPageProps {
  onEnterApp: () => void;
  onSelectPlan: (plan: PlanType, billingCycle: 'monthly' | 'annual') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onSelectPlan }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [calculatorHours, setCalculatorHours] = useState<number>(14);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const handleCtaClick = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    onEnterApp();
  };

  const handlePlanClick = (plan: PlanType) => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 }
    });
    onSelectPlan(plan, billingCycle);
  };

  const savingsCalculation = {
    hoursSavedMonthly: calculatorHours * 4,
    moneyValueSaved: calculatorHours * 4 * 35, // valor estimado de hora pastoral/clínica $35
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Notification Bar */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 py-1.5 px-4 text-center text-slate-950 text-xs font-bold flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 fill-slate-950" />
        <span>LANZAMIENTO LATAM & USA: Acceso anticipado con 30% OFF vitalicio usando el cupón <code className="bg-slate-950 text-amber-300 px-1.5 py-0.5 rounded font-mono">REINO30</code></span>
      </div>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden text-center">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full -z-10 pointer-events-none" />

        {/* Niche Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-amber-300 text-xs font-medium mb-6 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>La 1ª Suite Clínica, Pastoral y Homilética con IA Ética</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
          Cuida de las almas con{' '}
          <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
            rigor clínico
          </span>{' '}
          y predica con{' '}
          <span className="bg-gradient-to-r from-amber-300 via-slate-100 to-amber-200 bg-clip-text text-transparent">
            profundidad bíblica
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Diseñado para <strong>pastores, psicólogos cristianos y consejeros pastorales</strong>. 
          Digitaliza tus historias clínicas (SOAP-S), aplica escalas psicométricas (PHQ-9, Burnout), 
          prepara sermones exegéticos en 15 minutos y protege la confidencialidad de tu rebaño.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleCtaClick}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-base shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 group transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Comenzar Prueba Gratuita de 14 Días</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={() => setIsVideoModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Play className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            <span>Ver Demostración en Video</span>
          </button>
        </div>

        {/* Trust Markers */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Sin tarjeta de crédito requerida</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Cifrado AES-256 confidencial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Cumple normas de ética y secreto ministerial</span>
          </div>
        </div>

        {/* Hero Interactive Mockup Preview */}
        <div id="demo-interactive" className="mt-14 relative rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3 sm:p-5 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 font-mono text-slate-300 text-[11px]">app.pastoralmente.ai/expedientes/carlos-mendez</span>
            </div>
            <span className="hidden sm:inline bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded text-[10px] font-semibold border border-amber-500/20">
              Expediente Clínico & Pastoral Activo
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            {/* Box 1: SOAP-S Note */}
            <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  Nota de Evolución SOAP-S
                </span>
                <span className="text-[10px] text-slate-400">Sesión #5</span>
              </div>
              <p className="text-xs text-slate-300 font-medium">Paciente: Pastor Carlos M. (Burnout)</p>
              <div className="mt-2 text-[11px] text-slate-400 space-y-1.5 leading-relaxed">
                <p><strong className="text-slate-200">S:</strong> Reporta mejoría del sueño tras apagar celular a las 8 PM. Persiste culpa por decir 'no'.</p>
                <p><strong className="text-slate-200">A:</strong> Activación de esquema de autosacrificio mesiánico. GAD-7: 8 (leve).</p>
                <p className="text-amber-300/90 font-serif-bible"><strong className="text-amber-400">Dimensión Espiritual:</strong> 1 Reyes 19:5 (Dios provee pan y descanso a Elías antes de darle teología).</p>
              </div>
            </div>

            {/* Box 2: Homiletic Sermon Builder */}
            <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  Bosquejo Homilético IA
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-semibold">
                  Exegético
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">Serie: Salud Mental en el Reino</p>
              <div className="mt-2 text-[11px] text-slate-400 space-y-1 leading-relaxed">
                <p className="text-slate-200 font-semibold">1. La anatomía del colapso (1 R. 19:4)</p>
                <p className="text-slate-400 text-[10px]">Ilustración: El motor sin aceite que ignora el tablero.</p>
                <p className="text-slate-200 font-semibold mt-1.5">2. El tratamiento divino: Pan y sueño</p>
                <p className="text-slate-400 text-[10px]">La gracia de atender el cuerpo antes de la prédica.</p>
                <p className="text-slate-200 font-semibold mt-1.5">3. El silbo apacible (1 R. 19:12)</p>
              </div>
            </div>

            {/* Box 3: Psychometric Scales */}
            <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  Escalas Psicométricas
                </span>
                <span className="text-[10px] text-rose-400 font-semibold">Alerta Ética</span>
              </div>
              <p className="text-xs text-slate-300 font-medium">Batería de Evaluación Psicológica</p>
              <div className="mt-3 space-y-2">
                <div>
                  <div className="flex justify-between text-[10px] text-slate-300 mb-0.5">
                    <span>PHQ-9 (Depresión)</span>
                    <span className="font-bold text-amber-400">12/27 (Moderada)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full w-[44%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-slate-300 mb-0.5">
                    <span>Burnout Maslach (MBI-M)</span>
                    <span className="font-bold text-rose-400">42/60 (Alto Desgaste)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full w-[70%]" />
                  </div>
                </div>
                <div className="pt-1 text-[10px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Protocolo de interconsulta médica activado</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-center">
            <button
              onClick={handleCtaClick}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1.5 hover:underline"
            >
              <span>Explorar todo el software en vivo con datos pre-cargados</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/60">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Arquitectura de Gracia & Ciencia
          </span>
          <h2 className="text-3xl font-extrabold mt-2 text-white">
            Diseñado para los 4 Grandes Desafíos del Ministerio Moderno
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Expedientes Clínicos & SOAP-S</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No más notas dispersas en libretas. Registra notas de evolución con rigor formal y campo especializado para la dimensión espiritual, disciplinas y motivos de oración.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Escalas Psicométricas Válidas</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Aplica PHQ-9 (depresión), GAD-7 (ansiedad), Bienestar Espiritual y el Inventario Maslach adaptado al ministerio. Detección temprana de agotamiento y alertas de riesgo.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Motor Homilético con IA</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Genera bosquejos exegéticos de 3 puntos, raíces en griego/hebreo, ilustraciones contemporáneas y aplicaciones prácticas sin sacrificar la sana doctrina ni la unción.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Citas & WhatsApp Automático</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Reduce el ausentismo de consejería en un 75%. Genera recordatorios con 1 clic listos para enviar por WhatsApp o correo con plantillas amables y profesionales.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive ROI Calculator */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-slate-800/60">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 sm:p-10 rounded-3xl border border-amber-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1 text-left">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-4 h-4" /> Calculadora de Impacto Ministerial
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                ¿Cuánto tiempo y dinero pierde tu ministerio cada mes en tareas manuales?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
                Ajusta las horas semanales que dedicas a redactar notas, planificar sermones desde cero y gestionar citas manualmente:
              </p>

              <div className="mt-6">
                <div className="flex justify-between text-xs font-semibold text-slate-200 mb-2">
                  <span>Horas semanales dedicadas a administración y sermones:</span>
                  <span className="text-amber-400 text-sm font-bold">{calculatorHours} horas/sem</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="35"
                  value={calculatorHours}
                  onChange={(e) => setCalculatorHours(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>4 hrs (Mínimo)</span>
                  <span>20 hrs (Promedio pastoral)</span>
                  <span>35 hrs (Sobrecarga crítica)</span>
                </div>
              </div>
            </div>

            {/* Result Card */}
            <div className="w-full lg:w-72 bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Tiempo Recuperado al Mes</p>
              <p className="text-4xl font-extrabold text-amber-400 mt-1">
                {savingsCalculation.hoursSavedMonthly} hrs
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Equivalente a más de 1 semana completa al mes para tu familia y oración.
              </p>

              <div className="border-t border-slate-800 my-4 pt-3">
                <p className="text-[11px] font-semibold text-slate-400 uppercase">Valor Económico Ahorrado</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                  ~${savingsCalculation.moneyValueSaved} USD/mes
                </p>
              </div>

              <button
                onClick={handleCtaClick}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-transform active:scale-95"
              >
                Recuperar Mi Tiempo Ahora
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/60" id="precios">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Planes de Suscripción Transparentes
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
            Inversión Diseñada para Generar Retorno desde el Primer Mes
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-3">
            Elige el plan adecuado para tu vocación ministerial o consultorio clínico. Cancela o cambia de plan en cualquier momento.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="mt-6 inline-flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Facturación Mensual
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Facturación Anual</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/40">
                Ahorra 20%
              </span>
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Plan Básico */}
          <div className="rounded-3xl bg-slate-900/50 border border-slate-800 p-8 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-white">Plan Básico</h3>
                <span className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                  Iniciantes
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-6">
                Para pastores independientes, consejeros laicos y líderes de grupo pequeño.
              </p>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">
                    ${billingCycle === 'monthly' ? '19' : '15'}
                  </span>
                  <span className="text-xs text-slate-400">/ mes</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {billingCycle === 'annual' ? 'Facturado anualmente ($180/año)' : 'Facturación mensual sin compromiso'}
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Hasta 15 expedientes clínicos / miembros activos</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Notas de evolución SOAP-S básicas</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Biblioteca y planificador homilético</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>50 créditos de IA mensual para sermones</span>
                </div>
                <div className="flex items-start gap-2 text-slate-500">
                  <span className="w-4 h-4 shrink-0 text-center">—</span>
                  <span>Sin escalas psicométricas avanzadas</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handlePlanClick('basico')}
              className="mt-8 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
            >
              Comenzar con Plan Básico
            </button>
          </div>

          {/* Plan Profesional (Destacado) */}
          <div className="rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500 p-8 flex flex-col justify-between relative shadow-2xl shadow-amber-500/10 transform lg:-translate-y-2">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow">
              Más Popular & Recomendado
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-white flex items-center gap-1.5">
                  <Crown className="w-5 h-5 text-amber-400" /> Plan Profesional
                </h3>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                  Recomendado
                </span>
              </div>
              <p className="text-xs text-slate-300 mb-6">
                Para psicólogos clínicos cristianos, pastores principales y consejeros certificados.
              </p>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold text-amber-400">
                    ${billingCycle === 'monthly' ? '49' : '39'}
                  </span>
                  <span className="text-xs text-slate-400">/ mes</span>
                </div>
                <p className="text-[11px] text-amber-300/80 mt-1">
                  {billingCycle === 'annual' ? 'Facturado anualmente ($468/año) - Ahorras $120' : 'Facturación mensual'}
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-200">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Pacientes / miembros ilimitados</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Escalas psicométricas completas (PHQ-9, GAD-7, Maslach, SWBS)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>IA ilimitada</strong> para notas SOAP-S, sermones e intervenciones</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Generador de informes profesionales en PDF con membrete</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Recordatorios automáticos por WhatsApp y correo</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Exportación de copias de seguridad encriptadas</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handlePlanClick('profesional')}
              className="mt-8 w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/30 transition-transform active:scale-95"
            >
              Comenzar Prueba de 14 Días Gratis
            </button>
          </div>

          {/* Plan Premium */}
          <div className="rounded-3xl bg-slate-900/50 border border-slate-800 p-8 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-white">Plan Premium</h3>
                <span className="text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/40">
                  Instituciones
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-6">
                Para clínicas cristianas, redes ministeriales, mega-iglesias y seminarios teológicos.
              </p>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">
                    ${billingCycle === 'monthly' ? '99' : '79'}
                  </span>
                  <span className="text-xs text-slate-400">/ mes</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {billingCycle === 'annual' ? 'Facturado anualmente ($948/año)' : 'Facturación mensual'}
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Todo lo del Plan Profesional</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Multi-usuario:</strong> Hasta 10 pastores / terapeutas en equipo</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>CRM avanzado con seguimiento longitudinal eclesial</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Auditoría de confidencialidad y permisos de rol</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Soporte prioritario 24/7 y onboarding con consultor</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handlePlanClick('premium')}
              className="mt-8 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
            >
              Comenzar con Plan Premium
            </button>
          </div>
        </div>

        {/* Interactive Plan Comparison Matrix */}
        <div className="mt-16 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
              Transparencia Absoluta
            </span>
            <h3 className="text-xl font-extrabold text-white mt-1">Comparativa Detallada de Capacidades</h3>
            <p className="text-xs text-slate-400 mt-0.5">Elige el plan exacto para tu volumen de atención clínica y ministerial.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="pb-3 text-white font-bold">Módulos & Funciones</th>
                  <th className="pb-3 text-center">Gratuito</th>
                  <th className="pb-3 text-center">Básico ($19/m)</th>
                  <th className="pb-3 text-center text-amber-400 font-bold">Profesional ($49/m)</th>
                  <th className="pb-3 text-center">Premium ($99/m)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-3 font-semibold text-white">Expedientes Clínicos & CRM</td>
                  <td className="py-3 text-center text-slate-500">Hasta 3</td>
                  <td className="py-3 text-center">Hasta 15</td>
                  <td className="py-3 text-center font-bold text-amber-300">Ilimitados</td>
                  <td className="py-3 text-center font-bold text-white">Ilimitados</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-white">Notas de Evolución SOAP-S</td>
                  <td className="py-3 text-center text-slate-500">5 notas</td>
                  <td className="py-3 text-center">Manuales</td>
                  <td className="py-3 text-center font-bold text-amber-300">Sí + IA Síntesis</td>
                  <td className="py-3 text-center font-bold text-white">Sí + IA Síntesis</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-white">9 Escalas Clínicas (PHQ-9, GAD-7, Beck, etc.)</td>
                  <td className="py-3 text-center text-slate-500">—</td>
                  <td className="py-3 text-center text-slate-500">—</td>
                  <td className="py-3 text-center font-bold text-emerald-400">✓ 9 Escalas</td>
                  <td className="py-3 text-center font-bold text-emerald-400">✓ 9 Escalas</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-white">Sermones con IA & Homilética</td>
                  <td className="py-3 text-center text-slate-500">1 sermón</td>
                  <td className="py-3 text-center">50 créditos/m</td>
                  <td className="py-3 text-center font-bold text-amber-300">Ilimitados</td>
                  <td className="py-3 text-center font-bold text-white">Ilimitados</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-white">Recordatorios WhatsApp de Citas</td>
                  <td className="py-3 text-center text-slate-500">—</td>
                  <td className="py-3 text-center">Manual</td>
                  <td className="py-3 text-center font-bold text-emerald-400">✓ Automático</td>
                  <td className="py-3 text-center font-bold text-emerald-400">✓ Automático</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-white">Informes PDF con Membrete y Firma</td>
                  <td className="py-3 text-center text-slate-500">—</td>
                  <td className="py-3 text-center">Básico</td>
                  <td className="py-3 text-center font-bold text-amber-300">✓ Formal con Sello</td>
                  <td className="py-3 text-center font-bold text-white">✓ Formal con Sello</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-white">Seguridad AES-256 & Auditoría Clínica</td>
                  <td className="py-3 text-center">Básica</td>
                  <td className="py-3 text-center">Básica</td>
                  <td className="py-3 text-center font-bold text-amber-300">✓ HIPAA / Ética</td>
                  <td className="py-3 text-center font-bold text-white">✓ HIPAA / Multi-rol</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-white">Soporte Técnico Especializado</td>
                  <td className="py-3 text-center text-slate-500">Comunidad</td>
                  <td className="py-3 text-center">Correo 48h</td>
                  <td className="py-3 text-center font-bold text-emerald-400">WhatsApp Prioritario</td>
                  <td className="py-3 text-center font-bold text-white">Concierge 24/7</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/60">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Voces del Ministerio y la Clínica
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-2">
            La Herramienta Confiada por Más de 850 Pastores y Terapeutas
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <p className="text-xs text-slate-300 italic leading-relaxed">
              "El inventario de burnout ministerial y las notas SOAP-S salvaron a nuestro equipo pastoral del colapso. Antes teníamos el temor constante de que una libreta con notas de consejería confidencial se extraviara. Ahora todo está estructurado y protegido."
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-xs">
                PO
              </div>
              <div>
                <p className="text-xs font-bold text-white">Pr. Omar Valencia</p>
                <p className="text-[10px] text-slate-400">Iglesia Vida Plena (Bogotá, Colombia)</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <p className="text-xs text-slate-300 italic leading-relaxed">
              "Como psicóloga clínica cristiana, sufría para encontrar un software que no me obligara a ocultar mi fe o a perder el rigor psicométrico. PastoralMente integra PHQ-9 con dirección espiritual de manera magistral."
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-xs">
                MR
              </div>
              <div>
                <p className="text-xs font-bold text-white">Dra. Mariana Restrepo</p>
                <p className="text-[10px] text-slate-400">Centro Psicológico Shalom (Miami, FL)</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <p className="text-xs text-slate-300 italic leading-relaxed">
              "El planificador homilético no escribe el sermón por ti; te organiza la exégesis y te desafía con aplicaciones contemporáneas que conectan directo al corazón de los jóvenes. Recuperé mis sábados para cenar con mi esposa."
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-xs">
                CS
              </div>
              <div>
                <p className="text-xs font-bold text-white">Pr. Carlos Soto</p>
                <p className="text-[10px] text-slate-400">Comunidad Cristiana Central (Madrid)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-800/60">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Preguntas Frecuentes
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-2">
            Respuestas Claras para Decisiones Sabias
          </h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "¿Es ético y bíblico usar Inteligencia Artificial en el ministerio y la consejería?",
              a: "Absolutamente sí, siempre que se use como una herramienta de apoyo y nunca como un sustituto del Espíritu Santo ni del discernimiento pastoral. La IA en PastoralMente asiste en la redacción de notas, el cálculo de escalas y la búsqueda de pasajes e ilustraciones, liberando tiempo para el contacto humano genuino."
            },
            {
              q: "¿Cómo se protege la confidencialidad y el secreto de confesión/pastoral?",
              a: "Los datos se almacenan con cifrado local AES-256 en tu dispositivo y cuentas autorizadas. Ningún dato clínico de pacientes se utiliza jamás para entrenar modelos públicos de IA ni se vende a terceros."
            },
            {
              q: "¿Qué sucede si decido cancelar mi suscripción?",
              a: "Puedes cancelar en cualquier momento con 1 clic desde tu portal de facturación Stripe. Tienes siempre derecho a descargar una copia de seguridad completa en formato JSON o PDF de todos tus expedientes y sermones."
            },
            {
              q: "¿Puedo cobrar como afiliado recomendando PastoralMente AI?",
              a: "Sí. Contamos con un programa de afiliados con el 30% de comisión mensual recurrente de por vida por cada pastor, colega o iglesia que refieras. Puedes gestionarlo directamente desde el panel de afiliados."
            }
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left flex justify-between items-center text-xs sm:text-sm font-semibold text-slate-200 hover:text-amber-300"
              >
                <span>{item.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-amber-400' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="p-4 pt-0 text-xs text-slate-400 leading-relaxed border-t border-slate-800/50">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Bar */}
      <section className="py-16 px-4 bg-gradient-to-t from-slate-950 via-slate-900 to-slate-950 text-center border-t border-slate-800">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-white">
            Comienza a Cuidar con Sabiduría Clínica y Poder Pastoral
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-300">
            Prueba todos los módulos durante 14 días sin costo. Comprueba por ti mismo el impacto en tu iglesia y en tu propia salud emocional.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={handleCtaClick}
              className="px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
            >
              Acceder a la Plataforma Completa Ahora
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-4 text-center text-[11px] text-slate-500">
        <p>© 2026 PastoralMente AI Premium. Todos los derechos reservados. Diseñado para ministros del Reino de Dios.</p>
        <p className="mt-1">Cumple con normativas de protección de datos, secreto ministerial y estándares éticos de consejería.</p>
      </footer>

      {/* Video Demo Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <h3 className="font-bold text-white text-sm">Demostración en Vivo: PastoralMente AI Suite Enterprise</h3>
              </div>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Video Canvas Simulation */}
            <div className="aspect-video bg-slate-950 relative flex flex-col justify-between p-6">
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                  Tour Guiado • 2:45 min
                </span>
                <span className="text-[10px] font-mono text-slate-500">1080p HD • 60 FPS</span>
              </div>

              {/* Center Play Graphic */}
              <div className="text-center space-y-3">
                <div 
                  onClick={handleCtaClick}
                  className="w-16 h-16 rounded-full bg-amber-500/90 hover:bg-amber-400 text-slate-950 flex items-center justify-center mx-auto cursor-pointer shadow-xl shadow-amber-500/30 hover:scale-110 transition-transform"
                >
                  <Play className="w-7 h-7 fill-slate-950 ml-1" />
                </div>
                <div>
                  <h4 className="text-white font-extrabold text-base">
                    Mira cómo ahorrar 15 horas semanales en notas clínicas y sermones
                  </h4>
                  <p className="text-slate-400 text-xs mt-1">
                    Capítulo 1: Notas SOAP-S con IA • Capítulo 2: Escalas PHQ-9 & Burnout • Capítulo 3: Exégesis Bíblica
                  </p>
                </div>
              </div>

              {/* Video Timeline Scrubber */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>01:14</span>
                  <span>02:45</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full w-[45%]" />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-900 flex items-center justify-between">
              <p className="text-xs text-slate-300">¿Listo para probarlo con tus propios casos e iglesias?</p>
              <button
                onClick={handleCtaClick}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Iniciar Prueba de 14 Días
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
