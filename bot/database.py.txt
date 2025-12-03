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

async def get_unsent_operator_messages():
    """Получает ответы операторов, которые еще не отправлены в Telegram"""
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
    """Помечает сообщение как отправленное"""
    try:
        supabase.table("ticket_messages").update({"is_sent_to_telegram": True}).eq("id", msg_id).execute()
    except Exception as e:
        logger.error(f"DB Update Error: {e}")

async def get_user_complaints(user_id, limit=5):
    """Получает последние заявки пользователя"""
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
