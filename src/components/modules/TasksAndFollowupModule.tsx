import React, { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Calendar, 
  Clock, 
  Target, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Filter, 
  Trash2, 
  Sparkles,
  TrendingUp,
  X
} from 'lucide-react';
import { Patient, TaskItem } from '../../types';
import { useToast } from '../../context/ToastContext';

interface TasksAndFollowupModuleProps {
  patients: Patient[];
}

export const TasksAndFollowupModule: React.FC<TasksAndFollowupModuleProps> = ({ patients }) => {
  const { showSuccess, showInfo } = useToast();
  const [filterType, setFilterType] = useState<'todas' | 'pendientes' | 'completadas' | 'urgentes'>('todas');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('todos');
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  // Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskItem['priority']>('media');
  const [newTaskDue, setNewTaskDue] = useState('2026-10-25');
  const [newTaskPatientId, setNewTaskPatientId] = useState<string>(patients[0]?.id || '');

  // Tasks state
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: 'task-1',
      title: 'Monitoreo de ideación suicida y contrato de resguardo vital',
      description: 'Llamada telefónica a familiar de contención a las 48 horas post-sesión.',
      dueDate: '2026-10-23',
      priority: 'urgente',
      completed: false,
      patientId: patients[0]?.id,
      createdAt: '2026-10-21'
    },
    {
      id: 'task-2',
      title: 'Verificar entrega de registro de pensamientos automáticos (RPD)',
      description: 'Comprobar si el consultante completó 3 situaciones de activación ansiosa.',
      dueDate: '2026-10-24',
      priority: 'alta',
      completed: true,
      patientId: patients[0]?.id,
      createdAt: '2026-10-20'
    },
    {
      id: 'task-3',
      title: 'Revisión de interconsulta con psiquiatría',
      description: 'Evaluar respuesta terapéutica a ajuste farmacológico de ISRS.',
      dueDate: '2026-10-26',
      priority: 'media',
      completed: false,
      patientId: patients[1]?.id || patients[0]?.id,
      createdAt: '2026-10-19'
    },
    {
      id: 'task-4',
      title: 'Acompañamiento pastoral: Visita de oración y consuelo',
      description: 'Coordinar con el ministerio de intercesión visita de aliento por duelo.',
      dueDate: '2026-10-27',
      priority: 'media',
      completed: false,
      patientId: patients[0]?.id,
      createdAt: '2026-10-22'
    }
  ]);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = !t.completed;
          if (updated) showSuccess('Tarea Completada', `"${t.title}" marcada como resuelta.`);
          return { ...t, completed: updated };
        }
        return t;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    showInfo('Tarea Eliminada', 'La tarea ha sido retirada del panel de seguimiento.');
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      priority: newTaskPriority,
      dueDate: newTaskDue,
      completed: false,
      patientId: newTaskPatientId,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setTasks((prev) => [newTask, ...prev]);
    setIsNewTaskOpen(false);
    setNewTaskTitle('');
    setNewTaskDesc('');
    showSuccess('Tarea Creada', `Compromiso de seguimiento registrado.`);
  };

  // Metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const complianceRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const urgentCount = tasks.filter((t) => t.priority === 'urgente' && !t.completed).length;

  const filteredTasks = tasks.filter((t) => {
    const matchesPatient = selectedPatientId === 'todos' || t.patientId === selectedPatientId;
    if (!matchesPatient) return false;

    if (filterType === 'pendientes') return !t.completed;
    if (filterType === 'completadas') return t.completed;
    if (filterType === 'urgentes') return t.priority === 'urgente' && !t.completed;
    return true;
  });

  const getPriorityBadge = (p: TaskItem['priority']) => {
    switch (p) {
      case 'urgente':
        return <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full animate-pulse">Urgente</span>;
      case 'alta':
        return <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">Alta</span>;
      case 'media':
        return <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-full">Media</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-slate-700 text-slate-300 rounded-full">Baja</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-teal-950/40 via-slate-900 to-indigo-950/40 border border-teal-800/40 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-xl">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">Sistema de Tareas & Seguimiento</h2>
              <span className="px-2.5 py-0.5 text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded-full">
                Indicador: {complianceRate}% Cumplimiento
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Seguimiento clínico de acuerdos, llamadas de resguardo, recordatorios y compromisos pastorales.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsNewTaskOpen(true)}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-teal-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Tarea de Seguimiento</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Total Compromisos</p>
            <h3 className="text-2xl font-bold text-white font-mono mt-0.5">{totalTasks}</h3>
          </div>
          <div className="p-2.5 bg-slate-800 text-slate-300 rounded-xl">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Completadas</p>
            <h3 className="text-2xl font-bold text-emerald-400 font-mono mt-0.5">{completedTasks}</h3>
          </div>
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Tasa de Cumplimiento</p>
            <h3 className="text-2xl font-bold text-teal-400 font-mono mt-0.5">{complianceRate}%</h3>
          </div>
          <div className="p-2.5 bg-teal-500/20 text-teal-400 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Urgentes Pendientes</p>
            <h3 className="text-2xl font-bold text-rose-400 font-mono mt-0.5">{urgentCount}</h3>
          </div>
          <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Status filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'todas', label: 'Todas' },
            { id: 'pendientes', label: 'Pendientes' },
            { id: 'completadas', label: 'Completadas' },
            { id: 'urgentes', label: 'Urgentes' }
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilterType(pill.id as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                filterType === pill.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Patient filter */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400">Consultante:</span>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-teal-500"
          >
            <option value="todos">Todos los Pacientes</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-500 text-xs space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-slate-600" />
            <p className="font-semibold text-slate-300">No hay tareas pendientes en este filtro</p>
            <p>Todo el plan de seguimiento se encuentra al día.</p>
          </div>
        ) : (
          filteredTasks.map((t) => {
            const patient = patients.find((p) => p.id === t.patientId);
            return (
              <div
                key={t.id}
                className={`p-4 rounded-2xl border transition shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  t.completed
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    : t.priority === 'urgente'
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <button
                    onClick={() => toggleTask(t.id)}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition ${
                      t.completed
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'border-slate-600 hover:border-teal-400'
                    }`}
                  >
                    {t.completed && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className={`text-xs font-bold ${t.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                        {t.title}
                      </h4>
                      {getPriorityBadge(t.priority)}
                    </div>

                    {t.description && (
                      <p className="text-xs text-slate-300 leading-relaxed">{t.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                      {patient && (
                        <span className="flex items-center space-x-1 text-slate-400">
                          <User className="w-3 h-3 text-teal-400" />
                          <span>{patient.fullName} ({patient.code})</span>
                        </span>
                      )}
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>Vence: {t.dueDate}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end md:self-center">
                  <button
                    onClick={() => deleteTask(t.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                    title="Eliminar Tarea"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Task Modal */}
      {isNewTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <CheckSquare className="w-5 h-5 text-teal-400" />
                <span>Crear Compromiso de Seguimiento</span>
              </h3>
              <button onClick={() => setIsNewTaskOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Título de la Tarea / Compromiso *</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Ej. Llamada de control 48h o chequeo de escala"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Descripción / Objetivos</label>
                <textarea
                  rows={2}
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Detalles del acuerdo terapéutico o pastoral..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Prioridad</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    value={newTaskDue}
                    onChange={(e) => setNewTaskDue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                  </input>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Asignar a Consultante</label>
                <select
                  value={newTaskPatientId}
                  onChange={(e) => setNewTaskPatientId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewTaskOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold shadow-md shadow-teal-600/20"
                >
                  Guardar Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
