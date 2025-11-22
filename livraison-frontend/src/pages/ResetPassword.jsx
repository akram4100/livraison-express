import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../style/reset.css";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

      if (strength <= 2) return "weak";
      if (strength <= 4) return "medium";
      return "strong";
    };

    setPasswordStrength(checkPasswordStrength(formData.password));
  }, [formData.password]);

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
      setError(t("fill_all_fields") || "Please fill in all fields");
      return;
    }

    if (formData.password.length < 6) {
      setError(t("password_min_length") || "Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t("passwords_not_match") || "Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("https://livraison-api-x45n.onrender.com/api/reset-password", {
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
        setSuccess(t("password_reset_success") || "Password reset successfully!");
        
        // الانتقال لتسجيل الدخول بعد 2 ثانية
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(data.message || t("password_reset_failed") || "Password reset failed");
      }
    } catch (error) {
      console.error("❌ خطأ في إعادة تعيين كلمة المرور:", error);
      setError(t("connection_error") || "Connection error");
    } finally {
      setLoading(false);
    }
  };

  // 🎯 الحصول على تلميحات كلمة المرور
  const getPasswordTips = () => {
    const tips = [
      { key: "min_6_chars", condition: formData.password.length >= 6 },
      { key: "lowercase_letter", condition: /[a-z]/.test(formData.password) },
      { key: "uppercase_letter", condition: /[A-Z]/.test(formData.password) },
      { key: "number_required", condition: /[0-9]/.test(formData.password) },
      { key: "special_char", condition: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) }
    ];

    return tips;
  };

  return (
    <div className={`reset-password-page ${darkMode ? "dark" : ""}`}>
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
            <div className="icon-wrapper">
              <span className="key-icon">🔑</span>
              <div className="icon-glow"></div>
            </div>
          </motion.div>
          <h2>{t("set_new_password") || "Set New Password"}</h2>
          <p>{t("choose_strong_password") || "Choose a strong and secure password for your account"}</p>
          <div className="email-display">
            <span className="email-icon">📧</span>
            {email}
          </div>
        </div>

        {/* مؤشر التقدم */}
        <div className="progress-indicator">
          <div className="progress-steps">
            <div className="step completed">
              <div className="step-number">1</div>
              <span className="step-text">{t("request_code") || "Request Code"}</span>
            </div>
            <div className="step-line"></div>
            <div className="step completed">
              <div className="step-number">2</div>
              <span className="step-text">{t("verify_code") || "Verify Code"}</span>
            </div>
            <div className="step-line"></div>
            <div className="step active">
              <div className="step-number">3</div>
              <span className="step-text">{t("reset_password") || "Reset Password"}</span>
            </div>
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

        {/* رسالة النجاح */}
        {success && (
          <motion.div 
            className="success-message"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <span className="success-icon">✅</span>
            {success}
          </motion.div>
        )}

        {/* نموذج إعادة التعيين */}
        <form onSubmit={handleResetPassword} className="reset-form">
          {/* حقل كلمة المرور */}
          <motion.div
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label htmlFor="password" className="form-label">
              <span className="label-icon">🔒</span>
              {t("new_password") || "New Password"}
            </label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="password-input"
                placeholder={t("enter_new_password") || "Enter your new password"}
                disabled={loading}
                minLength="6"
              />
              <motion.button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {showPassword ? "🙈" : "👁️"}
              </motion.button>
            </div>
            
            {/* مؤشر قوة كلمة المرور */}
            {formData.password && (
              <motion.div 
                className="password-strength"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <div className="strength-header">
                  <span className="strength-label">{t("password_strength") || "Password Strength"}:</span>
                  <span className={`strength-value ${passwordStrength}`}>
                    {passwordStrength === "weak" && t("weak") || "Weak"}
                    {passwordStrength === "medium" && t("medium") || "Medium"}
                    {passwordStrength === "strong" && t("strong") || "Strong"}
                  </span>
                </div>
                <div className="strength-bar">
                  <div className={`strength-fill ${passwordStrength}`}></div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* حقل تأكيد كلمة المرور */}
          <motion.div
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label htmlFor="confirmPassword" className="form-label">
              <span className="label-icon">✅</span>
              {t("confirm_password") || "Confirm Password"}
            </label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="password-input"
                placeholder={t("re_enter_password") || "Re-enter your password"}
                disabled={loading}
              />
              <motion.button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </motion.button>
            </div>
            
            {/* مؤشر التطابق */}
            {formData.confirmPassword && (
              <motion.div 
                className="password-match"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {formData.password === formData.confirmPassword ? (
                  <span className="match-success">
                    <span className="match-icon">✅</span>
                    {t("passwords_match") || "Passwords match"}
                  </span>
                ) : (
                  <span className="match-error">
                    <span className="match-icon">❌</span>
                    {t("passwords_not_match") || "Passwords do not match"}
                  </span>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* تلميحات كلمة المرور */}
          <motion.div
            className="password-tips"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h4 className="tips-title">
              <span className="tips-icon">💡</span>
              {t("password_tips") || "Password Requirements"}:
            </h4>
            <div className="tips-list">
              {getPasswordTips().map((tip, index) => (
                <motion.div
                  key={tip.key}
                  className={`tip-item ${tip.condition ? "valid" : ""}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <span className="tip-icon">
                    {tip.condition ? "✅" : "⚪"}
                  </span>
                  <span className="tip-text">
                    {t(tip.key) || tip.key}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* زر الإرسال */}
          <motion.button
            type="submit"
            className={`reset-button ${loading ? "loading" : ""}`}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            disabled={loading}
          >
            {loading ? (
              <div className="button-loading">
                <div className="loading-spinner"></div>
                {t("setting_password") || "Setting Password..."}
              </div>
            ) : (
              <div className="button-content">
                <span className="button-icon">🔐</span>
                {t("set_password") || "Set Password"}
              </div>
            )}
          </motion.button>
        </form>

        {/* رابط العودة */}
        <motion.div 
          className="back-link"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <motion.button 
            onClick={() => navigate("/login")}
            className="back-button"
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="back-icon">↩</span>
            {t("back_to_login") || "Back to Login"}
          </motion.button>
        </motion.div>
      </motion.div>

      {/* العناصر الزخرفية */}
      <div className="decorative-elements">
        <motion.div 
          className="floating-element el-1"
          animate={{ 
            y: [0, -25, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          🔒
        </motion.div>
        <motion.div 
          className="floating-element el-2"
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, -8, 0]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        >
          🔑
        </motion.div>
        <motion.div 
          className="floating-element el-3"
          animate={{ 
            y: [0, -30, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 6,
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

export default ResetPassword;
