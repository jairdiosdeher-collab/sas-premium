import { Patient, Appointment, SoapNote, StripeInvoice } from '../types';

export class ExportService {
  /**
   * Convierte un arreglo de pacientes a formato CSV estructurado.
   */
  public static exportPatientsToCsv(patients: Patient[]): void {
    const headers = [
      'ID',
      'Codigo Expediente',
      'Nombre Completo',
      'Edad',
      'Genero',
      'Telefono',
      'Email',
      'Estado Civil',
      'Ocupacion',
      'Fecha Ingreso',
      'Estado',
      'Nivel Riesgo',
      'Etapa Pipeline',
      'Motivo Consulta',
      'Diagnostico Clinico'
    ];

    const rows = patients.map(p => [
      p.id,
      p.code,
      `"${p.fullName.replace(/"/g, '""')}"`,
      p.age,
      p.gender,
      p.phone,
      p.email,
      p.maritalStatus,
      `"${p.occupation.replace(/"/g, '""')}"`,
      p.admissionDate,
      p.status,
      p.riskLevel,
      p.pipelineStage,
      `"${p.primaryReason.replace(/"/g, '""')}"`,
      `"${(p.clinicalDiagnosis || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    this.downloadFile(csvContent, `PastoralMente_Pacientes_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
  }

  /**
   * Exporta citas de consejería a CSV.
   */
  public static exportAppointmentsToCsv(appointments: Appointment[]): void {
    const headers = ['ID', 'Paciente', 'Fecha y Hora', 'Duracion (Min)', 'Tipo', 'Modalidad', 'Estado', 'Recordatorio Enviado'];
    const rows = appointments.map(a => [
      a.id,
      `"${a.patientName.replace(/"/g, '""')}"`,
      a.dateTime,
      a.durationMinutes,
      a.type,
      a.modality,
      a.status,
      a.reminderSent ? 'Si' : 'No'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    this.downloadFile(csvContent, `PastoralMente_Citas_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
  }

  /**
   * Exporta historial de facturas a CSV.
   */
  public static exportBillingToCsv(invoices: StripeInvoice[]): void {
    const headers = ['ID Factura', 'Fecha', 'Plan', 'Monto (USD)', 'Estado', 'Tarjeta'];
    const rows = invoices.map(i => [
      i.id,
      i.date,
      i.planName,
      i.amount,
      i.status,
      `Terminada en ${i.cardLast4}`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    this.downloadFile(csvContent, `PastoralMente_Facturas_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
  }

  private static downloadFile(content: string, fileName: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }
}
