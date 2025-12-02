
import React, { useState, useEffect } from 'react';
import { Ticket, TicketStatus, Priority } from '../types';
import { TicketCard } from './TicketCard';
import { TicketModal } from './TicketModal';
import { CATEGORIES, STATUS_CONFIG, PRIORITY_LABELS } from '../constants';
import { ArrowUpDown, Filter, CheckSquare, Square } from 'lucide-react';

interface KanbanBoardProps {
  tickets: Ticket[];
  onUpdateTicket: (ticket: Ticket) => void;
  isLiveMode?: boolean;
}

type GroupingMode = 'status' | 'category' | 'priority';
type SortMode = 'date_desc' | 'date_asc' | 'priority';

// Columns definitions
const STATUS_COLUMNS = Object.entries(STATUS_CONFIG).map(([id, config]) => ({
  id: id as TicketStatus,
  label: config.label,
  color: config.color.split(' ')[2] || 'border-slate-300', // crude extraction
  dot: config.color.split(' ')[0] || 'bg-slate-300'
}));

const PRIORITY_COLUMNS: { id: Priority; label: string; color: string; dot: string }[] = [
    { id: 'critical', label: 'Критический', color: 'border-red-500', dot: 'bg-red-500' },
    { id: 'high', label: 'Высокий', color: 'border-orange-500', dot: 'bg-orange-500' },
    { id: 'medium', label: 'Средний', color: 'border-blue-500', dot: 'bg-blue-500' },
    { id: 'low', label: 'Низкий', color: 'border-slate-500', dot: 'bg-slate-500' },
];

const CATEGORY_COLUMNS = Object.entries(CATEGORIES).map(([key, val]) => ({
    id: val.name,
    label: `${val.emoji} ${val.name}`,
    color: 'border-slate-300',
    dot: 'bg-slate-400'
}));

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ tickets, onUpdateTicket, isLiveMode }) => {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [grouping, setGrouping] = useState<GroupingMode>('status');
  const [sortBy, setSortBy] = useState<SortMode>('date_desc');
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Dynamic filter state
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set());

  // Reset filters when grouping changes
  useEffect(() => {
    let allIds: string[] = [];
    if (grouping === 'status') allIds = STATUS_COLUMNS.map(c => c.id);
    else if (grouping === 'priority') allIds = PRIORITY_COLUMNS.map(c => c.id);
    else allIds = CATEGORY_COLUMNS.map(c => c.id);
    
    setVisibleColumns(new Set(allIds));
  }, [grouping]);

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    const ticketId = e.dataTransfer.getData('ticketId');
    const ticket = tickets.find((t) => t.id === ticketId);
    
    if (ticket) {
         if (grouping === 'status' && ticket.status !== targetId) {
            onUpdateTicket({ ...ticket, status: targetId as TicketStatus });
         } else if (grouping === 'priority' && ticket.priority !== targetId) {
            onUpdateTicket({ ...ticket, priority: targetId as Priority });
         }
    }
  };

  const toggleColumnFilter = (colId: string) => {
      const newSet = new Set(visibleColumns);
      if (newSet.has(colId)) newSet.delete(colId);
      else newSet.add(colId);
      setVisibleColumns(newSet);
  };

  const selectAllFilters = () => {
    let allIds: string[] = [];
    if (grouping === 'status') allIds = STATUS_COLUMNS.map(c => c.id);
    else if (grouping === 'priority') allIds = PRIORITY_COLUMNS.map(c => c.id);
    else allIds = CATEGORY_COLUMNS.map(c => c.id);
    setVisibleColumns(new Set(allIds));
  };

  const deselectAllFilters = () => setVisibleColumns(new Set());

  // Sort Tickets
  const sortedTickets = [...tickets].sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'date_asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'priority') {
          const pMap = { critical: 3, high: 2, medium: 1, low: 0 };
          return pMap[b.priority] - pMap[a.priority];
      }
      return 0;
  });

  // Determine Columns based on grouping
  let allColumns: any[] = [];
  if (grouping === 'status') allColumns = STATUS_COLUMNS;
  else if (grouping === 'priority') allColumns = PRIORITY_COLUMNS;
  else allColumns = CATEGORY_COLUMNS;

  // Filter Columns (Hiding logic)
  const visibleColObjs = allColumns.filter(c => visibleColumns.has(c.id));

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="px-6 py-3 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 gap-4">
          <div className="flex items-center gap-4">
             {/* Grouping */}
             <div className="flex items-center gap-2">
                 <span className="text-xs font-bold text-slate-500 uppercase hidden md:inline">Вид:</span>
                 <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setGrouping('status')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${grouping === 'status' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        Статус
                    </button>
                    <button 
                        onClick={() => setGrouping('priority')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${grouping === 'priority' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        Приоритет
                    </button>
                    <button 
                        onClick={() => setGrouping('category')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${grouping === 'category' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        Категория
                    </button>
                 </div>
             </div>

             {/* Sorting */}
             <div className="flex items-center gap-2">
                 <ArrowUpDown size={14} className="text-slate-400" />
                 <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value as SortMode)}
                    className="text-xs font-medium bg-transparent border-none focus:ring-0 text-slate-700 cursor-pointer"
                 >
                     <option value="date_desc">Сначала новые</option>
                     <option value="date_asc">Сначала старые</option>
                     <option value="priority">Сначала важные</option>
                 </select>
             </div>

             {/* Filtering */}
             <div className="relative">
                 <button 
                    onClick={() => setFilterOpen(!filterOpen)}
                    className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-md transition-colors ${visibleColumns.size < allColumns.length ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
                 >
                     <Filter size={14} />
                     Фильтр {visibleColumns.size < allColumns.length && `(${visibleColumns.size})`}
                 </button>
                 
                 {filterOpen && (
                     <>
                        <div className="fixed inset-0 z-20" onClick={() => setFilterOpen(false)}></div>
                        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 z-30 p-2 max-h-80 overflow-y-auto">
                            <div className="flex justify-between px-2 pb-2 border-b mb-2">
                                <button onClick={selectAllFilters} className="text-[10px] text-indigo-600 font-bold hover:underline">Выбрать все</button>
                                <button onClick={deselectAllFilters} className="text-[10px] text-slate-500 hover:text-slate-700 hover:underline">Снять все</button>
                            </div>
                            {allColumns.map((col) => (
                                <label key={col.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer text-xs">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${visibleColumns.has(col.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}>
                                        {visibleColumns.has(col.id) && <CheckSquare size={12} className="text-white" />}
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        checked={visibleColumns.has(col.id)}
                                        onChange={() => toggleColumnFilter(col.id)}
                                        className="hidden"
                                    />
                                    <span className="truncate">{col.label}</span>
                                </label>
                            ))}
                        </div>
                     </>
                 )}
             </div>
          </div>
          <div className="text-xs text-slate-400 whitespace-nowrap">
             {tickets.length} заявок
          </div>
      </div>

      {/* Board with Custom Scrollbar */}
      <div className="flex-1 flex overflow-x-auto p-6 gap-6 kanban-scroll bg-slate-50">
        {visibleColObjs.map((column) => {
          const columnTickets = sortedTickets.filter(t => {
              if (grouping === 'status') return t.status === column.id;
              if (grouping === 'priority') return t.priority === column.id;
              return t.category === column.id;
          });

          return (
            <div
                key={column.id}
                className="flex-1 min-w-[300px] max-w-[360px] flex flex-col bg-slate-100 rounded-xl border border-slate-200 shadow-sm h-full shrink-0"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
            >
                {/* Column Header */}
                <div className={`p-4 border-b-2 bg-white rounded-t-xl sticky top-0 z-10 flex justify-between items-center shrink-0 ${column.color}`}>
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${column.dot}`}></div>
                        <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide truncate max-w-[180px]">{column.label}</h3>
                    </div>
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold border border-slate-200">
                        {columnTickets.length}
                    </span>
                </div>

                {/* Column Content */}
                <div className="flex-1 p-3 overflow-y-auto space-y-3">
                {columnTickets.map((ticket) => (
                    <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        onClick={() => setSelectedTicketId(ticket.id)}
                    />
                    ))}
                {columnTickets.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-20 text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-lg m-2">
                        <span className="font-medium">Пусто</span>
                    </div>
                )}
                </div>
            </div>
          );
        })}
      </div>

      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicketId(null)}
          onUpdate={onUpdateTicket}
        />
      )}
    </div>
  );
};
