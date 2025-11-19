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