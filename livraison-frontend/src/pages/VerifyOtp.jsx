import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

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

      {/* الـ CSS */}
      <style jsx>{`
        .verify-otp-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          position: relative;
        }

        .verify-otp-page.dark {
          background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
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

        .otp-container {
          background: white;
          padding: 40px 30px;
          border-radius: 20px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
          text-align: center;
          max-width: 450px;
          width: 100%;
        }

        .verify-otp-page.dark .otp-container {
          background: #2d3748;
          color: white;
        }

        .otp-header {
          margin-bottom: 30px;
        }

        .otp-icon {
          font-size: 3rem;
          margin-bottom: 15px;
        }

        .otp-header h2 {
          color: #2d3748;
          margin-bottom: 10px;
          font-size: 1.8rem;
        }

        .verify-otp-page.dark .otp-header h2 {
          color: white;
        }

        .otp-header p {
          color: #718096;
          font-size: 1rem;
          line-height: 1.5;
          margin: 5px 0;
        }

        .verify-otp-page.dark .otp-header p {
          color: #cbd5e0;
        }

        .email-display {
          font-weight: bold;
          color: #667eea !important;
          background: #f7fafc;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .verify-otp-page.dark .email-display {
          background: #4a5568;
          border-color: #718096;
        }

        .error-message {
          background: #fed7d7;
          color: #c53030;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid #feb2b2;
        }

        .verify-otp-page.dark .error-message {
          background: #742a2a;
          color: #fc8181;
          border-color: #c53030;
        }

        .otp-inputs-container {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 30px;
        }

        .otp-input {
          width: 55px;
          height: 55px;
          text-align: center;
          font-size: 1.4rem;
          font-weight: bold;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          background: white;
          transition: all 0.3s ease;
          outline: none;
          color: #2d3748;
        }

        .verify-otp-page.dark .otp-input {
          background: #4a5568;
          border-color: #718096;
          color: white;
        }

        .otp-input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          background: #f7fafc;
        }

        .verify-otp-page.dark .otp-input:focus {
          background: #2d3748;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
        }

        .otp-input:disabled {
          background: #f7fafc;
          cursor: not-allowed;
        }

        .verify-otp-page.dark .otp-input:disabled {
          background: #2d3748;
        }

        .verify-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          margin-bottom: 20px;
          transition: all 0.3s ease;
        }

        .verify-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .verify-button.loading {
          background: #a0aec0;
          cursor: not-allowed;
        }

        .verify-button:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .resend-section {
          margin-bottom: 20px;
        }

        .resend-section p {
          color: #718096;
          margin-bottom: 10px;
        }

        .verify-otp-page.dark .resend-section p {
          color: #cbd5e0;
        }

        .resend-button {
          background: transparent;
          border: 2px solid #667eea;
          color: #667eea;
          padding: 8px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .verify-otp-page.dark .resend-button {
          color: #90cdf4;
          border-color: #90cdf4;
        }

        .resend-button.active:hover:not(:disabled) {
          background: #667eea;
          color: white;
        }

        .verify-otp-page.dark .resend-button.active:hover:not(:disabled) {
          background: #90cdf4;
          color: #2d3748;
        }

        .resend-button.disabled {
          border-color: #cbd5e0;
          color: #a0aec0;
          cursor: not-allowed;
        }

        .verify-otp-page.dark .resend-button.disabled {
          border-color: #718096;
          color: #a0aec0;
        }

        .resend-button:disabled {
          cursor: not-allowed;
        }

        .back-link {
          text-align: center;
        }

        .back-button {
          background: transparent;
          border: none;
          color: #667eea;
          cursor: pointer;
          font-size: 0.9rem;
          text-decoration: underline;
        }

        .verify-otp-page.dark .back-button {
          color: #90cdf4;
        }

        .back-button:hover {
          color: #5a67d8;
        }

        @media (max-width: 480px) {
          .otp-container {
            padding: 30px 20px;
          }

          .otp-input {
            width: 45px;
            height: 45px;
            font-size: 1.2rem;
          }

          .otp-inputs-container {
            gap: 8px;
          }
          
          .language-switch {
            top: 10px;
            right: 10px;
          }
          
          .language-switch.rtl {
            right: auto;
            left: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default VerifyOtp;
