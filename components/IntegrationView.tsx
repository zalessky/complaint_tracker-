import React, { useState, useEffect } from 'react';
import { Database, Copy, Key, Globe, FileCode, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { setBotUrl, getBotUrl } from '../services/supabaseService';

// Embedded Code for Viewer - FULL SET
const FILES = {
    'main.py': `import asyncio
import logging
import os
import sys
from aiohttp import web
from aiogram import Bot, Dispatcher, types
from config import BOT_TOKEN, PORT
import handlers
import database

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

if not BOT_TOKEN:
    logger.error("BOT_TOKEN is missing!")
    sys.exit(1)

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()
dp.include_router(handlers.router)

# --- CORS MIDDLEWARE ---
@web.middleware
async def cors_middleware(request, handler):
    if request.method == "OPTIONS":
        response = web.Response(status=200)
    else:
        try:
            response = await handler(request)
        except Exception as e:
            logger.error(f"Handler Error: {e}")
            response = web.Response(status=500, text=str(e))
            
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

async def handle_health(request):
    return web.Response(text="OK")

async def handle_image_proxy(request):
    file_id = request.match_info.get('file_id')
    if not file_id: return web.Response(status=404, text="No file_id")
    try:
        file = await bot.get_file(file_id)
        file_bytes = await bot.download_file(file.file_path)
        if hasattr(file_bytes, 'read'): data = file_bytes.read()
        else: data = file_bytes 
        return web.Response(body=data, content_type="image/jpeg")
    except Exception as e:
        return web.Response(status=500, text="Proxy Error")

async def handle_reply_api(request):
    try:
        reader = await request.multipart()
        data = {}; file_data = None; filename = "image.jpg"
        while True:
            part = await reader.next()
            if part is None: break
            if part.name == 'file':
                file_data = await part.read()
                filename = part.filename or "image.jpg"
            else:
                text = await part.read(decode=True)
                data[part.name] = text.decode('utf-8')
        
        ticket_id = data.get('ticket_id')
        user_id = await database.get_ticket_user_id(ticket_id)
        if not user_id: return web.Response(status=404, text="User not found")
        
        file_ids = []
        if file_data:
            input_file = types.BufferedInputFile(file_data, filename=filename)
            msg = await bot.send_photo(chat_id=user_id, photo=input_file, caption=data.get('text'))
            file_ids.append(msg.photo[-1].file_id)
        elif data.get('text'):
            await bot.send_message(chat_id=user_id, text=data.get('text'))
            
        await database.save_operator_message(ticket_id, data.get('text', ''), file_ids)
        return web.Response(text="OK")
    except Exception as e:
        return web.Response(status=500, text=str(e))

async def start_web_server():
    app = web.Application(middlewares=[cors_middleware])
    app.router.add_get('/', handle_health)
    app.router.add_get('/images/{file_id}', handle_image_proxy)
    app.router.add_post('/api/reply', handle_reply_api)
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, '0.0.0.0', PORT)
    await site.start()
    logger.info(f"🌍 Web Server running on port {PORT}")

async def main():
    await start_web_server()
    logger.info("🚀 Bot started polling...")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())`,
    'requirements.txt': `aiogram==3.17.0
supabase==2.11.0
python-dotenv==1.0.1
aiohttp==3.9.3`,
    'config.py': `import os
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
PORT = int(os.getenv("PORT", 8000))

CATEGORIES = {
    'roads': {'name': 'Дороги', 'emoji': '🛣', 'subs': ['Яма на дороге', 'Стертая разметка', 'Отсутствует знак', 'Не работает светофор', 'Открытый люк', 'Брошенный автомобиль'], 'req_geo': True, 'req_photo': True},
    'trash': {'name': 'Мусор и уборка', 'emoji': '🗑', 'subs': ['Невывоз мусора', 'Переполненная урна', 'Стихийная свалка', 'Грязь на площадке', 'Выброс мусора из транспортного средства'], 'req_geo': True, 'req_photo': True},
    'transport': {'name': 'Общественный транспорт', 'emoji': '🚌', 'subs': ['Нарушение графика', 'Хамство водителя', 'Грязный салон', 'Проезд остановки', 'Неисправность ТС', 'Нарушение ПДД водителем'], 'req_extra': True, 'req_geo': False, 'req_photo': False},
    'light': {'name': 'Уличное освещение', 'emoji': '💡', 'subs': ['Не горит фонарь', 'Мигает свет', 'Поврежден столб', 'Оголенные провода'], 'req_geo': True, 'req_photo': True},
    'green': {'name': 'Зеленые насаждения', 'emoji': '🌳', 'subs': ['Упавшее дерево', 'Необходим покос травы', 'Сухостой', 'Сломаны ветки', 'Незаконная вырубка'], 'req_geo': True, 'req_photo': True},
    'facades': {'name': 'Фасады и здания', 'emoji': '🏢', 'subs': ['Граффити', 'Осыпается фасад', 'Сосульки/Снег', 'Разбитые стекла', 'Сломанные ступени'], 'req_geo': True, 'req_photo': True},
    'cleaning': {'name': 'Зимняя уборка', 'emoji': '❄️', 'subs': ['Нечищеный двор', 'Гололед', 'Снежный вал', 'Нечищеный тротуар'], 'req_geo': True, 'req_photo': True},
    'kids': {'name': 'Детские площадки', 'emoji': '🧸', 'subs': ['Сломаны качели', 'Мусор на площадке', 'Нет песка', 'Повреждено покрытие', 'Торчащие элементы'], 'req_geo': True, 'req_photo': True},
    'animals': {'name': 'Животные', 'emoji': '🐕', 'subs': ['Стая собак', 'Агрессивное животное', 'Заявка на биркование', 'Жестокое обращение'], 'req_geo': True, 'req_photo': True},
    'water': {'name': 'Водоснабжение', 'emoji': '🚿', 'subs': ['Нет холодной воды', 'Нет горячей воды', 'Ржавая вода', 'Слабый напор', 'Прорыв трубы'], 'req_geo': False},
    'heating': {'name': 'Отопление', 'emoji': '🌡', 'subs': ['Холодно в квартире', 'Слишком жарко', 'Течь батареи', 'Шум в системе'], 'req_geo': False},
    'electricity': {'name': 'Электроснабжение', 'emoji': '🔌', 'subs': ['Отключение света', 'Искрит щиток', 'Открыт щиток', 'Перепады напряжения'], 'req_geo': False},
    'sport': {'name': 'Спортплощадки', 'emoji': '🏃', 'subs': ['Сломан инвентарь', 'Повреждено покрытие', 'Мусор', 'Нет освещения'], 'req_geo': True, 'req_photo': True},
    'ads': {'name': 'Реклама и торговля', 'emoji': '📢', 'subs': ['Незаконная вывеска', 'Расклейка листовок', 'Незаконная торговля', 'Штендер мешает'], 'req_geo': True, 'req_photo': True},
    'feedback': {'name': 'Обратная связь', 'emoji': '✉️', 'subs': ['Предложение по улучшению', 'Сообщить об ошибке'], 'simple': True},
    'gratitude': {'name': 'Благодарность', 'emoji': '✅', 'subs': ['Благодарность'], 'simple': True},
    'other': {'name': 'Прочее', 'emoji': '❓', 'subs': ['Иное'], 'req_geo': False}
}`,
    'database.py': `import logging
from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_KEY

logger = logging.getLogger(__name__)

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("Supabase credentials missing!")
    supabase = None
else:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

async def create_complaint(user_id, username, phone, category, sub_category, location, description, extra_data, photo_ids):
    try:
        data = {
            "user_id": user_id,
            "username": f"@{username}" if username else "Anonymous",
            "contact_phone": phone,
            "category": category,
            "sub_category": sub_category,
            "location": location,
            "description": description,
            "extra_data": extra_data,
            "photos": photo_ids, 
            "status": "new",
            "priority": "medium"
        }
        response = supabase.table("complaints").insert(data).execute()
        return response.data
    except Exception as e:
        logger.error(f"DB Insert Error: {e}")
        return None

async def get_ticket_user_id(ticket_id):
    try:
        res = supabase.table("complaints").select("user_id").eq("id", ticket_id).single().execute()
        return res.data['user_id'] if res.data else None
    except Exception as e:
        logger.error(f"DB Fetch User Error: {e}")
        return None

async def save_operator_message(ticket_id, text, file_ids):
    try:
        data = {
            "ticket_id": ticket_id,
            "sender": "operator",
            "message_text": text,
            "attachments": file_ids,
            "is_sent_to_telegram": True 
        }
        supabase.table("ticket_messages").insert(data).execute()
        supabase.table("complaints").update({"status": "in_work"}).eq("id", ticket_id).execute()
        return True
    except Exception as e:
        logger.error(f"DB Message Save Error: {e}")
        return False

async def get_user_complaints(user_id, limit=5):
    try:
        res = supabase.table("complaints").select("category, status, created_at, description").eq("user_id", user_id).order("created_at", desc=True).limit(limit).execute()
        return res.data
    except Exception as e:
        logger.error(f"DB History Error: {e}")
        return []`,
    'handlers.py': `from aiogram import Router, F, types
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.filters import Command
import database
import keyboards
from config import CATEGORIES

router = Router()

class NewComplaint(StatesGroup):
    category = State(); subcategory = State(); extra_data = State(); photo = State(); location = State(); description = State(); phone = State()

@router.message(Command("start"))
async def cmd_start(message: types.Message):
    await message.answer("Добро пожаловать в Городской Помощник! 🏙️\\nЧто вы хотите сделать?", reply_markup=keyboards.get_main_menu())

@router.message(F.text == "📂 Мои заявки")
async def cmd_history(message: types.Message):
    items = await database.get_user_complaints(message.from_user.id)
    if not items: return await message.answer("У вас пока нет активных заявок.")
    text = "📂 <b>Ваши последние заявки:</b>\\n\\n"
    status_map = {'new': '🔴 Новая', 'in_work': '🟡 В работе', 'resolved': '🟢 Решено', 'rejected': '⚪ Отклонено', 'clarification_needed': '🟠 Уточнение'}
    for item in items:
        status = status_map.get(item['status'], item['status'])
        text += f"▪️ {item['category']} ({status})\\n<i>{item['description'][:30]}...</i>\\n\\n"
    await message.answer(text, parse_mode="HTML")

@router.message(F.text == "📝 Новая заявка")
async def start_complaint(message: types.Message, state: FSMContext):
    await state.clear()
    await message.answer("Выберите категорию обращения:", reply_markup=keyboards.get_categories_kb())
    await state.set_state(NewComplaint.category)

@router.callback_query(F.data.startswith("cat_"))
async def process_category(callback: types.CallbackQuery, state: FSMContext):
    cat_key = callback.data.split("_")[1]
    cat_data = CATEGORIES[cat_key]
    await state.update_data(cat_key=cat_key, category_name=cat_data['name'])
    await callback.message.edit_text(f"Категория: <b>{cat_data['name']}</b>.\\nУточните проблему:", reply_markup=keyboards.get_subcategories_kb(cat_key), parse_mode="HTML")
    await state.set_state(NewComplaint.subcategory)

@router.callback_query(F.data == "back_to_cats")
async def back_to_cats(callback: types.CallbackQuery, state: FSMContext):
    await start_complaint(callback.message, state)

@router.callback_query(F.data.startswith("sub_"))
async def process_subcategory(callback: types.CallbackQuery, state: FSMContext):
    sub_idx = int(callback.data.split("_")[1])
    data = await state.get_data()
    cat_conf = CATEGORIES[data['cat_key']]
    sub_name = cat_conf['subs'][sub_idx]
    await state.update_data(sub_category=sub_name)
    
    if cat_conf.get('simple'):
        await callback.message.answer("📝 Напишите ваш текст:", reply_markup=types.ReplyKeyboardRemove())
        await state.set_state(NewComplaint.description)
        return
    if cat_conf.get("req_extra"):
        await callback.message.answer("🚌 Укажите номер маршрута и госномер (если есть):", reply_markup=types.ReplyKeyboardRemove())
        await state.set_state(NewComplaint.extra_data)
        return
    await ask_photo(callback.message, state)

@router.message(NewComplaint.extra_data)
async def process_extra(message: types.Message, state: FSMContext):
    await state.update_data(extra_text=message.text)
    await ask_photo(message, state)

async def ask_photo(message: types.Message, state: FSMContext):
    await message.answer("📸 Пришлите фото (можно до 3-х штук) или нажмите Пропустить:", reply_markup=keyboards.get_skip_kb())
    await state.set_state(NewComplaint.photo)

@router.message(NewComplaint.photo)
async def process_photo(message: types.Message, state: FSMContext):
    data = await state.get_data(); photos = data.get('photos', [])
    if message.photo:
        photos.append(message.photo[-1].file_id)
        await state.update_data(photos=photos)
        if len(photos) >= 3: await ask_location(message, state)
        else: await message.answer(f"Фото добавлено ({len(photos)}/3). Еще?", reply_markup=keyboards.get_skip_kb())
        return
    if message.text == "Пропустить": await ask_location(message, state)
    else: await message.answer("Пожалуйста, пришлите фото или нажмите кнопку Пропустить.")

async def ask_location(message: types.Message, state: FSMContext):
    data = await state.get_data(); cat_conf = CATEGORIES[data['cat_key']]; req_geo = cat_conf.get("req_geo", False)
    text = "📍 Где это произошло?\\n(Отправьте геопозицию или напишите адрес)"
    if req_geo: text = "📍 <b>ОБЯЗАТЕЛЬНО</b> отправьте геопозицию (скрепка -> геопозиция)."
    await message.answer(text, reply_markup=keyboards.get_geo_kb(req_geo), parse_mode="HTML")
    await state.set_state(NewComplaint.location)

@router.message(NewComplaint.location)
async def process_location(message: types.Message, state: FSMContext):
    data = await state.get_data(); cat_conf = CATEGORIES[data['cat_key']]; req_geo = cat_conf.get("req_geo", False)
    loc_str = None
    if message.location: loc_str = f"{message.location.latitude},{message.location.longitude}"
    elif message.text and not req_geo: loc_str = message.text
    elif message.text and message.text == "Пропустить" and not req_geo: loc_str = "Не указано"
    else: return await message.answer("⛔ Для этой категории нужна именно Геопозиция.")
    await state.update_data(location=loc_str)
    await message.answer("📝 Опишите проблему подробно:", reply_markup=types.ReplyKeyboardRemove())
    await state.set_state(NewComplaint.description)

@router.message(NewComplaint.description)
async def process_description(message: types.Message, state: FSMContext):
    await state.update_data(description=message.text)
    await message.answer("📞 Оставьте номер для связи:", reply_markup=keyboards.get_phone_kb())
    await state.set_state(NewComplaint.phone)

@router.message(NewComplaint.phone)
async def process_phone(message: types.Message, state: FSMContext):
    phone = message.contact.phone_number if message.contact else message.text
    data = await state.get_data()
    extra = {}; 
    if 'extra_text' in data: extra['info'] = data['extra_text']
    res = await database.create_complaint(message.from_user.id, message.from_user.username, phone, data['category_name'], data['sub_category'], data.get('location'), data['description'], extra, data.get('photos', []))
    if res: await message.answer("✅ <b>Заявка принята!</b>", reply_markup=keyboards.get_main_menu(), parse_mode="HTML")
    else: await message.answer("❌ Ошибка при сохранении.", reply_markup=keyboards.get_main_menu())
    await state.clear()`,
    'keyboards.py': `from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, ReplyKeyboardMarkup, KeyboardButton
from config import CATEGORIES

def get_main_menu():
    return ReplyKeyboardMarkup(keyboard=[[KeyboardButton(text="📝 Новая заявка"), KeyboardButton(text="📂 Мои заявки")]], resize_keyboard=True)

def get_categories_kb():
    buttons = []
    for key, val in CATEGORIES.items():
        buttons.append(InlineKeyboardButton(text=f"{val['emoji']} {val['name']}", callback_data=f"cat_{key}"))
    rows = [buttons[i:i + 2] for i in range(0, len(buttons), 2)]
    return InlineKeyboardMarkup(inline_keyboard=rows)

def get_subcategories_kb(cat_key):
    cat = CATEGORIES.get(cat_key)
    if not cat: return None
    buttons = [[InlineKeyboardButton(text=sub, callback_data=f"sub_{i}")] for i, sub in enumerate(cat['subs'])]
    buttons.append([InlineKeyboardButton(text="🔙 Назад", callback_data="back_to_cats")])
    return InlineKeyboardMarkup(inline_keyboard=buttons)

def get_skip_kb(): return ReplyKeyboardMarkup(keyboard=[[KeyboardButton(text="Пропустить")]], resize_keyboard=True)
def get_geo_kb(required=False):
    row = [KeyboardButton(text="📍 Отправить геопозицию", request_location=True)]
    keyboard = [row]
    if not required: keyboard.append([KeyboardButton(text="Пропустить")])
    return ReplyKeyboardMarkup(keyboard=keyboard, resize_keyboard=True)
def get_phone_kb():
    return ReplyKeyboardMarkup(keyboard=[[KeyboardButton(text="📱 Отправить мой номер", request_contact=True)], [KeyboardButton(text="Пропустить")]], resize_keyboard=True)`
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
      setProxyUrl(getBotUrl());
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