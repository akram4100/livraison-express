// DashboardAdmin.jsx - النسخة المصححة
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "../style/dashboardAdmin.css";

const DashboardAdmin = ({ globalDarkMode, updateGlobalDarkMode }) => {
  const { t, i18n } = useTranslation();
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    activeDeliveries: 0,
    revenue: 0
  });

  // محاكاة الإحصائيات الحية
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 2),
        totalOrders: prev.totalOrders + Math.floor(Math.random() * 3),
        activeDeliveries: prev.activeDeliveries + Math.floor(Math.random() * 2),
        revenue: prev.revenue + Math.floor(Math.random() * 50)
      }));
    }, 3000);

    // قيم ابتدائية
    setStats({
      totalUsers: 12543,
      totalOrders: 28476,
      activeDeliveries: 342,
      revenue: 125430
    });

    return () => clearInterval(interval);
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderMainContent = () => {
    switch(activeSection) {
      case "overview":
        return (
          <div className="admin-main-content">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {t("dashboard_overview")}
            </motion.h2>
            
            {/* شبكة الإحصائيات */}
            <div className="stats-grid">
              <motion.div 
                className="stat-card"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>{stats.totalUsers.toLocaleString()}</h3>
                  <p>{t("total_users")}</p>
                </div>
                <div className="stat-badge live">📈 {t("live")}</div>
              </motion.div>

              <motion.div 
                className="stat-card"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="stat-icon">📦</div>
                <div className="stat-info">
                  <h3>{stats.totalOrders.toLocaleString()}</h3>
                  <p>{t("total_orders")}</p>
                </div>
                <div className="stat-badge growing">🌱 {t("growing")}</div>
              </motion.div>

              <motion.div 
                className="stat-card"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="stat-icon">🚚</div>
                <div className="stat-info">
                  <h3>{stats.activeDeliveries.toLocaleString()}</h3>
                  <p>{t("active_deliveries")}</p>
                </div>
                <div className="stat-badge active">⚡ {t("active")}</div>
              </motion.div>

              <motion.div 
                className="stat-card"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <h3>${stats.revenue.toLocaleString()}</h3>
                  <p>{t("total_revenue")}</p>
                </div>
                <div className="stat-badge revenue">💵 {t("revenue")}</div>
              </motion.div>
            </div>

            {/* قسم المخططات */}
            <div className="charts-section">
              <motion.div 
                className="chart-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3>{t("orders_overview")}</h3>
                <div className="placeholder-chart">
                  <span>📊 {t("chart_placeholder")}</span>
                </div>
              </motion.div>

              <motion.div 
                className="chart-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h3>{t("user_activity")}</h3>
                <div className="placeholder-chart">
                  <span>📈 {t("chart_placeholder")}</span>
                </div>
              </motion.div>
            </div>

            {/* الجداول الحديثة */}
            <div className="tables-section">
              <motion.div 
                className="table-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h3>{t("recent_orders")}</h3>
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>{t("order_id")}</th>
                      <th>{t("customer")}</th>
                      <th>{t("date")}</th>
                      <th>{t("status")}</th>
                      <th>{t("actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>#ORD-7842</td>
                      <td>John Doe</td>
                      <td>2023-10-15</td>
                      <td><span className="status-badge status-en-cours">{t("in_progress")}</span></td>
                      <td>
                        <button className="btn-view" title={t("view")}>👁️</button>
                        <button className="btn-edit" title={t("edit")}>✏️</button>
                      </td>
                    </tr>
                    <tr>
                      <td>#ORD-7841</td>
                      <td>Jane Smith</td>
                      <td>2023-10-14</td>
                      <td><span className="status-badge status-livree">{t("delivered")}</span></td>
                      <td>
                        <button className="btn-view" title={t("view")}>👁️</button>
                        <button className="btn-edit" title={t("edit")}>✏️</button>
                      </td>
                    </tr>
                    <tr>
                      <td>#ORD-7840</td>
                      <td>Robert Johnson</td>
                      <td>2023-10-13</td>
                      <td><span className="status-badge status-en-attente">{t("pending")}</span></td>
                      <td>
                        <button className="btn-view" title={t("view")}>👁️</button>
                        <button className="btn-edit" title={t("edit")}>✏️</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </motion.div>

              <motion.div 
                className="table-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <h3>{t("recent_users")}</h3>
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>{t("name")}</th>
                      <th>{t("email")}</th>
                      <th>{t("role")}</th>
                      <th>{t("status")}</th>
                      <th>{t("actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Alice Brown</td>
                      <td>alice@example.com</td>
                      <td><span className="role-badge role-client">{t("client")}</span></td>
                      <td><span className="status-badge status-active">{t("active")}</span></td>
                      <td>
                        <button className="btn-view" title={t("view")}>👁️</button>
                        <button className="btn-edit" title={t("edit")}>✏️</button>
                      </td>
                    </tr>
                    <tr>
                      <td>Michael Wilson</td>
                      <td>michael@example.com</td>
                      <td><span className="role-badge role-livreur">{t("delivery_person")}</span></td>
                      <td><span className="status-badge status-active">{t("active")}</span></td>
                      <td>
                        <button className="btn-view" title={t("view")}>👁️</button>
                        <button className="btn-edit" title={t("edit")}>✏️</button>
                      </td>
                    </tr>
                    <tr>
                      <td>Sarah Davis</td>
                      <td>sarah@example.com</td>
                      <td><span className="role-badge role-partenaire">{t("partner")}</span></td>
                      <td><span className="status-badge status-inactive">{t("inactive")}</span></td>
                      <td>
                        <button className="btn-view" title={t("view")}>👁️</button>
                        <button className="btn-edit" title={t("edit")}>✏️</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </motion.div>
            </div>
          </div>
        );
      case "reports":
        return (
          <div className="admin-main-content">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {t("reports_analytics")}
            </motion.h2>
            <div className="coming-soon">
              <h3>📊 {t("reports_section")}</h3>
              <p>{t("coming_soon")}</p>
            </div>
          </div>
        );
      case "users":
        return (
          <div className="admin-main-content">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {t("user_management")}
            </motion.h2>
            <div className="coming-soon">
              <h3>👥 {t("users_section")}</h3>
              <p>{t("coming_soon")}</p>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="admin-main-content">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {t("system_settings")}
            </motion.h2>
            <div className="coming-soon">
              <h3>⚙️ {t("settings_section")}</h3>
              <p>{t("coming_soon")}</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="admin-main-content">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {t("dashboard_overview")}
            </motion.h2>
          </div>
        );
    }
  };

  return (
    <div className={`admin-dashboard ${darkMode ? "dark" : ""} ${i18n.language === "ar" ? "rtl" : "ltr"}`}>
      {/* 🌐 شريط اللغة والوضع الليلي في الأعلى */}
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

      {/* 🌐 شريط الرأس */}
      <header className="admin-header">
        <div className="header-left">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? "◀️" : "▶️"}
          </button>
          <h1>🚚 Livraison Express - {t("admin_panel")}</h1>
        </div>
        
        <div className="header-right">
          <div className="user-welcome">
            <span>{t("welcome")}, {userData?.nom || "Admin"}!</span>
          </div>
        </div>
      </header>

      {/* هيكل المحتوى */}
      <div className="admin-content">
        {/* 📱 الشريط الجانبي */}
        <motion.aside 
          className={`admin-sidebar ${sidebarOpen ? "open" : "closed"}`}
          initial={{ x: -280 }}
          animate={{ x: sidebarOpen ? 0 : -280 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="sidebar-user">
            <div className="user-avatar">
              {userData?.nom ? userData.nom.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="user-info">
              <h3>{userData?.nom || "Administrator"}</h3>
              <p>Admin</p>
            </div>
          </div>
          
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeSection === "overview" ? "active" : ""}`}
              onClick={() => setActiveSection("overview")}
            >
              📊 {t("dashboard")}
            </button>
            <button 
              className={`nav-item ${activeSection === "reports" ? "active" : ""}`}
              onClick={() => setActiveSection("reports")}
            >
              📈 {t("reports")}
            </button>
            <button 
              className={`nav-item ${activeSection === "users" ? "active" : ""}`}
              onClick={() => setActiveSection("users")}
            >
              👥 {t("users")}
            </button>
            <button 
              className={`nav-item ${activeSection === "settings" ? "active" : ""}`}
              onClick={() => setActiveSection("settings")}
            >
              ⚙️ {t("settings")}
            </button>
          </nav>
          
          <div className="sidebar-footer">
            <button className="logout-btn-sidebar" onClick={handleLogout}>
              🚪 {t("logout")}
            </button>
          </div>
        </motion.aside>

        {/* 🎯 المحتوى الرئيسي */}
        <main className="admin-main">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};

export default DashboardAdmin;