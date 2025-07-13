import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

const router = express.Router();

// Конфигурация загрузки изображений
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // до 5MB

// ✅ Добавление нового продукта
router.post('/products', upload.array("image", 3), async (req, res) => {
  const { name, description, fullDescription, price, category, specs } = req.body;
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ error: "Не загружены изображения" });
  }

  try {
    const imagePaths = files.map(file => `/uploads/${file.filename}`);
    const result = await db.execute(
      `INSERT INTO products (name, description, fullDescription, price, category, specs, image) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description,
        fullDescription,
        price,
        category,
        specs ? JSON.stringify(specs) : null,
        JSON.stringify(imagePaths)
      ]
    );
    res.status(201).json({ id: result[0].insertId, message: "Продукт успешно добавлен" });
  } catch (err) {
    console.error("Ошибка при добавлении продукта:", err);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

// ✅ Обновление продукта
router.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, fullDescription, price, discount, category, specs } = req.body;

  if (!name || !description || !fullDescription || !price || !category) {
    return res.status(400).json({ message: 'Обязательные поля: name, description, fullDescription, price, category' });
  }

  try {
    const [result] = await db.execute(
      `UPDATE products 
       SET name = ?, description = ?, fullDescription = ?, price = ?, discount = ?, category = ?, specs = ?
       WHERE id = ?`,
      [name, description, fullDescription, price, discount || 0, category, JSON.stringify(specs), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Продукт не найден' });
    }

    res.json({ message: 'Продукт успешно обновлен' });
  } catch (error) {
    console.error('Ошибка при обновлении продукта:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// ✅ Обновление изображения по индексу
router.put('/products/:id/image', upload.single("image"), async (req, res) => {
  const productId = req.params.id;
  const index = parseInt(req.body.index);
  const file = req.file;

  if (!file) return res.status(400).json({ error: "Файл изображения отсутствует" });
  if (isNaN(index) || index < 0 || index > 2) {
    return res.status(400).json({ error: "Неверный индекс изображения (допустимо 0-2)" });
  }

  try {
    const [rows] = await db.execute("SELECT * FROM products WHERE id = ?", [productId]);
    if (rows.length === 0) return res.status(404).json({ error: "Продукт не найден" });

    const currentImages = JSON.parse(rows[0].image || '[]');
    if (index >= currentImages.length) return res.status(400).json({ error: "Индекс вне диапазона" });

    currentImages[index] = `/uploads/${file.filename}`;

    await db.execute("UPDATE products SET image = ? WHERE id = ?", [JSON.stringify(currentImages), productId]);

    res.json({ message: "Изображение обновлено", newImage: currentImages[index] });
  } catch (error) {
    console.error("Ошибка при обновлении изображения:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// ✅ Получение всех продуктов
router.get('/products', async (req, res) => {
  try {
    const [results] = await db.execute("SELECT * FROM products");
    res.json(results);
  } catch (err) {
    console.error("Ошибка получения продуктов:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// ✅ Получение продукта по ID
router.get('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.execute("SELECT * FROM products WHERE id = ?", [id]);
    if (results.length === 0) return res.status(404).json({ error: "Продукт не найден" });

    const product = results[0];
    try {
      product.specs = product.specs ? JSON.parse(product.specs) : [];
      product.image = product.image ? JSON.parse(product.image) : [];
    } catch (e) {
      product.specs = [];
      product.image = [];
    }

    res.json(product);
  } catch (err) {
    console.error("Ошибка получения продукта:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// ✅ Удаление продукта
router.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.execute("DELETE FROM products WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Продукт не найден" });

    res.json({ message: "Продукт удалён" });
  } catch (err) {
    console.error("Ошибка удаления продукта:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// ✅ Массовое обновление скидок
router.put('/update-discounts', async (req, res) => {
  const { products } = req.body;

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: "Неверный формат данных" });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    for (const product of products) {
      const { id, discount } = product;

      if (!id || typeof discount !== 'number') {
        throw new Error(`Неверные данные для продукта: ${JSON.stringify(product)}`);
      }

      await connection.execute(
        "UPDATE products SET discount = ? WHERE id = ?",
        [discount.toFixed(2), id]
      );
    }

    await connection.commit();
    res.json({ message: "Скидки успешно обновлены" });
  } catch (err) {
    await connection.rollback();
    console.error("Ошибка массового обновления скидок:", err);
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

// ✅ Лог маршрутов
console.log('Маршруты в ProductRoutes:');
router.stack.forEach(m => {
  if (m.route) {
    console.log(Object.keys(m.route.methods).join(', ').toUpperCase(), m.route.path);
  }
});

export default router;
