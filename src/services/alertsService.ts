/**
 * Smart Clinical & Pastoral Alerts Engine
 * Monitorea riesgos suicidas, escalas severas, burnout pastoral, abandono y ausencias.
 */

import { Patient, SoapNote, AssessmentResult, Appointment, SmartAlert } from '../types';

export class AlertsService {
  /**
   * Genera todas las alertas inteligentes en tiempo real analizando la base clínica.
   */
  public static computeSmartAlerts(
    patients: Patient[],
    notes: SoapNote[],
    assessments: AssessmentResult[],
    appointments: Appointment[]
  ): SmartAlert[] {
    const alerts: SmartAlert[] = [];
    const now = new Date();

    patients.forEach((patient) => {
      // 1. Riesgo Suicida & Crisis Activa
      const isUrgentRisk = patient.riskLevel === 'urgente' || patient.riskLevel === 'alto' || patient.status === 'en_crisis';
      
      // Chequeo en notas SOAP
      const patientNotes = notes.filter((n) => n.patientId === patient.id);
      const latestNote = patientNotes[0];
      const hasRecentSoapRisk = latestNote?.riskFlag || (latestNote && /suicid|morir|autolesi[oó]n|sin salida/i.test(`${latestNote.subjective} ${latestNote.assessment}`));

      // Chequeo en evaluaciones PHQ-9 (pregunta 9 suele ser ideación suicida o score >= 20)
      const patientAssessments = assessments.filter((a) => a.patientId === patient.id);
      const latestPhq9 = patientAssessments.find((a) => a.type === 'PHQ9');
      const latestGad7 = patientAssessments.find((a) => a.type === 'GAD7');
      const latestMaslach = patientAssessments.find((a) => a.type === 'BURNOUT_MBI');

      // 1. Alerta de Riesgo Suicida
      if (isUrgentRisk || hasRecentSoapRisk) {
        alerts.push({
          id: `alert-suicide-${patient.id}`,
          patientId: patient.id,
          patientName: patient.fullName,
          patientCode: patient.code,
          type: 'riesgo_suicida',
          severity: 'critica',
          detectedAt: latestNote?.date || patient.admissionDate,
          summary: `Riesgo Suicida / Crisis Activa Detectada`,
          triggerDetail: hasRecentSoapRisk 
            ? `Nota de evolución reporta indicadores críticos o bandera de riesgo activada.` 
            : `Expediente clasificado con nivel de riesgo ${patient.riskLevel.toUpperCase()}.`,
          suggestedAction: 'Activar protocolo de rescate vital, contactar familiar de emergencia y aplicar C-SSRS.',
          status: 'activa'
        });
      }

      // 2. Alerta PHQ-9 Severo (>= 15 o >= 20)
      if (latestPhq9 && latestPhq9.score >= 15) {
        alerts.push({
          id: `alert-phq9-${latestPhq9.id}`,
          patientId: patient.id,
          patientName: patient.fullName,
          patientCode: patient.code,
          type: 'phq9_severo',
          severity: latestPhq9.score >= 20 ? 'critica' : 'alta',
          detectedAt: latestPhq9.date,
          summary: `Depresión Severa (PHQ-9: ${latestPhq9.score}/27)`,
          triggerDetail: `Puntuación de ${latestPhq9.score} clasificada en rango ${latestPhq9.severity}.`,
          suggestedAction: 'Programar sesión extraordinaria de contención y evaluar interconsulta psiquiátrica.',
          status: 'activa'
        });
      }

      // 3. Alerta GAD-7 Severo (>= 15)
      if (latestGad7 && latestGad7.score >= 15) {
        alerts.push({
          id: `alert-gad7-${latestGad7.id}`,
          patientId: patient.id,
          patientName: patient.fullName,
          patientCode: patient.code,
          type: 'gad7_severo',
          severity: 'alta',
          detectedAt: latestGad7.date,
          summary: `Ansiedad Severa / Crisis de Angustia (GAD-7: ${latestGad7.score}/21)`,
          triggerDetail: `Puntaje clínico de ${latestGad7.score} puntos en la escala de ansiedad generalizada.`,
          suggestedAction: 'Reforzar técnicas de desactivación fisiológica y desescalada emocional inmediata.',
          status: 'activa'
        });
      }

      // 4. Alerta Burnout Pastoral
      if (latestMaslach && (latestMaslach.score >= 27 || latestMaslach.severity.toLowerCase().includes('alto'))) {
        alerts.push({
          id: `alert-burnout-${latestMaslach.id}`,
          patientId: patient.id,
          patientName: patient.fullName,
          patientCode: patient.code,
          type: 'burnout_pastoral',
          severity: 'alta',
          detectedAt: latestMaslach.date,
          summary: `Agotamiento Emocional Severo / Burnout Pastoral`,
          triggerDetail: `Escala MBI indica fatiga ministerial profunda y despersonalización.`,
          suggestedAction: 'Prescribir retiro sabático de reposo y suspender temporalmente cargas de consejería masiva.',
          status: 'activa'
        });
      }

      // 5. Alerta Paciente sin Seguimiento (> 21 días)
      const lastContactDateStr = latestNote?.date || patient.admissionDate;
      const lastContactDate = new Date(lastContactDateStr);
      const diffDays = Math.floor((now.getTime() - lastContactDate.getTime()) / (1000 * 3600 * 24));

      if (diffDays >= 21 && patient.status !== 'alta') {
        alerts.push({
          id: `alert-followup-${patient.id}`,
          patientId: patient.id,
          patientName: patient.fullName,
          patientCode: patient.code,
          type: 'sin_seguimiento',
          severity: diffDays >= 35 ? 'alta' : 'media',
          detectedAt: lastContactDateStr,
          summary: `Sin Seguimiento hace ${diffDays} días`,
          triggerDetail: `Último registro clínico el ${lastContactDateStr}. Estado actual: ${patient.status}.`,
          suggestedAction: 'Enviar mensaje de WhatsApp o llamada pastoral para conocer estado de ánimo y reanudar proceso.',
          status: 'activa'
        });
      }

      // 6. Inasistencias Repetidas
      const patientApts = appointments.filter((a) => a.patientId === patient.id);
      const noShows = patientApts.filter((a) => a.status === 'no_asistio');
      if (noShows.length >= 2) {
        alerts.push({
          id: `alert-noshow-${patient.id}`,
          patientId: patient.id,
          patientName: patient.fullName,
          patientCode: patient.code,
          type: 'inasistencias',
          severity: 'media',
          detectedAt: noShows[0]?.dateTime || now.toISOString(),
          summary: `Inasistencias Reiteradas (${noShows.length} citas perdidas)`,
          triggerDetail: `El consultante no se presentó a ${noShows.length} sesiones programadas consecutivas.`,
          suggestedAction: 'Verificar posibles resistencias, barreras socioeconómicas o recaída depresiva.',
          status: 'activa'
        });
      }
    });

    // Ordenar: críticas primero, luego altas, luego medias
    const severityOrder: Record<string, number> = { critica: 0, alta: 1, media: 2 };
    return alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  }
}
