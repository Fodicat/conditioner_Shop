import express from 'express';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt'
import db from './db.js'
import dotenv from 'dotenv';
import { generateVerificationEmail, generatePasswordResetEmail } from './utils/serverEmailTemplates.js'
import { generateVerificationMail, generatePasswordResetMail } from './utils/serverMailTemplates.js'
dotenv.config();

const router = express.Router();

// ✅ **Вход в аккаунт* - Обновление завершено
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const query = 'SELECT * FROM users WHERE email = ?';
    const params = [email];

    const [results] = await db.execute(query, params);

    if (results.length === 0) {
      return res.status(401).json({ error: 'Неверный email или пароль.' });
    }
    console.log(results[0]);
    const user = results[0];

    if (!user.is_verified) {
      return res.status(403).json({ error: 'Аккаунт не подтвержден. Проверьте вашу почту.' });
    }
    console.log(user.password);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный email или пароль.' });
    }

    res.status(200).json({ message: 'Вход выполнен успешно!', user });

  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ error: 'Ошибка сервера.' });
  }
});

// ✅ **Регистрация пользователя* - Обновление завершено
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Проверяем, существует ли пользователь с таким email
    const [existingUsers] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Вставляем нового пользователя
    const [insertResult] = await db.execute(
      'INSERT INTO users (name, email, password, is_verified, isAdmin) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 0, 0]
    );

    const userId = insertResult.insertId;

    // Генерируем токен для верификации
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // через 1 час

    // Сохраняем токен в БД
    await db.execute(
      'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );

    // Отправка письма в зависимости от почтового сервиса
    if (email.endsWith('@gmail.com')) {
      console.log(`📩 Отправка через Gmail на ${email}`);
      sendVerificationGmail(email, token, name);
    } else if (email.endsWith('@mail.ru')) {
      console.log(`📩 Отправка через Mail.ru на ${email}`);
      sendVerificationEmail(email, token, name);
    } else if (email.endsWith('@yandex.ru')) {
      console.log(`📩 Отправка через Yandex.ru на ${email}`);
      sendVerificationYandexEmail(email, token, name);
    } else {
      return res.status(201).json({ message: 'Данный почтовый сервис не поддерживается.' });
    }

    res.status(201).json({ message: 'Пользователь зарегистрирован. Проверьте почту для подтверждения.' });

  } catch (err) {
    console.error('Ошибка регистрации:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ✅ **Изменение пароля пользователя* - Обновление завершено
router.post('/change-password', async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  try {
    // Получаем текущий хеш пароля пользователя из базы данных
    const [users] = await db.execute('SELECT password FROM users WHERE id = ?', [userId]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const user = users[0];

    // Проверяем текущий пароль
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный текущий пароль' });
    }

    // Хешируем новый пароль
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Обновляем пароль в базе данных
    await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, userId]);

    res.json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    console.error('Ошибка при изменении пароля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ✅ Эндпоинт для запроса сброса пароля - Обновление завершено
router.post('/request-password-reset', async (req, res) => {
  const { email } = req.body;

  try {
    // Получаем пользователя по email
    const [users] = await db.execute('SELECT id, name FROM users WHERE email = ?', [email]);
    const user = users[0];

    if (!user) {
      return res.status(404).json({ error: 'Пользователь с таким email не найден' });
    }

    // Генерируем токен для сброса пароля
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 3600000); // 1 час

    // Сохраняем токен в базе
    await db.execute(
      'INSERT INTO email_verification_tokens (token, expires_at, user_id) VALUES (?, ?, ?)',
      [resetToken, tokenExpiry, user.id]
    );

    const resetLink = `http://localhost:8080/reset-password?token=${resetToken}`;

    let transporter;
    let mailOptions;

    if (email.endsWith("@gmail.com")) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });

      mailOptions = {
        from: 'verifkon@gmail.com',
        to: email,
        subject: 'Сброс пароля',
        html: generatePasswordResetEmail(user.name, resetLink),
      };

    } else if (email.endsWith("@mail.ru")) {
      transporter = nodemailer.createTransport({
        host: 'smtp.mail.ru',
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      mailOptions = {
        from: 'verification.email.verif@mail.ru',
        to: email,
        subject: 'Сброс пароля',
        html: generatePasswordResetEmail(user.name, resetLink),
      };

    } else if (email.endsWith("@yandex.ru")) {
      transporter = nodemailer.createTransport({
        host: 'smtp.yandex.ru',
        port: 465,
        secure: true,
        auth: {
          user: process.env.YANDEX_EMAIL_USER,
          pass: process.env.YANDEX_EMAIL_PASS,
        },
      });

      mailOptions = {
        from: 'vladyslav.necrasov@yandex.ru',
        to: email,
        subject: 'Сброс пароля',
        html: generatePasswordResetEmail(user.name, resetLink),
      };
    }

    if (transporter && mailOptions) {
      await transporter.verify();
      await transporter.sendMail(mailOptions);
      console.log(`📩 Письмо с инструкциями по сбросу пароля отправлено на ${email}`);
    } else {
      console.warn('Почтовый сервис не поддерживается для этого email');
    }

    res.json({ message: 'Инструкции по сбросу пароля отправлены на email' });

  } catch (error) {
    console.error('Ошибка при запросе сброса пароля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ✅ Эндпоинт для сброса пароля - Обновление завершено
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Проверяем существование токена и срок действия
    const [tokens] = await db.execute(
      'SELECT user_id FROM email_verification_tokens WHERE token = ? AND expires_at > NOW()',
      [token]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ error: 'Токен недействителен или истек' });
    }

    const userId = tokens[0].user_id;

    // Хешируем новый пароль
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Обновляем пароль пользователя
    await db.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    // Удаляем использованный токен
    await db.execute(
      'DELETE FROM email_verification_tokens WHERE token = ?',
      [token]
    );

    res.status(200).json({ message: 'Пароль успешно изменен' });

  } catch (error) {
    console.error('Ошибка при сбросе пароля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ✅ **Обновление пользовательской информации** - Обновление завершено
router.post('/update-user-info', async (req, res) => {
  const { userId, phone, address } = req.body;

  try {
    await db.execute(
      'UPDATE users SET phone = ?, address = ? WHERE id = ?',
      [phone, address, userId]
    );
    res.json({ message: 'Информация успешно обновлена' });
  } catch (err) {
    console.error('Ошибка при обновлении информации:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ✅ **Отправка песьма верификации на Gmail** - Обновление завершено
async function sendVerificationGmail(email, token, name) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  transporter.verify((error, success) => {
    if (error) {
      console.error('Ошибка проверки соединения:', error);
    } else {
      console.log('Соединение установлено:', success);
    }
  });

  const verificationLink = `http://localhost:8080/verify-account?token=${token}`;

  const mailOptions = {
    from: 'verifkon@gmail.com',
    to: email,
    subject: 'Подтверждение вашей почты',
    html: generateVerificationEmail(name, verificationLink),
  };

  await transporter.sendMail(mailOptions);
}

// ✅ **Отправка песьма верификации на Email** - Обновление завершено
async function sendVerificationEmail(email, token, name) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.mail.ru',
    port: 465,
    secure: true, // Используем SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  transporter.verify((error, success) => {
    if (error) {
      console.error('Ошибка проверки соединения:', error);
    } else {
      console.log('Соединение установлено:', success);
    }
  });

  const verificationLink = `http://localhost:8080/verify-account?token=${token}`;

  const mailOptions = {
    from: 'verification.email.verif@mail.ru',
    to: email,
    subject: 'Подтверждение вашей почты',
    html: generateVerificationEmail(name, verificationLink),
  };

  await transporter.sendMail(mailOptions);
}

async function sendVerificationYandexEmail(email, token, name) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.yandex.ru', // Исправленный хост
    port: 465,
    secure: true, // Используем SSL
    auth: {
      user: process.env.YANDEX_EMAIL_USER,
      pass: process.env.YANDEX_EMAIL_PASS
    }
  });

  console.log(process.env.YANDEX_EMAIL_USER)
  console.log(process.env.YANDEX_EMAIL_PASS)

  transporter.verify((error, success) => {
    if (error) {
      console.error('Ошибка проверки соединения:', error);
    } else {
      console.log('Соединение установлено:', success);
    }
  });

  const verificationLink = `http://localhost:8080/verify-account?token=${token}`;

  const mailOptions = {
    from: 'vladyslav.necrasov@yandex.ru',
    to: email,
    subject: 'Подтверждение вашей почты',
    html: generateVerificationEmail(name, verificationLink),
  };

  await transporter.sendMail(mailOptions);
}

// ✅ **Верефикация почты* - Обновление завершено
router.post('/verify-email', async (req, res) => {
  const { token } = req.body;

  try {
    // Проверяем токен
    const [results] = await db.execute(
      'SELECT * FROM email_verification_tokens WHERE token = ?',
      [token]
    );

    if (results.length === 0) {
      return res.status(400).json({ error: 'Неверный или истекший токен.' });
    }

    const userId = results[0].user_id;

    // Обновляем статус пользователя на подтверждённый
    await db.execute(
      'UPDATE users SET is_verified = 1 WHERE id = ?',
      [userId]
    );

    // Удаляем токен подтверждения
    await db.execute(
      'DELETE FROM email_verification_tokens WHERE token = ?',
      [token]
    );

    res.status(200).json({ message: 'Ваша почта успешно подтверждена!' });

  } catch (err) {
    console.error('Ошибка при подтверждении почты:', err);
    res.status(500).json({ error: 'Ошибка сервера.' });
  }
});

// ✅ **Повторная верефикация почты* - Обновление завершено
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;

  try {
    // Получаем пользователя по email
    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (user.is_verified) {
      return res.status(400).json({ error: 'Email уже подтвержден' });
    }

    // Генерируем новый токен
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // истекает через 1 час

    // Вставляем или обновляем токен (ON DUPLICATE KEY UPDATE)
    await db.execute(
      `INSERT INTO email_verification_tokens (user_id, token, expires_at) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at)`,
      [user.id, token, expiresAt]
    );

    // Отправляем письмо в зависимости от почтового сервиса
    if (email.endsWith('@gmail.com')) {
      console.log(`📩 Отправка через Gmail на ${email}`);
      sendVerificationGmail(email, token, user.name);
    } else if (email.endsWith('@mail.ru')) {
      console.log(`📩 Отправка через Mail.ru на ${email}`);
      sendVerificationEmail(email, token, user.name);
    } else if (email.endsWith('@yandex.ru')) {
      console.log(`📩 Отправка через Yandex.ru на ${email}`);
      sendVerificationYandexEmail(email, token, user.name);
    }

    res.json({ message: 'Письмо с подтверждением отправлено' });

  } catch (error) {
    console.error('Ошибка при повторной отправке:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ✅ Эндпоинт для проверки токена
router.post('/verify-token', async (req, res) => {
  const { token } = req.body;

  try {
    const query = 'SELECT * FROM email_verification_tokens WHERE token = ? AND expires_at > NOW()';
    const [results] = await db.execute(query, [token]);

    if (results.length === 0) {
      return res.status(400).json({ error: 'Токен недействителен или истек' });
    }

    res.status(200).json({ message: 'Токен действителен' });

  } catch (error) {
    console.error('Ошибка при проверке токена:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

console.log('Маршруты в UserRoutes:');
router.stack.forEach(m => {
  if (m.route) {
    console.log(Object.keys(m.route.methods).join(', ').toUpperCase(), m.route.path);
  }
});

export default router;