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

  /**
   * Exporta un informe clínico consolidado a formato compatible con Microsoft Word (.doc/.docx)
   * con membrete institucional, código de caso y bloque de firma profesional.
   */
  public static exportToWordDoc(params: {
    title: string;
    patient: Patient;
    institution?: string;
    therapistName?: string;
    therapistTitle?: string;
    licenseNumber?: string;
    bodyHtml: string;
    caseCode?: string;
  }): void {
    const { title, patient, institution = 'PastoralMente AI - Centro Clínico Pastoral', therapistName = 'Profesional Responsable', therapistTitle = 'Especialista en Psicología y Consejería Pastoral', licenseNumber = 'MP-2026-PAST', bodyHtml, caseCode = patient.code } = params;
    
    const wordTemplate = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${title}</title>
  <style>
    body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.5; color: #1a1a1a; margin: 30px; }
    .header { border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px; }
    .header h1 { font-size: 16pt; color: #1e3a8a; margin: 0; }
    .header p { font-size: 9pt; color: #64748b; margin: 2px 0 0 0; }
    .patient-box { background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; margin-bottom: 20px; border-radius: 4px; }
    .patient-box table { width: 100%; border-collapse: collapse; }
    .patient-box td { font-size: 10pt; padding: 4px 8px; }
    .section-title { font-size: 12pt; font-weight: bold; color: #1e3a8a; border-bottom: 1px solid #e2e8f0; margin-top: 18px; margin-bottom: 8px; padding-bottom: 3px; }
    .signature-area { margin-top: 50px; padding-top: 20px; border-top: 1px dashed #94a3b8; width: 320px; }
    .signature-name { font-weight: bold; font-size: 11pt; color: #0f172a; }
    .signature-role { font-size: 9.5pt; color: #475569; }
    .footer { margin-top: 40px; font-size: 8pt; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${institution}</h1>
    <p>EXPEDIENTE CLÍNICO INTEGRAL &bull; CONFIDENCIALIDAD ÉTICA (HIPAA / LEY DE SALUD MENTAL)</p>
  </div>

  <div class="patient-box">
    <table>
      <tr>
        <td><strong>Consultante:</strong> ${patient.fullName}</td>
        <td><strong>Código de Caso:</strong> ${caseCode}</td>
      </tr>
      <tr>
        <td><strong>Edad / Género:</strong> ${patient.age} años | ${patient.gender}</td>
        <td><strong>Fecha de Emisión:</strong> ${new Date().toLocaleDateString('es-ES', { dateStyle: 'long' })}</td>
      </tr>
      <tr>
        <td><strong>Diagnóstico Clínico:</strong> ${patient.clinicalDiagnosis || 'En proceso diagnóstico'}</td>
        <td><strong>Nivel de Riesgo:</strong> ${patient.riskLevel.toUpperCase()}</td>
      </tr>
    </table>
  </div>

  <div class="content">
    ${bodyHtml}
  </div>

  <div class="signature-area">
    <div class="signature-name">${therapistName}</div>
    <div class="signature-role">${therapistTitle}</div>
    <div class="signature-role">Registro Profesional / Licencia: ${licenseNumber}</div>
    <div class="signature-role">Firma Digital Verificada &bull; PastoralMente Crypto Ledger</div>
  </div>

  <div class="footer">
    Documento emitido electrónicamente con validez clínica y pastoral. Prohibida su reproducción o divulgación sin el consentimiento expreso del titular.
  </div>
</body>
</html>`;

    this.downloadFile(wordTemplate, `${patient.code}_${title.replace(/\s+/g, '_')}.doc`, 'application/msword;charset=utf-8;');
  }

  /**
   * Exporta a Excel (.csv formateado con delimitador y BOM UTF-8)
   */
  public static exportToExcelCsv(fileName: string, headers: string[], rows: (string | number)[][]): void {
    const bom = '\uFEFF';
    const csvRows = [headers.map(h => `"${h}"`).join(';')];
    rows.forEach(r => {
      csvRows.push(r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(';'));
    });
    this.downloadFile(bom + csvRows.join('\r\n'), `${fileName}.csv`, 'text/csv;charset=utf-8;');
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

