import express from 'express';
import db from "./db.js"

const router = express.Router();

// ✅ **Получение всех уведомлений**
router.get('/notifications', (req, res) => {
    db.query(
        'SELECT * FROM notifications ORDER BY createdAt DESC',
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Ошибка сервера при получении уведомлений.' });
            }
            res.json(results);
        }
    );
});

// ✅ **Создание нового уведомления**
router.post('/notifications', (req, res) => {
    let { name, phone, email, adress, itemsproduct, totalprice, comments, type } = req.body;

    name = name || "Нет данных";
    phone = phone || "Нет данных";
    email = email || "Нет данных";
    adress = adress || "Нет данных";
    itemsproduct = itemsproduct || "Нет данных";
    totalprice = totalprice || "Нет данных";
    comments = comments || "Нет данных";

    db.query(
        'INSERT INTO notifications (name, phone, email, adress, itemsproduct, totalprice, comments, type, isRead, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, false, NOW())',
        [name, phone, email, adress, itemsproduct, totalprice, comments, type],
        (err, result) => {
            if (err) {
                console.log(err)
                return res.status(500).json({ error: 'Ошибка сервера при создании уведомления.' });
            }
            res.status(201).json({ message: 'Уведомление создано успешно!', id: result.insertId });
        }
    );
});

// ✅ **Отметка уведомления как прочитанного**
router.put('/notifications/:id/read', (req, res) => {
    const { id } = req.params;
    
    db.query(
        'UPDATE notifications SET isRead = true WHERE id = ?',
        [id],
        (err) => {
            if (err) {
                return res.status(500).json({ error: 'Ошибка сервера при обновлении уведомления.' });
            }
            res.json({ message: 'Уведомление отмечено как прочитанное.' });
        }
    );
});

// ✅ **Удаление уведомления**
router.delete('/notifications/:id/delete', (req, res) => {
  const { id } = req.params;
    
  db.query(
      'DELETE FROM notifications WHERE id = ?',
      [id],
      (err, result) => {
          if (err) {
              return res.status(500).json({ error: 'Ошибка сервера при удалении уведомления.', details: err });
          }
          if (result.affectedRows === 0) {
              return res.status(404).json({ error: 'Уведомление с таким ID не найдено.' });
          }
          res.json({ message: 'Уведомление успешно удалено.' });
      }
  );
});

export default router;