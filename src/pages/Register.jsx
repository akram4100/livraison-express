// src/pages/Register.jsx
import React, { useState, useEffect }  from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import "../style/register.css";

const Register = ({ globalDarkMode, updateGlobalDarkMode }) => {
  const { t, i18n } = useTranslation();
  const [darkMode, setDarkMode] = useState(false);
  // 🔹 مزامنة الوضع الليلي واللغة مع الإعدادات العالمية
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

  // حالة النموذج
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    mot_de_passe: "",
    role: "client",
  });

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 إعدادات API - مصحح
  const API_BASE = "http://localhost:8080/api";

  // 🌍 تغيير اللغة
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
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
  // ✏️ تحديث بيانات النموذج
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 📧 إرسال طلب التسجيل
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // ✅ التحقق من صحة البيانات
    if (!formData.nom || !formData.email || !formData.mot_de_passe) {
      setMessage("❌ " + t("fill_all_fields"));
      setLoading(false);
      return;
    }

    if (formData.mot_de_passe.length < 6) {
      setMessage("❌ " + t("password_min_length"));
      setLoading(false);
      return;
    }

    try {
      console.log("🚀 إرسال طلب التسجيل...", formData);
      
      const response = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("📩 استجابة السيرفر:", data);

      if (response.ok) {
        setMessage("✅ " + data.message);
        setIsVerifying(true);
      } else {
        setMessage("❌ " + (data.message || t("registration_failed")));
      }
    } catch (error) {
      console.error("❌ خطأ في التسجيل:", error);
      setMessage("❌ " + t("connection_error") + " - تأكد من تشغيل السيرفر");
    } finally {
      setLoading(false);
    }
  };

  // 🔐 التحقق من الكود
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!verificationCode || verificationCode.length !== 6) {
      setMessage("❌ " + t("enter_valid_code"));
      setLoading(false);
      return;
    }

    try {
      console.log("🔐 التحقق من الكود...", { 
        email: formData.email, 
        code: verificationCode 
      });

      const response = await fetch(`${API_BASE}/verify-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ " + data.message);
        
        // الانتقال لصفحة Login بعد نجاح التحقق
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        setMessage("❌ " + (data.message || t("verification_failed")));
      }
    } catch (error) {
      console.error("❌ خطأ في التحقق:", error);
      setMessage("❌ " + t("connection_error"));
    } finally {
      setLoading(false);
    }
  };

  // 🔗 اختبار اتصال السيرفر
  const testServerConnection = async () => {
    try {
      const response = await fetch("http://localhost:8080/");
      const data = await response.text();
      alert("✅ السيرفر يعمل: " + data);
    } catch (error) {
      alert("❌ السيرفر غير متاح. تأكد من تشغيله على البورت 8080");
    }
  };

  return (
    <div className={`register-container ${darkMode ? "dark" : ""}`}>
      {/* 🌐 أزرار التحكم */}
      <div className="control-buttons">
        <button onClick={() => changeLanguage("fr")}>🇫🇷 FR</button>
        <button onClick={() => changeLanguage("en")}>🇬🇧 EN</button>
        <button onClick={() => changeLanguage("ar")}>🇸🇦 AR</button>
        <button onClick={toggleDarkMode}>
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
        <button onClick={testServerConnection} className="test-btn">
          🔗 Test Server
        </button>
      </div>

      {/* 🎯 محتوى الصفحة */}
      <div className="register-content">
        
        {/* 📝 الجانب الأيسر - المعلومات */}
        <motion.div 
          className="register-info"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="truck-animation"
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 2, 0, -2, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            🚚
          </motion.div>
          
          <h1 className="app-title">Livraison Express</h1>
          <p className="app-description">
            {t("register_subtitle")}
          </p>
          
          <div className="features">
            <div className="feature">
              <span>⚡</span>
              <p>{t("fast_delivery")}</p>
            </div>
            <div className="feature">
              <span>🔒</span>
              <p>{t("secure_service")}</p>
            </div>
            <div className="feature">
              <span>🌍</span>
              <p>{t("wide_coverage")}</p>
            </div>
          </div>
        </motion.div>

        {/* 📋 الجانب الأيمن - النموذج */}
        <motion.div 
          className="register-form-section"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="form-container">
            
            {/* 🎫 رأس النموذج */}
            <div className="form-header">
              <div className="form-badge">
                {isVerifying ? "📧 " + t("verification") : "🚀 " + t("registration")}
              </div>
              <h2>{isVerifying ? t("email_verification") : t("create_account")}</h2>
              <p className="form-subtitle">
                {isVerifying ? t("enter_verification_code") : t("create_account_seconds")}
              </p>
            </div>

            {/* 📄 نموذج التسجيل */}
            {!isVerifying ? (
              <form className="register-form" onSubmit={handleRegister}>
                <div className="form-group">
                  <label htmlFor="nom">{t("full_name")} *</label>
                  <input
                    id="nom"
                    type="text"
                    name="nom"
                    placeholder={t("enter_full_name")}
                    value={formData.nom}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">{t("email_address")} *</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder={t("email_placeholder")}
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="mot_de_passe">{t("password")} *</label>
                  <input
                    id="mot_de_passe"
                    type="password"
                    name="mot_de_passe"
                    placeholder={t("create_secure_password")}
                    value={formData.mot_de_passe}
                    onChange={handleChange}
                    required
                    minLength="6"
                    disabled={loading}
                  />
                  <small className="password-hint">
                    {t("password_minimum")}
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="role">{t("role")} *</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="client">{t("client")}</option>
                    <option value="livreur">{t("delivery_person")}</option>
                  </select>
                </div>

                <motion.button
                  type="submit"
                  className={`submit-btn ${loading ? "loading" : ""}`}
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  {loading ? "⏳ " + t("processing") : "✅ " + t("sign_up")}
                </motion.button>
              </form>
            ) : (
              /* 🔐 نموذج التحقق */
              <form className="verification-form" onSubmit={handleVerifyCode}>
                <div className="form-group">
                  <label htmlFor="verificationCode">{t("verification_code")} *</label>
                  <input
                    id="verificationCode"
                    type="text"
                    placeholder={t("enter_6_digit_code")}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    maxLength="6"
                    required
                    disabled={loading}
                    pattern="[0-9]{6}"
                    title={t("six_digits_only")}
                  />
                  <small className="code-hint">
                    {t("check_your_email")}: <strong>{formData.email}</strong>
                  </small>
                </div>

                <motion.button
                  type="submit"
                  className={`verify-btn ${loading ? "loading" : ""}`}
                  disabled={loading || verificationCode.length !== 6}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  {loading ? "⏳ " + t("verifying") : "🔐 " + t("verify_email")}
                </motion.button>

                <button
                  type="button"
                  className="back-btn"
                  onClick={() => setIsVerifying(false)}
                  disabled={loading}
                >
                  ↩️ {t("back_to_register")}
                </button>
              </form>
            )}

            {/* 💬 رسائل التنبيه */}
            {message && (
              <motion.div 
                className={`message ${message.includes('✅') ? 'success' : 'error'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {message}
              </motion.div>
            )}

            {/* 🔗 رابط تسجيل الدخول */}
            <div className="auth-links">
              <p>
                {t("already_have_account")}{" "}
                <a href="/login" className="login-link">
                  {t("sign_in")}
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;