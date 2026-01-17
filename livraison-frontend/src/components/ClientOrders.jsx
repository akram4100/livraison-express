import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const ClientOrders = () => {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // بيانات عينة من الطلبات
  const orders = [
    {
      id: 'ORD-2024-001',
      store: 'متجر الأم',
      total: 450.0,
      date: '2024-01-15',
      status: 'delivered',
      items: 3,
      tracking: 'TRK-2024-001',
    },
    {
      id: 'ORD-2024-002',
      store: 'متجر الأزياء',
      total: 680.5,
      date: '2024-01-14',
      status: 'in_transit',
      items: 2,
      tracking: 'TRK-2024-002',
    },
    {
      id: 'ORD-2024-003',
      store: 'متجر الإلكترونيات',
      total: 1200.0,
      date: '2024-01-13',
      status: 'processing',
      items: 1,
      tracking: 'TRK-2024-003',
    },
    {
      id: 'ORD-2024-004',
      store: 'متجر الكتب',
      total: 320.0,
      date: '2024-01-12',
      status: 'delivered',
      items: 5,
      tracking: 'TRK-2024-004',
    },
  ];

  const getStatusColor = status => {
    const colors = {
      delivered: '#22c55e',
      in_transit: '#3b82f6',
      processing: '#f59e0b',
      cancelled: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = status => {
    const icons = {
      delivered: '✅',
      in_transit: '🚚',
      processing: '⏳',
      cancelled: '❌',
    };
    return icons[status] || '📦';
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter =
      activeFilter === 'all' || order.status === activeFilter;
    const matchesSearch =
      order.id.includes(searchTerm.toUpperCase()) ||
      order.store.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="client-orders-container">
      {/* خلفية الرسوم المتحركة */}
      <div className="orders-background">
        <div className="orders-shape-1"></div>
        <div className="orders-shape-2"></div>
        <div className="orders-shape-3"></div>
      </div>

      <div className="orders-content">
        {/* رأس القسم */}
        <div className="orders-header">
          <h2>📦 {t('my_orders')}</h2>
          <p>{t('orders_management')}</p>
        </div>

        {/* شريط التصفية والبحث */}
        <div className="orders-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder={t('search_orders')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          <div className="filter-tabs">
            <button
              className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              {t('all')} ({orders.length})
            </button>
            <button
              className={`filter-tab ${
                activeFilter === 'processing' ? 'active' : ''
              }`}
              onClick={() => setActiveFilter('processing')}
            >
              ⏳ {t('processing')}
            </button>
            <button
              className={`filter-tab ${
                activeFilter === 'in_transit' ? 'active' : ''
              }`}
              onClick={() => setActiveFilter('in_transit')}
            >
              🚚 {t('in_transit')}
            </button>
            <button
              className={`filter-tab ${
                activeFilter === 'delivered' ? 'active' : ''
              }`}
              onClick={() => setActiveFilter('delivered')}
            >
              ✅ {t('delivered')}
            </button>
          </div>
        </div>

        {/* قائمة الطلبات */}
        <div className="orders-list">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                className="order-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{
                  boxShadow: '0 20px 50px rgba(59, 130, 246, 0.3)',
                }}
              >
                <div className="order-card-header">
                  <div className="order-info">
                    <h3 className="order-id">{order.id}</h3>
                    <span className="order-date">
                      📅 {new Date(order.date).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                  <div
                    className="order-status"
                    style={{ borderColor: getStatusColor(order.status) }}
                  >
                    <span className="status-icon">
                      {getStatusIcon(order.status)}
                    </span>
                    <span
                      className="status-text"
                      style={{ color: getStatusColor(order.status) }}
                    >
                      {t(order.status)}
                    </span>
                  </div>
                </div>

                <div className="order-body">
                  <div className="order-details">
                    <div className="detail-item">
                      <label>{t('store')}</label>
                      <p>{order.store}</p>
                    </div>
                    <div className="detail-item">
                      <label>{t('items')}</label>
                      <p>
                        {order.items} {t('items')}
                      </p>
                    </div>
                    <div className="detail-item">
                      <label>{t('tracking')}</label>
                      <p className="tracking-code">{order.tracking}</p>
                    </div>
                  </div>

                  <div className="order-footer">
                    <div className="order-total">
                      <label>{t('total')}</label>
                      <p className="total-price">
                        {order.total.toFixed(2)} درهم
                      </p>
                    </div>
                    <div className="order-actions">
                      <button className="btn-track">{t('track_order')}</button>
                      {order.status === 'delivered' && (
                        <button className="btn-reorder">{t('reorder')}</button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>{t('no_orders_found')}</p>
            </div>
          )}
        </div>

        {/* إحصائيات سريعة */}
        <div className="orders-stats">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <p className="stat-label">{t('total_orders')}</p>
              <p className="stat-value">{orders.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <p className="stat-label">{t('total_spent')}</p>
              <p className="stat-value">
                {orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)} درهم
              </p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <p className="stat-label">{t('delivered')}</p>
              <p className="stat-value">
                {orders.filter(o => o.status === 'delivered').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientOrders;
