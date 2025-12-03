
import React, { useState, useEffect } from 'react';
import { KanbanBoard } from './components/KanbanBoard';
import { IntegrationView } from './components/IntegrationView';
import { Sidebar } from './components/Sidebar';
import { Ticket, ViewMode } from './types';
import { LayoutDashboard, Database, Wifi, BarChart2 } from 'lucide-react';
import { MOCK_TICKETS } from './constants';
import { initSupabase, fetchTickets, subscribeToTickets, updateTicketStatus, seedDatabase, clearDatabase } from './services/supabaseService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [notification, setNotification] = useState<string | null>(null);
  
  // Integration State
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Hardcoded Secrets (Auto-Connect)
  useEffect(() => {
      const url = "https://zjfgvvzyiutosaiuljuk.supabase.co";
      const key = "sb_publishable_iWKnzCb6R9iBI4KYYUZzww_-1qFPgn3";
      
      connectToSupabase(url, key);
  }, []);

  // Initialize Supabase
  const connectToSupabase = async (url: string, key: string) => {
      try {
          setIsLoading(true);
          initSupabase(url, key);
          const liveTickets = await fetchTickets();
          
          if (liveTickets.length > 0) {
            setTickets(liveTickets);
          } else {
             console.log("DB connected but empty");
          }
          
          setIsLiveMode(true); 

          // Setup Realtime Subscription
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
          } else {
             if(!errorMsg.includes('apikey')) {
                 setNotification(`Ошибка подключения: ${errorMsg}`);
             }
          }
          setIsLiveMode(false);
      } finally {
          setIsLoading(false);
      }
  };

  const handleUpdateTicket = async (updatedTicket: Ticket) => {
    // Optimistic UI Update
    setTickets((prev) =>
      prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
    );

    if (isLiveMode) {
        await updateTicketStatus(updatedTicket.id, updatedTicket.status);
    }
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
          console.error(e);
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
          setNotification("Тестовые данные загружены!");
          setTimeout(() => setNotification(null), 3000);
      } catch (e) {
          alert("Ошибка загрузки данных. Проверьте консоль.");
          console.error(e);
      } finally {
          setIsLoading(false);
      }
  };

  const simulateIncomingMessage = () => {
    // Only for local demo fallback
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
      default: return <LayoutDashboard className="text-indigo-600 w-6 h-6" />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        onSimulateIncoming={simulateIncomingMessage}
        isLiveMode={isLiveMode}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-3">
            {getHeaderIcon()}
            <h1 className="text-xl font-bold text-slate-800">
              {currentView === 'dashboard' && 'Городской Помощник v0.9.16'}
              {currentView === 'integration' && 'Администрирование'}
              {currentView === 'analytics' && 'Аналитика'}
            </h1>
            
            {/* Live Badge with Tooltip */}
            {isLiveMode && (
                <div className="group relative flex items-center">
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 cursor-help">
                        <Wifi size={12} />
                        Live
                    </span>
                    <div className="absolute left-0 top-full mt-2 w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg hidden group-hover:block z-50">
                        Подключено к базе данных Supabase. Изменения синхронизируются в реальном времени.
                    </div>
                </div>
            )}
            {!isLiveMode && (
                 <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                    Offline
                </span>
            )}
          </div>
          <div className="flex items-center gap-4">
             {notification && (
               <div className="animate-in fade-in bg-red-600 text-white text-xs px-3 py-1.5 rounded-full shadow-lg font-medium">
                 {notification}
               </div>
             )}
             <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold border border-slate-300">
                Д1
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          {currentView === 'dashboard' ? (
            <KanbanBoard 
                tickets={tickets} 
                onUpdateTicket={handleUpdateTicket} 
                isLiveMode={isLiveMode}
            />
          ) : currentView === 'integration' ? (
            <IntegrationView 
                onConnect={connectToSupabase} 
                isConnected={isLiveMode} 
                isLoading={isLoading} 
                onSeedData={handleSeedData}
                onClearData={handleClearData}
            />
          ) : (
             <div className="flex items-center justify-center h-full text-slate-400">
                 <div className="text-center">
                     <BarChart2 size={48} className="mx-auto mb-2 opacity-50" />
                     <h3 className="text-lg font-bold">Аналитика в разработке</h3>
                     <p>Скоро здесь появятся графики и отчеты.</p>
                 </div>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
