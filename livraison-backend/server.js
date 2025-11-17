// server.js - معدل خصيصاً لـ Render.com
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// 🔹 إعدادات CORS الشاملة لـ Render
// 🔹 إعدادات CORS الشاملة لـ Render - استبدل هذا الجزء
app.use(cors({
  origin: function (origin, callback) {
    // السماح لجميع المصادر أثناء التطوير
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      callback(null, true);
    } else {
      callback(null, true); // مؤقتاً نسمح للجميع
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// 🔹 معالجة طلبات OPTIONS يدوياً - استبدل هذا الجزء
app.options('*', (req, res) => {
  console.log('🛠️ Handling OPTIONS request for:', req.url);
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(204).send();
});

// 🔹 معالجة طلبات OPTIONS يدوياً لمنع الـ Redirect
app.options('*', (req, res) => {
  console.log('🛠️ Handling OPTIONS request for:', req.url);
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(204).send();
});

// 🔹 Middleware الأساسية
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 🔹 Logging middleware
app.use((req, res, next) => {
  console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log(`📍 Origin: ${req.get('origin') || 'No Origin'}`);
  next();
});

// 🔹 Routes
app.use("/api", userRoutes);

// 🔹 Health check
app.get("/api/health", async (req, res) => {
  try {
    const db = await import("./config/db.js");
    const connection = await db.default.getConnection();
    
    const [users] = await connection.query("SELECT COUNT(*) as count FROM utilisateurs");
    const [pending] = await connection.query("SELECT COUNT(*) as count FROM pending_verifications");
    
    connection.release();
    
    res.json({ 
      status: "success",
      message: "✅ Server and Database are fully operational",
      timestamp: new Date().toISOString(),
      database: {
        status: "connected",
        users_count: users[0].count,
        pending_verifications: pending[0].count
      },
      cors: {
        enabled: true,
        allowed_origins: ["localhost:3000", "127.0.0.1:3000"]
      }
    });
  } catch (error) {
    res.json({
      status: "warning", 
      message: "⚠️ Server running but database issue",
      error: error.message
    });
  }
});

// 🔹 Route لفحص CORS
app.get("/api/cors-test", (req, res) => {
  res.json({
    message: "CORS test successful!",
    origin: req.get('origin'),
    headers: req.headers,
    cors: "✅ Enabled for all origins"
  });
});

// 🔹 Route رئيسي
app.get("/", (req, res) => {
  res.json({ 
    message: "🚀 Livraison Express API - Render Deployment",
    status: "✅ Active",
    version: "1.0.0",
    cors: "✅ Enabled",
    endpoints: {
      health: "/api/health",
      cors_test: "/api/cors-test", 
      register: "/api/register",
      login: "/api/login"
    }
  });
});

// 🔹 معالجة 404
app.use("*", (req, res) => {
  res.status(404).json({ 
    error: "Route not found",
    path: req.originalUrl
  });
});

// 🔹 معالجة الأخطاء
app.use((error, req, res, next) => {
  console.error("💥 Error:", error);
  res.status(500).json({ 
    error: "Internal server error",
    details: process.env.NODE_ENV === "production" ? null : error.message
  });
});

// 🔹 تشغيل الخادم
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 Livraison Express Server Started on Render!
📍 Port: ${PORT}
🌐 Environment: ${process.env.NODE_ENV || "production"}  
🔧 CORS: ✅ Fully Enabled
📊 Health: https://livraison-api-x45n.onrender.com/api/health
🔗 API: https://livraison-api-x45n.onrender.com/api

✅ Ready to accept requests from localhost:3000
  `);
});

export default app;