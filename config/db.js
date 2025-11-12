// config/db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// إنشاء اتصال مباشر بدون async/await في التصدير
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "livraison_db",
  connectTimeout: 60000,
};

// إنشاء الاتصال
const db = mysql.createConnection(dbConfig);

// اختبار الاتصال
db.then(connection => {
  console.log("✅ Connecté à la base de données MySQL");
  return connection;
}).catch(error => {
  console.error("❌ Erreur de connexion à MySQL:", error.message);
  console.log("🔍 Vérifiez que MySQL est démarré et les paramètres sont corrects");
});

export default db;