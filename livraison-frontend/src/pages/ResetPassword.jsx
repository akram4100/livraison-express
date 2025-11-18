import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ResetPassword = ({ globalDarkMode, updateGlobalDarkMode }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [darkMode, setDarkMode] = useState(false);

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

  // 📧 الحصول على الإيميل من location state والتحقق من OTP
  useEffect(() => {
    if (location.state?.email && location.state?.verified) {
      setEmail(location.state.email);
    } else {
      // إذا لم يتم التحقق من OTP، ارجع لصفحة التحقق
      navigate("/verify-otp");
    }
  }, [location, navigate]);

  // 🔐 التحقق من قوة كلمة المرور
  useEffect(() => {
    const checkPasswordStrength = (password) => {
      if (password.length === 0) return "";
      
      const hasLower = /[a-z]/.test(password);
      const hasUpper = /[A-Z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      const isLong = password.length >= 8;

      const strength = [hasLower, hasUpper, hasNumber, hasSpecial, isLong].filter(Boolean).length;

      if (strength <= 2) return t("weak");
      if (strength <= 4) return t("medium");
      return t("strong");
    };

    setPasswordStrength(checkPasswordStrength(formData.password));
  }, [formData.password, t]);

  // ✏️ معالجة تغيير الحقول
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
    setSuccess("");
  };

  // ✅ إعادة تعيين كلمة المرور
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // التحقق من صحة البيانات
    if (!formData.password || !formData.confirmPassword) {
      setError(t("fill_all_fields"));
      return;
    }

    if (formData.password.length < 6) {
      setError(t("password_min_length"));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t("passwords_not_match"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8080/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          nouveauMotDePasse: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(t("password_reset_success"));
        
        // الانتقال لتسجيل الدخول بعد 2 ثانية
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(data.message || t("password_reset_failed"));
      }
    } catch (error) {
      console.error("❌ خطأ في إعادة تعيين كلمة المرور:", error);
      setError(t("connection_error"));
    } finally {
      setLoading(false);
    }
  };

  // 👁️ تبديل عرض كلمة المرور
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className={`reset-password-page ${darkMode ? "dark" : ""}`}>
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
        className="reset-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* رأس الصفحة */}
        <div className="reset-header">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="reset-icon"
          >
            🔑
          </motion.div>
          <h2>{t("set_new_password")}</h2>
          <p>{t("choose_strong_password")}</p>
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

        {/* رسالة النجاح */}
        {success && (
          <motion.div 
            className="success-message"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            ✅ {success}
          </motion.div>
        )}

        {/* نموذج إعادة التعيين */}
        <form onSubmit={handleResetPassword} className="reset-form">
          {/* حقل كلمة المرور */}
          <div className="form-group">
            <label htmlFor="password">{t("new_password")}</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="password-input"
                placeholder={t("enter_new_password")}
                disabled={loading}
                minLength="6"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            
            {/* مؤشر قوة كلمة المرور */}
            {formData.password && (
              <motion.div 
                className="password-strength"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span>{t("password_strength")}: </span>
                <span className={`strength-${passwordStrength}`}>
                  {passwordStrength}
                </span>
                <div className="strength-bar">
                  <div className={`strength-fill ${passwordStrength}`}></div>
                </div>
              </motion.div>
            )}
          </div>

          {/* حقل تأكيد كلمة المرور */}
          <div className="form-group">
            <label htmlFor="confirmPassword">{t("confirm_password")}</label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="password-input"
                placeholder={t("re_enter_password")}
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
            
            {/* مؤشر التطابق */}
            {formData.confirmPassword && (
              <motion.div 
                className="password-match"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {formData.password === formData.confirmPassword ? (
                  <span className="match-success">✅ {t("passwords_match")}</span>
                ) : (
                  <span className="match-error">❌ {t("passwords_not_match")}</span>
                )}
              </motion.div>
            )}
          </div>

          {/* تلميحات كلمة المرور */}
          <div className="password-tips">
            <h4>{t("password_tips")}:</h4>
            <ul>
              <li className={formData.password.length >= 6 ? "valid" : ""}>{t("min_6_chars")}</li>
              <li className={/[a-z]/.test(formData.password) ? "valid" : ""}>{t("lowercase_letter")}</li>
              <li className={/[A-Z]/.test(formData.password) ? "valid" : ""}>{t("uppercase_letter")}</li>
              <li className={/[0-9]/.test(formData.password) ? "valid" : ""}>{t("number_required")}</li>
              <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? "valid" : ""}>{t("special_char")}</li>
            </ul>
          </div>

          {/* زر الإرسال */}
          <motion.button
            type="submit"
            className={`reset-button ${loading ? "loading" : ""}`}
            whileHover={{ scale: loading ? 1 : 1.05 }}
            whileTap={{ scale: loading ? 1 : 0.95 }}
            disabled={loading}
          >
            {loading ? t("setting_password") : t("set_password")}
          </motion.button>
        </form>

        {/* رابط العودة */}
        <div className="back-link">
          <button 
            onClick={() => navigate("/login")}
            className="back-button"
          >
            ↩ {t("back_to_login")}
          </button>
        </div>
      </motion.div>

      {/* الـ CSS */}
      <style jsx>{`
        .reset-password-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          position: relative;
        }

        .reset-password-page.dark {
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

        .reset-container {
          background: white;
          padding: 40px 30px;
          border-radius: 20px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
          max-width: 500px;
          width: 100%;
        }

        .reset-password-page.dark .reset-container {
          background: #2d3748;
          color: white;
        }

        .reset-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .reset-icon {
          font-size: 3rem;
          margin-bottom: 15px;
        }

        .reset-header h2 {
          color: #2d3748;
          margin-bottom: 10px;
          font-size: 1.8rem;
        }

        .reset-password-page.dark .reset-header h2 {
          color: white;
        }

        .reset-header p {
          color: #718096;
          font-size: 1rem;
          line-height: 1.5;
          margin: 5px 0;
        }

        .reset-password-page.dark .reset-header p {
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

        .reset-password-page.dark .email-display {
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

        .reset-password-page.dark .error-message {
          background: #742a2a;
          color: #fc8181;
          border-color: #c53030;
        }

        .success-message {
          background: #c6f6d5;
          color: #276749;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid #9ae6b4;
        }

        .reset-password-page.dark .success-message {
          background: #22543d;
          color: #68d391;
          border-color: #38a169;
        }

        .reset-form {
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #2d3748;
        }

        .reset-password-page.dark .form-group label {
          color: white;
        }

        .password-input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .password-input {
          width: 100%;
          padding: 12px 45px 12px 12px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.3s ease;
          outline: none;
          background: white;
          color: #2d3748;
        }

        .reset-password-page.dark .password-input {
          background: #4a5568;
          border-color: #718096;
          color: white;
        }

        .password-input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .reset-password-page.dark .password-input:focus {
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
        }

        .password-input:disabled {
          background: #f7fafc;
          cursor: not-allowed;
        }

        .reset-password-page.dark .password-input:disabled {
          background: #2d3748;
        }

        .password-toggle {
          position: absolute;
          right: 10px;
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 5px;
        }

        .password-strength {
          margin-top: 8px;
          font-size: 0.9rem;
        }

        .strength-${t("weak")} { color: #e53e3e; }
        .strength-${t("medium")} { color: #d69e2e; }
        .strength-${t("strong")} { color: #38a169; }

        .strength-bar {
          width: 100%;
          height: 4px;
          background: #e2e8f0;
          border-radius: 2px;
          margin-top: 4px;
          overflow: hidden;
        }

        .reset-password-page.dark .strength-bar {
          background: #4a5568;
        }

        .strength-fill {
          height: 100%;
          transition: all 0.3s ease;
        }

        .strength-fill.${t("weak")} {
          width: 33%;
          background: #e53e3e;
        }

        .strength-fill.${t("medium")} {
          width: 66%;
          background: #d69e2e;
        }

        .strength-fill.${t("strong")} {
          width: 100%;
          background: #38a169;
        }

        .password-match {
          margin-top: 8px;
          font-size: 0.9rem;
        }

        .match-success { color: #38a169; }
        .match-error { color: #e53e3e; }

        .password-tips {
          background: #f7fafc;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid #e2e8f0;
        }

        .reset-password-page.dark .password-tips {
          background: #4a5568;
          border-color: #718096;
        }

        .password-tips h4 {
          margin: 0 0 10px 0;
          color: #2d3748;
          font-size: 0.9rem;
        }

        .reset-password-page.dark .password-tips h4 {
          color: white;
        }

        .password-tips ul {
          margin: 0;
          padding-left: 20px;
          color: #718096;
          font-size: 0.8rem;
        }

        .reset-password-page.dark .password-tips ul {
          color: #cbd5e0;
        }

        .password-tips li {
          margin-bottom: 5px;
        }

        .password-tips li.valid {
          color: #38a169;
          text-decoration: line-through;
        }

        .reset-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          transition: all 0.3s ease;
        }

        .reset-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .reset-button.loading {
          background: #a0aec0;
          cursor: not-allowed;
        }

        .reset-button:disabled {
          cursor: not-allowed;
          opacity: 0.7;
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

        .reset-password-page.dark .back-button {
          color: #90cdf4;
        }

        .back-button:hover {
          color: #5a67d8;
        }

        @media (max-width: 480px) {
          .reset-container {
            padding: 30px 20px;
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

export default ResetPassword;
