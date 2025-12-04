import React from 'react';
import { ViewMode } from '../types';
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  PlayCircle,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  Users,
  Map,
  Book,
  Mail,
  Wifi
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onSimulateIncoming: () => void;
  isLiveMode: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
    currentView, 
    onViewChange, 
    onSimulateIncoming, 
    isLiveMode,
    isCollapsed,
    onToggleCollapse
}) => {
  const navItemClass = (active: boolean) => 
    `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer whitespace-nowrap overflow-hidden ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`;

  // Engels Flag SVG (Official Construction)
  // Vertical Blue Stripe (1/3), Yellow Field (2/3), Bull symbol in center of yellow
  const FlagLogo = () => (
    <svg viewBox="0 0 90 60" className="w-8 h-8 drop-shadow-md rounded-sm overflow-hidden border border-white/10">
      {/* Yellow Field */}
      <rect x="30" y="0" width="60" height="60" fill="#fce300" />
      {/* Blue Stripe */}
      <rect x="0" y="0" width="30" height="60" fill="#0077ff" />
      
      {/* Bull Symbol (Simplified for small size) */}
      <g transform="translate(60, 30) scale(0.35)">
         <path d="M -30 10 Q -20 0 -10 10 Q 0 0 20 0 Q 30 -10 40 0 C 45 10 35 20 30 25 L 30 40 L 20 40 L 25 20 L 10 30 L 10 45 L 0 45 L 0 30 Q -10 35 -20 30 L -20 45 L -30 45 L -30 30 Q -40 30 -40 20 Z" fill="#1a1a1a" transform="translate(0, 10)" />
         {/* Bowl */}
         <path d="M -20 -10 L 20 -10 C 20 5 10 10 0 10 C -10 10 -20 5 -20 -10 Z" fill="#bc002d" />
         <ellipse cx="0" cy="-10" rx="20" ry="5" fill="#fff" />
      </g>
    </svg>
  );

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-slate-900 text-white flex flex-col h-full shrink-0 transition-all duration-300 relative z-20`}>
      
      {/* Header */}
      <div className={`p-4 border-b border-slate-800 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="shrink-0 transition-transform hover:scale-105">
          <FlagLogo />
        </div>
        {!isCollapsed && (
            <div className="animate-in fade-in duration-300 overflow-hidden">
                <h2 className="font-bold text-sm leading-tight tracking-tight whitespace-nowrap">ЭнгельсHelpDesk</h2>
                <div className="flex items-center gap-1.5 mt-1">
                    {isLiveMode ? (
                        <span className="flex items-center gap-1 text-[9px] font-bold uppercase text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20">
                            <Wifi size={8} /> Live
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-[9px] font-bold uppercase text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                            Offline
                        </span>
                    )}
                </div>
            </div>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto custom-scrollbar">
        {!isCollapsed && (
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-4 mt-2 animate-in fade-in">
                Рабочая зона
            </div>
        )}
        
        <button onClick={() => onViewChange('dashboard')} className={navItemClass(currentView === 'dashboard')} title="Доска заявок">
          <LayoutDashboard size={18} className="shrink-0" />
          {!isCollapsed && <span>Доска заявок</span>}
        </button>

        <button onClick={() => onViewChange('map')} className={navItemClass(currentView === 'map')} title="Карта проблем">
          <Map size={18} className="shrink-0" />
          {!isCollapsed && <span>Карта проблем</span>}
        </button>

        <button onClick={() => onViewChange('analytics')} className={navItemClass(currentView === 'analytics')} title="Аналитика">
          <BarChart2 size={18} className="shrink-0" />
          {!isCollapsed && <span>Аналитика</span>}
        </button>

        {!isCollapsed && (
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-4 mt-6 animate-in fade-in">
                Организация
            </div>
        )}

        <button onClick={() => onViewChange('staff')} className={navItemClass(currentView === 'staff')} title="Сотрудники">
          <Users size={18} className="shrink-0" />
          {!isCollapsed && <span>Сотрудники <span className="ml-1 text-[9px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">Скоро</span></span>}
        </button>

        <button onClick={() => onViewChange('knowledge')} className={navItemClass(currentView === 'knowledge')} title="База знаний">
          <Book size={18} className="shrink-0" />
          {!isCollapsed && <span>База знаний <span className="ml-1 text-[9px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">Скоро</span></span>}
        </button>
        
        <button onClick={() => onViewChange('mail')} className={navItemClass(currentView === 'mail')} title="Рассылки">
          <Mail size={18} className="shrink-0" />
          {!isCollapsed && <span>Рассылки <span className="ml-1 text-[9px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">Скоро</span></span>}
        </button>

        {!isCollapsed && (
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-4 mt-6 animate-in fade-in">
                Система
            </div>
        )}

        <button onClick={() => onViewChange('integration')} className={navItemClass(currentView === 'integration')} title="Интеграция">
          <Settings size={18} className="shrink-0" />
          {!isCollapsed && <span>Интеграция</span>}
        </button>

        {!isLiveMode && !isCollapsed && (
          <button 
            onClick={onSimulateIncoming}
            className="w-full flex items-center gap-3 px-4 py-3 mt-4 rounded-lg text-emerald-400 hover:bg-slate-800 hover:text-emerald-300 transition-colors border border-dashed border-slate-700 hover:border-emerald-500/50"
          >
            <PlayCircle size={18} className="shrink-0" />
            <span>Вход. сообщение</span>
          </button>
        )}
      </nav>

      {/* Collapse Toggle */}
      <button 
        onClick={onToggleCollapse}
        className="absolute -right-3 top-16 bg-slate-800 text-white p-1 rounded-full border border-slate-700 shadow-md hover:bg-indigo-600 transition-colors z-50"
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      <div className="p-4 border-t border-slate-800 bg-slate-950/30">
        <button className={`flex items-center gap-3 text-slate-400 hover:text-white w-full px-4 py-2 transition-colors ${isCollapsed ? 'justify-center' : ''}`}>
          <LogOut size={18} className="shrink-0" />
          {!isCollapsed && <span className="text-sm">Выйти</span>}
        </button>
        {!isCollapsed && (
            <div className="text-center mt-2 text-[10px] text-slate-600 font-mono">
                v0.9.24
            </div>
        )}
      </div>
    </aside>
  );
};