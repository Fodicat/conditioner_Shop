import express from 'express';
import multer from "multer";
import { fileURLToPath } from 'url';
import path from 'path';
import db from "./db.js"

const router = express.Router();

// Конфигурация загрузки файлов
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

router.post('/products', upload.array("image", 3), (req, res) => {
  const { name, description, fullDescription, price, category, specs } = req.body;
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ error: "Не загружены изображения" });
  }

  const imagePaths = files.map(file => `/uploads/${file.filename}`);

  db.query(
    "INSERT INTO products (name, description, fullDescription, price, category, specs, image) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [name, description, fullDescription, price, category, specs ? JSON.stringify(specs) : null, JSON.stringify(imagePaths)],
    (err, result) => {
      if (err) {
        console.error("Ошибка при добавлении продукта:", err);
        return res.status(500).json({ error: "Внутренняя ошибка сервера" });
      }
      res.status(201).json({ id: result.insertId, message: "Продукт успешно добавлен" });
    }
  );
});

//  **Добавление продукта с изображениями**
router.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, fullDescription, price, discount, category, specs } = req.body;

  if (!name || !description || !fullDescription || !price || !category) {
      return res.status(400).json({ message: 'Обязательные поля: name, description, fullDescription, price, category' });
  }

  try {
      const sql = `
          UPDATE products 
          SET name = ?, description = ?, fullDescription = ?, price = ?, discount = ?, category = ?, specs = ? 
          WHERE id = ?
      `;

      const values = [name, description, fullDescription, price, discount || 0, category, JSON.stringify(specs), id];

      const [result] = await db.execute(sql, values);

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Продукт не найден' });
      }

      res.json({ message: 'Продукт успешно обновлен' });
  } catch (error) {
      console.error('Ошибка при обновлении продукта:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// ✅ **Обновление изображения продукта**
router.put('/products/:id/image', upload.single("image"), (req, res) => {
    const productId = req.params.id;
    const index = parseInt(req.body.index);
    const file = req.file;
  
    if (!file) {
      return res.status(400).json({ error: "Файл изображения отсутствует" });
    }
  
    if (isNaN(index) || index < 0 || index > 2) {
      return res.status(400).json({ error: "Неверный индекс изображения (допустимо 0-2)" });
    }
  
    // Проверяем, существует ли продукт
    db.query("SELECT * FROM products WHERE id = ?", [productId], (err, products) => {
      if (err) {
        console.error("Ошибка при проверке продукта:", err);
        return res.status(500).json({ error: "Внутренняя ошибка сервера" });
      }
  
      if (products.length === 0) {
        return res.status(404).json({ error: "Продукт не найден" });
      }
  
      let currentImages = JSON.parse(products[0].image) || [];
      if (index >= currentImages.length) {
        return res.status(400).json({ error: "Указанный индекс не существует" });
      }
  
      // Обновляем изображение по индексу
      currentImages[index] = `/uploads/${file.filename}`;
  
      db.query("UPDATE products SET image = ? WHERE id = ?", [
        JSON.stringify(currentImages),
        productId,
      ], (err) => {
        if (err) {
          console.error("Ошибка при обновлении изображения:", err);
          return res.status(500).json({ error: "Внутренняя ошибка сервера" });
        }
  
        res.json({ message: "Изображение обновлено", newImage: currentImages[index] });
      });
    });
  });

// ✅ **Получение всех продуктов**
router.get('/products', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
      if (err) {
          console.error('Error fetching products:', err);
          return res.status(500).json({ error: 'Error fetching products' });
      }
      res.json(results);
  });
});

// ✅ **Получение продукта по id**
router.get('/products/:id', (req, res) => {
    const productId = req.params.id;
    db.query('SELECT * FROM products WHERE id = ?', [productId], (err, results) => {
      if (err) {
        console.error('Error fetching product:', err);
        return res.status(500).json({ error: 'Error fetching product' });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
  
      // Получаем первый найденный продукт
      const product = results[0];
  
      // Парсим JSON-строки в массивы
      try {
        product.specs = product.specs ? JSON.parse(product.specs) : [];
        product.image = product.image ? JSON.parse(product.image) : [];
      } catch (parseError) {
        console.error('Error parsing JSON fields:', parseError);
        product.specs = [];
        product.image = [];
      }
  
      console.log(product); // Проверим, что данные корректны
      res.json(product);
    });
  });

// ✅ **Удаление продукта по id**
router.delete('/products/:id', (req, res) => {
    const { id } = req.params;
    
    db.query('DELETE FROM products WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('Error deleting product:', err);
            return res.status(500).json({ error: 'Error deleting product' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    });
});

// ✅ **Обновление скидок для нескольких продуктов**
router.put("/update-discounts", (req, res) => {
    const products = req.body.products;

    // Проверка на корректный формат данных
    if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: "Неверный формат данных или пустой массив" });
    }

    // Начинаем транзакцию
    db.getConnection((err, connection) => {
        if (err) {
            console.error("Ошибка при получении соединения:", err);
            return res.status(500).json({ error: "Ошибка при получении соединения" });
        }

        connection.beginTransaction((err) => {
            if (err) {
                console.error("Ошибка начала транзакции:", err);
                connection.release();
                return res.status(500).json({ error: "Ошибка начала транзакции" });
            }

            const queries = products.map((product) => {
                const { id, discount } = product;

                // Проверка на наличие id и корректность discount
                if (!id || (discount !== undefined && isNaN(discount))) {
                    return Promise.reject(new Error(`Неверные данные для продукта: ${JSON.stringify(product)}`));
                }

                // Преобразуем discount в число, если он определен
                const discountValue = discount !== undefined ? parseFloat(discount) : 0;

                return new Promise((resolve, reject) => {
                    connection.query(
                        "UPDATE products SET discount = ? WHERE id = ?",
                        [discountValue.toFixed(2), id], // Округляем скидку до 2 знаков
                        (error, results) => {
                            if (error) {
                                return reject(error);
                            }
                            resolve(results);
                        }
                    );
                });
            });

            // Выполняем все запросы параллельно
            Promise.all(queries)
                .then(() => {
                    connection.commit((err) => {
                        if (err) {
                            connection.rollback(() => {
                                connection.release();
                                return res.status(500).json({ error: "Ошибка при фиксации транзакции" });
                            });
                        }
                        connection.release();
                        res.json({ message: "Скидки успешно обновлены" });
                    });
                })
                .catch((error) => {
                    connection.rollback(() => {
                        connection.release();
                        console.error("Ошибка обновления скидок:", error);
                        res.status(500).json({ error: "Ошибка обновления скидок: " + error.message });
                    });
                });
        });
    });
});

console.log('Маршруты в ProductRoutes:');
router.stack.forEach(m => {
  if (m.route) {
    console.log(Object.keys(m.route.methods).join(', ').toUpperCase(), m.route.path);
  }
});

export default router;
