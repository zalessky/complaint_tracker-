from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, ReplyKeyboardMarkup, KeyboardButton
from config import CATEGORIES

def get_main_menu():
    return ReplyKeyboardMarkup(keyboard=[
        [KeyboardButton(text="📝 Новая заявка"), KeyboardButton(text="📂 Мои заявки")]
    ], resize_keyboard=True)

def get_categories_kb():
    buttons = []
    for key, val in CATEGORIES.items():
        buttons.append(InlineKeyboardButton(text=f"{val['emoji']} {val['name']}", callback_data=f"cat_{key}"))
    
    # Разбиваем на 2 колонки
    rows = [buttons[i:i + 2] for i in range(0, len(buttons), 2)]
    return InlineKeyboardMarkup(inline_keyboard=rows)

def get_subcategories_kb(cat_key):
    cat = CATEGORIES.get(cat_key)
    if not cat: return None
    
    buttons = [[InlineKeyboardButton(text=sub, callback_data=f"sub_{i}")] for i, sub in enumerate(cat['subs'])]
    buttons.append([InlineKeyboardButton(text="🔙 Назад", callback_data="back_to_cats")])
    return InlineKeyboardMarkup(inline_keyboard=buttons)

def get_skip_kb():
    return ReplyKeyboardMarkup(keyboard=[[KeyboardButton(text="Пропустить")]], resize_keyboard=True)

def get_geo_kb(required=False):
    row = [KeyboardButton(text="📍 Отправить геопозицию", request_location=True)]
    keyboard = [row]
    if not required:
        keyboard.append([KeyboardButton(text="Пропустить")])
    return ReplyKeyboardMarkup(keyboard=keyboard, resize_keyboard=True)

def get_phone_kb():
    return ReplyKeyboardMarkup(keyboard=[
        [KeyboardButton(text="📱 Отправить мой номер", request_contact=True)],
        [KeyboardButton(text="Пропустить")]
    ], resize_keyboard=True)
