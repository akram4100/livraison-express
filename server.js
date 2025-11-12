// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// 🔹 معالجة الاتصال بقاعدة البيانات بشكل غير متزامن
const initializeServer = async () => {
  try {
    // انتظار اتصال قاعدة البيانات
    const database = await db;
    console.log("✅ Base de données prête");

    // ✅ المسارات
    app.use("/api", userRoutes);

    // ✅ مسار اختبار
    app.get("/", (req, res) => {
      res.send("🚀 API Livraison fonctionne correctement !");
    });

    // ✅ مسار لاختبار الاتصال بالصفحة الرئيسية
    app.get("/api/test", (req, res) => {
      res.json({ message: "✅ API test route is working!" });
    });

    // ✅ مسار لاختبار قاعدة البيانات
    app.get("/api/test-db", async (req, res) => {
      try {
        const [rows] = await database.query("SELECT 1 as test");
        res.json({ message: "✅ Database connection successful", data: rows });
      } catch (error) {
        res.status(500).json({ error: "❌ Database connection failed", details: error.message });
      }
    });

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () =>
      console.log(`✅ Serveur démarré sur http://localhost:${PORT}`)
    );

  } catch (error) {
    console.error("❌ Échec du démarrage du serveur:", error.message);
    console.log("\n🔧 Solutions possibles:");
    console.log("  1. Démarrez MySQL (XAMPP/WAMP/MAMP)");
    console.log("  2. Vérifiez le fichier .env");
    console.log("  3. Créez la base de données manuellement");
    process.exit(1);
  }
};

// بدء تشغيل السيرفر
initializeServer();