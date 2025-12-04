
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

// Direct reference to the file in the public directory structure
const flagLogo = '/components/Flag_of_Engels.svg';

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

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-slate-900 text-white flex flex-col h-full shrink-0 transition-all duration-300 relative z-20`}>
      
      {/* Header */}
      <div className={`p-4 border-b border-slate-800 flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'}`}>
        <div className="shrink-0 transition-transform hover:scale-105">
          <img src={flagLogo} alt="Engels Flag" className="w-10 h-auto rounded-sm shadow-md" />
        </div>
        {!isCollapsed && (
            <div className="animate-in fade-in duration-300 overflow-hidden">
                <h2 className="font-bold text-lg leading-tight tracking-tight whitespace-nowrap text-white">ЭнгельсHelpDesk</h2>
                <div className="flex items-center gap-1.5 mt-1">
                    {isLiveMode ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20">
                            <Wifi size={10} /> Live
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
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
                v0.10.2
            </div>
        )}
      </div>
    </aside>
  );
};
