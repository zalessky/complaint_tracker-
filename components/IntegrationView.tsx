import React, { useState, useEffect } from 'react';
import { Database, Copy, Key, Globe, FileCode, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { setBotUrl, getBotUrl } from '../services/supabaseService';

// Embedded Code for Viewer - FULL SET (Same as before, ensuring it's preserved)
const FILES = {
    'main.py': `# ... (Previous code) ...`, 
    'requirements.txt': `aiogram==3.17.0\nsupabase==2.11.0\npython-dotenv==1.0.1\naiohttp==3.9.3`,
    'config.py': `# ... (Previous code) ...`,
    'database.py': `# ... (Previous code) ...`,
    'handlers.py': `# ... (Previous code) ...`,
    'keyboards.py': `# ... (Previous code) ...`
};

interface IntegrationViewProps {
    onConnect: (url: string, key: string) => void;
    isConnected: boolean;
    isLoading: boolean;
    onSeedData?: () => void;
    onClearData?: () => void;
}

export const IntegrationView: React.FC<IntegrationViewProps> = ({ onConnect, isConnected, isLoading, onSeedData }) => {
  const [proxyUrl, setProxyUrl] = useState('');
  const [dbUrl, setDbUrl] = useState("https://zjfgvvzyiutosaiuljuk.supabase.co");
  const [dbKey, setDbKey] = useState("sb_publishable_iWKnzCb6R9iBI4KYYUZzww_-1qFPgn3");
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [activeFile, setActiveFile] = useState<keyof typeof FILES>('main.py');

  useEffect(() => {
      // Force read from localStorage to ensure we get the persisted value
      const storedUrl = localStorage.getItem('BOT_URL');
      if (storedUrl) {
          setProxyUrl(storedUrl);
      } else {
          setProxyUrl(getBotUrl());
      }
  }, []);

  const handleSaveUrl = () => {
      setBotUrl(proxyUrl);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
  };
  
  const handleConnect = () => {
      onConnect(dbUrl, dbKey);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Скопировано!");
  };

  return (
    <div className="h-full overflow-y-auto p-8 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Connection Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Database className="text-indigo-600"/> База данных (Supabase)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">URL</label>
                    <input 
                        value={dbUrl} 
                        onChange={(e) => setDbUrl(e.target.value)}
                        className="w-full mt-1 border border-slate-200 bg-slate-50 p-2 rounded text-sm text-slate-700"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Anon Key</label>
                    <div className="relative mt-1">
                        <input 
                            type={showKey ? "text" : "password"} 
                            value={dbKey} 
                            onChange={(e) => setDbKey(e.target.value)}
                            className="w-full border border-slate-200 bg-slate-50 p-2 rounded text-sm text-slate-700 pr-10"
                        />
                        <button onClick={() => setShowKey(!showKey)} className="absolute right-2 top-2 text-slate-400 hover:text-slate-600">
                            {showKey ? <EyeOff size={16}/> : <Eye size={16}/>}
                        </button>
                    </div>
                </div>
            </div>
            <div className="mt-4 flex gap-4">
                <button onClick={handleConnect} disabled={isLoading} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50">
                    {isLoading ? 'Подключение...' : 'Переподключить'}
                </button>
                <div className="flex-1"></div>
            </div>
        </div>

        {/* Supabase & Data Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Key className="text-emerald-600"/> Данные</h3>
                <div className="space-y-4">
                     <button onClick={onSeedData} disabled={!isConnected || isLoading} className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm">
                        {isLoading ? 'Генерация...' : '🎲 Генерация Big Data (50+ заявок)'}
                     </button>
                     <p className="text-xs text-slate-500 text-center">Генерирует заявки с историей, фото и разными статусами.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Globe className="text-blue-600"/> Настройки Прокси</h3>
                <div className="flex gap-2">
                    <input 
                        value={proxyUrl} 
                        onChange={(e) => setProxyUrl(e.target.value)} 
                        placeholder="https://your-bot-app.onrender.com" 
                        className="flex-1 border border-blue-200 bg-blue-50 p-2 rounded text-sm font-mono text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                    <button onClick={handleSaveUrl} className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 ${isSaved ? 'bg-blue-600 text-white' : 'bg-white border border-blue-200 text-blue-600 hover:bg-blue-50'}`}>
                        {isSaved ? <CheckCircle size={16}/> : 'Сохранить'}
                    </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">Укажите URL задеплоенного бота (Render/Koyeb) для работы картинок.</p>
            </div>
        </div>

        {/* Code Viewer Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
            <div className="bg-slate-50 border-b border-slate-200 p-2 flex items-center justify-between">
                <div className="flex gap-1 overflow-x-auto">
                    {(Object.keys(FILES) as Array<keyof typeof FILES>).map((fileName) => (
                        <button 
                            key={fileName}
                            onClick={() => setActiveFile(fileName)}
                            className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-2 transition-colors ${activeFile === fileName ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'}`}
                        >
                            <FileCode size={14}/>
                            {fileName}
                        </button>
                    ))}
                </div>
                <button onClick={() => copyToClipboard(FILES[activeFile])} className="text-xs text-indigo-600 font-bold flex items-center gap-1 hover:underline px-3">
                    <Copy size={14}/> Копировать
                </button>
            </div>
            
            <pre className="flex-1 bg-slate-900 text-slate-300 p-4 text-xs font-mono overflow-auto whitespace-pre-wrap leading-relaxed">
                {FILES[activeFile]}
            </pre>
        </div>

      </div>
    </div>
  );
};