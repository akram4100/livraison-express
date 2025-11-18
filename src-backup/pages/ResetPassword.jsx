import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import "../style/reset-password.css";

const ResetPassword = ({ globalDarkMode, updateGlobalDarkMode }) => {
  const { t, i18n } = useTranslation();
  const [darkMode, setDarkMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 🔒 التحقق من كلمة المرور
    if (newPassword.length < 6) {
      alert("❌ " + t("password_min_length"));
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("❌ " + t("passwords_do_not_match"));
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          nouveauMotDePasse: newPassword 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "❌ " + t("reset_failed"));
        return;
      }

      alert("✅ " + t("password_reset_success"));
      navigate("/login");
    } catch (error) {
      console.error("❌ Erreur:", error);
      alert("❌ " + t("connection_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`reset-container ${darkMode ? "dark" : ""}`}>
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
        className="reset-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <img src="/reset-password.png" alt="Reset Password" className="reset-image" />

        <h2>{t("reset_password")}</h2>
        <p className="reset-text">
          {t("create_new_password_for")}  
          <span className="reset-email">{email}</span>
        </p>

        <form onSubmit={handleResetPassword} className="reset-form">
          {/* 🔒 كلمة المرور الجديدة */}
          <div className="form-group">
            <label htmlFor="newPassword">{t("new_password")}</label>
            <input
              id="newPassword"
              type="password"
              placeholder={t("enter_new_password")}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="password-input"
              required
              minLength="6"
              disabled={loading}
            />
            <small className="password-hint">
              {t("password_minimum")}
            </small>
          </div>

          {/* 🔒 تأكيد كلمة المرور */}
          <div className="form-group">
            <label htmlFor="confirmPassword">{t("confirm_password")}</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder={t("confirm_new_password")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="password-input"
              required
              minLength="6"
              disabled={loading}
            />
          </div>

          {/* 🚀 زر إعادة التعيين */}
          <motion.button
            type="submit"
            className="reset-btn"
            whileHover={{ scale: loading ? 1 : 1.03 }}
            whileTap={{ scale: loading ? 1 : 0.97 }}
            disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
          >
            {loading ? "⏳ " + t("resetting") : "🔐 " + t("reset_password")}
          </motion.button>

          {/* ↩️ العودة لتسجيل الدخول */}
          <button
            type="button"
            className="back-btn"
            onClick={() => navigate("/login")}
            disabled={loading}
          >
            ↩️ {t("back_to_login")}
          </button>
        </form>

        {/* 💡 نصائح أمان */}
        <div className="security-tips">
          <h4>🔒 {t("security_tips")}</h4>
          <ul>
            <li>{t("use_strong_password")}</li>
            <li>{t("avoid_common_words")}</li>
            <li>{t("include_numbers_symbols")}</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;