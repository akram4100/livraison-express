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
    i18n.changeLanguage(savedLanguage); // دع i18n يتعامل مع اللغة
    
    if (updateGlobalDarkMode) {
      updateGlobalDarkMode(savedDarkMode);
    }
  }, [i18n, updateGlobalDarkMode]);

  // 🌍 تغيير اللغة مع الحفظ (مبسط)
  const changeLanguage = (lang) => {
    console.log('🔄 تغيير اللغة إلى:', lang);
    i18n.changeLanguage(lang);
    // لا تفعل أي شيء آخر - i18n.js سيتعامل مع الباقي
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
      const response = await fetch("http://localhost:8080/api/verify-reset-code", {
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
      const response = await fetch("http://localhost:8080/api/send-reset-code", {
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
            🔐
          </motion.div>
          <h2>{t("verify_otp")}</h2>
          <p>{t("enter_otp_sent")}</p>
          <p className="email-display">{email}</p>
        </div>

        {/* رسالة الخطأ */}
        {error && (
          <motion.div 
            className="error-message"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            ❌ {error}
          </motion.div>
        )}

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
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileFocus={{ scale: 1.1 }}
              disabled={loading}
            />
          ))}
        </div>

        {/* زر التحقق */}
        <motion.button
          className={`verify-button ${loading ? "loading" : ""}`}
          onClick={verifyOtp}
          whileHover={{ scale: loading ? 1 : 1.05 }}
          whileTap={{ scale: loading ? 1 : 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          disabled={loading}
        >
          {loading ? t("verifying") : t("verify_code")}
        </motion.button>

        {/* إعادة الإرسال */}
        <div className="resend-section">
          <p>{t("didnt_receive_code")}</p>
          <button 
            className={`resend-button ${canResend ? "active" : "disabled"}`}
            onClick={resendOtp}
            disabled={!canResend || loading}
          >
            {canResend 
              ? t("resend_otp")
              : `${t("resend_in")} ${timer}s`
            }
          </button>
        </div>

        {/* رابط العودة */}
        <div className="back-link">
          <button 
            onClick={() => navigate("/forgot-password")}
            className="back-button"
          >
            ↩ {t("back_to_forgot_password")}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOtp;