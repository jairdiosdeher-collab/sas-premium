import React, { useState } from 'react';
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
  Shield,
  Flame,
  Clock,
  Heart,
  BarChart3,
  GitPullRequest,
  ChevronLeft,
  ChevronRight,
  X,
  Cloud
} from 'lucide-react';
import { UserRole } from '../types';

export type ModuleKey = 
  | 'dashboard'
  | 'crm_pipeline'
  | 'patients'
  | 'timeline'
  | 'evolution'
  | 'assessments'
  | 'calendar'
  | 'tasks'
  | 'portal'
  | 'documents'
  | 'library'
  | 'sermons'
  | 'smallgroups'
  | 'pastoral'
  | 'name_heraldry'
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
  userRole?: UserRole;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenFirebaseStatus?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  setCurrentModule,
  crisisCount,
  userRole = 'psicologo',
  isMobileOpen = false,
  onCloseMobile,
  onOpenFirebaseStatus,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Matriz de permisos RBAC según privilegios
  const roleAllowedModules: Record<string, ModuleKey[]> = {
    administrador: [
      'dashboard', 'crm_pipeline', 'patients', 'timeline', 'evolution', 
      'assessments', 'calendar', 'tasks', 'portal', 'documents', 'library',
      'sermons', 'smallgroups', 'pastoral', 'name_heraldry', 'aistudio', 'reports', 'analytics', 
      'marketing', 'affiliates', 'settings'
    ],
    psicologo: [
      'dashboard', 'crm_pipeline', 'patients', 'timeline', 'evolution', 
      'assessments', 'calendar', 'tasks', 'portal', 'documents', 'library',
      'name_heraldry', 'aistudio', 'reports', 'settings'
    ],
    pastor: [
      'dashboard', 'crm_pipeline', 'patients', 'timeline', 'calendar', 'tasks',
      'portal', 'documents', 'library', 'sermons', 'smallgroups', 'pastoral',
      'name_heraldry', 'aistudio', 'reports', 'settings'
    ],
    supervisor: [
      'dashboard', 'patients', 'timeline', 'evolution', 'assessments', 'tasks',
      'documents', 'library', 'name_heraldry', 'reports', 'analytics', 'settings'
    ],
    invitado: [
      'dashboard', 'sermons', 'smallgroups', 'name_heraldry', 'library', 'aistudio', 'marketing'
    ],
    consejero: [
      'dashboard', 'crm_pipeline', 'patients', 'timeline', 'evolution', 
      'calendar', 'tasks', 'portal', 'library', 'pastoral', 'name_heraldry', 'aistudio', 'reports', 'settings'
    ],
    director_ministerio: [
      'dashboard', 'crm_pipeline', 'patients', 'calendar', 'tasks', 'library',
      'sermons', 'smallgroups', 'pastoral', 'name_heraldry', 'analytics', 'settings'
    ],
  };

  const allowed = roleAllowedModules[userRole] || roleAllowedModules['psicologo'];

  const allMenuItems: {
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
    { key: 'timeline', label: 'Timeline Integral (8D)', icon: Clock, category: 'clinico', badge: 'Docs' },
    { key: 'evolution', label: 'Notas de Evolución (SOAP-S)', icon: FileText, category: 'clinico' },
    { 
      key: 'assessments', 
      label: 'Escalas Clínicas (9 Test)', 
      icon: Activity, 
      category: 'clinico',
      badge: crisisCount > 0 ? `${crisisCount} Alertas` : '9 Escalas',
      badgeColor: crisisCount > 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : undefined
    },
    { key: 'tasks', label: 'Tareas & Seguimiento', icon: ShieldCheck, category: 'clinico', badge: 'Metas' },
    { key: 'portal', label: 'Portal del Paciente', icon: Heart, category: 'clinico', badge: 'Token' },
    { key: 'documents', label: 'Centro Documental', icon: Cloud, category: 'clinico', badge: 'Storage' },
    { key: 'calendar', label: 'Agenda & WhatsApp', icon: Calendar, category: 'clinico' },

    // Ministerial & Homilético
    { key: 'name_heraldry', label: 'Mi Nombre ante la Palabra', icon: Shield, category: 'pastoral', badge: 'Nuevo' },
    { key: 'sermons', label: 'Productor de Sermones 10.0', icon: BookOpen, category: 'pastoral', badge: 'IA v10' },
    { key: 'library', label: 'Biblioteca Clínica & Pastoral', icon: BookOpen, category: 'pastoral', badge: '7 Dominios' },
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

  // Filtrar según privilegios del rol
  const menuItems = allMenuItems.filter(item => allowed.includes(item.key));

  const handleSelect = (key: ModuleKey) => {
    setCurrentModule(key);
    if (onCloseMobile) onCloseMobile();
  };

  const renderSection = (category: 'clinico' | 'pastoral' | 'negocio', title: string) => {
    const sectionItems = menuItems.filter(m => m.category === category);
    if (sectionItems.length === 0) return null;

    return (
      <div>
        {!isCollapsed && (
          <p className="text-[10px] uppercase font-bold text-slate-500 px-3 tracking-wider mb-1.5 truncate">
            {title}
          </p>
        )}
        <div className="space-y-1">
          {sectionItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentModule === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleSelect(item.key)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-300 border border-amber-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!isCollapsed && item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${item.badgeColor || 'bg-amber-500/20 text-amber-300'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden animate-in fade-in"
        />
      )}

      {/* Main Sidebar Element */}
      <aside 
        className={`fixed md:sticky top-0 md:top-[65px] z-50 md:z-30 h-screen md:h-[calc(100vh-65px)] bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between p-3 select-none transition-all duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-18' : 'md:w-64'} shrink-0`}
      >
        <div className="space-y-4 overflow-y-auto pr-1">
          {/* Header Mobile / Collapse toggle */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 md:hidden">
            <span className="font-extrabold text-sm text-white">Navegación</span>
            <button 
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Desktop Collapse Button */}
          <div className="hidden md:flex justify-end pb-1">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-900 text-xs transition-colors"
              title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Sections filtered by role */}
          {renderSection('clinico', 'Clínica & Consejería')}
          {renderSection('pastoral', 'Homilética & Pastoral')}
          {renderSection('negocio', 'Gestión SaaS & Negocio')}
        </div>

        {/* Bottom Status / Cloud Action */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
          {onOpenFirebaseStatus && !isCollapsed && (
            <button
              onClick={onOpenFirebaseStatus}
              className="w-full p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800/90 text-slate-300 text-[11px] font-semibold flex items-center justify-between transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Cloud className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Estado Firebase Nube</span>
              </div>
              <span className="text-[10px] text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform">→</span>
            </button>
          )}

          {!isCollapsed && (
            <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-tight">
                <p className="font-semibold text-slate-200">Seguridad & Ética Enterprise</p>
                <p className="text-slate-400 text-[10px] mt-0.5">
                  Cifrado AES-256, auto-bloqueo y respaldos en la nube.
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
