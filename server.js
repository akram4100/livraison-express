// server.js - معدل خصيصاً لبياناتك
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

// CORS معدل للنشر
app.use(
  cors({
    origin: process.env.CIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

// 🔹 إنشاء اتصال قاعدة البيانات باستخدام بياناتك الفعلية
const createDbConnection = () => {
  const dbConfig = {
    host: process.env.MYSQLHOST || "mysql.railway.internal",
    user: process.env.MYSQLUSER || "root",
    password: process.env.MYSQLPASSWORD || "MRSRWegXGFhenCFNcuRQdmHkJVTjMjYC",
    database: process.env.MYSQLDATABASE || "railway",
    port: process.env.MYSQLPORT || 3306,
    connectTimeout: 60000,
    acquireTimeout: 60000,
    timeout: 60000,
    // إعدادات SSL مهمة لـ Railway
    ssl: {
      rejectUnauthorized: false
    }
  };

  console.log("🔧 Connecting to database:", {
    host: dbConfig.host,
    user: dbConfig.user,
    database: dbConfig.database
  });

  return mysql.createPool(dbConfig);
};

const db = createDbConnection();

// 🔹 تهيئة جميع الجداول المطلوبة
const initializeDatabase = async () => {
  let connection;
  try {
    connection = await db.getConnection();
    console.log("🔄 Starting database initialization...");

    // 1. جدول المستخدمين الرئيسي
    await connection.query(`
      CREATE TABLE IF NOT EXISTS utilisateurs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        mot_de_passe VARCHAR(255) NOT NULL,
        role ENUM('client', 'livreur', 'partenaire') DEFAULT 'client',
        verifie TINYINT(1) DEFAULT 0,
        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reset_code VARCHAR(10) DEFAULT NULL,
        reset_expires DATETIME DEFAULT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log("✅ Table 'utilisateurs' created/verified");

    // 2. جدول التحقق المؤقت
    await connection.query(`
      CREATE TABLE IF NOT EXISTS pending_verifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        mot_de_passe VARCHAR(255) NOT NULL,
        role ENUM('client', 'livreur') DEFAULT 'client',
        code_verification VARCHAR(6) NOT NULL,
        expiration DATETIME NOT NULL,
        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log("✅ Table 'pending_verifications' created/verified");

    // 3. جدول الطرود
    await connection.query(`
      CREATE TABLE IF NOT EXISTS colis (
        id INT AUTO_INCREMENT PRIMARY KEY,
        description TEXT,
        id_client INT,
        id_partenaire INT,
        statut ENUM('en_attente', 'en_cours', 'livré', 'annulé') DEFAULT 'en_attente',
        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log("✅ Table 'colis' created/verified");

    // 4. جدول التوصيل
    await connection.query(`
      CREATE TABLE IF NOT EXISTS livraisons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        id_colis INT,
        id_livreur INT,
        date_livraison DATETIME,
        statut ENUM('en_attente', 'en_cours', 'livré', 'annulé') DEFAULT 'en_attente',
        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log("✅ Table 'livraisons' created/verified");

    // 5. جدول الرسائل
    await connection.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        id_expediteur INT,
        id_destinataire INT,
        contenu TEXT,
        date DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log("✅ Table 'messages' created/verified");

    // 6. جدول الإحصائيات
    await connection.query(`
      CREATE TABLE IF NOT EXISTS statistiques_livraisons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nb_envoyes INT DEFAULT 0,
        nb_livres INT DEFAULT 0,
        nb_attente INT DEFAULT 0,
        revenus DECIMAL(10,2) DEFAULT 0.00,
        date_mise_a_jour TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log("✅ Table 'statistiques_livraisons' created/verified");

    console.log("🎉 All database tables initialized successfully!");

  } catch (error) {
    console.error("❌ Database initialization error:", error.message);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

// 🔹 مسارات فحص الصحة
app.get("/api/health", (req, res) => {
  res.json({
    status: "✅ API is healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.RAILWAY_ENVIRONMENT
  });
});

app.get("/api/db-status", async (req, res) => {
  try {
    const [tables] = await db.query("SHOW TABLES");
    const [users] = await db.query("SELECT COUNT(*) as count FROM utilisateurs");
    const [pending] = await db.query("SELECT COUNT(*) as count FROM pending_verifications");
    
    res.json({
      status: "✅ Database connected",
      tables: tables.map(t => Object.values(t)[0]),
      counts: {
        users: users[0].count,
        pending_verifications: pending[0].count
      },
      database: process.env.MYSQLDATABASE,
      environment: process.env.RAILWAY_ENVIRONMENT
    });
  } catch (error) {
    res.status(500).json({
      status: "❌ Database error",
      error: error.message
    });
  }
});

// ✅ المسارات الرئيسية
app.use("/api", userRoutes);

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head><title>Livraison Express API</title></head>
      <body>
        <h1>🚀 Livraison Express API is running on Railway!</h1>
        <p>Environment: ${process.env.RAILWAY_ENVIRONMENT}</p>
        <p>Database: ${process.env.MYSQLDATABASE}</p>
        <p>Check <a href="/api/health">/api/health</a> for API status</p>
        <p>Check <a href="/api/db-status">/api/db-status</a> for database status</p>
      </body>
    </html>
  `);
});

// 🔹 تهيئة وبدء السيرفر
const startServer = async () => {
  try {
    // اختبار الاتصال بال قاعدة البيانات
    console.log("🔌 Testing database connection...");
    const testConn = await db.getConnection();
    console.log("✅ Database connection successful");
    testConn.release();

    // تهيئة الجداول
    await initializeDatabase();

    // بدء السيرفر
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`
🎉 Server successfully started!
📍 Port: ${PORT}
🌐 Environment: ${process.env.RAILWAY_ENVIRONMENT}
🗄️ Database: ${process.env.MYSQLDATABASE}
🚀 API URL: https://your-app.railway.app
      `);
    });

  } catch (error) {
    console.error("💥 Failed to start server:", error.message);
    console.log("🔧 Troubleshooting tips:");
    console.log("   1. Check Railway MySQL service is running");
    console.log("   2. Verify environment variables are set");
    console.log("   3. Check Railway dashboard for service status");
    process.exit(1);
  }
};

// بدء التشغيل
startServer();