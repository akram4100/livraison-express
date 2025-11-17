import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "../style/login.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; 

export default function Login({ globalDarkMode, updateGlobalDarkMode }) {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    users: 0,
    visitors: 0,
    orders: 0
  });

  // 🔹 محاكاة الإحصائيات الحية
  useEffect(() => {
    // بيانات أولية واقعية
    setStats({
      users: 1247,
      visitors: 8563,
      orders: 2894
    });

    // محاكاة تحديث البيانات كل 3 ثواني
    const interval = setInterval(() => {
      setStats(prev => ({
        users: prev.users + Math.floor(Math.random() * 3),
        visitors: prev.visitors + Math.floor(Math.random() * 10),
        orders: prev.orders + Math.floor(Math.random() * 5)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 🔹 مزامنة الوضع الليلي مع الإعدادات العالمية
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'fr';
    
    setDarkMode(savedDarkMode);
    i18n.changeLanguage(savedLanguage);
    
    // إذا كانت هناك props من المكون الأب، استخدمها
    if (updateGlobalDarkMode) {
      updateGlobalDarkMode(savedDarkMode);
    }
  }, [i18n, updateGlobalDarkMode]);

  // 🌍 تغيير اللغة مع الحفظ
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
  };

  // 🎨 تبديل الوضع الليلي مع الحفظ
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    // تحديث الوضع الليلي عالمياً إذا كانت الدالة متاحة
    if (updateGlobalDarkMode) {
      updateGlobalDarkMode(newDarkMode);
    }
  };

  // ✅ عند إرسال النموذج - تسجيل الدخول
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("🔐 Tentative de connexion:", { email, motDePasse });

    try {
      const response = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, mot_de_passe: motDePasse }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "❌ Erreur de connexion");
        setLoading(false);
        return;
      }

      // ✅ تسجيل الدخول ناجح
      console.log("✅ Connexion réussie:", data.user);
      setIsLoggedIn(true);
      setUserRole(data.user.role);
      setUserData(data.user);
      
      // حفظ بيانات المستخدم في localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", "user-token");

// توجيه إلى الداشبورد المناسب
switch(data.user.role) {
  case 'admin':
    navigate('/dashboard-admin');  // 🔹 غير إلى حروف صغيرة
    break;
  case 'livreur':
    navigate('/dashboard-livreur');  // 🔹 غير إلى حروف صغيرة
    break;
  case 'client':
    navigate('/dashboard-client');  // 🔹 غير إلى حروف صغيرة
    break;
  default:
    navigate('/dashboard-client');  // 🔹 غير إلى حروف صغيرة
}

    } catch (error) {
      console.error("❌ Erreur:", error);
      alert("❌ Problème de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 إرسال كود إعادة التعيين (OTP)
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) return alert("Veuillez entrer votre adresse email !");

    try {
      const response = await fetch("http://localhost:8080/api/send-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "❌ Erreur serveur");
        return;
      }

      alert(data.message || "✅ Code envoyé à votre email !");
      navigate("/verify-otp", { state: { email } });
    } catch (error) {
      console.error("❌ Erreur:", error);
      alert("❌ Problème de connexion au serveur.");
    }
  };

  // إذا كان المستخدم مسجلاً، عرض رسالة تحميل
  if (isLoggedIn) {
    return (
      <div className="loading-container">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="loading-content"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="loading-spinner"
          >
            ⚡
          </motion.div>
          <h2>{t("redirecting_dashboard")}</h2>
          <p>{t("role_label")}: {userRole}</p>
        </motion.div>
      </div>
    );
  }

  // إذا لم يكن مسجلاً، عرض صفحة Login
  return (
    <div className={`login-container ${darkMode ? "dark" : ""}`}>
      {/* 🌐 أزرار اللغة والوضع */}
      <div className={`language-switch ${i18n.language === "ar" ? "rtl" : "ltr"}`}>
        <button onClick={() => changeLanguage("fr")}>🇫🇷</button>
        <button onClick={() => changeLanguage("en")}>🇬🇧</button>
        <button onClick={() => changeLanguage("ar")}>🇸🇦</button>
        <button onClick={toggleDarkMode}>
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>

      {/* 🎯 الجانب الأيسر */}
      <motion.div
        className="login-left"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.img
          src="/truck.png"
          alt="Delivery Truck"
          className="truck-image"
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        />
        <h1 className="login-title">🚚 Livraison Express</h1>
        <p className="login-subtitle">{t("secure_fast")}</p>

        {/* 📊 إحصائيات حية */}
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-icon">👥</div>
            <div className="stat-number">{stats.users.toLocaleString()}</div>
            <div className="stat-label">{t("stats_users")}</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">🌐</div>
            <div className="stat-number">{stats.visitors.toLocaleString()}</div>
            <div className="stat-label">{t("stats_visitors")}</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">📦</div>
            <div className="stat-number">{stats.orders.toLocaleString()}</div>
            <div className="stat-label">{t("stats_orders")}</div>
          </div>
        </div>
      </motion.div>

      {/* 🔐 الجانب الأيمن - نموذج تسجيل الدخول */}
      <div className="login-right">
        <motion.div
          className="login-form-container"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="login-header">
            <div className="login-badge">{t("secure_fast")}</div>
            <h2>{t("login_title")}</h2>
            <p>{t("login_subtitle")}</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {/* ✉️ البريد الإلكتروني */}
            <motion.div
              className="form-group"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <label htmlFor="email">{t("email")}</label>
              <input
                id="email"
                type="email"
                placeholder={t("email_placeholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </motion.div>

            {/* 🔒 كلمة المرور */}
            <motion.div
              className="form-group"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <label htmlFor="password">{t("password")}</label>
              <input
                id="password"
                type="password"
                placeholder={t("password_placeholder")}
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                required
                disabled={loading}
              />
            </motion.div>

            {/* 🚪 زر الدخول */}
            <motion.button
              type="submit"
              className="btn-login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ scale: loading ? 1 : 1.03 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              disabled={loading}
            >
              {loading ? "⏳ Connexion..." : t("login_button")}
            </motion.button>

            {/* رابط نسيان كلمة السر */}
            <motion.p
              className="forgot-password-link"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <a
                href="#"
                onClick={handleForgotPassword}
              >
                {t("forgot_password")}
              </a>
            </motion.p>

            {/* 🆕 إنشاء حساب */}
            <motion.p
              className="signup-link"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              {t("signup_text")}{" "}
              <a href="/register">{t("create_account")}</a>
            </motion.p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}