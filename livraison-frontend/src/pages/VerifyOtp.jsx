import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../style/verify.css";

const VerifyOtp = ({ globalDarkMode, updateGlobalDarkMode }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const inputsRef = useRef([]);

  // 🔹 مزامنة الوضع الليلي مع الإعدادات العالمية
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

  // 📧 الحصول على الإيميل من location state
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      navigate("/forgot-password");
    }
  }, [location, navigate]);

  // ⏰ timer لإعادة الإرسال
  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // 🔢 معالجة إدخال OTP
  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    if (value !== "" && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  // ⌨️ معالجة Backspace
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  // ✅ التحقق من OTP مع الخادم
  const verifyOtp = async () => {
    const enteredOtp = otp.join("");
    
    if (enteredOtp.length !== 6) {
      setError(t("enter_full_otp"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("https://livraison-api-x45n.onrender.com/api/verify-reset-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          code: enteredOtp
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/reset-password", { 
          state: { 
            email: email,
            verified: true
          }
        });
      } else {
        setError(data.message || t("invalid_otp"));
      }
    } catch (error) {
      console.error("❌ خطأ في التحقق من OTP:", error);
      setError(t("connection_error"));
    } finally {
      setLoading(false);
    }
  };

  // 🔄 إعادة إرسال OTP
  const resendOtp = async () => {
    if (!canResend) return;
    
    setLoading(true);
    setError("");

    try {
      const response = await fetch("https://livraison-api-x45n.onrender.com/api/send-reset-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTimer(60);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        setError("");
        inputsRef.current[0].focus();
        
        alert(t("otp_resent_success"));
      } else {
        setError(data.message || t("resend_failed"));
      }
    } catch (error) {
      console.error("❌ خطأ في إعادة إرسال OTP:", error);
      setError(t("connection_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`verify-otp-page ${darkMode ? "dark" : ""}`}>
      {/* 🌐 شريط اللغة والوضع الليلي المحسّن */}
      <div className={`language-darkmode-bar ${i18n.language === "ar" ? "rtl" : "ltr"}`}>
        <div className="language-section">
          <span className="section-label">{t("language")}:</span>
          <div className="language-buttons">
            <button 
              className={i18n.language === "fr" ? "active" : ""}
              onClick={() => changeLanguage("fr")}
            >
              🇫🇷
            </button>
            <button 
              className={i18n.language === "en" ? "active" : ""}
              onClick={() => changeLanguage("en")}
            >
              🇬🇧
            </button>
            <button 
              className={i18n.language === "ar" ? "active" : ""}
              onClick={() => changeLanguage("ar")}
            >
              🇸🇦
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
          </button>
        </div>
      </div>

      <motion.div 
        className="otp-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* رأس الصفحة */}
        <div className="otp-header">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="otp-icon"
          >
            <div className="icon-wrapper">
              <span className="lock-icon">🔐</span>
              <div className="icon-glow"></div>
            </div>
          </motion.div>
          <h2>{t("verify_otp") || "Verify OTP"}</h2>
          <p>{t("enter_otp_sent") || "Enter the verification code sent to your email"}</p>
          <div className="email-display">
            <span className="email-icon">📧</span>
            {email}
          </div>
        </div>

        {/* رسالة الخطأ */}
        {error && (
          <motion.div 
            className="error-message"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <span className="error-icon">⚠️</span>
            {error}
          </motion.div>
        )}

        {/* مؤشر التقدم */}
        <div className="progress-indicator">
          <div className="progress-steps">
            <div className="step completed">
              <div className="step-number">1</div>
              <span className="step-text">{t("request_code") || "Request Code"}</span>
            </div>
            <div className="step-line"></div>
            <div className="step active">
              <div className="step-number">2</div>
              <span className="step-text">{t("verify_code") || "Verify Code"}</span>
            </div>
            <div className="step-line"></div>
            <div className="step">
              <div className="step-number">3</div>
              <span className="step-text">{t("reset_password") || "Reset Password"}</span>
            </div>
          </div>
        </div>

        {/* حقول إدخال OTP */}
        <div className="otp-inputs-container">
          {otp.map((digit, index) => (
            <motion.input
              key={index}
              ref={el => inputsRef.current[index] = el}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleOtpChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={(e) => e.target.select()}
              className="otp-input"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                delay: 0.3 + index * 0.1,
                type: "spring",
                stiffness: 200
              }}
              whileFocus={{ scale: 1.05, y: -2 }}
              whileHover={{ scale: 1.02 }}
              disabled={loading}
            />
          ))}
        </div>

        {/* زر التحقق */}
        <motion.button
          className={`verify-button ${loading ? "loading" : ""}`}
          onClick={verifyOtp}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          disabled={loading}
        >
          {loading ? (
            <div className="button-loading">
              <div className="loading-spinner"></div>
              {t("verifying") || "Verifying..."}
            </div>
          ) : (
            <div className="button-content">
              <span className="button-icon">✅</span>
              {t("verify_code") || "Verify Code"}
            </div>
          )}
        </motion.button>

        {/* إعادة الإرسال */}
        <div className="resend-section">
          <div className="timer-container">
            <div className="timer-icon">⏰</div>
            <div className="timer-text">
              {canResend ? (
                <span className="ready-text">{t("ready_to_resend") || "Ready to resend?"}</span>
              ) : (
                <span className="countdown-text">
                  {t("resend_in") || "Resend in"} <span className="timer-number">{timer}s</span>
                </span>
              )}
            </div>
          </div>
          
          <motion.button 
            className={`resend-button ${canResend ? "active" : "disabled"}`}
            onClick={resendOtp}
            whileHover={canResend ? { scale: 1.05 } : {}}
            whileTap={canResend ? { scale: 0.95 } : {}}
            disabled={!canResend || loading}
          >
            <span className="resend-icon">🔄</span>
            {canResend ? t("resend_otp") || "Resend Code" : t("resend") || "Resend"}
          </motion.button>
        </div>

        {/* رابط العودة */}
        <div className="back-link">
          <motion.button 
            onClick={() => navigate("/Login")}
            className="back-button"
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="back-icon">↩</span>
            {t("back_to_forgot_password") || "Back to Forgot Password"}
          </motion.button>
        </div>
      </motion.div>

      {/* العناصر الزخرفية */}
      <div className="decorative-elements">
        <motion.div 
          className="floating-element el-1"
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          🔢
        </motion.div>
        <motion.div 
          className="floating-element el-2"
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        >
          📧
        </motion.div>
        <motion.div 
          className="floating-element el-3"
          animate={{ 
            y: [0, -25, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        >
          ⚡
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyOtp;
