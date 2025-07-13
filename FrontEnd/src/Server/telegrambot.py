import asyncio
import logging
import httpx
from aiogram import Bot, Dispatcher, types
from aiogram.types import Message, ReplyKeyboardMarkup, KeyboardButton
from aiogram.filters import Command
import pytz
from datetime import datetime
import os
from dotenv import load_dotenv
import json

load_dotenv()

logging.basicConfig(level=logging.INFO)
TOKEN = os.getenv("TELEGRAM_TOKEN")
bot = Bot(token=TOKEN)
dp = Dispatcher()

CHAT_ID = None
last_sent_notifications = set()

keyboard = ReplyKeyboardMarkup(keyboard=[
    [KeyboardButton(text="/start"), KeyboardButton(text="Уведомления")]
], resize_keyboard=True)

@dp.message(Command("start"))
async def start(message: Message):
    global CHAT_ID
    CHAT_ID = message.chat.id
    await message.answer("Бот запущен и готов к работе!", reply_markup=keyboard)
    logging.info(f"CHAT_ID установлен: {CHAT_ID}")

@dp.message(lambda message: message.text == "Уведомления")
@dp.message(Command("notifications"))
async def manual_check(message: Message):
    notifications = await fetch_notifications()
    if notifications:
        for notification in notifications:
            await bot.send_message(CHAT_ID, format_notification(notification))
    else:
        await message.answer("Нет новых уведомлений.")

async def fetch_notifications():
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get("http://localhost:3000/api/notifications")
            if response.status_code == 200:
                data = response.json()
                # Убедимся, что возвращается список
                if isinstance(data, list):
                    return [n for n in data if isinstance(n, dict)]
                elif isinstance(data, dict):
                    return [data]
    except Exception as e:
        logging.error(f"Ошибка при запросе уведомлений: {e}")
    return []

def format_notification(notification):
    id_ = notification.get("id", "—")
    name = notification.get("name", "—")
    phone = notification.get("phone", "—")
    email = notification.get("email", "—")
    address = notification.get("adress", "—")
    total_price = notification.get("totalprice", "—")
    comments = notification.get("comments", "—")
    created_at_raw = notification.get("createdAt", "—")
    notification_type = notification.get("type", "consultation")
    items = notification.get("items", None)
    
    try:
        created_at = datetime.fromisoformat(created_at_raw.replace("Z", "+00:00"))
        created_at = created_at.astimezone(pytz.timezone("Europe/Moscow"))
        formatted_date = created_at.strftime("%d.%m.%Y %H:%M")
    except Exception:
        formatted_date = "Неизвестно"
    
    # Уточненная логика определения заказа
    is_order = (
        notification_type == 'purchase' or 
        (items is not None and items != "—") or
        (total_price is not None and total_price != "—" and total_price != "Нет данных")
    )
    
    # Формируем сообщение в зависимости от типа
    if is_order:
        header = "🛒 Новый заказ"
        message = (
            f"📢 {header}\n"
            f"🆔 ID: {id_}\n"
        )
        
        # Добавляем только заполненные поля
        if name != "—":
            message += f"👤 Имя: {name}\n"
        if phone != "—":
            message += f"📞 Телефон: {phone}\n"
        if email != "—":
            message += f"📧 Email: {email}\n"
        if total_price != "—" and total_price != "Нет данных":
            message += f"💳 Сумма: {total_price} ₽\n"
        if address != "—" and address != "Нет данных":
            message += f"🏠 Адрес доставки: {address}\n"
        if comments != "—" and comments != "Нет данных":
            message += f"💬 Комментарий: {comments[:200] + '...' if comments and len(comments) > 200 else comments}\n"
        
        # Добавляем информацию о товарах, если есть
        if items and items != "—":
            try:
                if isinstance(items, str):
                    items = json.loads(items)
                
                if isinstance(items, list):
                    message += "\n🛍️ Заказанные товары:"
                    for i, item in enumerate(items, 1):
                        message += f"\n  {i}. {item.get('name', 'Без названия')}"
                        if 'quantity' in item:
                            message += f" (Кол-во: {item['quantity']})"
                        if 'price' in item:
                            message += f" - {item['price']} ₽"
            except Exception as e:
                logging.error(f"Ошибка при обработке товаров: {e}")
                message += "\n⚠️ Не удалось обработать информацию о товарах"
        
        message += f"⏰ Дата: {formatted_date}"
    else:
        # Формат для консультации
        header = "📨 Новая заявка на консультацию"
        message = (
            f"📢 {header}\n"
            f"🆔 ID: {id_}\n"
            f"👤 Имя: {name}\n"
            f"📞 Телефон: {phone}\n"
        )
        if email != "—":
            message += f"📧 Email: {email}\n"
        if comments != "—":
            message += f"💬 Комментарий: {comments[:200] + '...' if comments and len(comments) > 200 else comments}\n"
        message += f"⏰ Дата: {formatted_date}"
    
    return message

async def poll_notifications():
    global CHAT_ID, last_sent_notifications
    while True:
        await asyncio.sleep(5)
        if CHAT_ID is None:
            logging.warning("CHAT_ID не установлен.")
            continue

        try:
            notifications = await fetch_notifications()
            new_notifications = []
            for notification in notifications:
                notif_id = notification.get("id", str(notification))
                if notif_id not in last_sent_notifications:
                    new_notifications.append(notification)
                    last_sent_notifications.add(notif_id)
                    
                    if len(last_sent_notifications) > 1000:
                        last_sent_notifications = set(list(last_sent_notifications)[-500:])

            if new_notifications:
                for notification in new_notifications:
                    await bot.send_message(CHAT_ID, format_notification(notification))
        except Exception as e:
            logging.error(f"Error in poll_notifications: {e}")

async def main():
    loop = asyncio.get_event_loop()
    loop.create_task(poll_notifications())
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())