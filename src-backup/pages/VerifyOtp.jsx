import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import "../style/verify.css";

const VerifyOtp = ({ globalDarkMode, updateGlobalDarkMode }) => {
  const { t, i18n } = useTranslation();
  const [darkMode, setDarkMode] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
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

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: enteredOtp }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "❌ " + t("invalid_code"));
        return;
      }

      alert("✅ " + t("code_verified"));
      navigate("/reset-password", { state: { email } });
    } catch (error) {
      alert("❌ " + t("connection_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`otp-container ${darkMode ? "dark" : ""}`}>
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
        className="otp-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <img src="/otp.png" alt="OTP Icon" className="otp-image" />

        <h2>{t("verification_code")}</h2>
        <p className="otp-text">
          {t("code_sent_to")}  
          <span className="otp-email">{email}</span>
        </p>

        <form onSubmit={handleVerify} className="otp-form">
          <input
            type="text"
            placeholder={t("enter_6_digit_code")}
            value={enteredOtp}
            maxLength={6}
            onChange={(e) => setEnteredOtp(e.target.value)}
            className="otp-input"
            required
            disabled={loading}
          />

          <motion.button
            type="submit"
            className="otp-btn"
            whileHover={{ scale: loading ? 1 : 1.03 }}
            whileTap={{ scale: loading ? 1 : 0.97 }}
            disabled={loading}
          >
            {loading ? "⏳ " + t("verifying") : t("verify")}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default VerifyOtp;