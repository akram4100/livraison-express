import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import "../style/reset.css";

const ResetPassword = ({ globalDarkMode, updateGlobalDarkMode }) => {
  const { t, i18n } = useTranslation();
  const [darkMode, setDarkMode] = useState(false);
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [confirmerMotDePasse, setConfirmerMotDePasse] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

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

  // 🔐 إعادة تعيين كلمة المرور
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!nouveauMotDePasse || !confirmerMotDePasse) {
      setMessage("❌ " + t("fill_all_fields"));
      setLoading(false);
      return;
    }

    if (nouveauMotDePasse.length < 6) {
      setMessage("❌ " + t("password_min_length"));
      setLoading(false);
      return;
    }

    if (nouveauMotDePasse !== confirmerMotDePasse) {
      setMessage("❌ " + t("passwords_not_match"));
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          nouveauMotDePasse 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ " + data.message);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setMessage("❌ " + (data.message || t("reset_failed")));
      }
    } catch (error) {
      console.error("❌ Erreur:", error);
      setMessage("❌ " + t("connection_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`reset-password-container ${darkMode ? "dark" : ""}`}>
      {/* 🌐 أزرار اللغة والوضع */}
      <div className={`language-switch ${i18n.language === "ar" ? "rtl" : "ltr"}`}>
        <button onClick={() => changeLanguage("fr")}>🇫🇷</button>
        <button onClick={() => changeLanguage("en")}>🇬🇧</button>
        <button onClick={() => changeLanguage("ar")}>🇸🇦</button>
        <button onClick={toggleDarkMode}>
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>

      <motion.div
        className="reset-password-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <img src="/reset-password.png" alt="Reset Password" className="reset-image" />
        
        <h2>{t("reset_password")}</h2>
        <p className="reset-text">
          {t("create_new_password")}
        </p>

        <form onSubmit={handleResetPassword} className="reset-form">
          <div className="form-group">
            <label htmlFor="nouveauMotDePasse">{t("new_password")}</label>
            <input
              id="nouveauMotDePasse"
              type="password"
              placeholder={t("enter_new_password")}
              value={nouveauMotDePasse}
              onChange={(e) => setNouveauMotDePasse(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmerMotDePasse">{t("confirm_password")}</label>
            <input
              id="confirmerMotDePasse"
              type="password"
              placeholder={t("confirm_new_password")}
              value={confirmerMotDePasse}
              onChange={(e) => setConfirmerMotDePasse(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <motion.button
            type="submit"
            className="reset-btn"
            whileHover={{ scale: loading ? 1 : 1.03 }}
            whileTap={{ scale: loading ? 1 : 0.97 }}
            disabled={loading}
          >
            {loading ? "⏳ " + t("resetting") : t("reset_password_button")}
          </motion.button>
        </form>

        {message && (
          <motion.div 
            className={`message ${message.includes('✅') ? 'success' : 'error'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {message}
          </motion.div>
        )}

        <p className="back-login">
          <a href="/login">{t("back_to_login")}</a>
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPassword;