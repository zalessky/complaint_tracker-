import React, { useState, useEffect } from 'react';
import { KanbanBoard } from './components/KanbanBoard';
import { IntegrationView } from './components/IntegrationView';
import { AnalyticsView } from './components/AnalyticsView';
import { Sidebar } from './components/Sidebar';
import { MapView } from './components/MapView';
import { TicketModal } from './components/TicketModal';
import { Ticket, ViewMode } from './types';
import { LayoutDashboard, Database, BarChart2, Users, Map as MapIcon, Book, Mail } from 'lucide-react';
import { MOCK_TICKETS } from './constants';
import { initSupabase, fetchTickets, subscribeToTickets, updateTicketStatus, seedDatabase, clearDatabase } from './services/supabaseService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
      const url = "https://zjfgvvzyiutosaiuljuk.supabase.co";
      const key = "sb_publishable_iWKnzCb6R9iBI4KYYUZzww_-1qFPgn3";
      connectToSupabase(url, key);
  }, []);

  const connectToSupabase = async (url: string, key: string) => {
      try {
          setIsLoading(true);
          initSupabase(url, key);
          const liveTickets = await fetchTickets();
          if (liveTickets.length > 0) setTickets(liveTickets);
          setIsLiveMode(true); 
          subscribeToTickets(async (payload) => {
             if (payload.eventType === 'INSERT') {
                 setNotification(`Новая заявка из Telegram!`);
                 const newTickets = await fetchTickets(); 
                 setTickets(newTickets);
                 setTimeout(() => setNotification(null), 3000);
             } else if (payload.eventType === 'UPDATE') {
                 const newTickets = await fetchTickets();
                 setTickets(newTickets);
             }
          });
      } catch (e: any) {
          console.error("Auto-connect failed:", e);
          const errorMsg = e.message || JSON.stringify(e);
          if (errorMsg.includes('is_deleted') || errorMsg.includes('does not exist')) {
             setNotification("Требуется обновление БД! Запустите SQL скрипт.");
          } else if(!errorMsg.includes('apikey')) {
             setNotification(`Ошибка подключения: ${errorMsg}`);
          }
          setIsLiveMode(false);
      } finally {
          setIsLoading(false);
      }
  };

  const handleUpdateTicket = async (updatedTicket: Ticket) => {
    setTickets((prev) => prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)));
    if (isLiveMode) await updateTicketStatus(updatedTicket.id, updatedTicket.status);
  };

  const handleClearData = async () => {
      if (!isLiveMode) return;
      if (!confirm("Вы уверены? Это удалит ВСЕ заявки из базы данных безвозвратно.")) return;
      try {
          setIsLoading(true);
          await clearDatabase();
          setTickets([]);
          setNotification("База данных полностью очищена.");
          setTimeout(() => setNotification(null), 3000);
      } catch (e) {
          alert("Ошибка удаления. Возможно, нужно запустить SQL скрипт еще раз (отключение RLS).");
      } finally {
          setIsLoading(false);
      }
  };

  const handleSeedData = async () => {
      if (!isLiveMode) return;
      try {
          setIsLoading(true);
          await seedDatabase();
          const newTickets = await fetchTickets();
          setTickets(newTickets);
          setNotification("Big Data (50+) загружена!");
          setTimeout(() => setNotification(null), 3000);
      } catch (e) {
          alert("Ошибка загрузки данных. Проверьте консоль.");
      } finally {
          setIsLoading(false);
      }
  };

  const simulateIncomingMessage = () => {
    if (isLiveMode) return;
    const newTicket: Ticket = {
      id: `t-${Date.now()}`,
      telegramUserId: '12345',
      telegramUsername: '@demo_user',
      contactPhone: '+79990000000',
      category: 'Дороги',
      subCategory: 'Яма',
      originalMessage: 'Тестовая заявка (Демо)',
      status: 'new',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      attachments: [],
      history: []
    };
    setTickets(prev => [newTicket, ...prev]);
  };

  const getHeaderIcon = () => {
    switch (currentView) {
      case 'dashboard': return <LayoutDashboard className="text-indigo-600 w-6 h-6" />;
      case 'integration': return <Database className="text-emerald-500 w-6 h-6" />;
      case 'analytics': return <BarChart2 className="text-amber-500 w-6 h-6" />;
      case 'staff': return <Users className="text-blue-500 w-6 h-6" />;
      case 'map': return <MapIcon className="text-purple-500 w-6 h-6" />;
      case 'knowledge': return <Book className="text-pink-500 w-6 h-6" />;
      case 'mail': return <Mail className="text-cyan-500 w-6 h-6" />;
      default: return <LayoutDashboard className="text-indigo-600 w-6 h-6" />;
    }
  };

  const getHeaderTitle = () => {
      switch (currentView) {
          case 'dashboard': return 'Доска заявок';
          case 'integration': return 'Настройки и Интеграция';
          case 'analytics': return 'Аналитический центр';
          case 'staff': return 'Управление персоналом';
          case 'map': return 'Карта событий';
          case 'knowledge': return 'База знаний';
          case 'mail': return 'Рассылки';
          default: return 'Городской Помощник';
      }
  };

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        onSimulateIncoming={simulateIncomingMessage}
        isLiveMode={isLiveMode}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-3">
            {getHeaderIcon()}
            <h1 className="text-lg font-bold text-slate-800">
              {getHeaderTitle()}
            </h1>
          </div>
          <div className="flex items-center gap-4">
             {notification && (
               <div className="animate-in fade-in bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-full shadow-lg font-medium">
                 {notification}
               </div>
             )}
             <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200 text-xs">
                Д1
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          {currentView === 'dashboard' ? (
            <KanbanBoard 
                tickets={tickets} 
                onUpdateTicket={handleUpdateTicket} 
                onTicketSelect={(id) => setSelectedTicketId(id)}
                isLiveMode={isLiveMode} 
            />
          ) : currentView === 'integration' ? (
            <IntegrationView onConnect={connectToSupabase} isConnected={isLiveMode} isLoading={isLoading} onSeedData={handleSeedData} onClearData={handleClearData} />
          ) : currentView === 'analytics' ? (
            <AnalyticsView tickets={tickets} />
          ) : currentView === 'map' ? (
            <MapView tickets={tickets} onTicketSelect={(id) => setSelectedTicketId(id)} />
          ) : currentView === 'staff' ? (
             <div className="p-10 text-center text-slate-400"><Users size={48} className="mx-auto mb-4 opacity-50"/><h2 className="text-xl font-bold mb-2">Управление персоналом</h2><p>Функционал в разработке.</p></div>
          ) : currentView === 'knowledge' ? (
              <div className="p-10 text-center text-slate-400"><Book size={48} className="mx-auto mb-4 opacity-50"/><h2 className="text-xl font-bold mb-2">База знаний</h2><p>Раздел в разработке.</p></div>
          ) : currentView === 'mail' ? (
              <div className="p-10 text-center text-slate-400"><Mail size={48} className="mx-auto mb-4 opacity-50"/><h2 className="text-xl font-bold mb-2">Рассылки</h2><p>Раздел в разработке.</p></div>
          ) : null}
        </div>
      </main>

      {/* Global Ticket Modal */}
      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicketId(null)}
          onUpdate={handleUpdateTicket}
        />
      )}
    </div>
  );
};

export default App;