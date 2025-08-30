import mysql from 'mysql2/promise'

// Create a connection pool instead of a single connection for better performance
const db = mysql.createPool({
    host: process.env.DB_HOST || 'db',   // имя сервиса MariaDB
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootpass',
    database: process.env.DB_NAME || 'klimatholoddatabase',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err);
    return;
  }
  console.log('✅ Подключено к базе данных');
  connection.release();
});

export default db;
