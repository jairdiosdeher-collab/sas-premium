import React, { useState } from 'react';
import { 
  Activity, 
  HeartPulse, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  User, 
  Sparkles, 
  Save, 
  ChevronRight,
  Flame,
  ShieldAlert,
  ArrowRight,
  FileText
} from 'lucide-react';
import { Patient, AssessmentResult, ClinicalScaleType } from '../../types';

interface AssessmentsModuleProps {
  patients: Patient[];
  assessments: AssessmentResult[];
  onSaveAssessment: (assessment: AssessmentResult) => void;
}

export const AssessmentsModule: React.FC<AssessmentsModuleProps> = ({
  patients,
  assessments,
  onSaveAssessment,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [activeScale, setActiveScale] = useState<ClinicalScaleType>('PHQ9');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [justCalculated, setJustCalculated] = useState<AssessmentResult | null>(null);

  const currentPatient = patients.find((p) => p.id === selectedPatientId);

  // Scales Questions Banks
  const scaleDefinitions: Record<ClinicalScaleType, { title: string; max: number; questions: string[]; alertIndex?: number }> = {
    PHQ9: {
      title: 'PHQ-9 (Cuestionario de Salud del Paciente - Depresión)',
      max: 27,
      alertIndex: 8,
      questions: [
        "1. Poco interés o placer en hacer cosas",
        "2. Se ha sentido decaído(a), deprimido(a) o sin esperanzas",
        "3. Dificultad para conciliar el sueño, despertar a medianoche o dormir demasiado",
        "4. Se ha sentido cansado(a) o con poca energía",
        "5. Poco apetito o comer en exceso",
        "6. Sentirse mal consigo mismo(a), o que es un fracaso o ha defraudado a su familia/iglesia",
        "7. Dificultad para concentrarse en cosas tales como leer las Escrituras o escuchar el sermón",
        "8. Moverse o hablar tan despacio que los demás lo notan, o inquietud psicomotriz",
        "9. Pensamientos de que sería mejor estar muerto(a) o deseos de lastimarse a sí mismo(a)"
      ]
    },
    GAD7: {
      title: 'GAD-7 (Escala de Ansiedad Generalizada)',
      max: 21,
      questions: [
        "1. Sentirse nervioso(a), intranquilo(a) o con los nervios de punta",
        "2. No poder dejar de preocuparse o controlar la preocupación",
        "3. Preocuparse demasiado por diferentes cosas del ministerio o la familia",
        "4. Dificultad para relajarse y descansar en la presencia de Dios",
        "5. Sentirse tan inquieto(a) que le resulta difícil permanecer quieto(a)",
        "6. Irritarse o enfadarse con facilidad con hermanos o familiares",
        "7. Sentir miedo como si algo terrible fuera a suceder"
      ]
    },
    BDI2: {
      title: 'BDI-II (Inventario de Depresión de Beck - Adaptado)',
      max: 30,
      questions: [
        "1. Tristeza profunda y sensación de vacío persistente",
        "2. Pesimismo sobre el futuro y pérdida de visión espiritual",
        "3. Sentimientos de culpa exagerada y autorreproche constante",
        "4. Pérdida de interés en la comunión con otros creyentes y amistades",
        "5. Irritabilidad ante demandas de liderazgo o tareas familiares",
        "6. Dificultad para tomar decisiones sencillas cotidianas",
        "7. Cambios en los hábitos de sueño y descanso",
        "8. Fatiga física no atribuible a esfuerzo muscular directo",
        "9. Falta de apetito o consumo compulsivo de alimentos",
        "10. Disminución marcada en la concentración y claridad mental"
      ]
    },
    BAI: {
      title: 'BAI (Inventario de Ansiedad de Beck)',
      max: 24,
      questions: [
        "1. Sensación de adormecimiento, hormigueo o pinchazos en el cuerpo",
        "2. Sensación de calor o sofoco repentino",
        "3. Temblores en las piernas o manos al enfrentar situaciones de tensión",
        "4. Incapacidad para relajarse y calmar la respiración",
        "5. Temor a que ocurra lo peor o a perder el control",
        "6. Mareo o sensación de desvanecimiento leve",
        "7. Palpitaciones o latidos cardíacos acelerados (taquicardia)",
        "8. Miedo intenso a fallar en público o en el estrado"
      ]
    },
    CSSRS: {
      title: 'C-SSRS (Escala Columbia para Cribado del Riesgo de Suicidio)',
      max: 15,
      alertIndex: 0,
      questions: [
        "1. ¿Ha deseado estar muerto(a) o poder dormirse y no despertar jamás?",
        "2. ¿Ha tenido pensamientos reales de querer quitarse la vida?",
        "3. ¿Ha pensado en un método específico para hacerse daño (aunque no tenga intención inmediata)?",
        "4. ¿Ha tenido alguna intención o impulso de llevar a cabo estos pensamientos?",
        "5. ¿Ha comenzado a elaborar o preparado los detalles para terminar con su vida?"
      ]
    },
    ASSIST: {
      title: 'ASSIST (Prueba de Detección de Consumo de Sustancias - OMS)',
      max: 20,
      questions: [
        "1. ¿Ha consumido tabaco, alcohol u otras sustancias para mitigar el dolor emocional?",
        "2. ¿Ha sentido un fuerte deseo o necesidad imperiosa de consumir para tolerar el estrés?",
        "3. ¿El consumo le ha causado problemas de salud, familiares o de ministerio?",
        "4. ¿Ha dejado de cumplir tareas ministeriales o familiares debido al consumo?",
        "5. ¿Algún familiar, médico o líder espiritual ha expresado preocupación por este hábito?"
      ]
    },
    AUDIT: {
      title: 'AUDIT (Identificación de Trastornos por Consumo de Alcohol - OMS)',
      max: 18,
      questions: [
        "1. ¿Con qué frecuencia ingiere bebidas alcohólicas?",
        "2. ¿Con qué frecuencia en el último año no pudo parar tras haber comenzado?",
        "3. ¿Con qué frecuencia no pudo cumplir sus responsabilidades eclesiales o laborales?",
        "4. ¿Con qué frecuencia ha sentido culpa o remordimiento moral después de beber?",
        "5. ¿Usted o alguien más ha resultado herido a causa de haber bebido?",
        "6. ¿Ha intentado ocultar su consumo ante su congregación o familia?"
      ]
    },
    BURNOUT_MBI: {
      title: 'Inventario Maslach de Desgaste Ministerial (MBI-M)',
      max: 35,
      questions: [
        "1. Me siento emocionalmente exhausto(a) por las demandas de mi ministerio/trabajo",
        "2. Al levantarme por la mañana me falta energía para enfrentar otro día pastoral",
        "3. Siento que las personas del ministerio consumen toda mi energía y compasión",
        "4. Me he vuelto más cínico(a) o insensible ante los problemas de la congregación",
        "5. Siento que no importa cuánto me esfuerce, nunca es suficiente para satisfacer a otros",
        "6. Siento que he perdido la ilusión y la vocación con la que comencé a servir",
        "7. Me siento incomprendido(a) y solo(a) en mis responsabilidades de liderazgo"
      ]
    },
    SWBS: {
      title: 'Escala de Bienestar Espiritual y Existencial (SWBS)',
      max: 30,
      questions: [
        "1. No obtengo mucha satisfacción personal de la oración o el tiempo con Dios",
        "2. Siento que la vida tiene un propósito trascendente y divino para mí",
        "3. Creo que Dios me ama y se preocupa por mí de manera íntima y continua",
        "4. Me siento inquieto(a) sobre el futuro y dudo de mi destino eterno",
        "5. Mi relación con Dios me ayuda a no sentirme solo(a) en los momentos oscuros",
        "6. Siento que mi fe es más un conjunto de deberes legales que un manantial de vida"
      ]
    }
  };

  const handleAnswerChange = (questionIndex: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: value }));
  };

  const calculateResult = () => {
    const scale = scaleDefinitions[activeScale];
    let score = 0;
    Object.values(answers).forEach((val) => (score += val));

    let severity = '';
    let interpretation = '';
    let pastoralRecommendation = '';

    const ratio = score / scale.max;

    if (ratio < 0.25) {
      severity = 'Nivel Bajo / Sin afectación significativa';
      interpretation = 'Resultados dentro de la normalidad funcional.';
      pastoralRecommendation = 'Mantener disciplinas preventivas y cuidado del descanso.';
    } else if (ratio < 0.5) {
      severity = 'Nivel Leve / Reactivo';
      interpretation = 'Presencia de síntomas leves asociados a factores estresores recientes.';
      pastoralRecommendation = 'Reforzar acompañamiento pastoral no punitivo y técnicas de respiración.';
    } else if (ratio < 0.75) {
      severity = 'Nivel Moderado / Atención Recomendada';
      interpretation = 'Sintomatología con afectación en la vida diaria, relacional y devocional.';
      pastoralRecommendation = 'Acompañamiento psicoterapéutico quincenal y revisión de carga pastoral.';
    } else {
      severity = 'Nivel Severo / Riesgo Clínico Prioritario';
      interpretation = 'Cuadro clínico agudo que compromete el funcionamiento integral.';
      pastoralRecommendation = 'Intervención interdisciplinaria inmediata (médica/psiquiátrica) y activación de red de apoyo.';
    }

    const newResult: AssessmentResult = {
      id: `ass-${Date.now()}`,
      patientId: selectedPatientId,
      type: activeScale,
      title: scale.title,
      date: new Date().toISOString().split('T')[0],
      score,
      maxScore: scale.max,
      severity,
      interpretation,
      pastoralRecommendation,
      answers,
    };

    setJustCalculated(newResult);
  };

  const handleSaveToRecord = () => {
    if (justCalculated) {
      onSaveAssessment(justCalculated);
      alert('Evaluación guardada exitosamente en el expediente.');
      setAnswers({});
      setJustCalculated(null);
    }
  };

  const currentDef = scaleDefinitions[activeScale];
  const patientAssessments = assessments.filter((a) => a.patientId === selectedPatientId);

  // Check critical ethics flag
  const hasCriticalFlag = 
    (activeScale === 'PHQ9' && (answers[8] || 0) > 0) ||
    (activeScale === 'CSSRS' && (answers[0] || 0) > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Psicometría Clínica Completa
            </span>
            <span className="text-xs text-slate-400">9 Instrumentos Validados</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1 flex items-center gap-2">
            <Activity className="w-6 h-6 text-amber-400" />
            <span>Escalas Clínicas, Detección de Riesgo & Diagnóstico</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            PHQ-9, GAD-7, BDI-II, BAI, C-SSRS, ASSIST, AUDIT, Maslach Burnout y Bienestar Espiritual.
          </p>
        </div>

        {/* Patient Picker */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
          <User className="w-4 h-4 text-amber-400 ml-2" />
          <select
            value={selectedPatientId}
            onChange={(e) => {
              setSelectedPatientId(e.target.value);
              setAnswers({});
              setJustCalculated(null);
            }}
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

      {/* 9 Scales Switcher Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { key: 'PHQ9', label: 'PHQ-9 (Depresión)' },
          { key: 'GAD7', label: 'GAD-7 (Ansiedad)' },
          { key: 'BDI2', label: 'BDI-II (Beck Depresión)' },
          { key: 'BAI', label: 'BAI (Beck Ansiedad)' },
          { key: 'CSSRS', label: 'C-SSRS (Riesgo Suicida)' },
          { key: 'BURNOUT_MBI', label: 'Burnout Maslach' },
          { key: 'SWBS', label: 'Bienestar Espiritual' },
          { key: 'ASSIST', label: 'ASSIST (Sustancias OMS)' },
          { key: 'AUDIT', label: 'AUDIT (Alcohol OMS)' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveScale(tab.key as any);
              setAnswers({});
              setJustCalculated(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeScale === tab.key
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Questionnaire + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Questionnaire (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white">{currentDef.title}</h2>
              <p className="text-[11px] text-slate-400">Responda evaluando las últimas dos semanas del consultante:</p>
            </div>
            <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {Object.keys(answers).length}/{currentDef.questions.length} respondidas
            </span>
          </div>

          {/* Critical Ethical Banner */}
          {hasCriticalFlag && (
            <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500 text-red-200 text-xs flex items-start gap-2.5 animate-pulse">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-300">PROTOCOLO DE SEGURIDAD ÉTICA ACTIVADO</p>
                <p className="text-[11px] text-red-200/90 mt-0.5">
                  El consultante reportó ideación o pensamientos autolíticos. Requiere evaluación urgente de letalidad, contacto inmediato con familiar responsable y nunca dejar a la persona sin acompañamiento presencial.
                </p>
              </div>
            </div>
          )}

          {/* Questions */}
          <div className="space-y-3.5 max-h-[580px] overflow-y-auto pr-1">
            {currentDef.questions.map((q, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                <p className="text-xs font-semibold text-slate-200">{q}</p>
                <div className="grid grid-cols-4 gap-2 text-[11px]">
                  {[
                    { label: 'Nunca (0)', val: 0 },
                    { label: 'Varios días (1)', val: 1 },
                    { label: 'Frecuente (2)', val: 2 },
                    { label: 'Casi diario (3)', val: 3 },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => handleAnswerChange(idx, opt.val)}
                      className={`py-1.5 px-1 rounded-lg text-center font-medium transition-all ${
                        answers[idx] === opt.val
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              onClick={calculateResult}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              Calcular Puntuación e Interpretación
            </button>
          </div>
        </div>

        {/* Right Col: Instant Result & History (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {justCalculated ? (
            <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Resultado Clínico</span>
                <span className="text-xs text-slate-400">{justCalculated.date}</span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white">{justCalculated.title}</h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-amber-400">{justCalculated.score}</span>
                  <span className="text-xs text-slate-400">/ {justCalculated.maxScore} pts</span>
                  <span className="text-xs font-bold text-slate-200 px-2 py-0.5 rounded bg-slate-800 ml-auto">
                    {justCalculated.severity}
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-rose-500 h-full transition-all" 
                    style={{ width: `${Math.min(100, (justCalculated.score / justCalculated.maxScore) * 100)}%` }} 
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 text-xs space-y-1">
                <p className="font-bold text-cyan-400">Interpretación Diagnóstica:</p>
                <p className="text-slate-300 leading-relaxed">{justCalculated.interpretation}</p>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
                <p className="font-bold text-amber-400">Guía Pastoral y de Contención:</p>
                <p className="text-amber-200/90 leading-relaxed font-serif-bible">{justCalculated.pastoralRecommendation}</p>
              </div>

              <button
                onClick={handleSaveToRecord}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Guardar en Expediente de {currentPatient?.fullName}</span>
              </button>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-500">
              <HeartPulse className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p>Completa las respuestas de la escala para calcular el puntaje y la recomendación pastoral de inmediato.</p>
            </div>
          )}

          {/* Historical Assessments */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>Historial Psicométrico del Consultante ({patientAssessments.length})</span>
            </h3>

            {patientAssessments.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">No hay registros psicométricos para este paciente.</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {patientAssessments.map((ass) => (
                  <div key={ass.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{ass.title}</span>
                      <span className="text-[10px] text-slate-400">{ass.date}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-amber-400 font-bold">{ass.score} / {ass.maxScore} pts</span>
                      <span className="text-slate-400 text-[10px]">{ass.severity}</span>
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
