import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const ClientPayments = () => {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedPayment, setExpandedPayment] = useState(null);

  // بيانات عينة من المدفوعات
  const payments = [
    {
      id: 'PAY-2024-001',
      orderId: 'ORD-2024-002',
      amount: 680.5,
      date: '2024-01-14',
      method: 'credit_card',
      status: 'completed',
      description: 'دفع مقابل الطلب من متجر الأزياء',
      transactionId: 'TXN-2024-001',
      cardLast4: '4242',
    },
    {
      id: 'PAY-2024-002',
      orderId: 'ORD-2024-001',
      amount: 450.0,
      date: '2024-01-13',
      method: 'wallet',
      status: 'completed',
      description: 'دفع مقابل الطلب من متجر الأم',
      transactionId: 'TXN-2024-002',
      walletLabel: 'محفظتي',
    },
    {
      id: 'PAY-2024-003',
      orderId: 'ORD-2024-003',
      amount: 1200.0,
      date: '2024-01-13',
      method: 'bank_transfer',
      status: 'pending',
      description: 'دفع مقابل الطلب من متجر الإلكترونيات',
      transactionId: 'TXN-2024-003',
    },
    {
      id: 'PAY-2024-004',
      orderId: 'ORD-2024-004',
      amount: 320.0,
      date: '2024-01-12',
      method: 'credit_card',
      status: 'completed',
      description: 'دفع مقابل الطلب من متجر الكتب',
      transactionId: 'TXN-2024-004',
      cardLast4: '5555',
    },
    {
      id: 'PAY-2024-005',
      orderId: 'ORD-2024-005',
      amount: 550.75,
      date: '2024-01-11',
      method: 'credit_card',
      status: 'failed',
      description: 'دفع ملموسة - الطريقة باءت بالفشل',
      transactionId: 'TXN-2024-005',
      cardLast4: '7890',
      failureReason: 'insufficient_funds',
    },
  ];

  const getStatusColor = status => {
    const colors = {
      completed: '#22c55e',
      pending: '#f59e0b',
      failed: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = status => {
    const icons = {
      completed: '✅',
      pending: '⏳',
      failed: '❌',
    };
    return icons[status] || '📦';
  };

  const getPaymentMethodIcon = method => {
    const icons = {
      credit_card: '💳',
      wallet: '👛',
      bank_transfer: '🏦',
      cash: '💵',
    };
    return icons[method] || '💰';
  };

  const getPaymentMethodName = method => {
    const names = {
      credit_card: 'بطاقة ائتمان',
      wallet: 'محفظة رقمية',
      bank_transfer: 'تحويل بنكي',
      cash: 'دفع عند الاستلام',
    };
    return names[method] || method;
  };

  const filteredPayments = payments.filter(payment => {
    if (activeFilter === 'all') return true;
    return payment.status === activeFilter;
  });

  const totalSpent = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="client-payments-container">
      {/* خلفية الرسوم المتحركة */}
      <div className="payments-background">
        <div className="payments-shape-1"></div>
        <div className="payments-shape-2"></div>
        <div className="payments-shape-3"></div>
      </div>

      <div className="payments-content">
        {/* رأس القسم */}
        <div className="payments-header">
          <h2>💳 {t('payments')}</h2>
          <p>{t('payment_history')}</p>
        </div>

        {/* ملخص المدفوعات */}
        <div className="payments-summary">
          <div className="summary-card total-spent">
            <div className="summary-icon">💰</div>
            <div className="summary-info">
              <p className="summary-label">{t('total_spent')}</p>
              <p className="summary-value">{totalSpent.toFixed(2)} درهم</p>
            </div>
          </div>

          <div className="summary-card completed">
            <div className="summary-icon">✅</div>
            <div className="summary-info">
              <p className="summary-label">{t('completed')}</p>
              <p className="summary-value">
                {payments.filter(p => p.status === 'completed').length}
              </p>
            </div>
          </div>

          <div className="summary-card pending">
            <div className="summary-icon">⏳</div>
            <div className="summary-info">
              <p className="summary-label">{t('pending')}</p>
              <p className="summary-value">
                {payments.filter(p => p.status === 'pending').length}
              </p>
            </div>
          </div>

          <div className="summary-card failed">
            <div className="summary-icon">❌</div>
            <div className="summary-info">
              <p className="summary-label">{t('failed')}</p>
              <p className="summary-value">
                {payments.filter(p => p.status === 'failed').length}
              </p>
            </div>
          </div>
        </div>

        {/* شريط التصفية */}
        <div className="payments-filter">
          <button
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            {t('all')} ({payments.length})
          </button>
          <button
            className={`filter-btn ${
              activeFilter === 'completed' ? 'active' : ''
            }`}
            onClick={() => setActiveFilter('completed')}
          >
            ✅ {t('completed')}
          </button>
          <button
            className={`filter-btn ${
              activeFilter === 'pending' ? 'active' : ''
            }`}
            onClick={() => setActiveFilter('pending')}
          >
            ⏳ {t('pending')}
          </button>
          <button
            className={`filter-btn ${
              activeFilter === 'failed' ? 'active' : ''
            }`}
            onClick={() => setActiveFilter('failed')}
          >
            ❌ {t('failed')}
          </button>
        </div>

        {/* قائمة المدفوعات */}
        <div className="payments-list">
          {filteredPayments.length > 0 ? (
            filteredPayments.map((payment, index) => (
              <motion.div
                key={payment.id}
                className="payment-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="payment-card-main">
                  <div className="payment-left">
                    <div className="payment-method-icon">
                      {getPaymentMethodIcon(payment.method)}
                    </div>
                    <div className="payment-details">
                      <h3 className="payment-id">{payment.id}</h3>
                      <p className="payment-description">
                        {payment.description}
                      </p>
                      <p className="payment-date">
                        📅 {new Date(payment.date).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>

                  <div className="payment-right">
                    <div
                      className="payment-status"
                      style={{ borderColor: getStatusColor(payment.status) }}
                    >
                      <span className="status-icon">
                        {getStatusIcon(payment.status)}
                      </span>
                      <span
                        className="status-text"
                        style={{ color: getStatusColor(payment.status) }}
                      >
                        {t(payment.status)}
                      </span>
                    </div>
                    <p className="payment-amount">
                      {payment.amount.toFixed(2)}
                      <span className="currency"> درهم</span>
                    </p>
                  </div>
                </div>

                {/* تفاصيل التوسع */}
                {expandedPayment === payment.id && (
                  <motion.div
                    className="payment-details-expanded"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="details-grid">
                      <div className="detail-column">
                        <label>{t('order_id')}</label>
                        <p>{payment.orderId}</p>
                      </div>
                      <div className="detail-column">
                        <label>{t('transaction_id')}</label>
                        <p className="transaction-id">
                          {payment.transactionId}
                        </p>
                      </div>
                      <div className="detail-column">
                        <label>{t('payment_method')}</label>
                        <p>{getPaymentMethodName(payment.method)}</p>
                      </div>
                      <div className="detail-column">
                        <label>{t('amount')}</label>
                        <p>{payment.amount.toFixed(2)} درهم</p>
                      </div>

                      {payment.cardLast4 && (
                        <div className="detail-column">
                          <label>{t('card')}</label>
                          <p>•••• {payment.cardLast4}</p>
                        </div>
                      )}

                      {payment.walletLabel && (
                        <div className="detail-column">
                          <label>{t('wallet')}</label>
                          <p>{payment.walletLabel}</p>
                        </div>
                      )}

                      {payment.failureReason && (
                        <div className="detail-column">
                          <label>{t('failure_reason')}</label>
                          <p className="failure-text">
                            {payment.failureReason}
                          </p>
                        </div>
                      )}
                    </div>

                    {payment.status === 'failed' && (
                      <div className="payment-actions">
                        <button className="btn-retry">
                          🔄 {t('retry_payment')}
                        </button>
                      </div>
                    )}

                    {payment.status === 'completed' && (
                      <div className="payment-actions">
                        <button className="btn-invoice">
                          📄 {t('download_invoice')}
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* زر التفاصيل */}
                <button
                  className="btn-expand"
                  onClick={() =>
                    setExpandedPayment(
                      expandedPayment === payment.id ? null : payment.id
                    )
                  }
                >
                  {expandedPayment === payment.id ? '▲' : '▼'}
                </button>
              </motion.div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">💭</div>
              <p>{t('no_payments_found')}</p>
            </div>
          )}
        </div>

        {/* تنبيهات أمان */}
        <div className="payment-security-info">
          <div className="security-icon">🔒</div>
          <div className="security-content">
            <p className="security-title">{t('secure_payment')}</p>
            <p className="security-description">
              {t('all_payments_encrypted')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPayments;
