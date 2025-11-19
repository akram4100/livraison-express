import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "../style/dashboardAdmin.css";

const DashboardAdmin = ({ globalDarkMode, updateGlobalDarkMode }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 🔹 بيانات نموذجية للإحصائيات
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    pendingDeliveries: 0,
    revenue: 0
  });

  // 🔹 قائمة المستخدمين
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);

  // 🔹 مزامنة الإعدادات
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'fr';
    
    setDarkMode(savedDarkMode);
    i18n.changeLanguage(savedLanguage);
    
    if (updateGlobalDarkMode) {
      updateGlobalDarkMode(savedDarkMode);
    }

    // محاكاة تحميل البيانات
    loadSampleData();
  }, [i18n, updateGlobalDarkMode]);

  // 🌍 تغيير اللغة
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
  };

  // 🎨 تبديل الوضع الليلي
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (updateGlobalDarkMode) {
      updateGlobalDarkMode(newDarkMode);
    }
  };

  // 🚪 تسجيل الخروج
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  // 📊 محاكاة تحميل البيانات
  const loadSampleData = () => {
    setStats({
      totalUsers: 1247,
      totalOrders: 2894,
      pendingDeliveries: 23,
      revenue: 45230
    });

    setUsers([
      { id: 1, name: "Ahmed Ben Ali", email: "ahmed@example.com", role: "client", status: "active", joinDate: "2024-01-15" },
      { id: 2, name: "Marie Dupont", email: "marie@example.com", role: "livreur", status: "active", joinDate: "2024-01-10" },
      { id: 3, name: "John Smith", email: "john@example.com", role: "client", status: "inactive", joinDate: "2024-01-05" },
      { id: 4, name: "Fatima Zahra", email: "fatima@example.com", role: "partenaire", status: "active", joinDate: "2024-01-02" }
    ]);

    setOrders([
      { id: 1001, client: "Ahmed Ben Ali", livreur: "Marie Dupont", status: "livrée", amount: 150, date: "2024-01-20" },
      { id: 1002, client: "John Smith", livreur: "En attente", status: "en cours", amount: 75, date: "2024-01-20" },
      { id: 1003, client: "Fatima Zahra", livreur: "Pierre Martin", status: "en attente", amount: 200, date: "2024-01-19" },
      { id: 1004, client: "Sarah Johnson", livreur: "Marie Dupont", status: "annulée", amount: 120, date: "2024-01-19" }
    ]);
  };

  // 🗑️ حذف مستخدم
  const deleteUser = (userId) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  // ✏️ تعديل حالة الطلب
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  return (
    <div className={`admin-dashboard ${darkMode ? "dark" : ""}`}>
    {/* 🌐 شريط التحكم العلوي */}
    <header className="admin-header">
      <div className="header-left">
        <button 
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          ☰
        </button>
        <h1>🚚 Livraison Express - Admin</h1>
      </div>
      
      <div className="header-right">
        <div className="language-switch">
          <button onClick={() => changeLanguage("fr")}>🇫🇷</button>
          <button onClick={() => changeLanguage("en")}>🇬🇧</button>
          <button onClick={() => changeLanguage("ar")}>🇸🇦</button>
          <button onClick={toggleDarkMode}>
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
    </header>

    <div className="admin-content">
        {/* 📱 الشريط الجانبي */}
        <aside className={`admin-sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              📊 {t("dashboard")}
            </button>
            <button 
              className={`nav-item ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              👥 {t("users_management")}
            </button>
            <button 
              className={`nav-item ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              📦 {t("orders_management")}
            </button>
            <button 
              className={`nav-item ${activeTab === "deliveries" ? "active" : ""}`}
              onClick={() => setActiveTab("deliveries")}
            >
              🚚 {t("deliveries_management")}
            </button>
            <button 
              className={`nav-item ${activeTab === "analytics" ? "active" : ""}`}
              onClick={() => setActiveTab("analytics")}
            >
              📈 {t("analytics")}
            </button>
            <button 
              className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              ⚙️ {t("settings")}
            </button>
                      {/* 🔘 زر تسجيل الخروج في أسفل الشريط الجانبي */}
          <div className="sidebar-footer">
            <button 
              className="logout-btn-sidebar"
              onClick={handleLogout}
            >
              🚪 {t("logout")}
            </button>
          </div>
          </nav>
        </aside>

        {/* 🎯 المحتوى الرئيسي */}
        <main className="admin-main">
          {activeTab === "dashboard" && (
            <div className="dashboard-tab">
              <h2>{t("dashboard_overview")}</h2>
              
              {/* 📊 بطاقات الإحصائيات */}
              <div className="stats-grid">
                <motion.div 
                  className="stat-card"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="stat-icon">👥</div>
                  <div className="stat-info">
                    <h3>{stats.totalUsers}</h3>
                    <p>{t("total_users")}</p>
                  </div>
                </motion.div>

                <motion.div 
                  className="stat-card"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="stat-icon">📦</div>
                  <div className="stat-info">
                    <h3>{stats.totalOrders}</h3>
                    <p>{t("total_orders")}</p>
                  </div>
                </motion.div>

                <motion.div 
                  className="stat-card"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="stat-icon">⏳</div>
                  <div className="stat-info">
                    <h3>{stats.pendingDeliveries}</h3>
                    <p>{t("pending_deliveries")}</p>
                  </div>
                </motion.div>

                <motion.div 
                  className="stat-card"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="stat-icon">💰</div>
                  <div className="stat-info">
                    <h3>${stats.revenue}</h3>
                    <p>{t("total_revenue")}</p>
                  </div>
                </motion.div>
              </div>

              {/* 📈 مخططات سريعة */}
              <div className="charts-section">
                <div className="chart-card">
                  <h3>{t("recent_activity")}</h3>
                  <div className="placeholder-chart">
                    📊 {t("chart_placeholder")}
                  </div>
                </div>
                
                <div className="chart-card">
                  <h3>{t("user_growth")}</h3>
                  <div className="placeholder-chart">
                    📈 {t("chart_placeholder")}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="users-tab">
              <h2>{t("users_management")}</h2>
              <div className="table-container">
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
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge role-${user.role}`}>
                            {t(user.role)}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge status-${user.status}`}>
                            {t(user.status)}
                          </span>
                        </td>
                        <td>
                          <button className="btn-edit">✏️</button>
                          <button 
                            className="btn-delete"
                            onClick={() => deleteUser(user.id)}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="orders-tab">
              <h2>{t("orders_management")}</h2>
              <div className="table-container">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>{t("client")}</th>
                      <th>{t("delivery_person")}</th>
                      <th>{t("status")}</th>
                      <th>{t("amount")}</th>
                      <th>{t("date")}</th>
                      <th>{t("actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.client}</td>
                        <td>{order.livreur}</td>
                        <td>
                          <select 
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className={`status-select status-${order.status}`}
                          >
                            <option value="en attente">{t("pending")}</option>
                            <option value="en cours">{t("in_progress")}</option>
                            <option value="livrée">{t("delivered")}</option>
                            <option value="annulée">{t("cancelled")}</option>
                          </select>
                        </td>
                        <td>${order.amount}</td>
                        <td>{order.date}</td>
                        <td>
                          <button className="btn-view">👁️</button>
                          <button className="btn-edit">✏️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* يمكنك إضافة تبويبات أخرى هنا */}
          {activeTab !== "dashboard" && activeTab !== "users" && activeTab !== "orders" && (
            <div className="coming-soon">
              <h2>🚧 {t("coming_soon")}</h2>
              <p>{t("feature_development")}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardAdmin;