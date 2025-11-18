import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "../style/register.css";

const Register = ({ globalDarkMode, updateGlobalDarkMode }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  
  // 🔹 مزامنة الوضع الليلي واللغة مع الإعدادات العالمية
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'fr';
    
    setDarkMode(savedDarkMode);
    i18n.changeLanguage(savedLanguage);
    
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

  // 🔹 إعدادات API
  const API_BASE = "http://localhost:8080/api";

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
          navigate("/login");
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
      {/* 🌐 أزرار اللغة والوضع */}
      <div className={`language-switch ${i18n.language === "ar" ? "rtl" : "ltr"}`}>
        <button onClick={() => changeLanguage("fr")}>🇫🇷</button>
        <button onClick={() => changeLanguage("en")}>🇬🇧</button>
        <button onClick={() => changeLanguage("ar")}>🇸🇦</button>
        <button onClick={toggleDarkMode}>
          {darkMode ? "☀️" : "🌙"}
        </button>
        <button onClick={testServerConnection} className="test-btn">
          🔗
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
            {t("register_subtitle") || "Rejoignez notre plateforme de livraison express"}
          </p>
          
          <div className="features">
            <div className="feature">
              <span>⚡</span>
              <p>{t("fast_delivery") || "Livraison rapide"}</p>
            </div>
            <div className="feature">
              <span>🔒</span>
              <p>{t("secure_service") || "Service sécurisé"}</p>
            </div>
            <div className="feature">
              <span>🌍</span>
              <p>{t("wide_coverage") || "Couverture étendue"}</p>
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
                {isVerifying ? "📧 " + (t("verification") || "Vérification") : "🚀 " + (t("registration") || "Inscription")}
              </div>
              <h2>{isVerifying ? (t("email_verification") || "Vérification d'email") : (t("create_account") || "Créer un compte")}</h2>
              <p className="form-subtitle">
                {isVerifying ? 
                  (t("enter_verification_code") || "Entrez le code de vérification envoyé à votre email") : 
                  (t("create_account_seconds") || "Créez votre compte en quelques secondes")
                }
              </p>
            </div>

            {/* 📄 نموذج التسجيل */}
            {!isVerifying ? (
              <form className="register-form" onSubmit={handleRegister}>
                <div className="form-group">
                  <label htmlFor="nom">{t("full_name") || "Nom complet"} *</label>
                  <input
                    id="nom"
                    type="text"
                    name="nom"
                    placeholder={t("enter_full_name") || "Entrez votre nom complet"}
                    value={formData.nom}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">{t("email_address") || "Adresse email"} *</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder={t("email_placeholder") || "Entrez votre email"}
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="mot_de_passe">{t("password") || "Mot de passe"} *</label>
                  <input
                    id="mot_de_passe"
                    type="password"
                    name="mot_de_passe"
                    placeholder={t("create_secure_password") || "Créez un mot de passe sécurisé"}
                    value={formData.mot_de_passe}
                    onChange={handleChange}
                    required
                    minLength="6"
                    disabled={loading}
                  />
                  <small className="password-hint">
                    {t("password_minimum") || "Minimum 6 caractères"}
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="role">{t("role") || "Rôle"} *</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="client">{t("client") || "Client"}</option>
                    <option value="livreur">{t("delivery_person") || "Livreur"}</option>
                  </select>
                </div>

                <motion.button
                  type="submit"
                  className={`submit-btn ${loading ? "loading" : ""}`}
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  {loading ? 
                    "⏳ " + (t("processing") || "Traitement...") : 
                    "✅ " + (t("sign_up") || "S'inscrire")
                  }
                </motion.button>
              </form>
            ) : (
              /* 🔐 نموذج التحقق */
              <form className="verification-form" onSubmit={handleVerifyCode}>
                <div className="form-group">
                  <label htmlFor="verificationCode">{t("verification_code") || "Code de vérification"} *</label>
                  <input
                    id="verificationCode"
                    type="text"
                    placeholder={t("enter_6_digit_code") || "Entrez le code à 6 chiffres"}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    maxLength="6"
                    required
                    disabled={loading}
                    pattern="[0-9]{6}"
                    title={t("six_digits_only") || "6 chiffres uniquement"}
                  />
                  <small className="code-hint">
                    {t("check_your_email") || "Vérifiez votre email"}: <strong>{formData.email}</strong>
                  </small>
                </div>

                <motion.button
                  type="submit"
                  className={`verify-btn ${loading ? "loading" : ""}`}
                  disabled={loading || verificationCode.length !== 6}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  {loading ? 
                    "⏳ " + (t("verifying") || "Vérification...") : 
                    "🔐 " + (t("verify_email") || "Vérifier l'email")
                  }
                </motion.button>

                <button
                  type="button"
                  className="back-btn"
                  onClick={() => setIsVerifying(false)}
                  disabled={loading}
                >
                  ↩️ {t("back_to_register") || "Retour à l'inscription"}
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
                {t("already_have_account") || "Vous avez déjà un compte ?"}{" "}
                <a href="/login" className="login-link">
                  {t("sign_in") || "Se connecter"}
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* الـ CSS الإضافي */}
      <style jsx>{`
        .register-container {
          position: relative;
          min-height: 100vh;
        }

        .language-switch {
          position: absolute;
          top: 20px;
          right: 20px;
          display: flex;
          gap: 10px;
          z-index: 1000;
        }

        .language-switch.rtl {
          right: auto;
          left: 20px;
        }

        .language-switch button {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          color: white;
          font-size: 1rem;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .language-switch button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        .test-btn {
          background: rgba(255, 255, 255, 0.1) !important;
        }

        .test-btn:hover {
          background: rgba(255, 255, 255, 0.2) !important;
        }

        @media (max-width: 768px) {
          .language-switch {
            top: 10px;
            right: 10px;
            gap: 5px;
          }
          
          .language-switch.rtl {
            right: auto;
            left: 10px;
          }
          
          .language-switch button {
            padding: 6px 8px;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Register;
