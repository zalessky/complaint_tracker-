import asyncio
import logging
import os
import sys
from aiohttp import web
from aiogram import Bot, Dispatcher
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

# --- PROXY SERVER LOGIC ---
async def handle_health(request):
    return web.Response(text="OK")

async def handle_image_proxy(request):
    """
    Проксирует запрос картинки из Telegram.
    Frontend запрашивает: GET /images/{file_id}
    Бот скачивает с Telegram API и отдает байты.
    """
    file_id = request.match_info.get('file_id')
    if not file_id:
        return web.Response(status=404, text="No file_id")
    
    try:
        file = await bot.get_file(file_id)
        # Получаем поток байтов
        file_bytes = await bot.download_file(file.file_path)
        
        # Читаем данные (в памяти, т.к. картинки небольшие)
        if hasattr(file_bytes, 'read'):
            data = file_bytes.read()
        else:
            data = file_bytes # Если это bytes
            
        return web.Response(body=data, content_type="image/jpeg")
    except Exception as e:
        logger.error(f"Proxy Error: {e}")
        return web.Response(status=500, text="Image proxy error")

async def start_web_server():
    app = web.Application()
    app.router.add_get('/', handle_health)
    app.router.add_get('/health', handle_health)
    app.router.add_get('/images/{file_id}', handle_image_proxy)
    
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, '0.0.0.0', PORT)
    await site.start()
    logger.info(f"🌍 Web Server & Image Proxy running on port {PORT}")

async def operator_reply_loop():
    """Фоновая задача для отправки ответов оператора"""
    logger.info("🔄 Operator reply loop started")
    while True:
        try:
            messages = await database.get_unsent_operator_messages()
            for msg in messages:
                user_id = msg['complaints']['user_id']
                text = f"👨‍💻 <b>Ответ оператора:</b>\n{msg['message_text']}"
                
                # Если есть вложения (фото)
                if msg.get('attachments'):
                    for url in msg['attachments']:
                        await bot.send_photo(user_id, photo=url, caption=text, parse_mode="HTML")
                        text = "" # Чтобы не слать текст дважды, если фото несколько
                
                if text:
                    await bot.send_message(user_id, text, parse_mode="HTML")
                
                await database.mark_message_as_sent(msg['id'])
                
        except Exception as e:
            logger.error(f"Reply loop error: {e}")
        
        await asyncio.sleep(5)

async def main():
    await start_web_server()
    asyncio.create_task(operator_reply_loop())
    
    logger.info("🚀 Bot started polling...")
    await dp.start_polling(bot)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logger.info("Bot stopped")
