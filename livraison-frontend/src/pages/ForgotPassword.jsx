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
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../App";
import "../style/dashboardClient.css";

const DashboardClient = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();
  
  const [activeTab, setActiveTab] = useState("orders");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [newOrder, setNewOrder] = useState({
    description: "",
    address: "",
    priority: "normal"
  });

  // 🔹 بيانات المستخدم
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);
    loadSampleData();
  }, []);

  // 🌍 تغيير اللغة
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
  };

  // 🚪 تسجيل الخروج
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  // 📊 محاكاة تحميل البيانات
  const loadSampleData = () => {
    setOrders([
      {
        id: 1001,
        description: "Colis alimentaire",
        status: "livrée",
        date: "2024-01-20",
        livreur: "Marie Dupont",
        amount: 150
      },
      {
        id: 1002,
        description: "Documents importants",
        status: "en cours",
        date: "2024-01-21",
        livreur: "Pierre Martin",
        amount: 75
      },
      {
        id: 1003,
        description: "Équipement électronique",
        status: "en attente",
        date: "2024-01-22",
        livreur: "En attente",
        amount: 200
      },
      {
        id: 1004,
        description: "Cadeau anniversaire",
        status: "annulée",
        date: "2024-01-19",
        livreur: "-",
        amount: 120
      }
    ]);
  };

  // 📦 إنشاء طلب جديد
  const handleCreateOrder = (e) => {
    e.preventDefault();
    if (!newOrder.description || !newOrder.address) {
      alert(t("fill_all_fields"));
      return;
    }

    const order = {
      id: Date.now(),
      description: newOrder.description,
      status: "en attente",
      date: new Date().toISOString().split('T')[0],
      livreur: "En attente",
      amount: newOrder.priority === "urgent" ? 200 : 100,
      address: newOrder.address,
      priority: newOrder.priority
    };

    setOrders([order, ...orders]);
    setNewOrder({ description: "", address: "", priority: "normal" });
    
    alert("✅ " + t("order_created_success"));
  };

  // 🗑️ إلغاء طلب
  const cancelOrder = (orderId) => {
    if (window.confirm(t("confirm_cancel_order"))) {
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: "annulée" } 
          : order
      ));
    }
  };

  // 📞 محاكاة الاتصال بالمسؤول
  const contactSupport = () => {
    alert("📞 " + t("contacting_support"));
  };

  return (
    <div className={`client-dashboard ${darkMode ? "dark" : ""}`}>
      {/* 🌐 شريط التحكم العلوي */}
      <header className="client-header">
        <div className="header-left">
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <h1>🚚 Livraison Express - Client</h1>
        </div>
        
        <div className="header-right">
          <div className="user-info">
            <span>👤 {user?.nom || "Client"}</span>
          </div>
          <div className="language-switch">
            <button onClick={() => changeLanguage("fr")}>🇫🇷</button>
            <button onClick={() => changeLanguage("en")}>🇬🇧</button>
            <button onClick={() => changeLanguage("ar")}>🇸🇦</button>
            <button onClick={toggleDarkMode}>
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
          <button className="support-btn" onClick={contactSupport}>
            📞 {t("support")}
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 {t("logout")}
          </button>
        </div>
      </header>

      <div className="client-content">
        {/* 📱 الشريط الجانبي */}
        <aside className={`client-sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              📦 {t("my_orders")}
            </button>
            <button 
              className={`nav-item ${activeTab === "new" ? "active" : ""}`}
              onClick={() => setActiveTab("new")}
            >
              ➕ {t("new_order")}
            </button>
            <button 
              className={`nav-item ${activeTab === "tracking" ? "active" : ""}`}
              onClick={() => setActiveTab("tracking")}
            >
              🗺️ {t("track_delivery")}
            </button>
            <button 
              className={`nav-item ${activeTab === "history" ? "active" : ""}`}
              onClick={() => setActiveTab("history")}
            >
              📊 {t("order_history")}
            </button>
            <button 
              className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              👤 {t("my_profile")}
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
        <main className="client-main">
          {activeTab === "orders" && (
            <div className="orders-tab">
              <h2>📦 {t("my_orders")}</h2>
              
              <div className="orders-grid">
                {orders.map(order => (
                  <motion.div 
                    key={order.id}
                    className="order-card"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="order-header">
                      <h3>#{order.id} - {order.description}</h3>
                      <span className={`status-badge status-${order.status}`}>
                        {t(order.status)}
                      </span>
                    </div>
                    
                    <div className="order-details">
                      <p><strong>📅 {t("date")}:</strong> {order.date}</p>
                      <p><strong>🚚 {t("delivery_person")}:</strong> {order.livreur}</p>
                      <p><strong>💰 {t("amount")}:</strong> ${order.amount}</p>
                      {order.address && (
                        <p><strong>📍 {t("address")}:</strong> {order.address}</p>
                      )}
                    </div>

                    <div className="order-actions">
                      {order.status === "en attente" && (
                        <button 
                          className="btn-cancel"
                          onClick={() => cancelOrder(order.id)}
                        >
                          ❌ {t("cancel")}
                        </button>
                      )}
                      <button className="btn-track">
                        🗺️ {t("track")}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "new" && (
            <div className="new-order-tab">
              <h2>➕ {t("create_new_order")}</h2>
              
              <form onSubmit={handleCreateOrder} className="order-form">
                <div className="form-group">
                  <label htmlFor="description">{t("package_description")} *</label>
                  <textarea
                    id="description"
                    placeholder={t("describe_package")}
                    value={newOrder.description}
                    onChange={(e) => setNewOrder({...newOrder, description: e.target.value})}
                    required
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">{t("delivery_address")} *</label>
                  <textarea
                    id="address"
                    placeholder={t("enter_delivery_address")}
                    value={newOrder.address}
                    onChange={(e) => setNewOrder({...newOrder, address: e.target.value})}
                    required
                    rows="2"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="priority">{t("delivery_priority")}</label>
                  <select
                    id="priority"
                    value={newOrder.priority}
                    onChange={(e) => setNewOrder({...newOrder, priority: e.target.value})}
                  >
                    <option value="normal">🚗 {t("normal_delivery")} ($100)</option>
                    <option value="express">⚡ {t("express_delivery")} ($150)</option>
                    <option value="urgent">🚨 {t("urgent_delivery")} ($200)</option>
                  </select>
                </div>

                <motion.button
                  type="submit"
                  className="create-order-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ✅ {t("create_order")}
                </motion.button>
              </form>

              <div className="pricing-info">
                <h3>💰 {t("pricing")}</h3>
                <ul>
                  <li>🚗 {t("normal_delivery")}: <strong>$100</strong></li>
                  <li>⚡ {t("express_delivery")}: <strong>$150</strong></li>
                  <li>🚨 {t("urgent_delivery")}: <strong>$200</strong></li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "tracking" && (
            <div className="tracking-tab">
              <h2>🗺️ {t("track_your_delivery")}</h2>
              <div className="tracking-placeholder">
                <div className="map-icon">🗺️</div>
                <h3>{t("real_time_tracking")}</h3>
                <p>{t("tracking_description")}</p>
                <button className="btn-primary">
                  📱 {t("enable_gps_tracking")}
                </button>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="history-tab">
              <h2>📊 {t("order_history")}</h2>
              <div className="stats-cards">
                <div className="stat-card">
                  <div className="stat-icon">📦</div>
                  <div className="stat-info">
                    <h3>{orders.length}</h3>
                    <p>{t("total_orders")}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-info">
                    <h3>{orders.filter(o => o.status === "livrée").length}</h3>
                    <p>{t("delivered")}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⏳</div>
                  <div className="stat-info">
                    <h3>{orders.filter(o => o.status === "en cours").length}</h3>
                    <p>{t("in_progress")}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="profile-tab">
              <h2>👤 {t("my_profile")}</h2>
              <div className="profile-card">
                <div className="profile-header">
                  <div className="avatar">👤</div>
                  <h3>{user?.nom || "Client"}</h3>
                  <p>{user?.email || "client@example.com"}</p>
                </div>
                <div className="profile-details">
                  <p><strong>🎯 {t("role")}:</strong> {t("client")}</p>
                  <p><strong>📅 {t("member_since")}:</strong> 2024</p>
                  <p><strong>📞 {t("contact")}:</strong> +212 XXX XXX XXX</p>
                </div>
                <button className="btn-edit-profile">
                  ✏️ {t("edit_profile")}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardClient;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("http://http://livraison-api-x45n.onrender.com/api/send-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message);
      alert(data.message);
      navigate("/verify-reset", { state: { email } });
    } catch (error) {
      alert("❌ " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <h2>🔐 Réinitialisation du mot de passe</h2>
      <form onSubmit={handleSendCode}>
        <label>Email :</label>
        <input
          type="email"
          placeholder="Entrez votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Envoi en cours..." : "Envoyer le code"}
        </button>
      </form>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "../style/login.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; 

export default function Login({ globalDarkMode, updateGlobalDarkMode }) {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    users: 0,
    visitors: 0,
    orders: 0
  });

  // 🔹 محاكاة الإحصائيات الحية
  useEffect(() => {
    // بيانات أولية واقعية
    setStats({
      users: 1247,
      visitors: 8563,
      orders: 2894
    });

    // محاكاة تحديث البيانات كل 3 ثواني
    const interval = setInterval(() => {
      setStats(prev => ({
        users: prev.users + Math.floor(Math.random() * 3),
        visitors: prev.visitors + Math.floor(Math.random() * 10),
        orders: prev.orders + Math.floor(Math.random() * 5)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 🔹 مزامنة الوضع الليلي مع الإعدادات العالمية
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'fr';
    
    setDarkMode(savedDarkMode);
    i18n.changeLanguage(savedLanguage);
    
    // إذا كانت هناك props من المكون الأب، استخدمها
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
    
    // تحديث الوضع الليلي عالمياً إذا كانت الدالة متاحة
    if (updateGlobalDarkMode) {
      updateGlobalDarkMode(newDarkMode);
    }
  };

  // ✅ عند إرسال النموذج - تسجيل الدخول
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("🔐 Tentative de connexion:", { email, motDePasse });

    try {
      const response = await fetch("http://livraison-api-x45n.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, mot_de_passe: motDePasse }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "❌ Erreur de connexion");
        setLoading(false);
        return;
      }

      // ✅ تسجيل الدخول ناجح
      console.log("✅ Connexion réussie:", data.user);
      setIsLoggedIn(true);
      setUserRole(data.user.role);
      setUserData(data.user);
      
      // حفظ بيانات المستخدم في localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", "user-token");

// توجيه إلى الداشبورد المناسب
switch(data.user.role) {
  case 'admin':
    navigate('/dashboard-admin');  // 🔹 غير إلى حروف صغيرة
    break;
  case 'livreur':
    navigate('/dashboard-livreur');  // 🔹 غير إلى حروف صغيرة
    break;
  case 'client':
    navigate('/dashboard-client');  // 🔹 غير إلى حروف صغيرة
    break;
  default:
    navigate('/dashboard-client');  // 🔹 غير إلى حروف صغيرة
}

    } catch (error) {
      console.error("❌ Erreur:", error);
      alert("❌ Problème de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 إرسال كود إعادة التعيين (OTP)
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) return alert("Veuillez entrer votre adresse email !");

    try {
      const response = await fetch("http://livraison-api-x45n.onrender.com/api/send-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "❌ Erreur serveur");
        return;
      }

      alert(data.message || "✅ Code envoyé à votre email !");
      navigate("/verify-otp", { state: { email } });
    } catch (error) {
      console.error("❌ Erreur:", error);
      alert("❌ Problème de connexion au serveur.");
    }
  };

  // إذا كان المستخدم مسجلاً، عرض رسالة تحميل
  if (isLoggedIn) {
    return (
      <div className="loading-container">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="loading-content"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="loading-spinner"
          >
            ⚡
          </motion.div>
          <h2>{t("redirecting_dashboard")}</h2>
          <p>{t("role_label")}: {userRole}</p>
        </motion.div>
      </div>
    );
  }

  // إذا لم يكن مسجلاً، عرض صفحة Login
  return (
    <div className={`login-container ${darkMode ? "dark" : ""}`}>
      {/* 🌐 أزرار اللغة والوضع */}
      <div className={`language-switch ${i18n.language === "ar" ? "rtl" : "ltr"}`}>
        <button onClick={() => changeLanguage("fr")}>🇫🇷</button>
        <button onClick={() => changeLanguage("en")}>🇬🇧</button>
        <button onClick={() => changeLanguage("ar")}>🇸🇦</button>
        <button onClick={toggleDarkMode}>
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>

      {/* 🎯 الجانب الأيسر */}
      <motion.div
        className="login-left"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.img
          src="/truck.png"
          alt="Delivery Truck"
          className="truck-image"
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        />
        <h1 className="login-title">🚚 Livraison Express</h1>
        <p className="login-subtitle">{t("secure_fast")}</p>

        {/* 📊 إحصائيات حية */}
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-icon">👥</div>
            <div className="stat-number">{stats.users.toLocaleString()}</div>
            <div className="stat-label">{t("stats_users")}</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">🌐</div>
            <div className="stat-number">{stats.visitors.toLocaleString()}</div>
            <div className="stat-label">{t("stats_visitors")}</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">📦</div>
            <div className="stat-number">{stats.orders.toLocaleString()}</div>
            <div className="stat-label">{t("stats_orders")}</div>
          </div>
        </div>
      </motion.div>

      {/* 🔐 الجانب الأيمن - نموذج تسجيل الدخول */}
      <div className="login-right">
        <motion.div
          className="login-form-container"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="login-header">
            <div className="login-badge">{t("secure_fast")}</div>
            <h2>{t("login_title")}</h2>
            <p>{t("login_subtitle")}</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {/* ✉️ البريد الإلكتروني */}
            <motion.div
              className="form-group"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <label htmlFor="email">{t("email")}</label>
              <input
                id="email"
                type="email"
                placeholder={t("email_placeholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </motion.div>

            {/* 🔒 كلمة المرور */}
            <motion.div
              className="form-group"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <label htmlFor="password">{t("password")}</label>
              <input
                id="password"
                type="password"
                placeholder={t("password_placeholder")}
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                required
                disabled={loading}
              />
            </motion.div>

            {/* 🚪 زر الدخول */}
            <motion.button
              type="submit"
              className="btn-login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ scale: loading ? 1 : 1.03 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              disabled={loading}
            >
              {loading ? "⏳ Connexion..." : t("login_button")}
            </motion.button>

            {/* رابط نسيان كلمة السر */}
            <motion.p
              className="forgot-password-link"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <a
                href="#"
                onClick={handleForgotPassword}
              >
                {t("forgot_password")}
              </a>
            </motion.p>

            {/* 🆕 إنشاء حساب */}
            <motion.p
              className="signup-link"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              {t("signup_text")}{" "}
              <a href="/register">{t("create_account")}</a>
            </motion.p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

// src/pages/Register.jsx
import React, { useState, useEffect }  from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import "../style/register.css";

const Register = ({ globalDarkMode, updateGlobalDarkMode }) => {
  const { t, i18n } = useTranslation();
  const [darkMode, setDarkMode] = useState(false);
  // 🔹 مزامنة الوضع الليلي واللغة مع الإعدادات العالمية
useEffect(() => {
  const savedDarkMode = localStorage.getItem('darkMode') === 'true';
  const savedLanguage = localStorage.getItem('preferredLanguage') || 'fr';
  
  setDarkMode(savedDarkMode);
  i18n.changeLanguage(savedLanguage);
  
  // إذا كانت هناك props من المكون الأب، استخدمها
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

  // 🔹 إعدادات API - مصحح
  const API_BASE = "http://livraison-api-x45n.onrender.com/api";

  // 🌍 تغيير اللغة
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

// 🎨 تبديل الوضع الليلي مع الحفظ
const toggleDarkMode = () => {
  const newDarkMode = !darkMode;
  setDarkMode(newDarkMode);
  localStorage.setItem('darkMode', newDarkMode.toString());
  
  // تحديث الوضع الليلي عالمياً إذا كانت الدالة متاحة
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
        setIsVerifying(true);
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
          window.location.href = "/login";
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

  // 🔗 اختبار اتصال السيرفر
  const testServerConnection = async () => {
    try {
      const response = await fetch("http://livraison-api-x45n.onrender.com/");
      const data = await response.text();
      alert("✅ السيرفر يعمل: " + data);
    } catch (error) {
      alert("❌ السيرفر غير متاح. تأكد من تشغيله على البورت 8080");
    }
  };

  return (
    <div className={`register-container ${darkMode ? "dark" : ""}`}>
      {/* 🌐 أزرار التحكم */}
      <div className="control-buttons">
        <button onClick={() => changeLanguage("fr")}>🇫🇷 FR</button>
        <button onClick={() => changeLanguage("en")}>🇬🇧 EN</button>
        <button onClick={() => changeLanguage("ar")}>🇸🇦 AR</button>
        <button onClick={toggleDarkMode}>
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
        <button onClick={testServerConnection} className="test-btn">
          🔗 Test Server
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
            className="truck-animation"
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 2, 0, -2, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            🚚
          </motion.div>
          
          <h1 className="app-title">Livraison Express</h1>
          <p className="app-description">
            {t("register_subtitle")}
          </p>
          
          <div className="features">
            <div className="feature">
              <span>⚡</span>
              <p>{t("fast_delivery")}</p>
            </div>
            <div className="feature">
              <span>🔒</span>
              <p>{t("secure_service")}</p>
            </div>
            <div className="feature">
              <span>🌍</span>
              <p>{t("wide_coverage")}</p>
            </div>
          </div>
        </motion.div>

        {/* 📋 الجانب الأيمن - النموذج */}
        <motion.div 
          className="register-form-section"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="form-container">
            
            {/* 🎫 رأس النموذج */}
            <div className="form-header">
              <div className="form-badge">
                {isVerifying ? "📧 " + t("verification") : "🚀 " + t("registration")}
              </div>
              <h2>{isVerifying ? t("email_verification") : t("create_account")}</h2>
              <p className="form-subtitle">
                {isVerifying ? t("enter_verification_code") : t("create_account_seconds")}
              </p>
            </div>

            {/* 📄 نموذج التسجيل */}
            {!isVerifying ? (
              <form className="register-form" onSubmit={handleRegister}>
                <div className="form-group">
                  <label htmlFor="nom">{t("full_name")} *</label>
                  <input
                    id="nom"
                    type="text"
                    name="nom"
                    placeholder={t("enter_full_name")}
                    value={formData.nom}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">{t("email_address")} *</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder={t("email_placeholder")}
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="mot_de_passe">{t("password")} *</label>
                  <input
                    id="mot_de_passe"
                    type="password"
                    name="mot_de_passe"
                    placeholder={t("create_secure_password")}
                    value={formData.mot_de_passe}
                    onChange={handleChange}
                    required
                    minLength="6"
                    disabled={loading}
                  />
                  <small className="password-hint">
                    {t("password_minimum")}
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="role">{t("role")} *</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="client">{t("client")}</option>
                    <option value="livreur">{t("delivery_person")}</option>
                  </select>
                </div>

                <motion.button
                  type="submit"
                  className={`submit-btn ${loading ? "loading" : ""}`}
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  {loading ? "⏳ " + t("processing") : "✅ " + t("sign_up")}
                </motion.button>
              </form>
            ) : (
              /* 🔐 نموذج التحقق */
              <form className="verification-form" onSubmit={handleVerifyCode}>
                <div className="form-group">
                  <label htmlFor="verificationCode">{t("verification_code")} *</label>
                  <input
                    id="verificationCode"
                    type="text"
                    placeholder={t("enter_6_digit_code")}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    maxLength="6"
                    required
                    disabled={loading}
                    pattern="[0-9]{6}"
                    title={t("six_digits_only")}
                  />
                  <small className="code-hint">
                    {t("check_your_email")}: <strong>{formData.email}</strong>
                  </small>
                </div>

                <motion.button
                  type="submit"
                  className={`verify-btn ${loading ? "loading" : ""}`}
                  disabled={loading || verificationCode.length !== 6}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  {loading ? "⏳ " + t("verifying") : "🔐 " + t("verify_email")}
                </motion.button>

                <button
                  type="button"
                  className="back-btn"
                  onClick={() => setIsVerifying(false)}
                  disabled={loading}
                >
                  ↩️ {t("back_to_register")}
                </button>
              </form>
            )}

            {/* 💬 رسائل التنبيه */}
            {message && (
              <motion.div 
                className={`message ${message.includes('✅') ? 'success' : 'error'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {message}
              </motion.div>
            )}

            {/* 🔗 رابط تسجيل الدخول */}
            <div className="auth-links">
              <p>
                {t("already_have_account")}{" "}
                <a href="/login" className="login-link">
                  {t("sign_in")}
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import "../style/reset.css";

const ResetPassword = ({ globalDarkMode, updateGlobalDarkMode }) => {
  const { t, i18n } = useTranslation();
  const [darkMode, setDarkMode] = useState(false);
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [confirmerMotDePasse, setConfirmerMotDePasse] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

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

  // 🔐 إعادة تعيين كلمة المرور
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!nouveauMotDePasse || !confirmerMotDePasse) {
      setMessage("❌ " + t("fill_all_fields"));
      setLoading(false);
      return;
    }

    if (nouveauMotDePasse.length < 6) {
      setMessage("❌ " + t("password_min_length"));
      setLoading(false);
      return;
    }

    if (nouveauMotDePasse !== confirmerMotDePasse) {
      setMessage("❌ " + t("passwords_not_match"));
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://livraison-api-x45n.onrender.com/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          nouveauMotDePasse 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ " + data.message);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setMessage("❌ " + (data.message || t("reset_failed")));
      }
    } catch (error) {
      console.error("❌ Erreur:", error);
      setMessage("❌ " + t("connection_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`reset-password-container ${darkMode ? "dark" : ""}`}>
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
        className="reset-password-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <img src="/reset-password.png" alt="Reset Password" className="reset-image" />
        
        <h2>{t("reset_password")}</h2>
        <p className="reset-text">
          {t("create_new_password")}
        </p>

        <form onSubmit={handleResetPassword} className="reset-form">
          <div className="form-group">
            <label htmlFor="nouveauMotDePasse">{t("new_password")}</label>
            <input
              id="nouveauMotDePasse"
              type="password"
              placeholder={t("enter_new_password")}
              value={nouveauMotDePasse}
              onChange={(e) => setNouveauMotDePasse(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmerMotDePasse">{t("confirm_password")}</label>
            <input
              id="confirmerMotDePasse"
              type="password"
              placeholder={t("confirm_new_password")}
              value={confirmerMotDePasse}
              onChange={(e) => setConfirmerMotDePasse(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <motion.button
            type="submit"
            className="reset-btn"
            whileHover={{ scale: loading ? 1 : 1.03 }}
            whileTap={{ scale: loading ? 1 : 0.97 }}
            disabled={loading}
          >
            {loading ? "⏳ " + t("resetting") : t("reset_password_button")}
          </motion.button>
        </form>

        {message && (
          <motion.div 
            className={`message ${message.includes('✅') ? 'success' : 'error'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {message}
          </motion.div>
        )}

        <p className="back-login">
          <a href="/login">{t("back_to_login")}</a>
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPassword;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/verify.css";

const Verify = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://http://livraison-api-x45n.onrender.com/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Email verified successfully!");
        navigate("/login"); // بعد التحقق ننتقل لصفحة الدخول
      } else {
        alert(data.message || "❌ Invalid or expired code");
      }
    } catch (error) {
      console.error("❌ Verification error:", error);
      alert("Network error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-container">
      <div className="verify-box">
        <h2>Email Verification</h2>
        <p>Enter your email and the code sent to your inbox.</p>

        <form onSubmit={handleVerify}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Verification code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength="6"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <button className="back-btn" onClick={() => navigate("/register")}>
          ← Back to Register
        </button>
      </div>
    </div>
  );
};

export default Verify;
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import "../style/verify.css";

const VerifyOtp = ({ globalDarkMode, updateGlobalDarkMode }) => {
  const { t, i18n } = useTranslation();
  const [darkMode, setDarkMode] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

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

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://livraison-api-x45n.onrender.com/api/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: enteredOtp }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "❌ " + t("invalid_code"));
        return;
      }

      alert("✅ " + t("code_verified"));
      navigate("/reset-password", { state: { email } });
    } catch (error) {
      alert("❌ " + t("connection_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`otp-container ${darkMode ? "dark" : ""}`}>
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
        className="otp-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <img src="/otp.png" alt="OTP Icon" className="otp-image" />

        <h2>{t("verification_code")}</h2>
        <p className="otp-text">
          {t("code_sent_to")}  
          <span className="otp-email">{email}</span>
        </p>

        <form onSubmit={handleVerify} className="otp-form">
          <input
            type="text"
            placeholder={t("enter_6_digit_code")}
            value={enteredOtp}
            maxLength={6}
            onChange={(e) => setEnteredOtp(e.target.value)}
            className="otp-input"
            required
            disabled={loading}
          />

          <motion.button
            type="submit"
            className="otp-btn"
            whileHover={{ scale: loading ? 1 : 1.03 }}
            whileTap={{ scale: loading ? 1 : 0.97 }}
            disabled={loading}
          >
            {loading ? "⏳ " + t("verifying") : t("verify")}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default VerifyOtp;

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function VerifyResetCode() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://http://livraison-api-x45n.onrender.com/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message);
      alert("✅ Mot de passe mis à jour !");
      navigate("/login");
    } catch (error) {
      alert("❌ " + error.message);
    }
  };

  return (
    <div className="verify-container">
      <h2>Vérification du code</h2>
      <form onSubmit={handleVerify}>
        <p>Email : <b>{email}</b></p>
        <label>Code reçu :</label>
        <input
          type="text"
          placeholder="Entrez le code OTP"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />

        <label>Nouveau mot de passe :</label>
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <button type="submit">Valider</button>
      </form>
    </div>
  );
}

