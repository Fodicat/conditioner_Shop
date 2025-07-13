import express from 'express';
import multer from "multer";
import { fileURLToPath } from 'url';
import path from 'path';
import db from "./db.js"

const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

const router = express.Router();

// ✅ **Получение всех постов блога** - Обновление завершено
router.get('/blog-posts', async (req, res) => {
  try {
    const [posts] = await db.execute('SELECT * FROM blog_posts ORDER BY createdAt DESC');
    res.status(200).json(posts);
  } catch (error) {
    console.error('Ошибка при получении постов блога:', error);
    res.status(500).json({ error: 'Ошибка при получении постов блога' });
  }
});

// ✅ **Удаление поста блога** - Обновление завершено
router.delete('/blog-posts/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    let query = 'DELETE FROM blog_posts WHERE id = ?'
    let params = [postId]
    const [status] = await db.execute(query, params)
    res.status(200).json({status})
  } catch (error) {
    res.status(500).json({ error: 'Ошибка удаления поста'})
  }
});

// ✅ **Создание нового поста блога** - Обновление завершено
router.post('/blog-posts', upload.single('image'), async (req, res) => {
  try {
    const { title, content } = req.body;
    const file = req.file;
    const author = 'Admin'; // можно будет брать из авторизации

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }

    let query = '';
    let params = [];

    if (file) {
      const imagePath = `/uploads/${file.filename}`;
      query = 'INSERT INTO blog_posts (title, content, author, image) VALUES (?, ?, ?, ?)';
      params = [title, content, author, imagePath];
    } else {
      query = 'INSERT INTO blog_posts (title, content, author) VALUES (?, ?, ?)';
      params = [title, content, author];
    }

    const [result] = await db.execute(query, params);

    return res.status(201).json({
      id: result.insertId,
      message: 'Blog post created successfully.',
      ...(file && { image: `/uploads/${file.filename}` })
    });

  } catch (error) {
    console.error('Ошибка при добавлении поста:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

console.log('Маршруты в blogpostsRoutes:');
router.stack.forEach(m => {
  if (m.route) {
    console.log(Object.keys(m.route.methods).join(', ').toUpperCase(), m.route.path);
  }
});

export default router;