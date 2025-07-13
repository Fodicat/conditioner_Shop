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

// ✅ **Получение всех постов блога**
router.get('/blog-posts', (req, res) => {
  db.query('SELECT * FROM blog_posts ORDER BY createdAt DESC', (err, results) => {
    if (err) {
      console.error('Error fetching blog posts:', err);
      return res.status(500).json({ error: 'Error fetching blog posts' });
    }
    res.json(results);
  });
});

// ✅ **Удаление поста блога**
router.delete('/blog-posts/:id', (req, res) => {
  const postId = req.params.id;
  db.query('DELETE FROM blog_posts WHERE id = ?', [postId], (err, result) => {
    if (err) {
      console.error('Error deleting post:', err);
      return res.status(500).json({ error: 'Error deleting post' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Post deleted successfully' });
  });
});

// ✅ **Создание нового поста блога**
router.post('/blog-posts', upload.single('image'), (req, res) => {
  const { title, content } = req.body;
  const image = req.file; // Получаем изображение, загруженное через FormData

  if (image) {
    const imagePath = `/uploads/${image.filename}`; // Путь к изображению

    // Добавляем пост в базу данных с изображением
    db.query(
      'INSERT INTO blog_posts (title, content, author, image) VALUES (?, ?, ?, ?)',
      [title, content, 'Admin', imagePath],
      (err, result) => {
        if (err) {
          console.error('Error adding blog post:', err);
          return res.status(500).json({ error: 'Error adding blog post' });
        }
        res.status(201).json({ id: result.insertId, message: 'Blog post added successfully' });
      }
    );
  } else {
    // Если изображения нет, добавляем пост без изображения
    db.query(
      'INSERT INTO blog_posts (title, content, author) VALUES (?, ?, ?)',
      [title, content, 'Admin'],
      (err, result) => {
        if (err) {
          console.error('Error adding blog post:', err);
          return res.status(500).json({ error: 'Error adding blog post' });
        }
        res.status(201).json({ id: result.insertId, message: 'Blog post added successfully' });
      }
    );
  }
});

export default router;