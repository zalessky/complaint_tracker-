import React, { useState, useMemo } from 'react';
import { Ticket } from '../types';
import { CATEGORIES, STATUS_CONFIG } from '../constants';
import { Filter, MapPin, Map as MapIcon } from 'lucide-react';

interface MapViewProps {
  tickets: Ticket[];
  onTicketSelect: (id: string) => void;
}

export const MapView: React.FC<MapViewProps> = ({ tickets, onTicketSelect }) => {
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Strict Coordinate Validator
  // Matches "51.123, 46.456" allowing optional spaces
  const isCoordinate = (loc: string) => /^\d+(\.\d+)?,\s*\d+(\.\d+)?$/.test(loc);

  // Filter Tickets
  const mapTickets = useMemo(() => {
      return tickets.filter(t => {
          if (!t.location || !isCoordinate(t.location)) return false;
          if (filterCategory !== 'all' && t.category !== filterCategory) return false;
          if (filterStatus !== 'all' && t.status !== filterStatus) return false;
          return true;
      });
  }, [tickets, filterCategory, filterStatus]);

  // Generate Yandex Static Map URL
  const getStaticMapUrl = () => {
      if (mapTickets.length === 0) return null;

      // Limit markers to prevent URL overflow (Yandex limit)
      const markers = mapTickets.slice(0, 20).map((t, idx) => {
          const parts = t.location!.split(',').map(s => s.trim());
          const lat = parts[0];
          const lon = parts[1];
          
          let color = 'bl'; 
          if (t.priority === 'critical' || t.priority === 'high') color = 'rd'; 
          if (t.status === 'resolved') color = 'gn';
          if (t.status === 'new') color = 'yw';
          
          // Yandex expects: lon,lat
          return `${lon},${lat},pm2${color}m${idx+1}`; 
      }).join('~');

      // Center map on the first point
      const firstParts = mapTickets[0].location!.split(',').map(s => s.trim());
      const centerLat = firstParts[0];
      const centerLon = firstParts[1];

      return `https://static-maps.yandex.ru/1.x/?l=map&pt=${markers}&z=11&size=600,400`;
  };

  const mapUrl = getStaticMapUrl();

  return (
    <div className="h-full p-6 bg-slate-50 flex flex-col overflow-hidden">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shrink-0">
          <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="text-purple-600"/>
                  Карта проблем
              </h2>
              <p className="text-slate-500 text-sm mt-1">География инцидентов (Топ-20 актуальных с координатами)</p>
          </div>
          
          <div className="flex gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 px-2 text-slate-400">
                  <Filter size={16} />
              </div>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bg-transparent text-xs font-bold text-slate-700 outline-none border-r border-slate-200 px-2">
                  <option value="all">Все категории</option>
                  {Object.values(CATEGORIES).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-transparent text-xs font-bold text-slate-700 outline-none px-2">
                  <option value="all">Все статусы</option>
                  {Object.entries(STATUS_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
          </div>
      </div>

      {/* Map Display */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex relative min-h-0">
          {mapTickets.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                  <MapIcon size={64} className="mb-4 opacity-20"/>
                  <p>Нет заявок с координатами (lat,lon) для отображения</p>
                  <p className="text-xs text-slate-300 mt-2">Текстовые адреса на карту не наносятся без геокодера</p>
              </div>
          ) : (
              <>
                <div className="flex-1 bg-slate-100 relative flex items-center justify-center bg-[url('https://static-maps.yandex.ru/1.x/?l=map&ll=46.12,51.50&z=12&size=650,450')] bg-cover bg-center grayscale opacity-50">
                    {mapUrl && (
                        <img 
                            src={mapUrl} 
                            alt="Yandex Map" 
                            className="absolute inset-0 w-full h-full object-contain bg-slate-100" 
                        />
                    )}
                </div>
                
                {/* Sidebar List */}
                <div className="w-80 border-l border-slate-200 bg-white overflow-y-auto p-4 hidden lg:block custom-scrollbar">
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">Объекты на карте</h3>
                    <div className="space-y-3">
                        {mapTickets.slice(0, 20).map((t, idx) => (
                            <div 
                                key={t.id} 
                                onClick={() => onTicketSelect(t.id)}
                                className="flex gap-3 p-3 rounded-lg border border-slate-100 hover:border-purple-200 hover:bg-purple-50 transition-all cursor-pointer group"
                            >
                                <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm group-hover:bg-purple-600 transition-colors">
                                    {idx + 1}
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-800 line-clamp-1">{t.category}</div>
                                    <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{t.originalMessage}</div>
                                    <div className="text-[9px] text-slate-400 font-mono mt-1">{t.location}</div>
                                    <div className="mt-2 flex gap-1">
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${STATUS_CONFIG[t.status].color}`}>
                                            {STATUS_CONFIG[t.status].label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              </>
          )}
      </div>
      <div className="mt-2 text-[10px] text-slate-400 text-center shrink-0">
          Картографические данные © Яндекс
      </div>
    </div>
  );
};