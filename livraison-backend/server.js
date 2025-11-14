// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

// CORS معدل للنشر
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

// 🔹 تهيئة الجداول في قاعدة البيانات
const initializeDatabase = async () => {
  try {
    const connection = await db.getConnection();
    
    // إنشاء الجداول إذا لم تكن موجودة
    await connection.query(`
      CREATE TABLE IF NOT EXISTS utilisateurs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        mot_de_passe VARCHAR(255) NOT NULL,
        role ENUM('client', 'livreur', 'partenaire') DEFAULT 'client',
        verifie TINYINT(1) DEFAULT 0,
        reset_code VARCHAR(10) DEFAULT NULL,
        reset_expires DATETIME DEFAULT NULL,
        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

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
      )
    `);

    connection.release();
    console.log("✅ Database tables initialized successfully");
  } catch (error) {
    console.error("❌ Database initialization error:", error);
  }
};

// 🔹 تهيئة السيرفر
const initializeServer = async () => {
  try {
    // اختبار اتصال قاعدة البيانات
    await db.getConnection();
    console.log("✅ Database connection established");

    // تهيئة الجداول
    await initializeDatabase();

    // ✅ المسارات
    app.use("/api", userRoutes);

    // ✅ مسارات الاختبار
    app.get("/", (req, res) => {
      res.send("🚀 API Livraison Express is running on Railway!");
    });

    app.get("/api/test", (req, res) => {
      res.json({ 
        message: "✅ API is working!",
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      });
    });

    app.get("/api/test-db", async (req, res) => {
      try {
        const [rows] = await db.query("SELECT 1 as test, NOW() as time");
        res.json({ 
          message: "✅ Database connection successful", 
          data: rows,
          database: process.env.MYSQLDATABASE 
        });
      } catch (error) {
        res.status(500).json({ 
          error: "❌ Database connection failed", 
          details: error.message 
        });
      }
    });

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
    });

  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
};

// بدء تشغيل السيرفر
initializeServer();