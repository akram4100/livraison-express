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
  
  // 🔹 الإعدادات الصحيحة لـ Connection Pool فقط
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  
  // 🔹 إعدادات SSL لـ Railway
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

console.log('🔧 Initializing Railway MySQL Connection...');
console.log('📍 Host:', dbConfig.host);
console.log('📁 Database:', dbConfig.database);
console.log('🚪 Port:', dbConfig.port);

// إنشاء Connection Pool
const db = mysql.createPool(dbConfig);

// اختبار الاتصال عند التهيئة
db.getConnection()
  .then(connection => {
    console.log("✅ Connected to Railway MySQL database successfully!");
    
    // اختبار استعلام إضافي
    return connection.query('SELECT NOW() as server_time, DATABASE() as db_name')
      .then(([results]) => {
        console.log('⏰ Database Server Time:', results[0].server_time);
        console.log('🗃️ Current Database:', results[0].db_name);
        connection.release();
      });
  })
  .catch(error => {
    console.error("❌ Railway DB connection error:", error.message);
    console.error("🔍 Error details:", {
      code: error.code,
      errno: error.errno
    });
  });

// معالجة أخطاء الـ Pool
db.on('connection', (connection) => {
  console.log('🔌 New database connection established');
});

db.on('error', (err) => {
  console.error('💥 Database pool error:', err.message);
});

export default db;