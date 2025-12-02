
import React from 'react';
import { Ticket, Priority } from '../types';
import { Clock, MapPin, Bus, CreditCard } from 'lucide-react';
import { CATEGORIES, PRIORITY_LABELS } from '../constants';

interface TicketCardProps {
  ticket: Ticket;
  onClick: () => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onClick }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('ticketId', ticket.id);
  };

  // Priority Color
  const priorityColor = {
    low: 'bg-slate-100 text-slate-600',
    medium: 'bg-blue-50 text-blue-700 border-blue-100',
    high: 'bg-orange-50 text-orange-700 border-orange-100',
    critical: 'bg-red-50 text-red-700 border-red-100',
  };

  // Time elapsed pretty print
  const getTimeElapsed = () => {
    const hours = Math.floor((Date.now() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60));
    if (hours < 1) return '< 1ч';
    if (hours > 24) return `${Math.floor(hours / 24)}д`;
    return `${hours}ч`;
  };

  // Find Category Emoji key from Russian Name
  const catKey = Object.keys(CATEGORIES).find(key => CATEGORIES[key as keyof typeof CATEGORIES].name === ticket.category);
  const categoryEmoji = catKey ? CATEGORIES[catKey as keyof typeof CATEGORIES].emoji : '❓';

  // Fallback for priority translation if mismatched case exists in DB
  const priorityLabel = PRIORITY_LABELS[ticket.priority.toLowerCase() as Priority] || PRIORITY_LABELS[ticket.priority as Priority] || ticket.priority;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-95 group relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-1.5">
           <span className="text-xs font-mono text-slate-400">#{ticket.id.slice(0, 6)}</span>
           <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${priorityColor[ticket.priority.toLowerCase() as Priority] || 'bg-slate-100'}`}>
             {priorityLabel}
           </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Clock size={12} />
          {getTimeElapsed()}
        </div>
      </div>

      {/* Category & SubCategory Badges */}
      <div className="flex flex-wrap gap-1 mb-2">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200">
              <span>{categoryEmoji}</span>
              {ticket.category}
          </div>
          {ticket.subCategory && (
             <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-slate-600 text-[10px] border border-slate-200 shadow-sm">
                {ticket.subCategory}
             </div>
          )}
      </div>

      <h4 className="font-medium text-slate-800 text-sm mb-2 line-clamp-2 leading-snug">
        {ticket.originalMessage}
      </h4>

      {/* Extra Data Badges (Transport) */}
      {ticket.extraData && (
         <div className="flex gap-2 mb-2">
            {ticket.extraData.routeNumber && (
                <div className="flex items-center gap-1 text-[10px] bg-yellow-50 text-yellow-800 px-1.5 py-0.5 rounded border border-yellow-100">
                    <Bus size={10} />
                    {ticket.extraData.routeNumber}
                </div>
            )}
            {ticket.extraData.vehicleNumber && (
                <div className="flex items-center gap-1 text-[10px] bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 font-mono">
                    <CreditCard size={10} />
                    {ticket.extraData.vehicleNumber}
                </div>
            )}
         </div>
      )}

      {ticket.attachments && ticket.attachments.length > 0 && (
          <div className="mb-3">
              <div className="text-[10px] text-slate-500 bg-slate-50 rounded px-2 py-1 inline-block border border-slate-100">
                 📸 {ticket.attachments.length} фото
              </div>
          </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-600 font-bold">
            {ticket.telegramUsername ? ticket.telegramUsername.substring(1, 3).toUpperCase() : 'U'}
          </div>
          <span className="text-xs text-slate-500 truncate max-w-[80px]">{ticket.telegramUsername || 'Аноним'}</span>
        </div>
        
        {ticket.location && (
            <div className="flex items-center gap-1 text-[10px] text-slate-500 max-w-[100px] truncate">
                <MapPin size={10} />
                {ticket.location}
            </div>
        )}
      </div>
    </div>
  );
};