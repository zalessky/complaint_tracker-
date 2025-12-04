import React, { useState, useMemo } from 'react';
import { Ticket, Priority, TicketStatus } from '../types';
import { CATEGORIES, STATUS_CONFIG, PRIORITY_LABELS } from '../constants';
import { 
    BarChart2, PieChart, TrendingUp, AlertOctagon, CheckCircle2, Clock, 
    Activity, User, Calendar, MapPin, Zap, Filter, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';

interface AnalyticsViewProps {
  tickets: Ticket[];
}

type TimeRange = 'week' | 'month' | 'year' | 'all';

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ tickets }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter Logic
  const filteredTickets = useMemo(() => {
      return tickets.filter(t => {
          // Time Filter
          const date = new Date(t.createdAt);
          const now = new Date();
          const diffDays = Math.ceil(Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
          
          if (timeRange === 'week' && diffDays > 7) return false;
          if (timeRange === 'month' && diffDays > 30) return false;
          if (timeRange === 'year' && diffDays > 365) return false;

          // Category Filter
          if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

          // Status Filter
          if (statusFilter !== 'all' && t.status !== statusFilter) return false;

          return true;
      });
  }, [tickets, timeRange, categoryFilter, statusFilter]);

  // --- Metrics Calculation ---
  const total = filteredTickets.length;
  const resolved = filteredTickets.filter(t => ['resolved', 'measures_taken'].includes(t.status)).length;
  const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const critical = filteredTickets.filter(t => t.priority === 'critical').length;
  
  // Fake "Avg Speed" calculation (mock logic for demo)
  const avgSpeedHours = total > 0 ? Math.round(4 + (Math.random() * 2)) : 0; 

  // Distribution Data
  const statusDist = Object.keys(STATUS_CONFIG).map(key => ({
      label: STATUS_CONFIG[key as TicketStatus].label,
      count: filteredTickets.filter(t => t.status === key).length,
      color: STATUS_CONFIG[key as TicketStatus].color.split(' ')[0].replace('bg-', 'bg-').replace('100', '500')
  }));

  const categoryDist = Object.values(CATEGORIES).map(cat => ({
      name: cat.name,
      count: filteredTickets.filter(t => t.category === cat.name).length
  })).sort((a,b) => b.count - a.count).slice(0, 5);

  const priorityDist = ['low', 'medium', 'high', 'critical'].map(p => ({
      label: PRIORITY_LABELS[p as Priority],
      count: filteredTickets.filter(t => t.priority === p).length,
      color: p === 'critical' ? '#ef4444' : p === 'high' ? '#f97316' : p === 'medium' ? '#3b82f6' : '#94a3b8'
  }));

  // Activity by Hour (Heatmap mock)
  const activityByHour = new Array(24).fill(0).map((_, i) => ({
      hour: i,
      count: filteredTickets.filter(t => new Date(t.createdAt).getHours() === i).length
  }));
  const maxHour = Math.max(...activityByHour.map(i => i.count), 1); // For scaling

  // Activity by Day
  const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const activityByDay = new Array(7).fill(0).map((_, i) => ({
      day: days[i],
      count: filteredTickets.filter(t => new Date(t.createdAt).getDay() === i).length
  }));
  // Ensure we scale relative to the highest visible bar, with a minimum of 1 to avoid /0
  const maxDay = Math.max(...activityByDay.map(i => i.count), 1); 

  // Top Users
  const userCounts: Record<string, number> = {};
  filteredTickets.forEach(t => userCounts[t.telegramUsername] = (userCounts[t.telegramUsername] || 0) + 1);
  const topUsers = Object.entries(userCounts).sort(([,a], [,b]) => b - a).slice(0, 5);

  // Category Efficiency (Mock)
  const catEfficiency = categoryDist.map(c => ({
      name: c.name,
      speed: Math.round(2 + Math.random() * 10) + 'ч',
      rate: Math.round(50 + Math.random() * 50) + '%'
  }));

  const StatCard = ({ title, value, subtext, icon: Icon, color, trend }: any) => (
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
              <div className={`p-2 rounded-lg opacity-80 ${color.replace('text-', 'bg-').replace('600', '100')} ${color}`}>
                  <Icon size={20} />
              </div>
              {trend && (
                  <span className={`text-[10px] font-bold flex items-center ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {trend === 'up' ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>} 12%
                  </span>
              )}
          </div>
          <div>
              <h3 className="text-2xl font-extrabold text-slate-800">{value}</h3>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</p>
              <p className="text-xs text-slate-400 mt-1">{subtext}</p>
          </div>
      </div>
  );

  return (
    <div className="h-full overflow-y-auto p-6 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Filters Toolbar */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 pl-2">
                <Activity className="text-indigo-600" size={20}/>
                Дашборд
            </h2>
            <div className="flex gap-2 flex-wrap">
                <select value={timeRange} onChange={(e) => setTimeRange(e.target.value as any)} className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2 outline-none focus:border-indigo-500 font-bold">
                    <option value="week">За неделю</option>
                    <option value="month">За месяц</option>
                    <option value="year">За год</option>
                    <option value="all">Все время</option>
                </select>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2 outline-none focus:border-indigo-500 font-bold max-w-[150px]">
                    <option value="all">Все категории</option>
                    {Object.values(CATEGORIES).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2 outline-none focus:border-indigo-500 font-bold">
                    <option value="all">Все статусы</option>
                    {Object.entries(STATUS_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
            </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Всего заявок" value={total} subtext="За выбранный период" icon={TrendingUp} color="text-indigo-600" trend="up" />
            <StatCard title="Решено" value={`${rate}%`} subtext={`${resolved} успешно закрыто`} icon={CheckCircle2} color="text-emerald-600" trend="up" />
            <StatCard title="Ср. время реакции" value={`~${avgSpeedHours}ч`} subtext="Эффективность персонала" icon={Zap} color="text-blue-600" />
            <StatCard title="Критические" value={critical} subtext="Требуют внимания" icon={AlertOctagon} color="text-red-600" trend="down" />
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status Bars */}
            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wide">Статус выполнения</h3>
                <div className="space-y-4">
                    {statusDist.map((stat) => (
                        <div key={stat.label}>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-semibold text-slate-700">{stat.label}</span>
                                <span className="text-slate-500">{stat.count}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5">
                                <div className={`h-2.5 rounded-full ${stat.color}`} style={{ width: `${total > 0 ? (stat.count / total) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Priority Pie (CSS Conic) */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wide w-full text-left">Приоритеты</h3>
                <div className="relative w-40 h-40 rounded-full" style={{
                    background: `conic-gradient(
                        ${priorityDist[0].color} 0% ${(priorityDist[0].count/total)*100}%,
                        ${priorityDist[1].color} 0% ${(priorityDist[0].count + priorityDist[1].count)/total*100}%,
                        ${priorityDist[2].color} 0% ${(priorityDist[0].count + priorityDist[1].count + priorityDist[2].count)/total*100}%,
                        ${priorityDist[3].color} 0% 100%
                    )`
                }}>
                    <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center flex-col">
                        <span className="text-2xl font-bold text-slate-800">{total}</span>
                        <span className="text-[9px] text-slate-400 uppercase">Всего</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-6 w-full">
                    {priorityDist.map(p => (
                        <div key={p.label} className="flex items-center gap-2 text-xs">
                            <div className="w-2 h-2 rounded-full" style={{background: p.color}}></div>
                            <span className="text-slate-600">{p.label}</span>
                            <span className="text-slate-400 ml-auto">{p.count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Activity Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wide flex items-center gap-2"><Clock size={16}/> Активность по часам</h3>
                <div className="flex items-end h-40 gap-1 border-b border-slate-100 pb-2">
                    {activityByHour.map((h) => (
                        <div key={h.hour} className="flex-1 bg-indigo-500 hover:bg-indigo-600 rounded-t transition-colors relative group" style={{ height: `${(h.count / maxHour) * 100}%` }}>
                            <div className="absolute bottom-0 left-0 right-0 top-0 flex items-end justify-center pb-1 pointer-events-none">
                                {h.hour % 6 === 0 && <span className="text-[9px] text-white opacity-50 absolute bottom-1">{h.hour}</span>}
                            </div>
                            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                                {h.count}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wide flex items-center gap-2"><Calendar size={16}/> Активность по дням</h3>
                <div className="flex items-end h-40 gap-3 border-b border-slate-100 pb-2">
                    {activityByDay.map((d) => (
                        <div key={d.day} className="flex-1 flex flex-col justify-end group">
                            <div className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-t transition-colors relative shadow-sm" style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: d.count > 0 ? '4px' : '0' }}>
                                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-1 rounded opacity-0 group-hover:opacity-100">
                                    {d.count}
                                </div>
                            </div>
                            <span className="text-[10px] text-slate-500 text-center mt-1 font-bold">{d.day}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Lists: Efficiency & Top Users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wide">Эффективность категорий</h3>
                <table className="w-full text-xs text-left">
                    <thead>
                        <tr className="border-b border-slate-100 text-slate-400">
                            <th className="py-2">Категория</th>
                            <th className="py-2 text-right">Скорость</th>
                            <th className="py-2 text-right">Решено</th>
                        </tr>
                    </thead>
                    <tbody>
                        {catEfficiency.map((cat, i) => (
                            <tr key={cat.name} className="border-b border-slate-50 hover:bg-slate-50">
                                <td className="py-2.5 font-medium text-slate-700">{cat.name}</td>
                                <td className="py-2.5 text-right font-mono text-slate-500">{cat.speed}</td>
                                <td className="py-2.5 text-right font-bold text-emerald-600">{cat.rate}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wide">Топ Заявителей</h3>
                <div className="space-y-3">
                    {topUsers.map(([user, count], idx) => (
                        <div key={user} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                    {idx + 1}
                                </div>
                                <span className="text-xs font-bold text-slate-700">{user}</span>
                            </div>
                            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{count}</span>
                        </div>
                    ))}
                    {topUsers.length === 0 && <p className="text-xs text-slate-400">Нет данных</p>}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};