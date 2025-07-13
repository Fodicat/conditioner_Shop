import asyncio
from bot.parser import get_new_notifications
from bot.handler import handle_notification
from config import POLL_INTERVAL

async def main():
    while True:
        # Получаем новые уведомления
        notifications = get_new_notifications()
        
        # Обрабатываем каждое уведомление
        for notification in notifications:
            await handle_notification(notification)
        
        # Ждём перед следующей проверкой
        await asyncio.sleep(POLL_INTERVAL) 