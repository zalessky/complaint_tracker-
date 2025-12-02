import React from 'react';
import { 
  Server, 
  Bot, 
  ArrowRight,
  GitBranch,
  Layout,
  Database,
  Rocket,
  Cloud,
  Lock,
  AlertTriangle
} from 'lucide-react';

export const StrategyView: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto p-8 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Инструкция по Деплою (Koyeb)</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Как запустить бота в облаке бесплатно и избежать ошибок
          </p>
        </div>

        {/* Troubleshooting */}
        <div className="bg-red-50 p-6 rounded-xl border border-red-100 shadow-sm mb-8">
            <h3 className="font-bold text-red-800 flex items-center gap-2 mb-2">
                <AlertTriangle size={20}/>
                Решение проблем (Troubleshooting)
            </h3>
            <p className="text-sm text-red-700 mb-2 font-semibold">
                Ошибка: "Application exited with code 1"
            </p>
            <p className="text-sm text-red-600 mb-4">
                Это значит, что бот упал при запуске. Частые причины:
            </p>
            <ul className="list-disc ml-5 text-sm text-red-700 space-y-1">
                <li>
                    <strong>Нет переменных окружения:</strong> Вы забыли добавить <code>BOT_TOKEN</code> или ключи Supabase в настройках Koyeb.
                </li>
                <li>
                    <strong>Koyeb убивает процесс:</strong> Koyeb по умолчанию проверяет порт 8000. В новой версии v0.8.8 мы добавили веб-сервер заглушку, чтобы это исправить.
                </li>
            </ul>
        </div>

        {/* Development Paths */}
        <div className="grid grid-cols-1 gap-6">
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                        <Cloud className="text-indigo-600 w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg">Запуск на Koyeb</h3>
                </div>
                
                <div className="space-y-6 text-sm text-slate-700">
                    <div>
                        <span className="font-bold text-slate-900 block mb-1">Шаг 1. Подготовка файлов</span>
                        <p>Возьмите код из вкладки "Интеграция" (main.py, requirements.txt, Procfile) и загрузите на GitHub.</p>
                    </div>

                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                        <span className="font-bold text-indigo-800 block mb-2 flex items-center gap-2">
                           <Lock size={16}/> Шаг 2. Настройка Секретов (Environment Variables)
                        </span>
                        <p className="text-indigo-700 mb-2">В панели Koyeb найдите раздел <strong>Environment Variables</strong> и добавьте:</p>
                        <ul className="list-disc ml-5 text-indigo-800 font-mono text-xs">
                            <li>BOT_TOKEN = (Ваш токен от @BotFather)</li>
                            <li>SUPABASE_URL = (URL вашей базы)</li>
                            <li>SUPABASE_KEY = (Ключ anon_public)</li>
                        </ul>
                    </div>
                    
                    <div>
                        <span className="font-bold text-slate-900 block mb-1">Шаг 3. Health Checks</span>
                        <p>
                            В настройках сервиса Koyeb, раздел "Health checks":<br/>
                            <strong>Port:</strong> 8000<br/>
                            <strong>Protocol:</strong> HTTP<br/>
                            <strong>Path:</strong> /
                        </p>
                    </div>
                </div>
            </div>

        </div>

      </div>
    </div>
  );
};