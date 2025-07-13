import fs from 'fs';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ✅ Получение прайс-листа - Обновление завершено
router.get('/price', (req, res) => {
  const filePath = path.join(__dirname, 'Price.json');
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading Price.json:', err);
      return res.status(500).send('Error reading file');
    }
    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseError) {
      console.error('Error parsing Price.json:', parseError);
      res.status(500).send('Error parsing JSON');
    }
  });
});

// ✅ Обновление скидки в прайс-листе - Обновление завершено
router.put('/update-discount-Pricelist', (req, res) => {
  const { Discount } = req.body;

  if (typeof Discount !== 'number') {
    return res.status(400).json({ error: 'Discount должен быть числом' });
  }

  const filePath = path.join(__dirname, 'Price.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading Price.json:', err);
      return res.status(500).json({ error: 'Ошибка при чтении файла' });
    }

    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (parseError) {
      console.error('Error parsing Price.json:', parseError);
      return res.status(500).json({ error: 'Ошибка при парсинге JSON' });
    }

    // Обновляем Discount у первого элемента массива
    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      return res.status(400).json({ error: 'Неверный формат файла Price.json' });
    }

    jsonData[0].Discount = Discount;

    fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
      if (err) {
        console.error('Error writing Price.json:', err);
        return res.status(500).json({ error: 'Ошибка при записи в файл' });
      }

      res.status(200).json({ message: 'Discount успешно обновлен' });
    });
  });
});

console.log('Маршруты в pricelistRoutes:');
router.stack.forEach(m => {
  if (m.route) {
    console.log(Object.keys(m.route.methods).join(', ').toUpperCase(), m.route.path);
  }
});

export default router;
