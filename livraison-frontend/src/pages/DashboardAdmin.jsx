import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "../style/dashboard.css";

const DashboardAdmin = ({ globalDarkMode, updateGlobalDarkMode }) => {
  const { t, i18n } = useTranslation();
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

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

  return (
    <div className={`dashboard-container ${darkMode ? "dark" : ""}`}>
      <div className="control-buttons">
        <button onClick={() => changeLanguage("fr")}>🇫🇷 FR</button>
        <button onClick={() => changeLanguage("en")}>🇬🇧 EN</button>
        <button onClick={() => changeLanguage("ar")}>🇸🇦 AR</button>
        <button onClick={toggleDarkMode}>
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
        <button onClick={handleLogout} className="logout-btn">
          🚪 Logout
        </button>
      </div>

      <div className="dashboard-content">
        <motion.div
          className="welcome-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>👋 {t("welcome_admin")}</h1>
          <p>{userData?.nom || "Administrator"}</p>
        </motion.div>

        <div className="dashboard-stats">
          <motion.div 
            className="stat-card"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3>👥 {t("total_users")}</h3>
            <p className="stat-number">0</p>
          </motion.div>

          <motion.div 
            className="stat-card"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3>📦 {t("total_orders")}</h3>
            <p className="stat-number">0</p>
          </motion.div>

          <motion.div 
            className="stat-card"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3>🚚 {t("active_deliveries")}</h3>
            <p className="stat-number">0</p>
          </motion.div>
        </div>

        <motion.div
          className="dashboard-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <button className="action-btn">📊 {t("view_reports")}</button>
          <button className="action-btn">👥 {t("manage_users")}</button>
          <button className="action-btn">⚙️ {t("system_settings")}</button>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardAdmin;

