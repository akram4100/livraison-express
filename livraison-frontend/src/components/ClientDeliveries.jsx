import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const ClientDeliveries = () => {
  const { t } = useTranslation();
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [activeTab, setActiveTab] = useState('active');

  // بيانات عينة من التوصيلات
  const deliveries = {
    active: [
      {
        id: 'DEL-2024-001',
        order: 'ORD-2024-002',
        driver: 'أحمد محمد',
        driverPhone: '+971501234567',
        location: 'تقاطع الشارقة - دبي',
        eta: '15 دقيقة',
        progress: 75,
        route: [
          { location: 'المتجر', time: '2024-01-14 14:30', completed: true },
          {
            location: 'نقطة التجميع',
            time: '2024-01-14 15:00',
            completed: true,
          },
          { location: 'الطريق السريعة', time: 'الآن', completed: false },
          {
            location: 'عنوانك',
            time: '2024-01-14 15:45 (متوقع)',
            completed: false,
          },
        ],
      },
    ],
    completed: [
      {
        id: 'DEL-2024-002',
        order: 'ORD-2024-001',
        driver: 'علي حسن',
        deliveredAt: '2024-01-13 18:30',
        rating: 5,
        feedback: 'توصيل ممتاز وسريع',
      },
      {
        id: 'DEL-2024-003',
        order: 'ORD-2024-004',
        driver: 'محمد عبدالله',
        deliveredAt: '2024-01-12 11:00',
        rating: 4,
        feedback: 'جيد جداً',
      },
    ],
    cancelled: [
      {
        id: 'DEL-2024-004',
        order: 'ORD-2024-005',
        cancelReason: 'طلب إلغاء من المتجر',
        cancelledAt: '2024-01-11 09:00',
      },
    ],
  };

  const getTabData = () => {
    if (activeTab === 'active') return deliveries.active;
    if (activeTab === 'completed') return deliveries.completed;
    return deliveries.cancelled;
  };

  const getStatusColor = tab => {
    const colors = {
      active: '#3b82f6',
      completed: '#22c55e',
      cancelled: '#ef4444',
    };
    return colors[tab];
  };

  const getStatusIcon = tab => {
    const icons = {
      active: '🚚',
      completed: '✅',
      cancelled: '❌',
    };
    return icons[tab];
  };

  return (
    <div className="client-deliveries-container">
      {/* خلفية الرسوم المتحركة */}
      <div className="deliveries-background">
        <div className="deliveries-shape-1"></div>
        <div className="deliveries-shape-2"></div>
        <div className="deliveries-shape-3"></div>
      </div>

      <div className="deliveries-content">
        {/* رأس القسم */}
        <div className="deliveries-header">
          <h2>🚚 {t('deliveries')}</h2>
          <p>{t('deliveries_tracking')}</p>
        </div>

        {/* علامات التبويب */}
        <div className="deliveries-tabs">
          <button
            className={`delivery-tab ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            <span className="tab-icon">🚚</span>
            <span>
              {t('active')} ({deliveries.active.length})
            </span>
          </button>
          <button
            className={`delivery-tab ${
              activeTab === 'completed' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('completed')}
          >
            <span className="tab-icon">✅</span>
            <span>
              {t('completed')} ({deliveries.completed.length})
            </span>
          </button>
          <button
            className={`delivery-tab ${
              activeTab === 'cancelled' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('cancelled')}
          >
            <span className="tab-icon">❌</span>
            <span>
              {t('cancelled')} ({deliveries.cancelled.length})
            </span>
          </button>
        </div>

        {/* محتوى التبويب */}
        <div className="deliveries-list">
          {getTabData().length > 0 ? (
            getTabData().map((delivery, index) => (
              <motion.div
                key={delivery.id}
                className={`delivery-card ${activeTab}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() =>
                  setSelectedDelivery(
                    selectedDelivery === delivery.id ? null : delivery.id
                  )
                }
              >
                <div className="delivery-card-header">
                  <div className="delivery-info">
                    <h3 className="delivery-id">{delivery.id}</h3>
                    <p className="delivery-order">{delivery.order}</p>
                  </div>
                  <div
                    className="delivery-badge"
                    style={{ backgroundColor: getStatusColor(activeTab) }}
                  >
                    <span>{getStatusIcon(activeTab)}</span>
                  </div>
                </div>

                {/* معلومات السائق - للتوصيلات النشطة */}
                {activeTab === 'active' && delivery.driver && (
                  <div className="driver-section">
                    <div className="driver-info">
                      <div className="driver-avatar">👨‍🚚</div>
                      <div className="driver-details">
                        <p className="driver-name">{delivery.driver}</p>
                        <p className="driver-phone">{delivery.driverPhone}</p>
                      </div>
                    </div>
                    <button className="btn-contact">
                      📞 {t('contact_driver')}
                    </button>
                  </div>
                )}

                {/* شريط التقدم - للتوصيلات النشطة */}
                {activeTab === 'active' && (
                  <>
                    <div className="progress-section">
                      <div className="progress-info">
                        <p className="progress-location">{delivery.location}</p>
                        <p className="progress-eta">
                          ⏱️ {t('eta')}: {delivery.eta}
                        </p>
                      </div>
                      <div className="progress-bar">
                        <motion.div
                          className="progress-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${delivery.progress}%` }}
                          transition={{ duration: 1 }}
                        ></motion.div>
                      </div>
                      <p className="progress-percentage">
                        {delivery.progress}%
                      </p>
                    </div>

                    {/* تفاصيل المسار */}
                    {selectedDelivery === delivery.id && (
                      <motion.div
                        className="route-details"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="route-timeline">
                          {delivery.route.map((stop, idx) => (
                            <div
                              key={idx}
                              className={`timeline-item ${
                                stop.completed ? 'completed' : ''
                              }`}
                            >
                              <div className="timeline-icon">
                                {stop.completed ? '✅' : '⭕'}
                              </div>
                              <div className="timeline-content">
                                <p className="timeline-location">
                                  {stop.location}
                                </p>
                                <p className="timeline-time">{stop.time}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </>
                )}

                {/* معلومات التوصيل المكتملة */}
                {activeTab === 'completed' && delivery.deliveredAt && (
                  <div className="completed-section">
                    <p className="delivered-time">
                      ✅ {t('delivered_at')}:{' '}
                      {new Date(delivery.deliveredAt).toLocaleDateString(
                        'ar-SA'
                      )}
                    </p>
                    <div className="rating-section">
                      <label>{t('rate_delivery')}</label>
                      <div className="star-rating">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span
                            key={star}
                            className={`star ${
                              star <= delivery.rating ? 'filled' : ''
                            }`}
                          >
                            ⭐
                          </span>
                        ))}
                      </div>
                      {delivery.feedback && (
                        <p className="feedback">{delivery.feedback}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* معلومات الإلغاء */}
                {activeTab === 'cancelled' && delivery.cancelReason && (
                  <div className="cancelled-section">
                    <p className="cancel-reason">
                      {t('cancel_reason')}: {delivery.cancelReason}
                    </p>
                    <p className="cancelled-time">
                      {new Date(delivery.cancelledAt).toLocaleDateString(
                        'ar-SA'
                      )}
                    </p>
                  </div>
                )}

                {/* تفاصيل القابلة للتوسع */}
                <button className="btn-details">
                  {selectedDelivery === delivery.id
                    ? '▲ إخفاء التفاصيل'
                    : '▼ عرض المزيد'}
                </button>
              </motion.div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>{t('no_deliveries_found')}</p>
            </div>
          )}
        </div>

        {/* إحصائيات التوصيلات */}
        <div className="deliveries-stats">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <p className="stat-label">{t('total_deliveries')}</p>
              <p className="stat-value">
                {deliveries.active.length +
                  deliveries.completed.length +
                  deliveries.cancelled.length}
              </p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <p className="stat-label">{t('completed')}</p>
              <p className="stat-value">{deliveries.completed.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-info">
              <p className="stat-label">{t('active')}</p>
              <p className="stat-value">{deliveries.active.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDeliveries;
