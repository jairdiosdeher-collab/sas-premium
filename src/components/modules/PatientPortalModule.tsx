import React, { useState, useRef } from 'react';
import { 
  Lock, 
  Send, 
  CheckSquare, 
  Calendar, 
  FileText, 
  Heart, 
  Download, 
  ShieldCheck, 
  PenTool, 
  MessageSquare, 
  ExternalLink, 
  Sparkles, 
  User, 
  Clock, 
  CheckCircle,
  Copy,
  Check
} from 'lucide-react';
import { Patient, Appointment, AssessmentResult, Devotional, PatientPortalMessage } from '../../types';

interface PatientPortalModuleProps {
  patients: Patient[];
  appointments: Appointment[];
  assessments: AssessmentResult[];
  devotionals?: Devotional[];
}

export const PatientPortalModule: React.FC<PatientPortalModuleProps> = ({
  patients,
  appointments,
  assessments,
  devotionals = [],
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [portalToken, setPortalToken] = useState<string>('sec-tok-2026-pm');
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'tareas' | 'citas' | 'escalas' | 'devocionales' | 'consentimiento' | 'mensajes'>('tareas');

  // Interactive signature canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [consentSignedDate, setConsentSignedDate] = useState<string | null>(null);

  // Portal tasks state
  const [tasks, setTasks] = useState<{ id: string; title: string; completed: boolean; dueDate: string }[]>([
    { id: '1', title: 'Registro diario de pensamientos automáticos en momentos de ansiedad', completed: false, dueDate: 'Viernes' },
    { id: '2', title: 'Ejercicio de respiración diafragmática 4-7-8 antes de dormir (10 min)', completed: true, dueDate: 'Diario' },
    { id: '3', title: 'Lectura meditada del Salmo 46 y oración de entrega matutina', completed: false, dueDate: 'Mañana' },
    { id: '4', title: 'Caminata reflexiva de 20 minutos al aire libre', completed: false, dueDate: 'Sábado' }
  ]);

  // Secure patient-therapist messages state
  const [messages, setMessages] = useState<PatientPortalMessage[]>([
    {
      id: 'm1',
      patientId: selectedPatientId,
      sender: 'terapeuta',
      senderName: 'Lic. David Morales (Terapeuta)',
      timestamp: 'Ayer, 16:30',
      content: 'Estimado consultante, te adjunté las tareas de reestructuración para esta semana y el devocional sobre la paz de Dios. Recuerda que cualquier inquietud puedes escribir por este canal.',
      read: true
    },
    {
      id: 'm2',
      patientId: selectedPatientId,
      sender: 'paciente',
      senderName: 'Consultante',
      timestamp: 'Hoy, 09:15',
      content: 'Muchas gracias Licenciado. He realizado los ejercicios de respiración y me han ayudado con el sueño.',
      read: true
    }
  ]);
  const [newMessageText, setNewMessageText] = useState('');

  const currentPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];
  const patientAppointments = appointments.filter((a) => a.patientId === currentPatient?.id);
  const patientAssessments = assessments.filter((a) => a.patientId === currentPatient?.id);

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setConsentSignedDate(null);
  };

  const saveSignature = () => {
    setConsentSignedDate(new Date().toLocaleDateString('es-ES', { dateStyle: 'long' }));
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleSendMessage = () => {
    if (!newMessageText.trim()) return;
    const msg: PatientPortalMessage = {
      id: `msg-${Date.now()}`,
      patientId: currentPatient?.id || 'p-1',
      sender: 'paciente',
      senderName: currentPatient?.fullName || 'Consultante',
      timestamp: 'Ahora mismo',
      content: newMessageText.trim(),
      read: true
    };
    setMessages(prev => [...prev, msg]);
    setNewMessageText('');
  };

  const portalPrivateUrl = `${window.location.origin}/?portalToken=${portalToken}&exp=${currentPatient?.code}`;

  const copyPortalLink = () => {
    navigator.clipboard.writeText(portalPrivateUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Selector for Professional View */}
      <div className="p-5 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-800/40 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">Portal Privado del Paciente</h2>
              <span className="px-2.5 py-0.5 text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full">
                Token Encriptado
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Vista interactiva segura de acceso directo para consultantes. Cifrado extremo a extremo.
            </p>
          </div>
        </div>

        {/* Patient switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName} ({p.code})
              </option>
            ))}
          </select>

          <button
            onClick={copyPortalLink}
            className="px-3.5 py-2 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/40 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar Enlace Seguro'}</span>
          </button>
        </div>
      </div>

      {/* Patient Public Facing Preview Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Portal Header */}
        <div className="p-6 bg-slate-950/80 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-cyan-500/20">
              {currentPatient?.fullName.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Hola, {currentPatient?.fullName}</h3>
              <p className="text-xs text-slate-400">
                Expediente: <span className="font-mono text-cyan-300">{currentPatient?.code}</span> &bull; Plan de Acompañamiento Activo
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            {[
              { id: 'tareas', label: 'Tareas', icon: CheckSquare },
              { id: 'citas', label: 'Citas', icon: Calendar },
              { id: 'escalas', label: 'Mis Resultados', icon: FileText },
              { id: 'devocionales', label: 'Devocional', icon: Heart },
              { id: 'consentimiento', label: 'Consentimiento', icon: PenTool },
              { id: 'mensajes', label: 'Mensajería', icon: MessageSquare },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 transition ${
                    activeTab === tab.id
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Contents */}
        <div className="p-6 min-h-[380px]">
          {/* TAREAS */}
          {activeTab === 'tareas' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <h4 className="text-sm font-bold text-white">Mis Tareas Terapéuticas y Ejercicios</h4>
                <p className="text-xs text-slate-400">
                  Marca las actividades realizadas para que tu terapeuta pueda ver tu progreso.
                </p>
              </div>

              <div className="space-y-2.5">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      task.completed
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                        task.completed ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-600'
                      }`}>
                        {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span className={`text-xs ${task.completed ? 'line-through opacity-70' : ''}`}>
                        {task.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono bg-slate-900 px-2 py-0.5 rounded-md">
                      {task.dueDate}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CITAS */}
          {activeTab === 'citas' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <h4 className="text-sm font-bold text-white">Mis Próximas Citas de Consejería</h4>
                <p className="text-xs text-slate-400">
                  Horarios confirmados y enlaces para sesiones virtuales o presenciales.
                </p>
              </div>

              {patientAppointments.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800 text-slate-500 text-xs">
                  No tienes citas agendadas por el momento. Tu consejero te asignará la próxima fecha.
                </div>
              ) : (
                <div className="space-y-3">
                  {patientAppointments.map((apt) => (
                    <div key={apt.id} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">
                            Sesión {apt.modality.toUpperCase()} ({apt.type})
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {new Date(apt.dateTime).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })} &bull; {apt.durationMinutes} min
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ESCALAS */}
          {activeTab === 'escalas' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <h4 className="text-sm font-bold text-white">Resultados de Evaluaciones Clínicas</h4>
                <p className="text-xs text-slate-400">
                  Histórico de escalas aplicadas y recomendaciones de cuidado personal.
                </p>
              </div>

              {patientAssessments.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800 text-slate-500 text-xs">
                  Aún no se han registrado evaluaciones en este expediente.
                </div>
              ) : (
                <div className="space-y-3">
                  {patientAssessments.map((a) => (
                    <div key={a.id} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-white">{a.title} ({a.type})</h5>
                        <span className="text-xs font-mono font-bold text-cyan-400">{a.score} / {a.maxScore}</span>
                      </div>
                      <p className="text-xs text-slate-300">{a.interpretation}</p>
                      <div className="p-2.5 bg-slate-900 rounded-lg text-[11px] text-purple-300 border border-purple-500/20">
                        <strong className="block text-purple-200">Consejo Pastoral:</strong>
                        {a.pastoralRecommendation}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DEVOCIONALES */}
          {activeTab === 'devocionales' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <h4 className="text-sm font-bold text-white">Material Devocional Personalizado</h4>
                <p className="text-xs text-slate-400">
                  Lecturas y oraciones recomendadas especialmente para tu momento vital.
                </p>
              </div>

              <div className="p-5 bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-indigo-500/30 rounded-2xl space-y-3">
                <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Devocional Semanal &bull; Filipenses 4:6-7</span>
                </div>
                <h5 className="text-base font-bold text-white font-serif">
                  "La Paz que Sobrepasa Todo Entendimiento"
                </h5>
                <blockquote className="p-3 bg-slate-900/80 rounded-xl text-xs text-slate-300 italic border-l-2 border-indigo-500">
                  "Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias. Y la paz de Dios guardará vuestros corazones."
                </blockquote>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Cuando la mente se llena de ruido e incertidumbre, la oración no es una exigencia ritual, sino un refugio seguro para vaciar la carga. Dios comprende tu fatiga física y emocional.
                </p>
                <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                  <span>Asignado por: Dirección Pastoral</span>
                  <button className="text-cyan-400 hover:underline flex items-center space-x-1">
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Guía en PDF</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CONSENTIMIENTO CON FIRMA CANVAS */}
          {activeTab === 'consentimiento' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <h4 className="text-sm font-bold text-white">Consentimiento Informado & Firma Digital</h4>
                <p className="text-xs text-slate-400">
                  Firma directamente en el recuadro inferior para validar la confidencialidad y términos del servicio.
                </p>
              </div>

              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-2 max-h-40 overflow-y-auto leading-relaxed">
                <p>
                  <strong>1. Objeto:</strong> Mediante el presente instrumento el consultante autoriza la prestación de servicios de consejería pastoral y acompañamiento psicológico ético.
                </p>
                <p>
                  <strong>2. Confidencialidad:</strong> Toda la información compartida es estrictamente reservada bajo secreto profesional, salvo en los supuestos de riesgo inminente para la vida propia o de terceros.
                </p>
                <p>
                  <strong>3. Integración Pastoral:</strong> El consultante consiente la aplicación respetuosa de principios bíblicos y apoyo espiritual no impositivo.
                </p>
              </div>

              {/* Canvas Pad */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Firma aquí con el cursor o pantalla táctil:</span>
                  <button
                    onClick={clearCanvas}
                    className="text-slate-500 hover:text-slate-300 text-[11px] underline"
                  >
                    Borrar firma
                  </button>
                </div>

                <div className="border border-cyan-500/40 rounded-xl bg-slate-950 p-2 flex justify-center">
                  <canvas
                    ref={canvasRef}
                    width={480}
                    height={140}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full max-w-md bg-slate-900/60 rounded-lg cursor-crosshair touch-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  {consentSignedDate ? (
                    <span className="flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold">
                      <CheckCircle className="w-4 h-4" />
                      <span>Consentimiento firmado el {consentSignedDate}</span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">Pendiente de firma</span>
                  )}
                </div>

                <button
                  onClick={saveSignature}
                  disabled={!hasSignature || !!consentSignedDate}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{consentSignedDate ? 'Firmado Correctamente' : 'Registrar Firma Legal'}</span>
                </button>
              </div>
            </div>
          )}

          {/* MENSAJERÍA SEGURA */}
          {activeTab === 'mensajes' && (
            <div className="space-y-4 max-w-2xl flex flex-col h-[380px]">
              <div>
                <h4 className="text-sm font-bold text-white">Canal de Comunicación Seguro</h4>
                <p className="text-xs text-slate-400">
                  Mensajería directa y privada con tu profesional a cargo.
                </p>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.sender === 'paciente' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                        m.sender === 'paciente'
                          ? 'bg-cyan-600 text-white rounded-br-none'
                          : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                      }`}
                    >
                      <span className="block text-[10px] font-bold opacity-75 mb-1">{m.senderName}</span>
                      <p>{m.content}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 px-1">{m.timestamp}</span>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Escribe tu mensaje seguro para el profesional..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessageText.trim()}
                  className="p-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
