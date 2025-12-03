import React, { useState, useEffect, useRef } from 'react';
import { Ticket, TicketStatus, ChatMessage, Priority } from '../types';
import { X, Send, User, Calendar, MessageSquare, MapPin, Tag, Paperclip, AlertCircle, Loader2, Bus, CreditCard, ChevronDown, UploadCloud, ChevronLeft, ChevronRight, Phone, Trash2 } from 'lucide-react';
import { sendReplyViaBot, fetchTicketHistory, updateTicketStatus, updateTicketPriority, softDeleteTicket } from '../services/supabaseService';
import { CATEGORIES, PRIORITY_LABELS, STATUS_CONFIG } from '../constants';

interface TicketModalProps {
  ticket: Ticket;
  onClose: () => void;
  onUpdate: (ticket: Ticket) => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ ticket, onClose, onUpdate }) => {
  const [replyText, setReplyText] = useState('');
  const [localHistory, setLocalHistory] = useState<ChatMessage[]>(ticket.history || []);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);
  // Collect all images (ticket attachments + history attachments)
  const allImages = [
      ...(ticket.attachments || []).map(a => ({...a, source: 'ticket'})),
      ...(localHistory.flatMap(m => m.attachments || [])).map(a => ({...a, source: 'chat'}))
  ];

  useEffect(() => {
     if (ticket.id.length > 10 && !ticket.id.startsWith('t-mock')) { 
        setLoadingHistory(true);
        fetchTicketHistory(ticket.id)
            .then(msgs => {
                if (msgs.length > 0) setLocalHistory(msgs);
            })
            .catch(err => console.error("Failed to load history", err))
            .finally(() => setLoadingHistory(false));
     }
  }, [ticket.id]);

  const processFile = async (file: File) => {
      if (!file) return;
      if (!file.type.startsWith('image/')) {
          alert("Можно загружать только изображения");
          return;
      }

      setIsUploading(true);
      try {
          // Send via Bot API
          await sendReplyViaBot(ticket.id, "Отправлено фото", file);
          
          // Optimistic update
          const tempUrl = URL.createObjectURL(file);
          const newMessage: ChatMessage = {
              id: Date.now().toString(),
              sender: 'operator',
              text: "Отправлено фото",
              attachments: [{ id: 'new', type: 'image', url: tempUrl, name: file.name }],
              timestamp: new Date().toISOString()
          };
          setLocalHistory(prev => [...prev, newMessage]);
          onUpdate({ ...ticket, status: 'in_work' });
      } catch (err) {
          alert("Ошибка отправки. Проверьте URL бота в настройках.");
          console.error(err);
      } finally {
          setIsUploading(false);
          setIsDragging(false);
      }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) await processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) await processFile(file);
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
              const file = items[i].getAsFile();
              if (file) await processFile(file);
          }
      }
  };

  const sendReply = async () => {
      if (!replyText.trim()) return;
      
      const textToSend = replyText;
      setReplyText(''); 

      const newMessage: ChatMessage = {
          id: Date.now().toString(),
          sender: 'operator',
          text: textToSend,
          timestamp: new Date().toISOString()
      };

      setLocalHistory(prev => [...prev, newMessage]);

      if (ticket.id.length > 10 && !ticket.id.startsWith('t-mock')) {
          try {
            await sendReplyViaBot(ticket.id, textToSend);
            onUpdate({ ...ticket, status: 'in_work' });
          } catch (e) {
              alert("Ошибка отправки. Проверьте URL бота.");
              console.error(e);
          }
      }
  }

  const changeStatus = async (newStatus: TicketStatus) => {
      onUpdate({ ...ticket, status: newStatus });
      if (ticket.id.length > 10 && !ticket.id.startsWith('t-mock')) {
          await updateTicketStatus(ticket.id, newStatus);
      }
  }

  const changePriority = async (newPriority: Priority) => {
      onUpdate({ ...ticket, priority: newPriority });
      if (ticket.id.length > 10 && !ticket.id.startsWith('t-mock')) {
          await updateTicketPriority(ticket.id, newPriority);
      }
  }

  const handleDelete = async () => {
      if(confirm('Вы уверены, что хотите удалить эту заявку? Она будет скрыта из списка.')) {
          if (ticket.id.length > 10 && !ticket.id.startsWith('t-mock')) {
              await softDeleteTicket(ticket.id);
          }
          onUpdate({ ...ticket, isDeleted: true }); 
          onClose();
      }
  }

  const formatDate = (isoString: string) => {
      try {
        return new Date(isoString).toLocaleString('ru-RU', {
            day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
        });
      } catch (e) { return isoString; }
  }

  const catKey = Object.keys(CATEGORIES).find(key => CATEGORIES[key as keyof typeof CATEGORIES].name === ticket.category);
  const categoryEmoji = catKey ? CATEGORIES[catKey as keyof typeof CATEGORIES].emoji : '';

  const openLightbox = (url: string) => {
      const idx = allImages.findIndex(img => img.url === url);
      if (idx !== -1) setLightboxIndex(idx);
  };

  const nextImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      setLightboxIndex((prev) => (prev + 1) % allImages.length);
  };
  const prevImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Lightbox Overlay */}
      {lightboxIndex >= 0 && allImages.length > 0 && (
          <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4" onClick={() => setLightboxIndex(-1)}>
              <button className="absolute top-4 right-4 text-white hover:text-gray-300 z-50">
                  <X size={32} />
              </button>
              
              <img 
                 src={allImages[lightboxIndex].url} 
                 className="max-h-[90vh] max-w-[90vw] object-contain" 
                 onClick={(e) => e.stopPropagation()}
              />
              
              {allImages.length > 1 && (
                  <>
                    <button className="absolute left-4 text-white hover:bg-white/10 p-2 rounded-full" onClick={prevImage}>
                        <ChevronLeft size={48} />
                    </button>
                    <button className="absolute right-4 text-white hover:bg-white/10 p-2 rounded-full" onClick={nextImage}>
                        <ChevronRight size={48} />
                    </button>
                    <div className="absolute bottom-4 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                        {lightboxIndex + 1} / {allImages.length}
                    </div>
                  </>
              )}
          </div>
      )}

      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Left Side: Structured Data */}
        <div className="w-[400px] bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-white">
             <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-slate-800">Заявка <span className="text-xs text-slate-400 font-mono">#{ticket.id.slice(0, 8)}</span></h2>
                
                {/* Priority Dropdown */}
                <div className="relative group">
                    <button className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide border flex items-center gap-1 min-w-[100px] justify-between transition-colors
                        ${ticket.priority === 'critical' ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 
                          ticket.priority === 'high' ? 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100' :
                          ticket.priority === 'medium' ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100' :
                          'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'}`}>
                        {PRIORITY_LABELS[ticket.priority]}
                        <ChevronDown size={12} />
                    </button>
                    <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl hidden group-hover:block z-20 min-w-[140px] overflow-hidden">
                        {(['low', 'medium', 'high', 'critical'] as Priority[]).map(p => (
                            <button key={p} onClick={() => changePriority(p)} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-slate-50 text-slate-700 border-b border-slate-50 last:border-0 flex items-center justify-between group/item">
                                {PRIORITY_LABELS[p]}
                                {ticket.priority === p && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>}
                            </button>
                        ))}
                    </div>
                </div>
             </div>
             <div className="text-xs text-slate-500 flex items-center gap-1">
                 <Calendar size={12} />
                 {formatDate(ticket.createdAt)}
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Status Controls */}
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Статус</label>
                <div className="grid grid-cols-2 gap-2">
                    {Object.entries(STATUS_CONFIG).map(([id, config]) => {
                        const style = config.color.split('-')[1]; 
                        return (
                         <button 
                            key={id}
                            onClick={() => changeStatus(id as TicketStatus)} 
                            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all text-left shadow-sm
                            ${ticket.status === id 
                                ? `bg-${style}-50 border-${style}-400 text-${style}-800 ring-1 ring-${style}-300` 
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}`}>
                            {config.label}
                        </button>
                        );
                    })}
                </div>
            </div>

            {/* Classification */}
            <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Классификация</label>
                
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <Tag className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs text-slate-500">Категория</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-800 pl-6 flex items-center gap-2">
                        <span>{categoryEmoji}</span>
                        {ticket.category}
                    </div>
                    {ticket.subCategory && (
                        <div className="mt-2 ml-6 text-xs bg-slate-100 px-2 py-1 rounded inline-block text-slate-600">
                           {ticket.subCategory}
                        </div>
                    )}
                </div>

                {/* Extra Data */}
                {ticket.extraData && (
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 shadow-sm">
                         {ticket.extraData.routeNumber && (
                            <div className="flex items-center gap-3 mb-2">
                                <Bus size={16} className="text-yellow-600" />
                                <div>
                                    <div className="text-[10px] text-yellow-600 uppercase font-bold">Маршрут</div>
                                    <div className="text-sm font-bold text-yellow-900">{ticket.extraData.routeNumber}</div>
                                </div>
                            </div>
                         )}
                         {ticket.extraData.vehicleNumber && (
                            <div className="flex items-center gap-3">
                                <CreditCard size={16} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-500 uppercase font-bold">Госномер</div>
                                    <div className="text-sm font-mono font-bold text-slate-800">{ticket.extraData.vehicleNumber}</div>
                                </div>
                            </div>
                         )}
                    </div>
                )}
            </div>

            {/* Applicant Details */}
            <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Данные заявителя</label>
                
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-3 border-b border-slate-100 flex items-center gap-3">
                        <User className="w-4 h-4 text-slate-400" />
                        <div>
                            <div className="text-sm font-bold text-slate-800">{ticket.telegramUsername}</div>
                            <div className="text-[10px] text-slate-500">ID: {ticket.telegramUserId}</div>
                        </div>
                    </div>
                    <div className="p-3 space-y-2 bg-slate-50/50">
                        {ticket.contactPhone && (
                             <div className="flex items-center gap-2 text-sm text-slate-700">
                                <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <span className="font-mono">{ticket.contactPhone}</span>
                            </div>
                        )}
                        {ticket.location ? (
                            <div className="flex items-start gap-2 text-sm text-slate-700">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                                <span className="leading-snug">{ticket.location}</span>
                            </div>
                        ) : (
                             <div className="flex items-center gap-2 text-xs text-red-400">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Адрес не указан
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
             {/* Ticket Photos */}
            {ticket.attachments && ticket.attachments.length > 0 && (
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Фото ({ticket.attachments.length})</label>
                    <div className="grid grid-cols-2 gap-2">
                        {ticket.attachments.map((att, idx) => (
                             <div 
                                key={idx} 
                                onClick={() => openLightbox(att.url)}
                                className="aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative group cursor-pointer hover:ring-2 hover:ring-indigo-500"
                             >
                                <img src={att.url} alt="Evidence" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                             </div>
                        ))}
                    </div>
                </div>
            )}
            
            <div className="pt-4 border-t border-slate-200">
                <button onClick={handleDelete} className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 py-2 rounded-lg text-xs font-bold transition-colors">
                    <Trash2 size={14} />
                    Удалить заявку
                </button>
            </div>
            
          </div>
        </div>

        {/* Right Side: Chat & Description */}
        <div 
            className={`flex-1 flex flex-col bg-white overflow-hidden relative transition-colors ${isDragging ? 'bg-indigo-50 ring-4 ring-inset ring-indigo-400/50' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onPaste={handlePaste}
        >
          {isDragging && (
             <div className="absolute inset-0 z-50 flex items-center justify-center bg-indigo-50/90 pointer-events-none">
                 <div className="text-center text-indigo-600 animate-bounce">
                     <UploadCloud size={48} className="mx-auto mb-2" />
                     <p className="font-bold text-lg">Отпустите файл для загрузки</p>
                 </div>
             </div>
          )}

          {/* Header */}
          <div className="h-14 border-b border-slate-100 flex items-center justify-end px-4 gap-2 shrink-0">
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
            </button>
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-y-auto p-8 bg-white">
              
              <div className="mb-8 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                  <div className="flex items-center gap-2 mb-2 text-indigo-800 text-sm font-bold">
                      <MessageSquare className="w-4 h-4" />
                      Описание проблемы
                  </div>
                  <div className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {ticket.originalMessage}
                  </div>
              </div>

              {loadingHistory ? (
                  <div className="flex justify-center py-8">
                      <Loader2 className="animate-spin text-indigo-600" />
                  </div>
              ) : (
                <div className="space-y-6">
                    {localHistory.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
                            <div className={`flex flex-col max-w-[80%] ${msg.sender === 'user' ? 'items-start' : 'items-end'}`}>
                                <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm leading-relaxed ${
                                    msg.sender === 'user' 
                                    ? 'bg-white text-slate-700 border border-slate-200 rounded-tl-sm' 
                                    : 'bg-indigo-600 text-white rounded-tr-sm shadow-indigo-200'
                                }`}>
                                    {msg.text}
                                    {msg.attachments && msg.attachments.length > 0 && (
                                        <div className="mt-2 space-y-2">
                                            {msg.attachments.map((att, i) => (
                                                <img 
                                                    key={i} 
                                                    src={att.url} 
                                                    className="rounded-lg max-w-full max-h-40 border border-white/20 bg-black/10 cursor-pointer hover:opacity-90" 
                                                    onClick={() => openLightbox(att.url)} 
                                                    alt="attachment" 
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <span className="text-[10px] text-slate-400 mt-1 px-1">
                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {msg.sender === 'user' ? ticket.telegramUsername : 'Оператор'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
              )}
          </div>

          {/* Footer Input */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0">
             <div className="flex gap-2">
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileUpload}
                 />
                 <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="h-20 w-10 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors gap-1 disabled:opacity-50">
                     {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Paperclip size={20} />}
                     <span className="text-[9px]">Фото</span>
                 </button>
                 <textarea 
                    className="flex-1 border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none h-20 bg-white"
                    placeholder="Введите ответ... (Вставьте скриншот или перетащите файл)"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                        if(e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendReply();
                        }
                    }}
                 />
                 <button 
                    onClick={sendReply}
                    disabled={!replyText.trim()}
                    className="w-14 h-20 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl transition-all shadow-sm">
                    <Send size={20} />
                 </button>
             </div>
             <div className="mt-2 text-xs text-slate-400 flex justify-between px-1">
                 <span>Нажмите Enter для отправки</span>
                 <span>Drag & Drop и Ctrl+V для картинок</span>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
};