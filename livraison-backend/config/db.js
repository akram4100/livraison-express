// config/db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  host: process.env.MYSQLHOST || process.env.DB_HOST,
  user: process.env.MYSQLUSER || process.env.DB_USER,
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
  database: process.env.MYSQLDATABASE || process.env.DB_NAME,
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// استخدم Connection Pool للأفضلية في production
const db = mysql.createPool(dbConfig);

// اختبار الاتصال
db.getConnection()
  .then(connection => {
    console.log("✅ Connected to Railway MySQL database");
    connection.release();
  })
  .catch(error => {
    console.error("❌ Railway DB connection error:", error.message);
  });

export default db;