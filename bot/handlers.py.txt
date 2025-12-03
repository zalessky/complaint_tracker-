from aiogram import Router, F, types
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.filters import Command
import database
import keyboards
from config import CATEGORIES

router = Router()

class NewComplaint(StatesGroup):
    category = State()
    subcategory = State()
    extra_data = State() # Для транспорта
    photo = State()
    location = State()
    description = State()
    phone = State()

@router.message(Command("start"))
async def cmd_start(message: types.Message):
    await message.answer("Добро пожаловать в Городской Помощник! 🏙️\nЧто вы хотите сделать?", reply_markup=keyboards.get_main_menu())

@router.message(F.text == "📂 Мои заявки")
async def cmd_history(message: types.Message):
    items = await database.get_user_complaints(message.from_user.id)
    if not items:
        return await message.answer("У вас пока нет активных заявок.")
    
    text = "📂 <b>Ваши последние заявки:</b>\n\n"
    status_map = {
        'new': '🔴 Новая', 'in_work': '🟡 В работе', 'resolved': '🟢 Решено', 
        'rejected': '⚪ Отклонено', 'clarification_needed': '🟠 Уточнение'
    }
    for item in items:
        status = status_map.get(item['status'], item['status'])
        desc = item['description'][:30] + "..." if len(item['description']) > 30 else item['description']
        text += f"▪️ {item['category']} ({status})\n<i>{desc}</i>\n\n"
    
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
    
    await callback.message.edit_text(f"Категория: <b>{cat_data['name']}</b>.\nУточните проблему:", 
                                     reply_markup=keyboards.get_subcategories_kb(cat_key),
                                     parse_mode="HTML")
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
    
    # 1. Если это простая категория (Благодарность/Обратная связь)
    if cat_conf.get('simple'):
        await callback.message.answer("📝 Напишите ваш текст:", reply_markup=types.ReplyKeyboardRemove())
        await state.set_state(NewComplaint.description)
        return

    # 2. Если требует доп данных (Транспорт)
    if cat_conf.get("req_extra"):
        await callback.message.answer("🚌 Укажите номер маршрута и госномер (если есть):", reply_markup=types.ReplyKeyboardRemove())
        await state.set_state(NewComplaint.extra_data)
        return

    # 3. Иначе фото
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
    data = await state.get_data()
    photos = data.get('photos', [])
    
    if message.photo:
        # Сохраняем file_id самого большого фото
        photos.append(message.photo[-1].file_id)
        await state.update_data(photos=photos)
        
        if len(photos) >= 3:
            await ask_location(message, state)
        else:
            await message.answer(f"Фото добавлено ({len(photos)}/3). Еще?", reply_markup=keyboards.get_skip_kb())
        return

    if message.text == "Пропустить":
        await ask_location(message, state)
    else:
        await message.answer("Пожалуйста, пришлите фото или нажмите кнопку Пропустить.")

async def ask_location(message: types.Message, state: FSMContext):
    data = await state.get_data()
    cat_conf = CATEGORIES[data['cat_key']]
    req_geo = cat_conf.get("req_geo", False)
    
    text = "📍 Где это произошло?\n(Отправьте геопозицию или напишите адрес)"
    if req_geo:
        text = "📍 <b>ОБЯЗАТЕЛЬНО</b> отправьте геопозицию (скрепка -> геопозиция). Текстовые адреса в этой категории не принимаются."
    
    await message.answer(text, reply_markup=keyboards.get_geo_kb(req_geo), parse_mode="HTML")
    await state.set_state(NewComplaint.location)

@router.message(NewComplaint.location)
async def process_location(message: types.Message, state: FSMContext):
    data = await state.get_data()
    cat_conf = CATEGORIES[data['cat_key']]
    req_geo = cat_conf.get("req_geo", False)

    loc_str = None
    if message.location:
        loc_str = f"{message.location.latitude},{message.location.longitude}"
    elif message.text and not req_geo:
        loc_str = message.text
    elif message.text and message.text == "Пропустить" and not req_geo:
        loc_str = "Не указано"
    else:
        await message.answer("⛔ Для этой категории нужна именно Геопозиция (точка на карте). Попробуйте еще раз.")
        return

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
    
    # Парсинг доп данных для транспорта
    extra = {}
    if 'extra_text' in data:
        extra['info'] = data['extra_text']

    # Запись в БД
    res = await database.create_complaint(
        user_id=message.from_user.id,
        username=message.from_user.username,
        phone=phone,
        category=data['category_name'],
        sub_category=data['sub_category'],
        location=data.get('location'),
        description=data['description'],
        extra_data=extra,
        photo_ids=data.get('photos', [])
    )

    if res:
        await message.answer("✅ <b>Заявка принята!</b>\nСпасибо за ваше обращение.", reply_markup=keyboards.get_main_menu(), parse_mode="HTML")
    else:
        await message.answer("❌ Ошибка при сохранении. Попробуйте позже.", reply_markup=keyboards.get_main_menu())
    
    await state.clear()
