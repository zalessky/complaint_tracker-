import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Ticket } from '../types';
import { CATEGORIES, STATUS_CONFIG } from '../constants';
import { Filter, MapPin, Map as MapIcon, Loader2 } from 'lucide-react';

declare global {
    interface Window {
        ymaps: any;
    }
}

interface MapViewProps {
  tickets: Ticket[];
  onTicketSelect: (id: string) => void;
}

export const MapView: React.FC<MapViewProps> = ({ tickets, onTicketSelect }) => {
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  // Strict Coordinate Validator
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

  useEffect(() => {
      if (window.ymaps) {
          window.ymaps.ready(() => initMap());
      } else {
          const script = document.createElement('script');
          script.src = "https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey="; 
          script.onload = () => window.ymaps.ready(() => initMap());
          document.head.appendChild(script);
      }
  }, []);

  useEffect(() => {
      if (mapInstance.current && window.ymaps) {
          updateMarkers();
      }
  }, [mapTickets]);

  const initMap = () => {
      if (!mapRef.current) return;
      if (mapInstance.current) return; // Already initialized

      setMapLoaded(true);
      // Default center Engels
      mapInstance.current = new window.ymaps.Map(mapRef.current, {
          center: [51.498, 46.12], 
          zoom: 12,
          controls: ['zoomControl', 'fullscreenControl']
      });

      updateMarkers();
  };

  const updateMarkers = () => {
      if (!mapInstance.current) return;
      
      mapInstance.current.geoObjects.removeAll();
      const clusterer = new window.ymaps.Clusterer({
          preset: 'islands#invertedVioletClusterIcons',
          groupByCoordinates: false,
          clusterDisableClickZoom: false,
          clusterHideIconOnBalloonOpen: false,
          geoObjectHideIconOnBalloonOpen: false
      });

      const placemarks = mapTickets.map((t) => {
          const coords = t.location!.split(',').map(s => parseFloat(s.trim()));
          
          // Color mapping
          let color = 'blue';
          if (t.priority === 'critical') color = 'red';
          else if (t.priority === 'high') color = 'orange';
          else if (t.status === 'resolved') color = 'green';

          const placemark = new window.ymaps.Placemark(coords, {
              balloonContentHeader: t.category,
              balloonContentBody: t.originalMessage,
              balloonContentFooter: t.status,
              hintContent: t.subCategory
          }, {
              preset: `islands#${color}CircleDotIcon`
          });

          placemark.events.add('click', () => {
              onTicketSelect(t.id);
          });

          return placemark;
      });

      clusterer.add(placemarks);
      mapInstance.current.geoObjects.add(clusterer);
      
      if (placemarks.length > 0) {
          try {
             mapInstance.current.setBounds(clusterer.getBounds(), { checkZoomRange: true });
          } catch(e) {}
      }
  };

  return (
    <div className="h-full p-6 bg-slate-50 flex flex-col overflow-hidden">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shrink-0">
          <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="text-purple-600"/>
                  Карта событий
              </h2>
              <p className="text-slate-500 text-sm mt-1">Интерактивная карта инцидентов</p>
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
          <div ref={mapRef} className="w-full h-full" style={{ minHeight: '400px' }}></div>
          {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
                  <Loader2 className="animate-spin text-purple-600 w-10 h-10" />
                  <span className="ml-2 text-slate-500 font-bold">Загрузка карт...</span>
              </div>
          )}
      </div>
      <div className="mt-2 text-[10px] text-slate-400 text-center shrink-0">
          Картографические данные © Яндекс
      </div>
    </div>
  );
};