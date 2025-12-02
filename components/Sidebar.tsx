
import React from 'react';
import { ViewMode } from '../types';
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Bot,
  PlayCircle,
  BarChart2
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onSimulateIncoming: () => void;
  isLiveMode: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, onSimulateIncoming, isLiveMode }) => {
  const navItemClass = (active: boolean) => 
    `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`;

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-full shrink-0 transition-all duration-300">
      <div className="p-6 border-b border-slate-800 flex items-center gap-2">
        <div className={`bg-gradient-to-tr p-2 rounded-lg transition-colors duration-500 ${isLiveMode ? 'from-emerald-500 to-teal-500' : 'from-indigo-500 to-purple-500'}`}>
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-lg leading-tight">HelpDesk</h2>
          <span className={`text-xs font-medium transition-colors ${isLiveMode ? 'text-emerald-400' : 'text-indigo-400'}`}>
             {isLiveMode ? '● Online' : '○ Local Demo'}
          </span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-4 mt-2">
          Рабочая зона
        </div>
        
        <button 
          onClick={() => onViewChange('dashboard')}
          className={navItemClass(currentView === 'dashboard')}
        >
          <LayoutDashboard size={20} />
          <span>Доска заявок</span>
        </button>

        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-4 mt-6">
          Администрирование
        </div>

        <button 
          onClick={() => onViewChange('analytics')}
          className={navItemClass(currentView === 'analytics')}
        >
          <BarChart2 size={20} />
          <span>Аналитика (Скоро)</span>
        </button>

        <button 
          onClick={() => onViewChange('integration')}
          className={navItemClass(currentView === 'integration')}
        >
          <Settings size={20} />
          <span>Интеграция</span>
        </button>

        {!isLiveMode && (
          <>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-4 mt-6">
              Эмулятор (Dev)
            </div>

            <button 
              onClick={onSimulateIncoming}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-emerald-400 hover:bg-slate-800 hover:text-emerald-300 transition-colors border border-dashed border-slate-700 hover:border-emerald-500/50"
            >
              <PlayCircle size={20} />
              <span>Вход. сообщение</span>
            </button>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center gap-3 text-slate-400 hover:text-white w-full px-4 py-2 transition-colors">
          <LogOut size={18} />
          <span>Выйти</span>
        </button>
      </div>
    </aside>
  );
};
