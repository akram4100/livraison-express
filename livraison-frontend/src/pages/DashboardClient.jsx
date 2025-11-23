import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "../style/dashboardClient.css";

const DashboardClient = ({ globalDarkMode, updateGlobalDarkMode }) => {
  const { t, i18n } = useTranslation();
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'fr';
    
    setDarkMode(savedDarkMode);
    i18n.changeLanguage(savedLanguage);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserData(user);
  }, [i18n]);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (updateGlobalDarkMode) {
      updateGlobalDarkMode(newDarkMode);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleQR = () => {
    setShowQR(!showQR);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
      setSidebarOpen(false); // إغلاق الشريط الجانبي بعد النقر
    }
  };

  const navItems = [
    { id: 'overview', icon: '📊', label: t("overview") },
    { id: 'orders', icon: '📦', label: t("my_orders") },
    { id: 'profile', icon: '👤', label: t("my_profile") },
    { id: 'settings', icon: '⚙️', label: t("settings") }
  ];

  return (
    <div className={`dashboard-client ${darkMode ? "dark" : ""} ${i18n.language === "ar" ? "rtl" : "ltr"}`}>
      {/* 🌐 شريط اللغة والوضع الليلي */}
      <div className={`language-darkmode-bar ${i18n.language === "ar" ? "rtl" : "ltr"}`}>
        <div className="language-section">
          <span className="section-label">{t("language")}:</span>
          <div className="language-buttons">
            <button 
              className={i18n.language === "fr" ? "active" : ""}
              onClick={() => changeLanguage("fr")}
            >
              🇫🇷 Français
            </button>
            <button 
              className={i18n.language === "en" ? "active" : ""}
              onClick={() => changeLanguage("en")}
            >
              🇬🇧 English
            </button>
            <button 
              className={i18n.language === "ar" ? "active" : ""}
              onClick={() => changeLanguage("ar")}
            >
              🇸🇦 العربية
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
            <span className="toggle-text">
              {darkMode ? t("light_mode") : t("dark_mode")}
            </span>
          </button>
        </div>
      </div>

      {/* 🎯 التنقل العلوي */}
      <motion.nav 
        className="dashboard-nav"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="nav-left">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? "✕" : "☰"}
          </button>
          <div className="nav-brand">
            <motion.div 
              className="logo"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              🚚
            </motion.div>
            <span>Livraison Express</span>
          </div>
        </div>
        
        <div className="nav-center">
          {['overview', 'orders', 'profile'].map((section) => (
            <button
              key={section}
              className={`nav-item ${activeSection === section ? 'active' : ''}`}
              onClick={() => scrollToSection(section)}
            >
              {section === 'overview' && `📊 ${t("overview")}`}
              {section === 'orders' && `📦 ${t("my_orders")}`}
              {section === 'profile' && `👤 ${t("my_profile")}`}
            </button>
          ))}
        </div>

        <div className="nav-user">
          <span className="user-welcome">{t("welcome")}, {userData?.nom || "Client"}!</span>
          <button onClick={handleLogout} className="logout-btn">
            🚪 {t("logout")}
          </button>
        </div>
      </motion.nav>

      {/* 📱 الشريط الجانبي القابل للغلق */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="sidebar-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
            />
            
            {/* Sidebar */}
            <motion.div
              className="sidebar"
              initial={{ x: i18n.language === 'ar' ? 300 : -300 }}
              animate={{ x: 0 }}
              exit={{ x: i18n.language === 'ar' ? 300 : -300 }}
              transition={{ type: "spring", damping: 25 }}
            >
              {/* رأس الشريط الجانبي */}
              <div className="sidebar-header">
                <div className="user-info-sidebar">
                  <div className="user-avatar-sidebar">
                    {userData?.nom?.charAt(0) || 'C'}
                  </div>
                  <div className="user-details-sidebar">
                    <h3>{userData?.nom || "Client"}</h3>
                    <p>{userData?.email || ""}</p>
                    <span className="user-role">{t("client")}</span>
                  </div>
                </div>
                <button className="close-sidebar" onClick={toggleSidebar}>
                  ✕
                </button>
              </div>

              {/* قائمة التنقل في الشريط الجانبي */}
              <div className="sidebar-nav">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    className={`sidebar-nav-item ${activeSection === item.id ? 'active' : ''}`}
                    onClick={() => scrollToSection(item.id)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* قسم الإعدادات */}
              <div className="sidebar-settings">
                <h4>{t("settings")}</h4>
                <button className="settings-item" onClick={toggleDarkMode}>
                  <span className="settings-icon">{darkMode ? "☀️" : "🌙"}</span>
                  <span className="settings-label">
                    {darkMode ? t("light_mode") : t("dark_mode")}
                  </span>
                </button>
                
                {/* زر مسح QR - يظهر على الهواتف فقط */}
                <button className="settings-item qr-button" onClick={toggleQR}>
                  <span className="settings-icon">📱</span>
                  <span className="settings-label">{t("scan_qr")}</span>
                </button>
              </div>

              {/* زر تسجيل الخروج */}
              <div className="sidebar-footer">
                <button className="logout-btn-sidebar" onClick={handleLogout}>
                  <span className="logout-icon">🚪</span>
                  <span className="logout-text">{t("logout")}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 🎯 نافذة QR Code */}
      <AnimatePresence>
        {showQR && (
          <>
            <motion.div
              className="qr-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleQR}
            />
            <motion.div
              className="qr-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="qr-header">
                <h3>📱 {t("scan_qr")}</h3>
                <button className="close-qr" onClick={toggleQR}>✕</button>
              </div>
              <div className="qr-content">
                <div className="qr-code-placeholder">
                  <div className="qr-animation">
                    <motion.div
                      className="qr-scanner"
                      animate={{ y: [0, 100, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <p>{t("qr_instruction")}</p>
                </div>
                <div className="qr-actions">
                  <button className="qr-action-btn primary">{t("download_qr")}</button>
                  <button className="qr-action-btn secondary" onClick={toggleQR}>
                    {t("cancel")}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 🎯 المحتوى الرئيسي */}
      <div className={`dashboard-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        
        {/* 📊 قسم النظرة العامة */}
        <section id="overview" className="overview-section">
          <motion.div
            className="welcome-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="welcome-content">
              <h1>👋 {t("welcome_client")}</h1>
              <p>{t("welcome_subtitle")}</p>
              <div className="user-info">
                <span className="user-name">{userData?.nom || "Client"}</span>
                <span className="user-email">{userData?.email || ""}</span>
              </div>
            </div>
            <div className="welcome-visual">
              <motion.div
                className="floating-package"
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, 5, 0, -5, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                📦
              </motion.div>
            </div>
          </motion.div>

          {/* 📊 إحصائيات سريعة */}
          <div className="stats-grid">
            <motion.div 
              className="stat-card"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="stat-icon orders">📦</div>
              <div className="stat-info">
                <h3>5</h3>
                <p>{t("total_orders")}</p>
              </div>
              <div className="stat-badge active">{t("active")}</div>
            </motion.div>

            <motion.div 
              className="stat-card"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="stat-icon pending">⏳</div>
              <div className="stat-info">
                <h3>2</h3>
                <p>{t("pending_orders")}</p>
              </div>
              <div className="stat-badge live">{t("pending")}</div>
            </motion.div>

            <motion.div 
              className="stat-card"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="stat-icon delivered">✅</div>
              <div className="stat-info">
                <h3>3</h3>
                <p>{t("delivered_orders")}</p>
              </div>
              <div className="stat-badge growing">{t("completed")}</div>
            </motion.div>

            <motion.div 
              className="stat-card"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="stat-icon tracking">🚚</div>
              <div className="stat-info">
                <h3>1</h3>
                <p>{t("in_transit")}</p>
              </div>
              <div className="stat-badge live">{t("on_way")}</div>
            </motion.div>
          </div>

          {/* 🎯 الإجراءات السريعة */}
          <motion.div
            className="quick-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2>🚀 {t("quick_actions")}</h2>
            <div className="actions-grid">
              <motion.button 
                className="action-btn primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="action-icon">➕</span>
                <span className="action-text">{t("new_order")}</span>
              </motion.button>

              <motion.button 
                className="action-btn secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="action-icon">📋</span>
                <span className="action-text">{t("order_history")}</span>
              </motion.button>

              <motion.button 
                className="action-btn secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="action-icon">📍</span>
                <span className="action-text">{t("track_order")}</span>
              </motion.button>

              <motion.button 
                className="action-btn secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="action-icon">👤</span>
                <span className="action-text">{t("my_profile")}</span>
              </motion.button>
            </div>
          </motion.div>
        </section>

        {/* 📦 قسم الطلبيات */}
        <section id="orders" className="orders-section">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2>📦 {t("my_orders")}</h2>
            <p>{t("manage_your_orders")}</p>
          </motion.div>

          <div className="orders-grid">
            <motion.div 
              className="order-card"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="order-header">
                <span className="order-id">#ORD-001</span>
                <span className="order-status pending">{t("pending")}</span>
              </div>
              <div className="order-details">
                <p className="order-title">{t("package")} 📦</p>
                <p className="order-date">{t("created")}: 2024-01-15</p>
                <p className="order-address">{t("delivery_to")}: Casa...</p>
              </div>
              <button className="order-action">{t("track")}</button>
            </motion.div>

            <motion.div 
              className="order-card"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="order-header">
                <span className="order-id">#ORD-002</span>
                <span className="order-status delivered">{t("delivered")}</span>
              </div>
              <div className="order-details">
                <p className="order-title">{t("documents")} 📄</p>
                <p className="order-date">{t("created")}: 2024-01-10</p>
                <p className="order-address">{t("delivered_to")}: Rabat</p>
              </div>
              <button className="order-action">{t("view_details")}</button>
            </motion.div>
          </div>
        </section>

        {/* 👤 قسم الملف الشخصي */}
        <section id="profile" className="profile-section">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2>👤 {t("my_profile")}</h2>
            <p>{t("manage_your_profile")}</p>
          </motion.div>

          <motion.div 
            className="profile-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="profile-header">
              <div className="profile-avatar">
                {userData?.nom?.charAt(0) || 'C'}
              </div>
              <div className="profile-info">
                <h3>{userData?.nom || "Client"}</h3>
                <p>{userData?.email || ""}</p>
                <span className="member-since">{t("member_since")}: 2024</span>
              </div>
            </div>
            
            <div className="profile-details">
              <div className="detail-item">
                <span className="detail-label">📞 {t("phone")}:</span>
                <span className="detail-value">{userData?.telephone || t("not_provided")}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">📍 {t("address")}:</span>
                <span className="detail-value">{userData?.adresse || t("not_provided")}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">🎯 {t("account_type")}:</span>
                <span className="detail-value client-badge">{t("client")}</span>
              </div>
            </div>

            <div className="profile-actions">
              <button className="edit-profile-btn">{t("edit_profile")}</button>
              <button className="change-password-btn">{t("change_password")}</button>
            </div>
          </motion.div>
        </section>

        {/* ⚙️ قسم الإعدادات */}
        <section id="settings" className="settings-section">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2>⚙️ {t("settings")}</h2>
            <p>{t("manage_app_settings")}</p>
          </motion.div>

          <motion.div 
            className="settings-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="settings-item-card">
              <span className="settings-icon">🔔</span>
              <div className="settings-info">
                <h4>{t("notifications")}</h4>
                <p>{t("notifications_desc")}</p>
              </div>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>

            <div className="settings-item-card">
              <span className="settings-icon">🌐</span>
              <div className="settings-info">
                <h4>{t("language")}</h4>
                <p>{t("change_app_language")}</p>
              </div>
              <select className="language-select">
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </motion.div>
        </section>
      </div>

      {/* 🦶 الفوتر */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <p>&copy; 2024 Livraison Express. {t("all_rights_reserved")}</p>
          <div className="footer-links">
            <button onClick={() => scrollToSection('overview')}>{t("overview")}</button>
            <button onClick={() => scrollToSection('orders')}>{t("orders")}</button>
            <button onClick={() => scrollToSection('profile')}>{t("profile")}</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardClient;