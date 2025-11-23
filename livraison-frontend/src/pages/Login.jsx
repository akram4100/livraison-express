import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../style/homepage.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; 

// TODO: استيراد تكوين Firebase
// import { db } from "../config/firebase";
// import { collection, addDoc, doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";

export default function Homepage({ globalDarkMode, updateGlobalDarkMode }) {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isLoginOpen, setIsLoginOpen] = useState(true);
  const [showQRLogin, setShowQRLogin] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [qrSessionId, setQrSessionId] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [qrStatus, setQrStatus] = useState(""); // "waiting", "scanned", "confirmed", "error"
  
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const checkIntervalRef = useRef(null);

  // 🔹 إحصائيات ديناميكية
  const [stats, setStats] = useState({
    deliveries: 0,
    users: 0,
    cities: 0,
    satisfaction: 0
  });

  // 🔹 محاكاة الإحصائيات الحية
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        deliveries: prev.deliveries + Math.floor(Math.random() * 3),
        users: prev.users + Math.floor(Math.random() * 2),
        cities: 156,
        satisfaction: 98
      }));
    }, 2000);

    setStats({
      deliveries: 28476,
      users: 12543,
      cities: 156,
      satisfaction: 98
    });

    return () => clearInterval(interval);
  }, []);

  // 🔹 مزامنة الوضع الليلي واللغة
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'fr';
    
    setDarkMode(savedDarkMode);
    i18n.changeLanguage(savedLanguage);
    
    if (updateGlobalDarkMode) {
      updateGlobalDarkMode(savedDarkMode);
    }
  }, [i18n, updateGlobalDarkMode]);

  // 🔹 تنظيف الـ intervals
  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);

  // 🌍 تغيير اللغة
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  // 🎨 تبديل الوضع الليلي
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (updateGlobalDarkMode) {
      updateGlobalDarkMode(newDarkMode);
    }
  };

  // ✅ تسجيل الدخول العادي
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("https://livraison-api-x45n.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, mot_de_passe: motDePasse }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "❌ " + t("login_error"));
        setLoading(false);
        return;
      }

      setIsLoggedIn(true);
      setUserRole(data.user.role);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", "user-token");

      switch(data.user.role) {
        case 'admin':
          navigate('/dashboard-admin');
          break;
        case 'livreur':
          navigate('/dashboard-livreur');
          break;
        case 'client':
          navigate('/dashboard-client');
          break;
        default:
          navigate('/dashboard-client');
      }

    } catch (error) {
      console.error("❌ " + t("error"), error);
      alert("❌ " + t("server_connection_error"));
    } finally {
      setLoading(false);
    }
  };

  // 🔹 إرسال كود إعادة التعيين
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) return alert(t("enter_email_alert"));

    try {
      const response = await fetch("https://livraison-api-x45n.onrender.com/api/send-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "❌ " + t("server_error"));
        return;
      }

      alert(data.message || "✅ " + t("code_sent_success"));
      setShowForgotPassword(false);
      setResetEmail("");
      navigate("/verify-otp", { state: { email: resetEmail } });
    } catch (error) {
      console.error("❌ " + t("error"), error);
      alert("❌ " + t("server_connection_error"));
    }
  };

 // 🎯 إنشاء QR code - مع Firebase الحقيقي
const generateQRCode = async () => {
  setQrLoading(true);
  setQrStatus("waiting");
  
  try {
    const response = await fetch("https://livraison-api-x45n.onrender.com/api/generate-qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to generate QR session");
    }

    setQrSessionId(data.session_id);
    setQrCodeUrl(data.qr_url);
    
    // بدء فحص حالة الجلسة
    startSessionChecking(data.session_id);
    
  } catch (error) {
    console.error("❌ " + t("qr_generation_error"), error);
    setQrStatus("error");
    alert("❌ " + t("qr_generation_error"));
  } finally {
    setQrLoading(false);
  }
};

// 🔄 فحص حالة الجلسة مع Firebase
const startSessionChecking = (sessionId) => {
  // فحص كل 2 ثانية
  checkIntervalRef.current = setInterval(async () => {
    try {
      const response = await fetch(`https://livraison-api-x45n.onrender.com/api/check-qr-session/${sessionId}`);
      const data = await response.json();

      if (response.ok) {
        setQrStatus(data.status);
        
        if (data.status === "confirmed" && data.user_data) {
          // تسجيل الدخول تلقائياً
          handleQRLogin(data.user_data);
          clearInterval(checkIntervalRef.current);
        }
        
        if (data.status === "expired") {
          clearInterval(checkIntervalRef.current);
        }
      }
    } catch (error) {
      console.error("❌ Error checking session:", error);
    }
  }, 2000);
};

// 🔐 تسجيل الدخول بعد تأكيد QR
const handleQRLogin = async (userData) => {
  if (!userData) {
    alert("❌ " + t("qr_login_error"));
    return;
  }
  
  setIsLoggedIn(true);
  setUserRole(userData.role);
  localStorage.setItem("user", JSON.stringify(userData));
  localStorage.setItem("token", "qr-auth-token");
  localStorage.setItem("login_method", "qr_code");

  // إظهار رسالة نجاح
  setQrStatus("confirmed");
  
  // الانتقال بعد ثانيتين
  setTimeout(() => {
    switch(userData.role) {
      case 'admin':
        navigate('/dashboard-admin');
        break;
      case 'livreur':
        navigate('/dashboard-livreur');
        break;
      case 'client':
        navigate('/dashboard-client');
        break;
      default:
        navigate('/dashboard-client');
    }
  }, 2000);
};


  // 🔄 فحص حالة الجلسة - جاهز لربط Firebase
  const startFirebaseListener = (sessionId) => {
    // TODO: تنفيذ الاستماع لـ Firebase
    /*
    const qrSessionRef = doc(db, "qrSessions", sessionId);
    
    const unsubscribe = onSnapshot(qrSessionRef, (doc) => {
      if (doc.exists()) {
        const sessionData = doc.data();
        setQrStatus(sessionData.status);
        
        if (sessionData.status === "confirmed" && sessionData.user_data) {
          handleQRLogin(sessionData.user_data);
          unsubscribe();
        }
      }
    });
    */
  };
  // 🎯 التمرير إلى الأقسام
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  // تنظيف QR session
  const handleCloseQRModal = () => {
    setShowQRLogin(false);
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }
    setQrCodeUrl("");
    setQrSessionId("");
    setQrStatus("");
  };

  // إذا كان المستخدم مسجلاً
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
          <p>{t("role")}: {userRole}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`homepage-container ${darkMode ? "dark" : ""} ${i18n.language === "ar" ? "rtl" : "ltr"}`}>
      {/* 🌐 خلفية ديناميكية */}
      <div className="dynamic-bg">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
      </div>

      {/* 🌐 شريط اللغة والوضع الليلي */}
      <div className={`language-darkmode-bar ${i18n.language === "ar" ? "rtl" : "ltr"}`}>
        <div className="language-section">
          <span className="section-label">{t("language")}:</span>
          <div className="language-buttons">
            <button 
              className={i18n.language === "fr" ? "active" : ""}
              onClick={() => changeLanguage("fr")}
            >
              🇫🇷 Français
            </button>
            <button 
              className={i18n.language === "en" ? "active" : ""}
              onClick={() => changeLanguage("en")}
            >
              🇬🇧 English
            </button>
            <button 
              className={i18n.language === "ar" ? "active" : ""}
              onClick={() => changeLanguage("ar")}
            >
              🇸🇦 العربية
            </button>
          </div>
        </div>
        
        <div className="darkmode-section">
          <button 
            className={`darkmode-toggle ${darkMode ? "dark" : "light"}`}
            onClick={toggleDarkMode}
          >
            <span className="toggle-icon">
              {darkMode ? "☀️" : "🌙"}
            </span>
            <span className="toggle-text">
              {darkMode ? t("light_mode") : t("dark_mode")}
            </span>
          </button>
        </div>
      </div>

      {/* 🎯 التنقل */}
      <motion.nav 
        className="dynamic-nav"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="nav-brand">
          <motion.div 
            className="logo"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            🚚
          </motion.div>
          <span>Livraison Express</span>
        </div>
        
        <div className="nav-center">
          {['hero', 'stats', 'login'].map((section) => (
            <button
              key={section}
              className={`nav-item ${activeSection === section ? 'active' : ''}`}
              onClick={() => scrollToSection(section)}
            >
              {section === 'hero' && `🏠 ${t("home")}`}
              {section === 'stats' && `📊 ${t("stats")}`}
              {section === 'login' && `🔐 ${t("login")}`}
            </button>
          ))}
        </div>

        <div className="nav-placeholder"></div>
      </motion.nav>

      {/* 🎯 الهيرو */}
      <section id="hero" className="hero-dynamic">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="title-main">Livraison Express</span>
            <span className="title-sub">{t("fastest_delivery_partner")}</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {t("hero_description")}
          </motion.p>
          
          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              className="cta-btn primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
            >
              🚀 {t("get_started_free")}
            </motion.button>
            <motion.button
              className="cta-btn secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToSection('login')}
            >
              🔐 {t("sign_in")}
            </motion.button>
          </motion.div>
        </motion.div>

        <div className="hero-visuals">
          <motion.div className="visual-element delivery-truck" animate={{ x: [0, 20, 0], y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>🚚</motion.div>
          <motion.div className="visual-element package" animate={{ y: [0, -15, 0], rotate: [0, 5, 0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}>📦</motion.div>
          <motion.div className="visual-element location" animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 2 }}>📍</motion.div>
        </div>
      </section>

      {/* 📊 الإحصائيات */}
      <section id="stats" className="stats-dynamic">
        <motion.div
          className="stats-container"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {t("real_time_stats")}
          </motion.h2>
          
          <div className="stats-grid">
            {[
              { icon: "📦", value: stats.deliveries, label: t("deliveries_completed"), badge: t("live") },
              { icon: "👥", value: stats.users, label: t("happy_customers"), badge: t("growing") },
              { icon: "🌍", value: stats.cities, label: t("cities_covered"), badge: t("nationwide") },
              { icon: "⭐", value: `${stats.satisfaction}%`, label: t("satisfaction_rate"), badge: t("excellent") }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="stat-card"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-number">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-badge">{stat.badge}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 🔐 تسجيل الدخول */}
      <section id="login" className="login-dynamic">
        <motion.div
          className="login-section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2>{t("account_access")}</h2>
          <p>{t("sign_in_to_manage")}</p>
          
          <motion.button
            className="login-toggle-btn"
            onClick={() => setIsLoginOpen(!isLoginOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoginOpen ? `▲ ${t("hide_login_form")}` : `▼ ${t("show_login_form")}`}
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {isLoginOpen && (
            <motion.div
              className="login-container"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <AnimatePresence mode="wait">
                {!showForgotPassword ? (
                  <motion.div
                    key="login-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="login-header"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h3>{t("welcome_back")}!</h3>
                      <p>{t("sign_in_to_access")}</p>
                    </motion.div>

                    <motion.form
                      className="login-form"
                      onSubmit={handleSubmit}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <motion.div
                        className="input-group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <label>📧 {t("email_address")}</label>
                        <input
                          type="email"
                          placeholder={t("enter_your_email")}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </motion.div>

                      <motion.div
                        className="input-group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <label>🔒 {t("password")}</label>
                        <input
                          type="password"
                          placeholder={t("enter_your_password")}
                          value={motDePasse}
                          onChange={(e) => setMotDePasse(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </motion.div>

                      <motion.div
                        className="forgot-password-link"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                      >
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                        >
                          {t("forgot_password")}?
                        </button>
                      </motion.div>

                      <motion.button
                        type="submit"
                        className={`login-btn ${loading ? 'loading' : ''}`}
                        disabled={loading}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                      >
                        {loading ? (
                          <>
                            <div className="spinner"></div>
                            {t("signing_in")}...
                          </>
                        ) : (
                          `🔐 ${t("sign_in")}`
                        )}
                      </motion.button>

                      {/* 🔐 خيار QR */}
                      <motion.div
                        className="qr-login-option"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                      >
                        <div className="divider">
                          <span>{t("or")}</span>
                        </div>
                        
                        <motion.button
                          type="button"
                          className="qr-login-btn"
                          onClick={() => setShowQRLogin(true)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span className="qr-icon">📱</span>
                          {t("login_with_qr")}
                        </motion.button>
                      </motion.div>
                    </motion.form>

                    <motion.div
                      className="login-footer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                    >
                      <p>
                        {t("no_account")}{' '}
                        <button 
                          className="signup-link"
                          onClick={() => navigate('/register')}
                        >
                          {t("create_account")}
                        </button>
                      </p>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="forgot-password-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="login-header"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h3>{t("reset_password")}</h3>
                      <p>{t("enter_email_for_reset")}</p>
                    </motion.div>

                    <motion.form
                      className="login-form"
                      onSubmit={handleForgotPassword}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <motion.div
                        className="input-group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <label>📧 {t("email_address")}</label>
                        <input
                          type="email"
                          placeholder={t("enter_your_email")}
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          required
                        />
                      </motion.div>

                      <motion.button
                        type="submit"
                        className="login-btn"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        📧 {t("send_reset_code")}
                      </motion.button>

                      <motion.button
                        type="button"
                        className="back-btn"
                        onClick={() => setShowForgotPassword(false)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                      >
                        ↩ {t("back_to_login")}
                      </motion.button>
                    </motion.form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 🎯 نافذة QR */}
      <AnimatePresence>
        {showQRLogin && (
          <>
            <motion.div
              className="qr-login-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseQRModal}
            />
            <motion.div
              className="qr-login-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="qr-login-header">
                <h3>📱 {t("qr_login")}</h3>
                <button 
                  className="close-qr-login"
                  onClick={handleCloseQRModal}
                >
                  ✕
                </button>
              </div>
              
              <div className="qr-login-content">
                {!qrCodeUrl ? (
                  <div className="qr-init-state">
                    <div className="qr-init-icon">📱</div>
                    <h4>{t("qr_ready_title")}</h4>
                    <p>{t("qr_ready_description")}</p>
                    
                    <motion.button
                      className="generate-qr-btn"
                      onClick={generateQRCode}
                      disabled={qrLoading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {qrLoading ? (
                        <>
                          <div className="spinner"></div>
                          {t("generating_qr")}...
                        </>
                      ) : (
                        `🎯 ${t("generate_qr")}`
                      )}
                    </motion.button>
                  </div>
                ) : (
                  <div className="qr-display-state">
                    <div className="qr-code-container">
                      <img 
                        src={qrCodeUrl} 
                        alt="QR Code" 
                        className="qr-code-image"
                      />
                      
                      <div className={`qr-status ${qrStatus}`}>
                        {qrStatus === "waiting" && (
                          <div className="status-waiting">
                            <div className="pulse-dot"></div>
                            <span>{t("waiting_scan")}</span>
                          </div>
                        )}
                        
                        {qrStatus === "scanned" && (
                          <div className="status-scanning">
                            <div className="scanning-animation">🔍</div>
                            <span>{t("scanning_qr")}</span>
                          </div>
                        )}
                        
                        {qrStatus === "confirmed" && (
                          <div className="status-success">
                            <div className="success-icon">✅</div>
                            <span>{t("login_success")}</span>
                          </div>
                        )}
                        
                        {qrStatus === "error" && (
                          <div className="status-error">
                            <div className="error-icon">❌</div>
                            <span>{t("qr_error")}</span>
                            <button 
                              className="retry-btn"
                              onClick={generateQRCode}
                            >
                              {t("retry")}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="qr-instructions">
                      <h4>📋 {t("how_to_use")}:</h4>
                      <ol>
                        <li>{t("step1_open_app")}</li>
                        <li>{t("step2_scan_qr")}</li>
                        <li>{t("step3_confirm_login")}</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 🦶 الفوتر */}
      <footer className="simple-footer">
        <div className="footer-content">
          <p>&copy; 2024 Livraison Express. {t("all_rights_reserved")}</p>
          <div className="footer-links">
            <button onClick={() => scrollToSection('hero')}>{t("home")}</button>
            <button onClick={() => scrollToSection('stats')}>{t("stats")}</button>
            <button onClick={() => scrollToSection('login')}>{t("login")}</button>
          </div>
        </div>
      </footer>
    </div>
  );
}