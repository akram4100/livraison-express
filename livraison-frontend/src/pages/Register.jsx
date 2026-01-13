import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [step, setStep] = useState(1); // 1: التسجيل, 2: التحقق
  const [selectedRole, setSelectedRole] = useState("client"); // للأنيميشن

  // 🔹 إعدادات API
  const API_BASE = "https://livraison-api-x45n.onrender.com/api";

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

    // أنيميشن خاصة عند تغيير الدور
    if (name === "role") {
      setSelectedRole(value);
    }
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
        setTimeout(() => {
          setStep(2);
          setIsVerifying(true);
        }, 1500);
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

  // ↩️ العودة للتسجيل
  const handleBackToRegister = () => {
    setStep(1);
    setIsVerifying(false);
    setVerificationCode("");
    setMessage("");
  };

  // 🎯 تأثيرات ديناميكية للأدوار
  const roleAnimations = {
    client: { icon: "📦", color: "#4fc3f7", description: t("Order deliveries and track your packages") },
    livreur: { icon: "🚚", color: "#ffa726", description: t("Make deliveries and earn money") },
    partner: { icon: "🤝", color: "#66bb6a", description: t("Collaborate with our platform")}
  };

  return (
    <div className={`register-container ${darkMode ? "dark" : ""}`}>
      {/* 🌐 خلفية Glass Morphism */}
      <div className="glass-bg">
        <div className="glass-circle circle-1"></div>
        <div className="glass-circle circle-2"></div>
        <div className="glass-circle circle-3"></div>
        <div className="glass-circle circle-4"></div>
      </div>

      {/* 🌐 أزرار اللغة والوضع */}
      <div className={`language-switch ${i18n.language === "ar" ? "rtl" : "ltr"}`}>
        <button onClick={() => changeLanguage("fr")}>🇫🇷</button>
        <button onClick={() => changeLanguage("en")}>🇬🇧</button>
        <button onClick={() => changeLanguage("ar")}>🇸🇦</button>
        <button onClick={toggleDarkMode}>
          {darkMode ? "☀️" : "🌙"}
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
            className="hero-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="logo-badge">
              <div className="logo-icon">🚚</div>
              <span className="logo-text">Livraison Express</span>
            </div>
            
            <div className="step-indicator">
              <div className={`step ${step === 1 ? 'active' : ''}`}>
                <div className="step-number">1</div>
                <span className="step-text">Create Account</span>
              </div>
              <div className="step-line"></div>
              <div className={`step ${step === 2 ? 'active' : ''}`}>
                <div className="step-number">2</div>
                <span className="step-text">Verify Email</span>
              </div>
            </div>
            
            <h1 className="app-title">
              {step === 1 ? t("Join") : t("Verify")}
            </h1>
            
            <p className="app-description">
              {step === 1 
                ? (t("register_subtitle") || "Choose your role and start your journey with us")
                : (t("enter_verification_code") || "Enter the verification code sent to your email")
              }
            </p>
          </motion.div>

{step === 1 && (
  <motion.div 
    className="features-grid"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 }}
  >
    <div className="feature-item">
      <div className="feature-icon-wrapper">
        <span className="feature-icon">⚡</span>
      </div>
      <div className="feature-content">
        <h4>{t("fast_delivery")}</h4>
        <p>{t("express_service_24h")}</p>
      </div>
    </div>

    <div className="feature-item">
      <div className="feature-icon-wrapper">
        <span className="feature-icon">🔒</span>
      </div>
      <div className="feature-content">
        <h4>{t("secure_service")}</h4>
        <p>{t("packages_complete_safety")}</p>
      </div>
    </div>

    <div className="feature-item">
      <div className="feature-icon-wrapper">
        <span className="feature-icon">🌍</span>
      </div>
      <div className="feature-content">
        <h4>{t("wide_coverage")}</h4>
        <p>{t("everywhere_in_region")}</p>
      </div>
    </div>
  </motion.div>
)}

{step === 2 && (
  <motion.div 
    className="verification-info"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 }}
  >
    <div className="verification-graphic">
      <div className="email-icon">📧</div>
      <div className="verification-arrow">➡️</div>
      <div className="code-icon">🔢</div>
    </div>
    
    <div className="verification-steps">
      <div className="verification-step">
        <div className="step-icon">1</div>
        <div className="step-content">
          <h4>{t("check_your_email")}</h4>
          <p>{t("we_sent_6digit_code")}: <strong>{formData.email}</strong></p>
        </div>
      </div>
      
      <div className="verification-step">
        <div className="step-icon">2</div>
        <div className="step-content">
          <h4>{t("enter_the_code")}</h4>
          <p>{t("type_verification_code")}</p>
        </div>
      </div>
      
      <div className="verification-step">
        <div className="step-icon">3</div>
        <div className="step-content">
          <h4>{t("start_using")}</h4>
          <p>{t("access_account_immediately")}</p>
        </div>
      </div>
    </div>
  </motion.div>
)}

          {/* العناصر الزخرفية */}
          <div className="decorative-elements">
            <div className="floating-element el-1">{step === 1 ? "📦" : "🔐"}</div>
            <div className="floating-element el-2">{step === 1 ? "🚀" : "✓"}</div>
            <div className="floating-element el-3">{step === 1 ? "⭐" : "✉️"}</div>
          </div>
        </motion.div>

        {/* 📋 الجانب الأيمن - النموذج */}
        <motion.div 
          className="register-form-section"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="form-container-glass">
            
            <AnimatePresence mode="wait">
              {step === 1 ? (
                /* 📄 نموذج التسجيل */
                <motion.div
                  key="register-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* 🎫 رأس النموذج */}
                  <motion.div 
                    className="form-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="form-badge-glass">
                      🚀 {t("registration") || "Sign Up"}
                    </div>
                    <h2>{t("create_account") || "Create Account"}</h2>
                    <p className="form-subtitle">
                      {t("create_account_seconds") || "Create your account in seconds"}
                    </p>
                  </motion.div>

                  <motion.form 
                    className="register-form"
                    onSubmit={handleRegister}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <motion.div
                      className="form-group-glass"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <label htmlFor="nom">{t("full_name") || "Full Name"} *</label>
                      <input
                        id="nom"
                        type="text"
                        name="nom"
                        placeholder={t("enter_full_name") || "Enter your full name"}
                        value={formData.nom}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </motion.div>

                    <motion.div
                      className="form-group-glass"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <label htmlFor="email">{t("email_address") || "Email Address"} *</label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        placeholder={t("email_placeholder") || "Enter your email"}
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </motion.div>

                    <motion.div
                      className="form-group-glass"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <label htmlFor="mot_de_passe">{t("password") || "Password"} *</label>
                      <input
                        id="mot_de_passe"
                        type="password"
                        name="mot_de_passe"
                        placeholder={t("create_secure_password") || "Create a secure password"}
                        value={formData.mot_de_passe}
                        onChange={handleChange}
                        required
                        minLength="6"
                        disabled={loading}
                      />
                      <small className="password-hint">
                        {t("password_minimum") || "Minimum 6 characters"}
                      </small>
                    </motion.div>

                    {/* 🎯 قسم الدور مع أنيميشن */}
                    <motion.div
                      className="form-group-glass"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <label htmlFor="role">{t("role") || "Role"} *</label>
                      
                      <AnimatePresence mode="wait">
                        <motion.select
                          key={selectedRole}
                          id="role"
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          disabled={loading}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.3 }}
                          className="role-select"
                          style={{
                            borderLeft: `4px solid ${roleAnimations[formData.role].color}`
                          }}
                        >
                          <option value="client" style={{ color: '#333', backgroundColor: '#fff' }}>
                            👤 {t("client") || "Client"}
                          </option>
                          <option value="livreur" style={{ color: '#333', backgroundColor: '#fff' }}>
                            🚚 {t("delivery_person") || "Delivery Person"}
                          </option>
                          <option value="partner" style={{ color: '#333', backgroundColor: '#fff' }}>
                            🤝 {t("partner") || "Partner"}
                          </option>
                        </motion.select>
                      </AnimatePresence>

                      {/* 🎨 بطاقة وصف الدور */}
                      <motion.div 
                        className="role-description-card"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        style={{
                          borderLeft: `4px solid ${roleAnimations[formData.role].color}`,
                          background: `linear-gradient(135deg, ${roleAnimations[formData.role].color}20, transparent)`
                        }}
                      >
                        <div className="role-description-header">
                          <span className="role-icon">{roleAnimations[formData.role].icon}</span>
                          <span className="role-title">
                            {formData.role === "client" && (t("client") || "Client")}
                            {formData.role === "livreur" && (t("delivery_person") || "Delivery Person")}
                            {formData.role === "partner" && (t("partner") || "Partner")}
                          </span>
                        </div>
                        <p className="role-description-text">
                          {roleAnimations[formData.role].description}
                        </p>
                      </motion.div>
                    </motion.div>

                    <motion.button
                      type="submit"
                      className={`submit-btn-glass ${loading ? "loading" : ""}`}
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 }}
                    >
                      {loading ? 
                        <span className="btn-loading">
                          <span className="spinner"></span>
                          {t("processing") || "Processing..."}
                        </span>
                        : 
                        <span className="btn-content">
                          <span className="btn-icon">✅</span>
                          {t("sign_up") || "Sign Up"}
                        </span>
                      }
                    </motion.button>
                  </motion.form>
                </motion.div>
              ) : (
                /* 🔐 نموذج التحقق */
                <motion.div
                  key="verification-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* 🎫 رأس النموذج */}
                  <motion.div 
                    className="form-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="form-badge-glass">
                      📧 {t("verification") || "Verification"}
                    </div>
                    <h2>{t("email_verification") || "Email Verification"}</h2>
                    <p className="form-subtitle">
                      {t("enter_verification_code") || "Enter the verification code sent to your email"}
                    </p>
                  </motion.div>

                  <motion.form 
                    className="verification-form"
                    onSubmit={handleVerifyCode}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <motion.div
                      className="form-group-glass"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <label htmlFor="verificationCode">{t("verification_code") || "Verification Code"} *</label>
                      <div className="code-input-container">
                        <input
                          id="verificationCode"
                          type="text"
                          placeholder="000000"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                          maxLength="6"
                          required
                          disabled={loading}
                          pattern="[0-9]{6}"
                          title={t("six_digits_only") || "6 digits only"}
                          className="code-input"
                        />
                        <div className="code-dots">
                          {[...Array(6)].map((_, index) => (
                            <motion.div 
                              key={index} 
                              className={`code-dot ${verificationCode.length > index ? 'filled' : ''}`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {verificationCode[index] || ''}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                      <small className="code-hint">
                        {t("check_your_email") || "Check your email"}: <strong>{formData.email}</strong>
                      </small>
                    </motion.div>

                    <motion.button
                      type="submit"
                      className={`verify-btn-glass ${loading ? "loading" : ""}`}
                      disabled={loading || verificationCode.length !== 6}
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      {loading ? 
                        <span className="btn-loading">
                          <span className="spinner"></span>
                          {t("verifying") || "Verifying..."}
                        </span>
                        : 
                        <span className="btn-content">
                          <span className="btn-icon">🔐</span>
                          {t("verify_email") || "Verify Email"}
                        </span>
                      }
                    </motion.button>

                    <motion.button
                      type="button"
                      className="back-btn-glass"
                      onClick={handleBackToRegister}
                      disabled={loading}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <span className="btn-icon">↩️</span>
                      {t("back_to_register") || "Back to Sign Up"}
                    </motion.button>
                  </motion.form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 💬 رسائل التنبيه */}
            {message && (
              <motion.div 
                className={`message-glass ${message.includes('✅') ? 'success' : 'error'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {message}
              </motion.div>
            )}

            {/* 🔗 رابط تسجيل الدخول */}
            <motion.div 
              className="auth-links"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <p>
                {t("already_have_account") || "Already have an account?"}{" "}
                <a href="/login" className="login-link-glass">
                  {t("sign_in") || "Sign In"}
                </a>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
