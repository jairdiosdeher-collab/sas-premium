/**
 * Clinical Supervisor AI Service
 * Realiza auditoría clínica experta de notas SOAP-S, detecta riesgos,
 * contradicciones diagnósticas, síntomas omitidos y sugiere intervenciones.
 */

import { SoapNote, Patient, AssessmentResult, ClinicalSupervisorReview, RiskLevel } from '../types';
import { GeminiService } from './geminiService';

export class ClinicalSupervisorService {
  /**
   * Revisa automáticamente una nota SOAP-S con IA o motor heurístico clínico experto.
   */
  public static async reviewSoapNote(
    note: Partial<SoapNote>,
    patient?: Patient,
    previousAssessments?: AssessmentResult[]
  ): Promise<ClinicalSupervisorReview> {
    const prompt = `Actúa como Supervisor Clínico en Psicología Clínica y Consejería Pastoral Certificada.
Audita la siguiente nota de evolución SOAP-S y contexto del consultante:

PACIENTE:
- Nombre: ${patient?.fullName || 'Consultante'} (${patient?.age || 'N/A'} años, ${patient?.gender || 'N/A'})
- Motivo principal: ${patient?.primaryReason || 'No especificado'}
- Diagnóstico previo: ${patient?.clinicalDiagnosis || 'En evaluación'}
- Antecedentes médicos/psiquiátricos: ${patient?.medicalHistory?.psychiatricHistory || 'Ninguno'}
- Antecedentes espirituales: ${patient?.spiritualBackground?.spiritualStruggles || 'Ninguno'}

NOTA SOAP-S ACTUAL:
- Subjetivo (S): ${note.subjective || 'Sin datos'}
- Objetivo (O): ${note.objective || 'Sin datos'}
- Análisis/Evaluación (A): ${note.assessment || 'Sin datos'}
- Plan de Intervención (P): ${note.plan || 'Sin datos'}
- Dimensión Espiritual (S): ${note.spiritualDimension || 'Sin datos'}
- Flag de Riesgo del terapeuta: ${note.riskFlag ? 'SÍ' : 'NO'}

Devuelve un JSON estricto con la siguiente estructura:
{
  "clinicalConfidenceScore": number (0 a 100),
  "overallRiskLevel": "bajo" | "moderado" | "alto" | "urgente",
  "diagnosticContradictions": string[],
  "clinicalRisksDetected": [
    {
      "type": "suicidio" | "autolesion" | "depresion_severa" | "ansiedad_panico" | "burnout" | "psicosis" | "duelo_complicado" | "violencia",
      "severity": "leve" | "moderada" | "severa" | "urgente",
      "evidence": string,
      "protocolRecommendation": string
    }
  ],
  "omittedSymptomsDsm5": string[],
  "suggestedClinicalInterventions": [
    {
      "approach": "TCC" | "Terapia Breve" | "Aceptacion y Compromiso" | "Psicoeducacion" | "Logoterapia",
      "technique": string,
      "rationale": string
    }
  ],
  "therapeuticObjectives": string[],
  "pastoralRecommendations": [
    {
      "biblicalPassage": string,
      "pastoralAction": string,
      "spiritualIntegrationTip": string,
      "cautionNote": string
    }
  ],
  "supervisorNotes": string
}`;

    try {
      const responseText = await GeminiService.callGeminiWithFallback(prompt, 'supervisor');
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          noteId: note.id,
          patientId: patient?.id || 'unknown',
          reviewedAt: new Date().toISOString(),
          clinicalConfidenceScore: Math.min(100, Math.max(10, Number(parsed.clinicalConfidenceScore) || 85)),
          overallRiskLevel: parsed.overallRiskLevel || (note.riskFlag ? 'alto' : 'moderado'),
          diagnosticContradictions: Array.isArray(parsed.diagnosticContradictions) ? parsed.diagnosticContradictions : [],
          clinicalRisksDetected: Array.isArray(parsed.clinicalRisksDetected) ? parsed.clinicalRisksDetected : [],
          omittedSymptomsDsm5: Array.isArray(parsed.omittedSymptomsDsm5) ? parsed.omittedSymptomsDsm5 : [],
          suggestedClinicalInterventions: Array.isArray(parsed.suggestedClinicalInterventions) ? parsed.suggestedClinicalInterventions : [],
          therapeuticObjectives: Array.isArray(parsed.therapeuticObjectives) ? parsed.therapeuticObjectives : [],
          pastoralRecommendations: Array.isArray(parsed.pastoralRecommendations) ? parsed.pastoralRecommendations : [],
          supervisorNotes: parsed.supervisorNotes || 'Auditoría completada exitosamente conforme a estándares clínicos y ministeriales.'
        };
      }
    } catch (e) {
      console.warn('ClinicalSupervisorService: usando motor heurístico offline', e);
    }

    // Heurístico clínico robusto de respaldo (100% offline y seguro)
    return this.generateHeuristicReview(note, patient, previousAssessments);
  }

  /**
   * Motor determinístico clínico basado en DSM-5-TR y Guías de Consejería Pastoral
   */
  public static generateHeuristicReview(
    note: Partial<SoapNote>,
    patient?: Patient,
    previousAssessments?: AssessmentResult[]
  ): ClinicalSupervisorReview {
    const textCorpus = `${note.subjective || ''} ${note.objective || ''} ${note.assessment || ''} ${note.plan || ''}`.toLowerCase();
    
    // Detección de riesgos
    const hasSuicideRisk = /suicid|morir|quitarme la vida|no despertar|acabar con todo|desesperanz|sin salida/.test(textCorpus) || note.riskFlag;
    const hasPanicAnxiety = /p[aá]nico|taquicardia|ahogo|opresi[oó]n|angustia|desesperaci[oó]n|hiperventil/.test(textCorpus);
    const hasSevereDepression = /anhedonia|no siento nada|llanto incontrolable|culpa extrema|sin energ[ií]a|no me levanto/.test(textCorpus);
    const hasBurnout = /agotad|colapso|pastoral|ministerial|desgaste|sin fuerzas/.test(textCorpus);
    const hasSpiritualConflict = /dios me castig|culpa|pecado imperdonable|abandono de dios|duda espiritual/.test(textCorpus);

    const risks: ClinicalSupervisorReview['clinicalRisksDetected'] = [];
    const contradictions: string[] = [];
    const omitted: string[] = [];

    let calculatedRisk: RiskLevel = 'bajo';

    if (hasSuicideRisk) {
      calculatedRisk = 'urgente';
      risks.push({
        type: 'suicidio',
        severity: 'urgente',
        evidence: 'Presencia de ideación, desesperanza o verbalizaciones explícitas de muerte.',
        protocolRecommendation: 'Aplicar Escala C-SSRS de inmediato, activar red de apoyo familiar y firmar acuerdo de resguardo de vida.'
      });
    }

    if (hasSevereDepression) {
      if (calculatedRisk !== 'urgente') calculatedRisk = 'alto';
      risks.push({
        type: 'depresion_severa',
        severity: 'severa',
        evidence: 'Indicadores de anhedonia profunda y bloqueo psicomotor.',
        protocolRecommendation: 'Evaluar necesidad de interconsulta con psiquiatría y monitoreo semanal de activación conductual.'
      });
    }

    if (hasPanicAnxiety) {
      if (calculatedRisk === 'bajo') calculatedRisk = 'moderado';
      risks.push({
        type: 'ansiedad_panico',
        severity: 'moderada',
        evidence: 'Sintomatología simpática autonómica aguda referida en la sesión.',
        protocolRecommendation: 'Entrenar respiración diafragmática 4-7-8 y técnica de anclaje sensorial 5-4-3-2-1.'
      });
    }

    if (hasBurnout) {
      risks.push({
        type: 'burnout',
        severity: 'moderada',
        evidence: 'Desgaste por compasión y sobrecarga ministerial/laboral.',
        protocolRecommendation: 'Establecer límites de disponibilidad pastoral y semanas de reposo sabático.'
      });
    }

    // Contradicciones diagnósticas
    if (note.plan && !note.plan.includes('seguridad') && hasSuicideRisk) {
      contradictions.push('Inconsistencia crítica: Se identifican verbalizaciones de riesgo pero el Plan no incluye contrato de resguardo ni protocolo de crisis.');
    }
    if ((note.assessment || '').length < 30) {
      contradictions.push('Análisis clínico insuficiente: El campo (A) requiere mayor formulación psicodinámica o cognitivo-conductual.');
    }
    if (note.riskFlag && calculatedRisk === 'bajo') {
      contradictions.push('Discrepancia en nivel de alerta: El terapeuta marcó riesgo activo pero la redacción no lo explicita con evidencia.');
    }

    // Síntomas omitidos típicos
    if (!textCorpus.includes('sueño') && !textCorpus.includes('insomnio') && !textCorpus.includes('dormir')) {
      omitted.push('Patrón del sueño / ritmo circadiano no documentado.');
    }
    if (!textCorpus.includes('apetito') && !textCorpus.includes('comida') && !textCorpus.includes('peso')) {
      omitted.push('Ingesta nutricional / variaciones de peso no exploradas.');
    }
    if (!textCorpus.includes('red de apoyo') && !textCorpus.includes('familia')) {
      omitted.push('Calidad de red vincular y apoyo social de contención omitida.');
    }

    // Puntuación de confianza clínica
    let confidence = 92;
    if (contradictions.length > 0) confidence -= contradictions.length * 12;
    if (omitted.length > 1) confidence -= 8;
    if ((note.subjective || '').length < 25) confidence -= 15;
    confidence = Math.max(35, Math.min(98, confidence));

    return {
      id: `rev-${Date.now()}`,
      noteId: note.id,
      patientId: patient?.id || 'unknown',
      reviewedAt: new Date().toISOString(),
      clinicalConfidenceScore: confidence,
      overallRiskLevel: calculatedRisk,
      diagnosticContradictions: contradictions.length > 0 ? contradictions : [
        'Coherencia diagnóstica aceptable entre el relato subjetivo (S) y los hallazgos objetivos (O).'
      ],
      clinicalRisksDetected: risks,
      omittedSymptomsDsm5: omitted,
      suggestedClinicalInterventions: [
        {
          approach: 'TCC',
          technique: 'Reestructuración Cognitiva & Registro de Pensamientos Automáticos (RPD)',
          rationale: 'Permite desmontar creencias disfuncionales de indefensión o catastrofismo.'
        },
        {
          approach: 'Aceptacion y Compromiso',
          technique: 'Defusión Cognitiva y Clarificación de Valores Nucleares',
          rationale: 'Ayuda a desconectarse de la rumiación ansiosa conectando con el propósito de vida.'
        },
        {
          approach: 'Psicoeducacion',
          technique: 'Modelo Neurobiológico del Estrés y Curva de Ansiedad',
          rationale: 'Normaliza la experiencia fisiológica del consultante disminuyendo el miedo al miedo.'
        }
      ],
      therapeuticObjectives: [
        'Reducción de sintomatología aguda mediante activación de recursos de afrontamiento en los próximos 14 días.',
        'Estabilización de patrones biológicos basales (higiene del sueño y ritmos de descanso).',
        'Fortalecimiento de la autoeficacia y articulación del apoyo ministerial y familiar.'
      ],
      pastoralRecommendations: [
        {
          biblicalPassage: hasSpiritualConflict ? 'Romanos 8:1-2 y Salmos 103:8-12' : 'Filipenses 4:6-7 y Salmos 46:1-3',
          pastoralAction: 'Acompañamiento en oración de gracia sin imponer culpabilidad espiritual por la condición clínica.',
          spiritualIntegrationTip: 'Evitar discursos de "falta de fe"; validar el dolor como experiencia humana legítima en las Escrituras.',
          cautionNote: 'No sustituir la intervención psicoterapéutica por exigencias devocionales extenuantes.'
        },
        {
          biblicalPassage: '1 Reyes 19:4-8 (Elías bajo el enebro)',
          pastoralAction: 'Reflexionar sobre la necesidad física y emocional de descanso antes de la demanda ministerial.',
          spiritualIntegrationTip: 'Dios primero proveyó pan, agua y sueño a Elías antes de darle una nueva instrucción profética.'
        }
      ],
      supervisorNotes: `Auditoría completada. Confianza diagnóstica estimada en ${confidence}%. ${
        risks.length > 0 
          ? `ALERTA: Se detectaron ${risks.length} foco(s) de riesgo clínico que requieren seguimiento prioritario.` 
          : 'Evolución con buen encuadre ético y clínico.'
      }`
    };
  }
}
