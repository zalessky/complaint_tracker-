import asyncio
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

# --- PROXY & API LOGIC ---
async def handle_health(request):
    return web.Response(text="OK")

async def handle_image_proxy(request):
    """
    GET /images/{file_id}
    Скачивает файл из Telegram и стримит его в ответ.
    """
    file_id = request.match_info.get('file_id')
    if not file_id:
        return web.Response(status=404, text="No file_id")
    
    try:
        file = await bot.get_file(file_id)
        # Получаем поток байтов
        file_bytes = await bot.download_file(file.file_path)
        
        # Читаем данные
        if hasattr(file_bytes, 'read'):
            data = file_bytes.read()
        else:
            data = file_bytes 
            
        return web.Response(body=data, content_type="image/jpeg")
    except Exception as e:
        logger.error(f"Proxy Error: {e}")
        return web.Response(status=500, text="Image proxy error")

async def handle_reply_api(request):
    """
    POST /api/reply
    Принимает multipart/form-data: ticket_id, text, file (опционально)
    1. Находит user_id по ticket_id
    2. Отправляет сообщение (и фото) пользователю в Telegram
    3. Сохраняет file_id и сообщение в БД
    """
    try:
        reader = await request.multipart()
        data = {}
        file_data = None
        filename = "image.jpg"
        
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
        text = data.get('text', '')
        
        if not ticket_id:
            return web.Response(status=400, text="Missing ticket_id")

        user_id = await database.get_ticket_user_id(ticket_id)
        if not user_id:
            return web.Response(status=404, text="User not found for ticket")
        
        file_ids = []
        # Если есть файл, шлем как фото
        if file_data:
            input_file = types.BufferedInputFile(file_data, filename=filename)
            # Отправляем фото с подписью (или без, если текст длинный)
            caption = text[:1000] if text else None
            msg = await bot.send_photo(chat_id=user_id, photo=input_file, caption=caption)
            file_ids.append(msg.photo[-1].file_id)
            # Если текст был использован как капшн, обнуляем его, чтобы не дублировать
            if caption:
                text = "" 
        
        # Если остался текст (или файла не было)
        if text:
            await bot.send_message(chat_id=user_id, text=text)
            
        # Сохраняем в БД
        await database.save_operator_message(ticket_id, data.get('text', ''), file_ids)
        
        return web.Response(text="OK")
        
    except Exception as e:
        logger.error(f"Reply API Error: {e}")
        return web.Response(status=500, text=str(e))

async def start_web_server():
    app = web.Application(middlewares=[cors_middleware])
    app.router.add_get('/', handle_health)
    app.router.add_get('/health', handle_health)
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
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logger.info("Bot stopped")
