/**
 * Voice Dictation Clinical Engine
 * Transcripción en tiempo real y sintetizador automático de notas SOAP-S
 */

import { VoiceClinicalDictation } from '../types';

export class VoiceDictationService {
  /**
   * Comprueba si el navegador tiene soporte nativo para Web Speech API
   */
  public static isSupported(): boolean {
    return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }

  /**
   * Crea una instancia de reconocimiento de voz configurada para español clínico
   */
  public static createRecognitionInstance(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ): any {
    if (!this.isSupported()) {
      return null;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-ES';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      onResult(finalTranscript || interimTranscript, !!finalTranscript);
    };

    recognition.onerror = (event: any) => {
      onError(event.error || 'Error en el reconocimiento de voz');
    };

    recognition.onend = () => {
      onEnd();
    };

    return recognition;
  }

  /**
   * Parsea un texto hablado desestructurado y genera una nota SOAP-S estructurada
   */
  public static parseClinicalSpeechToSoap(
    rawText: string,
    patientName?: string
  ): VoiceClinicalDictation {
    const text = rawText.trim();
    const lower = text.toLowerCase();

    // Detección heurística de secciones o términos clave
    const sentences = text.split(/(?<=[.!?])\s+/);

    const symptoms: string[] = [];
    const spiritualFactors: string[] = [];

    // Extracción de síntomas
    const symptomKeywords = [
      'insomnio', 'ansiedad', 'tristeza', 'angustia', 'taquicardia', 'ataque de pánico',
      'culpa', 'desesperanza', 'llanto', 'falta de apetito', 'fatiga', 'irritabilidad',
      'pensamientos intrusivos', 'aislamiento', 'pesadillas', 'estrés'
    ];

    symptomKeywords.forEach(kw => {
      if (lower.includes(kw)) {
        symptoms.push(kw.charAt(0).toUpperCase() + kw.slice(1));
      }
    });

    // Extracción de factores espirituales
    const spiritualKeywords = [
      'oración', 'iglesia', 'dios', 'culpa espiritual', 'falta de fe', 'pastor',
      'ministerio', 'ayuno', 'biblia', 'perdón', 'duda espiritual', 'comunión'
    ];

    spiritualKeywords.forEach(sk => {
      if (lower.includes(sk)) {
        spiritualFactors.push(sk.charAt(0).toUpperCase() + sk.slice(1));
      }
    });

    // Segmentación en S-O-A-P-S
    let subjective = '';
    let objective = '';
    let assessment = '';
    let plan = '';
    let spiritualDimension = '';

    if (text.length > 0) {
      subjective = `Consultante ${patientName ? patientName + ' ' : ''}refiere en sesión: "${text.substring(0, 320)}${text.length > 320 ? '...' : ''}"`;
      
      objective = `Paciente lúcido, orientado en las tres esferas. Se observa afecto concordante con relato verbal, contacto visual adecuado. ${
        symptoms.length > 0 ? `Se aprecian manifestaciones somáticas y emocionales compatibles con: ${symptoms.join(', ')}.` : 'Sin alteraciones psicomotoras agudas evidentes.'
      }`;

      assessment = `Cuadro clínico caracterizado por sintomatología de ${
        symptoms.length > 0 ? symptoms.slice(0, 3).join(', ') : 'malestar adaptativo'
      }. Presenta recursos yoicos preservados con necesidad de reestructuración cognitiva y soporte vincular. ${
        spiritualFactors.length > 0 ? `Dimensión espiritual activa con factores de: ${spiritualFactors.join(', ')}.` : ''
      }`;

      plan = `1. Registro semanal de pensamientos automáticos disfuncionales.\n2. Entrenamiento en respiración diafragmática y pausas de autorregulación.\n3. Psicoeducación sobre la curva de activación ansiosa y hábitos de descanso.`;

      spiritualDimension = spiritualFactors.length > 0
        ? `Acompañamiento pastoral centrado en la gracia y el consuelo divino (Filipenses 4:6-7, Salmos 23). Intercesión pastoral por descanso mental y paz espiritual.`
        : `Fomentar disciplinas espirituales amables: lectura devocional reflexiva y oración contemplativa sin sobrecarga de exigencias.`;
    }

    return {
      id: `vcd-${Date.now()}`,
      timestamp: new Date().toISOString(),
      audioDurationSeconds: Math.max(12, Math.round(text.split(' ').length * 0.4)),
      rawTranscript: text,
      parsedSoap: {
        subjective,
        objective,
        assessment,
        plan,
        spiritualDimension
      },
      identifiedSymptoms: symptoms.length > 0 ? symptoms : ['Estrés general', 'Preocupación'],
      spiritualFactors: spiritualFactors.length > 0 ? spiritualFactors : ['Búsqueda de dirección espiritual'],
      clinicalSummary: `Sesión clínica centrada en el abordaje de ${symptoms.slice(0, 3).join(', ') || 'motivo de consulta principal'}.`,
      interventionPlan: `Enfoque cognitivo-conductual integrador y apoyo pastoral continuo.`
    };
  }
}
