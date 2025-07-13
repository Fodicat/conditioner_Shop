import mysql from 'mysql2'

// Create a connection pool instead of a single connection for better performance
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'klimatholoddatabase',
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
