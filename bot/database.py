import logging
from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_KEY

logger = logging.getLogger(__name__)

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("Supabase credentials missing!")
    supabase = None
else:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

async def create_complaint(user_id, username, phone, category, sub_category, location, description, extra_data, photo_ids):
    """Создает новую заявку в таблице complaints"""
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
            "photos": photo_ids, # Сохраняем массив file_id
            "status": "new",
            "priority": "medium"
        }
        response = supabase.table("complaints").insert(data).execute()
        return response.data
    except Exception as e:
        logger.error(f"DB Insert Error: {e}")
        return None

async def get_ticket_user_id(ticket_id):
    """Получает Telegram ID пользователя по ID заявки"""
    try:
        res = supabase.table("complaints").select("user_id").eq("id", ticket_id).single().execute()
        return res.data['user_id'] if res.data else None
    except Exception as e:
        logger.error(f"DB Fetch User Error: {e}")
        return None

async def save_operator_message(ticket_id, text, file_ids):
    """Сохраняет сообщение оператора с file_id вместо ссылок"""
    try:
        data = {
            "ticket_id": ticket_id,
            "sender": "operator",
            "message_text": text,
            "attachments": file_ids, # Массив file_id
            "is_sent_to_telegram": True # Мы отправляем его сразу через бота
        }
        supabase.table("ticket_messages").insert(data).execute()
        # Обновляем статус заявки
        supabase.table("complaints").update({"status": "in_work"}).eq("id", ticket_id).execute()
        return True
    except Exception as e:
        logger.error(f"DB Message Save Error: {e}")
        return False

async def get_unsent_operator_messages():
    """Legacy: Получает ответы (если вдруг записаны старым способом)"""
    try:
        res = supabase.table("ticket_messages")\
            .select("*, complaints(user_id)")\
            .eq("sender", "operator")\
            .eq("is_sent_to_telegram", False)\
            .execute()
        return res.data
    except Exception as e:
        logger.error(f"DB Fetch Error: {e}")
        return []

async def mark_message_as_sent(msg_id):
    try:
        supabase.table("ticket_messages").update({"is_sent_to_telegram": True}).eq("id", msg_id).execute()
    except Exception as e:
        logger.error(f"DB Update Error: {e}")

async def get_user_complaints(user_id, limit=5):
    try:
        res = supabase.table("complaints")\
            .select("category, status, created_at, description")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .limit(limit)\
            .execute()
        return res.data
    except Exception as e:
        logger.error(f"DB History Error: {e}")
        return []
