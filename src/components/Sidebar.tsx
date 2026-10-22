import React from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  Activity,
  Calendar,
  BookOpen,
  UsersRound,
  Bot,
  Printer,
  TrendingUp,
  Share2,
  Settings,
  ShieldCheck,
  Flame,
  Clock,
  Heart,
  BarChart3,
  GitPullRequest
} from 'lucide-react';

export type ModuleKey = 
  | 'dashboard'
  | 'crm_pipeline'
  | 'patients'
  | 'timeline'
  | 'evolution'
  | 'assessments'
  | 'calendar'
  | 'sermons'
  | 'smallgroups'
  | 'pastoral'
  | 'aistudio'
  | 'reports'
  | 'analytics'
  | 'marketing'
  | 'affiliates'
  | 'settings';

interface SidebarProps {
  currentModule: ModuleKey;
  setCurrentModule: (mod: ModuleKey) => void;
  crisisCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  setCurrentModule,
  crisisCount,
}) => {
  const menuItems: {
    key: ModuleKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    category: 'clinico' | 'pastoral' | 'negocio';
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    // Clínico & Cuidado Pastoral
    { key: 'dashboard', label: 'Dashboard General', icon: LayoutDashboard, category: 'clinico' },
    { key: 'crm_pipeline', label: 'CRM & Pipeline Visual', icon: GitPullRequest, category: 'clinico', badge: 'Kanban' },
    { key: 'patients', label: 'Historias Clínicas & CRM', icon: Users, category: 'clinico' },
    { key: 'timeline', label: 'Timeline & Adjuntos', icon: Clock, category: 'clinico', badge: 'Docs' },
    { key: 'evolution', label: 'Notas de Evolución (SOAP-S)', icon: FileText, category: 'clinico' },
    { 
      key: 'assessments', 
      label: 'Escalas Clínicas (9 Test)', 
      icon: Activity, 
      category: 'clinico',
      badge: crisisCount > 0 ? `${crisisCount} Alertas` : '9 Escalas',
      badgeColor: crisisCount > 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : undefined
    },
    { key: 'calendar', label: 'Agenda & WhatsApp', icon: Calendar, category: 'clinico' },

    // Ministerial & Homilético
    { key: 'sermons', label: 'Homilética & Sermones con IA', icon: BookOpen, category: 'pastoral', badge: 'IA v3.8' },
    { key: 'smallgroups', label: 'Grupos Pequeños & Células', icon: UsersRound, category: 'pastoral' },
    { key: 'pastoral', label: 'Dirección Espiritual & Escuela', icon: Heart, category: 'pastoral', badge: 'Ficha' },
    { key: 'aistudio', label: 'Estudio de IA & Preguntas', icon: Bot, category: 'pastoral' },
    { key: 'reports', label: 'Informes Profesionales PDF', icon: Printer, category: 'pastoral' },

    // Negocio & Crecimiento
    { key: 'analytics', label: 'Analíticas SaaS & MRR', icon: BarChart3, category: 'negocio', badge: '$58k ARR' },
    { key: 'marketing', label: 'Estrategia de Ventas & Ads', icon: TrendingUp, category: 'negocio', badge: 'Playbook' },
    { key: 'affiliates', label: 'Programa de Afiliados (30%)', icon: Share2, category: 'negocio' },
    { key: 'settings', label: 'Copias de Seguridad & Config', icon: Settings, category: 'negocio' },
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-950 border-r border-slate-800/80 min-h-[calc(100vh-65px)] flex flex-col justify-between p-3 select-none">
      <div className="space-y-4">
        {/* Category: Clínico & Consejería */}
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-500 px-3 tracking-wider mb-1.5">
            Clínica & Consejería
          </p>
          <div className="space-y-1">
            {menuItems.filter(m => m.category === 'clinico').map((item) => {
              const Icon = item.icon;
              const isActive = currentModule === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setCurrentModule(item.key)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-300 border border-amber-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${item.badgeColor || 'bg-amber-500/20 text-amber-300'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category: Homilética & Recursos */}
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-500 px-3 tracking-wider mb-1.5">
            Homilética & Pastoral
          </p>
          <div className="space-y-1">
            {menuItems.filter(m => m.category === 'pastoral').map((item) => {
              const Icon = item.icon;
              const isActive = currentModule === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setCurrentModule(item.key)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-300 border border-amber-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category: Negocio & Marketing */}
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-500 px-3 tracking-wider mb-1.5">
            Gestión SaaS & Negocio
          </p>
          <div className="space-y-1">
            {menuItems.filter(m => m.category === 'negocio').map((item) => {
              const Icon = item.icon;
              const isActive = currentModule === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setCurrentModule(item.key)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-300 border border-amber-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Security & Confidentiality Badge */}
      <div className="mt-4 pt-3 border-t border-slate-800/80">
        <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-tight">
            <p className="font-semibold text-slate-200">Seguridad & Ética Enterprise</p>
            <p className="text-slate-400 text-[10px] mt-0.5">
              Cifrado AES-256, auto-bloqueo y registro de auditoría clínica.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
