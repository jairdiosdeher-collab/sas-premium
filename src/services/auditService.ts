import { AuditLog } from '../types';

const AUDIT_STORAGE_KEY = 'pm_audit_logs';

export class AuditService {
  public static getLogs(): AuditLog[] {
    try {
      const saved = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error reading audit logs:', e);
    }
    return [
      {
        id: 'aud-init-1',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        userId: 'usr-admin-1',
        userName: 'Dr. David Benítez',
        action: 'LOGIN',
        targetResource: 'Sistema PastoralMente AI',
        details: 'Inicio de sesión exitoso con 2FA verificado.',
      },
      {
        id: 'aud-init-2',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        userId: 'usr-admin-1',
        userName: 'Dr. David Benítez',
        action: 'VER_EXPEDIENTE',
        targetResource: 'EXP-2026-001 (Carlos Méndez)',
        details: 'Revisión de notas SOAP-S y escala de Burnout.',
      }
    ];
  }

  public static log(
    action: AuditLog['action'],
    targetResource: string,
    details: string,
    userName: string = 'Usuario Activo',
    userId: string = 'usr-current'
  ): AuditLog {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      userId,
      userName,
      action,
      targetResource,
      details,
    };

    try {
      const logs = this.getLogs();
      const updated = [newLog, ...logs.slice(0, 199)]; // Guardar los últimos 200 eventos
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Error saving audit log:', e);
    }

    return newLog;
  }

  public static clearLogs(): void {
    localStorage.removeItem(AUDIT_STORAGE_KEY);
  }
}
