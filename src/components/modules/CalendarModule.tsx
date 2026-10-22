import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  X, 
  User, 
  Send, 
  Copy, 
  ExternalLink,
  CalendarCheck
} from 'lucide-react';
import { Appointment, Patient, UserProfile } from '../../types';

interface CalendarModuleProps {
  user: UserProfile;
  patients: Patient[];
  appointments: Appointment[];
  onAddAppointment: (apt: Appointment) => void;
  onUpdateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  onMarkReminderSent: (id: string) => void;
}

export const CalendarModule: React.FC<CalendarModuleProps> = ({
  user,
  patients,
  appointments,
  onAddAppointment,
  onUpdateAppointmentStatus,
  onMarkReminderSent,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAptForReminder, setSelectedAptForReminder] = useState<Appointment | null>(null);
  const [copied, setCopied] = useState(false);

  // Form state
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [dateTime, setDateTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(50);
  const [type, setType] = useState<'presencial' | 'virtual'>('presencial');
  const [modality, setModality] = useState<'individual' | 'pareja' | 'familiar' | 'pastoral'>('individual');
  const [notes, setNotes] = useState('');

  const handleCreateApt = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient || !dateTime) return;

    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      patientId: selectedPatientId,
      patientName: patient.fullName,
      dateTime,
      durationMinutes,
      type,
      modality,
      status: 'programada',
      notes,
      reminderSent: false,
    };

    onAddAppointment(newApt);
    setIsModalOpen(false);
    setNotes('');
  };

  const getWhatsAppMessage = (apt: Appointment) => {
    const dateObj = new Date(apt.dateTime);
    const dateStr = dateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    const timeStr = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    return `Paz y gracia, estimado(a) ${apt.patientName}.

Le saludamos del ministerio de consejería y cuidado pastoral (${user.institution}).
Le confirmamos con aprecio su sesión de consejería pastoral programada para el día ${dateStr} a las ${timeStr} (${apt.type}).

Si necesita reagendar con anticipación, por favor responda a este mensaje. Oramos para que este tiempo sea de profunda edificación y consuelo en Cristo.

Atentamente,
${user.name} - ${user.title}`;
  };

  const handleCopyReminder = (apt: Appointment) => {
    const msg = getWhatsAppMessage(apt);
    navigator.clipboard.writeText(msg);
    setCopied(true);
    onMarkReminderSent(apt.id);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleOpenWhatsApp = (apt: Appointment) => {
    const patient = patients.find(p => p.id === apt.patientId);
    const phone = patient?.phone.replace(/[^0-9]/g, '') || '';
    const msg = encodeURIComponent(getWhatsAppMessage(apt));
    onMarkReminderSent(apt.id);
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-amber-400" />
            <span>Agenda de Citas & Recordatorios WhatsApp</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Reduce ausencias y fortalece el compromiso pastoral con recordatorios automáticos y cálidos.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Agendar Nueva Sesión</span>
        </button>
      </div>

      {/* Appointments List */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
          <span className="font-bold text-white uppercase tracking-wider">
            Sesiones Programadas ({appointments.length})
          </span>
          <span className="text-slate-400">
            Horario: Lunes a Sábado • Sesiones confidenciales
          </span>
        </div>

        <div className="space-y-3">
          {appointments.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">No hay citas registradas en la agenda.</p>
          ) : (
            appointments.map((apt) => {
              const dateObj = new Date(apt.dateTime);
              const dateStr = dateObj.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
              const timeStr = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
              const patient = patients.find(p => p.id === apt.patientId);

              return (
                <div
                  key={apt.id}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors text-xs"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center shrink-0">
                      <span className="block text-[10px] uppercase font-bold text-amber-400">{dateStr}</span>
                      <span className="block text-sm font-extrabold text-white">{timeStr}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{apt.patientName}</span>
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {apt.modality}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                          {apt.type} ({apt.durationMinutes} min)
                        </span>
                      </div>
                      {apt.notes && (
                        <p className="text-slate-400 text-[11px] mt-1 line-clamp-1 italic">
                          "{apt.notes}"
                        </p>
                      )}
                      <p className="text-slate-500 text-[10px] mt-0.5">
                        Teléfono: {patient?.phone || 'No registrado'}
                      </p>
                    </div>
                  </div>

                  {/* Actions & WhatsApp buttons */}
                  <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <button
                      onClick={() => setSelectedAptForReminder(apt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        apt.reminderSent
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{apt.reminderSent ? 'Recordatorio Enviado' : 'Enviar WhatsApp'}</span>
                    </button>

                    <select
                      value={apt.status}
                      onChange={(e) => onUpdateAppointmentStatus(apt.id, e.target.value as any)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300 font-medium cursor-pointer"
                    >
                      <option value="programada">Programada</option>
                      <option value="completada">Completada</option>
                      <option value="cancelada">Cancelada</option>
                      <option value="no_asistio">No Asistió</option>
                    </select>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Reminder Preview Modal */}
      {selectedAptForReminder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <span>Mensaje Automático de Recordatorio</span>
              </h3>
              <button
                onClick={() => setSelectedAptForReminder(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
              {getWhatsAppMessage(selectedAptForReminder)}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => handleCopyReminder(selectedAptForReminder)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? '¡Copiado!' : 'Copiar Texto'}</span>
              </button>

              <button
                onClick={() => handleOpenWhatsApp(selectedAptForReminder)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Abrir en WhatsApp Web / App</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-amber-400" />
                <span>Programar Nueva Sesión de Consejería</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateApt} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Consultante / Paciente *</label>
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
                <label className="block text-slate-300 font-semibold mb-1">Fecha y Hora *</label>
                <input
                  type="datetime-local"
                  required
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Modalidad</label>
                  <select
                    value={modality}
                    onChange={(e) => setModality(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="individual">Individual</option>
                    <option value="pareja">Pareja / Matrimonio</option>
                    <option value="familiar">Familiar</option>
                    <option value="pastoral">Dirección Pastoral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tipo de Atención</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="presencial">Presencial (Templo/Clínica)</option>
                    <option value="virtual">Virtual (Videollamada)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Notas de Preparación</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Revisión de pacto matrimonial..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                >
                  Confirmar Sesión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
