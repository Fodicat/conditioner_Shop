import fs from 'fs';
import express from 'express';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(__filename);

// ✅ **Получение прайс-листа**
router.get('/price', (req, res) => {
  // Создание абсолютного пути к файлу с помощью __dirname
  const filePath = path.join(__dirname, 'Price.json');
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error reading file');
    }
    const jsonData = JSON.parse(data);
    res.json(jsonData);
  });
});

// ✅ **Обновление скидки в прайс-листе**
router.put('/update-discount-Pricelist', (req, res) => {
  const { Discount } = req.body;
  console.log(process.cwd());
  if (typeof Discount !== 'number') {
    return res.status(400).json({ error: 'Discount должен быть числом' });
  }

  fs.readFile("src/Server/Price.json", 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при чтении файла' });
    }

    let jsonData = JSON.parse(data);

    jsonData[0].Discount = Discount;

    fs.writeFile("src/Server/Price.json", JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка при записи в файл' });
      }

      return res.status(200).json({ message: 'Discount успешно обновлен' });
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