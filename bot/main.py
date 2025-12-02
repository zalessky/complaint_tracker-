import asyncio
import logging
import uuid
import os
import sys
from aiohttp import web
from aiogram import Bot, Dispatcher, F, types
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

logger.info("Startup: Checking environment variables...")
BOT_TOKEN = os.getenv("BOT_TOKEN")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
PORT = int(os.getenv("PORT", 8000))

if not BOT_TOKEN or not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("❌ FATAL: Credentials missing. Set BOT_TOKEN, SUPABASE_URL, SUPABASE_KEY.")
    sys.exit(1)

try:
    bot = Bot(token=BOT_TOKEN)
    dp = Dispatcher()
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    logger.info("✅ Supabase connected successfully")
except Exception as e:
    logger.error(f"❌ FATAL: Initialization failed: {e}")
    sys.exit(1)

CATEGORIES = {
  'roads': { 'name': 'Дороги', 'emoji': '🛣', 'subs': ['Яма на дороге', 'Стертая разметка', 'Отсутствует знак', 'Не работает светофор', 'Открытый люк'], 'req_geo': True },
  'trash': { 'name': 'Мусор', 'emoji': '🗑', 'subs': ['Невывоз мусора', 'Переполненная урна', 'Свалка', 'Грязь на контейнерной площадке'], 'req_geo': True },
  'transport': { 'name': 'Транспорт', 'emoji': '🚌', 'subs': ['Нарушение графика', 'Хамство водителя', 'Грязный салон', 'Проезд остановки', 'Неисправность ТС'], 'req_extra': True },
  'light': { 'name': 'Освещение', 'emoji': '💡', 'subs': ['Не горит фонарь', 'Мигает свет', 'Поврежден столб', 'Оголенные провода'] },
  'green': { 'name': 'Зеленые насаждения', 'emoji': '🌳', 'subs': ['Упавшее дерево', 'Необходим покос травы', 'Сухостой', 'Сломаны ветки'] },
  'facades': { 'name': 'Фасады и крыши', 'emoji': '🏢', 'subs': ['Граффити', 'Осыпается фасад', 'Сосульки/Снег на крыше', 'Незаконная реклама'] },
  'cleaning': { 'name': 'Уборка снега', 'emoji': '❄️', 'subs': ['Нечищеный двор', 'Гололед', 'Снежный вал', 'Нечищеный тротуар'] },
  'kids': { 'name': 'Детские площадки', 'emoji': '🧸', 'subs': ['Сломаны качели', 'Мусор на площадке', 'Нет песка', 'Повреждено покрытие'] },
  'animals': { 'name': 'Животные', 'emoji': '🐕', 'subs': ['Стая бездомных собак', 'Агрессивное животное', 'Заявка на биркование'], 'req_geo': True },
  'water': { 'name': 'Водоснабжение', 'emoji': '🚿', 'subs': ['Нет холодной воды', 'Нет горячей воды', 'Ржавая вода', 'Слабый напор'] },
  'heating': { 'name': 'Отопление', 'emoji': '🌡', 'subs': ['Холодно в квартире', 'Слишком жарко', 'Течь батареи'] },
  'electricity': { 'name': 'Электричество', 'emoji': '🔌', 'subs': ['Отключение света', 'Искрит щиток', 'Открыт щиток в подъезде'] },
  'sport': { 'name': 'Спортплощадки', 'emoji': '🏃', 'subs': ['Сломан инвентарь', 'Повреждено покрытие', 'Мусор'] },
  'ads': { 'name': 'Реклама', 'emoji': '📢', 'subs': ['Незаконная вывеска', 'Расклейка листовок', 'Штендер на тротуаре'] },
  'feedback': { 'name': 'Обратная связь', 'emoji': '📢', 'subs': ['Предложение по улучшению', 'Сообщить об ошибке'], 'simple': True },
  'gratitude': { 'name': 'Благодарность', 'emoji': '✅', 'subs': ['Благодарность'], 'simple': True },
  'other': { 'name': 'Прочее', 'emoji': '❓', 'subs': ['Иное'] }
}

class NewComplaint(StatesGroup):
    category = State()
    subcategory = State()
    extra_data = State()
    photo = State()
    location = State()
    description = State()
    phone = State()

def get_main_menu():
    return types.ReplyKeyboardMarkup(keyboard=[
        [types.KeyboardButton(text="📝 Новая заявка"), types.KeyboardButton(text="📂 Мои заявки")]
    ], resize_keyboard=True)

async def upload_photo(file_id: str) -> str:
    try:
        file_info = await bot.get_file(file_id)
        file_bytes = await bot.download_file(file_info.file_path)
        filename = f"{uuid.uuid4()}.jpg"
        supabase.storage.from_("evidence").upload(filename, file_bytes.read(), {"content-type": "image/jpeg"})
        return supabase.storage.from_("evidence").get_public_url(filename).public_url
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        return ""

@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    await message.answer("Городской Помощник v0.9.10 готов.", reply_markup=get_main_menu())

@dp.message(F.text == "📂 Мои заявки")
async def cmd_my_complaints(message: types.Message):
    res = supabase.table("complaints").select("*").eq("user_id", message.from_user.id).order("created_at", desc=True).limit(5).execute()
    if not res.data: return await message.answer("У вас нет активных заявок.")
    text = "📂 <b>Ваши заявки:</b>\n\n"
    for item in res.data:
        text += f"🔸 <b>{item['category']}</b>: {item['status']}\n"
    await message.answer(text, parse_mode="HTML")

@dp.message(F.text == "📝 Новая заявка")
async def start_flow(message: types.Message, state: FSMContext):
    buttons = [types.InlineKeyboardButton(text=f"{val['emoji']} {val['name']}", callback_data=f"cat_{key}") for key, val in CATEGORIES.items()]
    rows = [buttons[i:i + 2] for i in range(0, len(buttons), 2)]
    await message.answer("Выберите категорию:", reply_markup=types.InlineKeyboardMarkup(inline_keyboard=rows))
    await state.set_state(NewComplaint.category)

@dp.callback_query(F.data.startswith("cat_"))
async def process_cat(callback: types.CallbackQuery, state: FSMContext):
    cat_key = callback.data.split("_")[1]
    cat_data = CATEGORIES[cat_key]
    await state.update_data(cat_key=cat_key, category=cat_data['name'])
    sub_buttons = [[types.InlineKeyboardButton(text=sub, callback_data=f"sub_{sub[:20]}")] for sub in cat_data['subs']]
    await callback.message.edit_text(f"Категория: {cat_data['name']}. Уточните:", reply_markup=types.InlineKeyboardMarkup(inline_keyboard=sub_buttons))
    await state.set_state(NewComplaint.subcategory)

@dp.callback_query(F.data.startswith("sub_"))
async def process_sub(callback: types.CallbackQuery, state: FSMContext):
    sub = callback.data.split("_")[1]
    await state.update_data(sub_category=sub)
    data = await state.get_data()
    cat_conf = CATEGORIES[data['cat_key']]
    
    # Simple flow for feedback/gratitude
    if cat_conf.get('simple'):
         await callback.message.answer("📝 Напишите ваш текст:")
         await state.set_state(NewComplaint.description)
         return

    if cat_conf.get("req_extra"):
        await callback.message.answer("🚌 Номер маршрута и госномер:")
        await state.set_state(NewComplaint.extra_data)
    else:
        await ask_photo(callback.message, state)

@dp.message(NewComplaint.extra_data)
async def process_extra(message: types.Message, state: FSMContext):
    await state.update_data(extra_text=message.text)
    await ask_photo(message, state)

async def ask_photo(message: types.Message, state: FSMContext):
    await message.answer("📸 Пришлите фото (или нажмите Пропустить):", reply_markup=types.ReplyKeyboardMarkup(keyboard=[[types.KeyboardButton(text="Пропустить")]], resize_keyboard=True))
    await state.set_state(NewComplaint.photo)

@dp.message(NewComplaint.photo)
async def process_photo(message: types.Message, state: FSMContext):
    url = await upload_photo(message.photo[-1].file_id) if message.photo else None
    await state.update_data(photos=[url] if url else [])
    kb = [[types.KeyboardButton(text="📍 Отправить гео", request_location=True)]]
    if not CATEGORIES[(await state.get_data())['cat_key']].get("req_geo"): kb.append([types.KeyboardButton(text="Пропустить")])
    await message.answer("📍 Где это случилось?", reply_markup=types.ReplyKeyboardMarkup(keyboard=kb, resize_keyboard=True))
    await state.set_state(NewComplaint.location)

@dp.message(NewComplaint.location)
async def process_loc(message: types.Message, state: FSMContext):
    loc = f"{message.location.latitude},{message.location.longitude}" if message.location else message.text
    await state.update_data(location=loc)
    await message.answer("📝 Опишите проблему:", reply_markup=types.ReplyKeyboardRemove())
    await state.set_state(NewComplaint.description)

@dp.message(NewComplaint.description)
async def process_desc(message: types.Message, state: FSMContext):
    await state.update_data(desc=message.text)
    kb = [[types.KeyboardButton(text="📱 Отправить мой номер", request_contact=True)], [types.KeyboardButton(text="Пропустить")]]
    await message.answer("📞 Оставьте номер для связи (нажмите кнопку или напишите):", reply_markup=types.ReplyKeyboardMarkup(keyboard=kb, resize_keyboard=True))
    await state.set_state(NewComplaint.phone)

@dp.message(NewComplaint.phone)
async def process_phone(message: types.Message, state: FSMContext):
    phone = message.contact.phone_number if message.contact else message.text
    data = await state.get_data()
    extra = {}
    if 'extra_text' in data:
        parts = data['extra_text'].split()
        extra['routeNumber'] = parts[0]
    
    supabase.table("complaints").insert({
        "user_id": message.from_user.id,
        "username": f"@{message.from_user.username}",
        "contact_phone": phone,
        "category": data['category'],
        "sub_category": data['sub_category'],
        "location": data.get('location'),
        "description": data['desc'],
        "extra_data": extra,
        "photos": data.get('photos', []),
        "status": "new",
        "priority": "medium"
    }).execute()
    await message.answer("✅ Заявка принята!", reply_markup=get_main_menu())
    await state.clear()

async def check_operator_replies():
    logger.info("ℹ️ Started operator reply loop")
    while True:
        try:
            res = supabase.table("ticket_messages").select("*, complaints(user_id)").eq("sender", "operator").eq("is_sent_to_telegram", False).execute()
            for msg in res.data:
                user_id = msg['complaints']['user_id']
                text = f"👨‍💻 Ответ: {msg['message_text']}"
                if msg.get('attachments'):
                    for url in msg['attachments']: await bot.send_photo(user_id, photo=url, caption=text); text=""
                if text: await bot.send_message(user_id, text)
                supabase.table("ticket_messages").update({"is_sent_to_telegram": True}).eq("id", msg['id']).execute()
        except Exception as e: logger.error(f"Loop error: {e}")
        await asyncio.sleep(5)

# --- WEB SERVER FOR RENDER HEALTH CHECKS ---
async def health_check(request):
    return web.Response(text="OK")

async def run_web_server():
    app = web.Application()
    app.router.add_get("/", health_check)
    app.router.add_get("/health", health_check)
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, "0.0.0.0", PORT)
    logger.info(f"🌍 Web server started on port {PORT}")
    await site.start()

async def main():
    await run_web_server() # Start health check server
    asyncio.create_task(check_operator_replies()) # Start operator reply loop
    await dp.start_polling(bot) # Start bot

if __name__ == "__main__": 
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logger.info("Bot stopped!")
