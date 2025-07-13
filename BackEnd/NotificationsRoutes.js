import express from 'express';
import db from "./db.js"

const router = express.Router();

// ✅ **Получение всех уведомлений** - Обновление завершено
router.get('/notifications', async (req, res) => {
    try {
        let [notifications] = await db.execute('SELECT * FROM notifications ORDER BY createdAt DESC')
        res.status(200).json({ status: 'Успешное получение уведомления'})
    } catch (error) {
        res.status(500).json({ error: 'Не удалось получить уведомления'})
        console.error(error)
    }
});

// ✅ **Создание нового уведомления** - Обновление завершено
router.post('/notifications', async (req, res) => {
    try {
        let { name, phone, email, adress, itemsproduct, totalprice, comments, type } = req.body;

        name = name || "Нет данных";
        phone = phone || "Нет данных";
        email = email || "Нет данных";
        adress = adress || "Нет данных";
        itemsproduct = itemsproduct || "Нет данных";
        totalprice = totalprice || "Нет данных";
        comments = comments || "Нет данных";

        let query = 'INSERT INTO notifications (name, phone, email, adress, itemsproduct, totalprice, comments, type, isRead, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, false, NOW())'
        let params = [name, phone, email, adress, itemsproduct, totalprice, comments, type]

        let [status] = await db.execute(query, params)

        res.status(200).json({ status: "Создания уведомления успешно" })
    } catch (error) {
        console.error('Ошибка при создания поста:', error);
        res.status(500).json({ error: 'Internal server error' })
    }
});

// ✅ **Отметка уведомления как прочитанного** - Обновление завершено
router.put('/notifications/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        let params = [id]
        let [status] = await db.execute('UPDATE notifications SET isRead = true WHERE id = ?', params)
        res.status(200).json({ status: 'Уведомление помечо как прочитанное' })
    } catch (error) {
        console.error('Ошибка при отметке уведомления как прочитаного:', error);
        res.status(500).json('Internal server error')
    }
});

// ✅ **Удаление уведомления** - Обновление завершено
router.delete('/notifications/:id/delete', async (req, res) => {
    try {
        const { id } = req.params;
        let params = [id]
        let [status] = await db.execute('DELETE FROM notifications WHERE id = ?', params)
        res.status(200).json({ status: 'Успешное удаление уведомления'})
    } catch (error) {
        console.error('Ошибка удаления уведомления:', error)
        res.status(500).json({ status: 'Ошибка удаления уведомления'})
    }
});

console.log('Маршруты в NotificationsRoutes:');
router.stack.forEach(m => {
  if (m.route) {
    console.log(Object.keys(m.route.methods).join(', ').toUpperCase(), m.route.path);
  }
});

export default router;