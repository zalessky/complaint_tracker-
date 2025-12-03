
import React, { useState, useEffect } from 'react';
import { Database, Copy, Terminal, FileText, Key, Cloud, Globe } from 'lucide-react';
import { setBotUrl, getBotUrl } from '../services/supabaseService';

interface IntegrationViewProps {
    onConnect: (url: string, key: string) => void;
    isConnected: boolean;
    isLoading: boolean;
    onSeedData?: () => void;
    onClearData?: () => void;
}

export const IntegrationView: React.FC<IntegrationViewProps> = ({ onConnect, isConnected, isLoading }) => {
  const [url, setUrl] = useState('https://zjfgvvzyiutosaiuljuk.supabase.co');
  const [key, setKey] = useState('sb_publishable_iWKnzCb6R9iBI4KYYUZzww_-1qFPgn3');
  const [botToken, setBotToken] = useState('');
  
  // Bot Proxy URL
  const [proxyUrl, setProxyUrl] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
      setProxyUrl(getBotUrl());
  }, []);

  const handleSaveUrl = () => {
      setBotUrl(proxyUrl);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
  };
  
  const [activeTab, setActiveTab] = useState<'sql' | 'bot' | 'render'>('render');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Скопировано в буфер обмена!");
  };

  const sqlCode = `-- SQL Схема для v0.9.16
ALTER TABLE complaints DISABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS complaints (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id BIGINT NOT NULL,
    username TEXT,
    contact_phone TEXT,
    category TEXT,
    sub_category TEXT,
    location TEXT,
    description TEXT,
    extra_data JSONB,
    photos TEXT[],
    status TEXT DEFAULT 'new',
    priority TEXT DEFAULT 'medium',
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES complaints(id),
    sender TEXT NOT NULL,
    message_text TEXT NOT NULL,
    attachments TEXT[],
    is_sent_to_telegram BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Безопасные миграции
DO $$ BEGIN
    BEGIN ALTER TABLE complaints ADD COLUMN contact_phone TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE complaints ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE ticket_messages ADD COLUMN is_sent_to_telegram BOOLEAN DEFAULT FALSE; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE ticket_messages ADD COLUMN attachments TEXT[]; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE complaints ADD COLUMN extra_data JSONB; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE complaints ADD COLUMN sub_category TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE complaints ADD COLUMN priority TEXT DEFAULT 'medium'; EXCEPTION WHEN duplicate_column THEN NULL; END;
END $$;
`;

  const botCode = `# Смотрите файлы в папке bot/ в вашем репозитории.
# main.py, handlers.py, database.py, config.py, keyboards.py
# Все они уже сгенерированы.
`;

  const renderGuide = `
# Инструкция по деплою (v0.9.16)

1. Убедитесь, что в репозитории есть папка "bot" с файлами.
2. Создайте Web Service на Render.com:
   - Root Directory: bot
   - Start Command: python main.py
3. Добавьте Environment Variables:
   - BOT_TOKEN
   - SUPABASE_URL
   - SUPABASE_KEY
   - PORT = 8000
4. После деплоя скопируйте URL сервиса (например https://my-bot.onrender.com)
5. Вставьте его в поле "URL Бота" ниже и сохраните.
`;

  return (
    <div className="h-full overflow-y-auto p-8 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Администрирование</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Supabase Config */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Key className="text-indigo-600"/> Подключение к БД</h3>
                <div className="space-y-4">
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Supabase URL</label>
                        <input value={url} disabled className="w-full border p-2 rounded text-sm mt-1 font-mono text-slate-600 bg-slate-50" />
                     </div>
                     <button onClick={()=>onConnect(url,key)} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors w-full">
                        {isLoading ? 'Подключение...' : isConnected ? 'Подключено' : 'Переподключить'}
                    </button>
                </div>
            </div>

            {/* Bot Config */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Globe className="text-emerald-600"/> Настройки Прокси</h3>
                <div className="space-y-4">
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">URL Бота (для картинок)</label>
                        <input 
                            value={proxyUrl} 
                            onChange={(e) => setProxyUrl(e.target.value)} 
                            placeholder="https://your-app.onrender.com" 
                            className="w-full border border-emerald-200 bg-emerald-50 p-2 rounded text-sm mt-1 font-mono text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none" 
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Без слэша в конце. Нужен для отображения фото из Telegram.</p>
                     </div>
                     <button onClick={handleSaveUrl} className={`w-full px-6 py-2 rounded-lg font-bold text-sm transition-colors ${isSaved ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        {isSaved ? 'Сохранено!' : 'Сохранить настройки'}
                    </button>
                </div>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
             <button onClick={()=>setActiveTab('render')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap flex items-center gap-2 ${activeTab==='render'?'bg-black text-white':'bg-white text-slate-600'}`}><Cloud size={16}/> Render.com</button>
             <button onClick={()=>setActiveTab('bot')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap flex items-center gap-2 ${activeTab==='bot'?'bg-emerald-600 text-white':'bg-white text-slate-600'}`}><Terminal size={16}/> Код Бота</button>
             <button onClick={()=>setActiveTab('sql')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap flex items-center gap-2 ${activeTab==='sql'?'bg-indigo-600 text-white':'bg-white text-slate-600'}`}><Database size={16}/> SQL Схема</button>
        </div>

        <div className="flex flex-col h-[400px] bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                <span className="font-bold text-slate-700 flex gap-2 items-center">
                   {activeTab==='render'?'Инструкция': activeTab==='bot'?'Структура бота': 'SQL'}
                </span>
                <button onClick={()=>copyToClipboard(activeTab==='bot'?botCode:activeTab==='sql'?sqlCode:renderGuide)} className="text-xs text-indigo-600 font-bold flex items-center gap-1 hover:underline">
                    <Copy size={14}/> Копировать
                </button>
            </div>
            
            <pre className="flex-1 bg-slate-900 text-slate-300 p-4 text-xs font-mono overflow-auto whitespace-pre-wrap leading-relaxed">
                {activeTab === 'bot' && botCode}
                {activeTab === 'sql' && sqlCode}
                {activeTab === 'render' && renderGuide}
            </pre>
        </div>

      </div>
    </div>
  );
};
