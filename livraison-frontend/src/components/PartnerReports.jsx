import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function PartnerReports({ user = {}, onExport }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('month');
  const [chartType, setChartType] = useState('line');

  // 📊 بيانات الإحصائيات
  const [reportStats, setReportStats] = useState({
    totalOrders: 1250,
    completedOrders: 1189,
    canceledOrders: 61,
    totalRevenue: 450000,
    averageRating: 4.8,
    totalDistance: 15420,
  });

  // 📈 بيانات المبيعات الشهرية
  const [monthlySales] = useState([
    { month: 'يناير', sales: 25000, orders: 120 },
    { month: 'فبراير', sales: 32000, orders: 145 },
    { month: 'مارس', sales: 28500, orders: 135 },
    { month: 'أبريل', sales: 38000, orders: 168 },
    { month: 'مايو', sales: 42000, orders: 189 },
    { month: 'يونيو', sales: 45000, orders: 205 },
    { month: 'يوليو', sales: 48000, orders: 215 },
    { month: 'أغسطس', sales: 50000, orders: 225 },
  ]);

  // 🚚 بيانات التوصيلات
  const [deliveryStats] = useState([
    { period: 'السبت', completed: 28, pending: 5, canceled: 2 },
    { period: 'الأحد', completed: 32, pending: 3, canceled: 1 },
    { period: 'الاثنين', completed: 35, pending: 4, canceled: 2 },
    { period: 'الثلاثاء', completed: 38, pending: 2, canceled: 0 },
    { period: 'الأربعاء', completed: 40, pending: 6, canceled: 1 },
    { period: 'الخميس', completed: 42, pending: 5, canceled: 2 },
    { period: 'الجمعة', completed: 45, pending: 8, canceled: 3 },
  ]);

  // 💰 بيانات الأرباح
  const [earningsData] = useState([
    { category: 'التوصيلات', amount: 350000, percentage: 77.8 },
    { category: 'المكافآت والحوافز', amount: 50000, percentage: 11.1 },
    { category: 'العروض الخاصة', amount: 30000, percentage: 6.7 },
    { category: 'البرنامج الإحالة', amount: 20000, percentage: 4.4 },
  ]);

  // 📋 أحدث الطلبات
  const [recentOrders] = useState([
    {
      id: 'ORD-2024-001',
      date: '2024-01-15',
      amount: 1500,
      status: 'completed',
      distance: 15.2,
    },
    {
      id: 'ORD-2024-002',
      date: '2024-01-15',
      amount: 2300,
      status: 'completed',
      distance: 22.5,
    },
    {
      id: 'ORD-2024-003',
      date: '2024-01-15',
      amount: 1800,
      status: 'completed',
      distance: 18.7,
    },
    {
      id: 'ORD-2024-004',
      date: '2024-01-14',
      amount: 2100,
      status: 'completed',
      distance: 19.3,
    },
    {
      id: 'ORD-2024-005',
      date: '2024-01-14',
      amount: 1650,
      status: 'completed',
      distance: 16.8,
    },
  ]);

  // 🎯 دوال التصدير
  const handleExportPDF = () => {
    console.log('تصدير البيانات كـ PDF');
    // يمكن استخدام مكتبة jsPDF هنا
  };

  const handleExportExcel = () => {
    console.log('تصدير البيانات كـ Excel');
    // يمكن استخدام مكتبة xlsx هنا
  };

  return (
    <div className="partner-reports-container">
      {/* 🎨 الخلفية الديناميكية */}
      <div className="reports-background">
        <div className="reports-shape reports-shape-1"></div>
        <div className="reports-shape reports-shape-2"></div>
        <div className="reports-shape reports-shape-3"></div>
      </div>

      {/* 📱 محتوى التقارير */}
      <div className="reports-content">
        {/* 📋 رأس التقارير */}
        <div className="reports-header">
          <div className="header-title">
            <h2>📊 {t('reports') || 'التقارير'}</h2>
            <p>
              {t('reports_subtitle') ||
                'تحليل شامل لأداءك والإحصائيات التفصيلية'}
            </p>
          </div>

          <div className="header-controls">
            <div className="date-range-selector">
              <label>{t('date_range') || 'نطاق التاريخ'}:</label>
              <select
                value={dateRange}
                onChange={e => setDateRange(e.target.value)}
                className="date-select"
              >
                <option value="week">
                  📅 {t('this_week') || 'هذا الأسبوع'}
                </option>
                <option value="month">
                  📅 {t('this_month') || 'هذا الشهر'}
                </option>
                <option value="quarter">
                  📅 {t('this_quarter') || 'هذا الربع'}
                </option>
                <option value="year">📅 {t('this_year') || 'هذه السنة'}</option>
              </select>
            </div>

            <div className="export-buttons">
              <button className="export-btn pdf" onClick={handleExportPDF}>
                📄 {t('export_pdf') || 'تصدير PDF'}
              </button>
              <button className="export-btn excel" onClick={handleExportExcel}>
                📊 {t('export_excel') || 'تصدير Excel'}
              </button>
            </div>
          </div>
        </div>

        {/* 🔖 التابات الرئيسية */}
        <div className="reports-tabs">
          <button
            className={`reports-tab ${
              activeTab === 'overview' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('overview')}
          >
            📈 {t('overview') || 'نظرة عامة'}
          </button>
          <button
            className={`reports-tab ${activeTab === 'sales' ? 'active' : ''}`}
            onClick={() => setActiveTab('sales')}
          >
            💰 {t('sales') || 'المبيعات'}
          </button>
          <button
            className={`reports-tab ${
              activeTab === 'deliveries' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('deliveries')}
          >
            🚚 {t('deliveries') || 'التوصيلات'}
          </button>
          <button
            className={`reports-tab ${
              activeTab === 'earnings' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('earnings')}
          >
            💳 {t('earnings') || 'الأرباح'}
          </button>
          <button
            className={`reports-tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            📋 {t('details') || 'التفاصيل'}
          </button>
        </div>

        {/* 📄 محتوى التابات */}
        <div className="reports-panels">
          {/* 📈 التاب الأول - نظرة عامة */}
          {activeTab === 'overview' && (
            <div className="reports-panel active">
              <div className="stats-grid overview-grid">
                <div className="stat-card overview-card">
                  <div className="stat-icon">📦</div>
                  <div className="stat-details">
                    <h4>{t('total_orders') || 'إجمالي الطلبات'}</h4>
                    <p className="stat-value">{reportStats.totalOrders}</p>
                    <span className="stat-change positive">
                      ↑ 12% {t('from_last_month') || 'من الشهر الماضي'}
                    </span>
                  </div>
                </div>

                <div className="stat-card overview-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-details">
                    <h4>{t('completed_orders') || 'الطلبات المكتملة'}</h4>
                    <p className="stat-value">{reportStats.completedOrders}</p>
                    <span className="stat-change positive">
                      95.1% {t('completion_rate') || 'معدل الإكمال'}
                    </span>
                  </div>
                </div>

                <div className="stat-card overview-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-details">
                    <h4>{t('total_revenue') || 'إجمالي الإيرادات'}</h4>
                    <p className="stat-value">
                      {reportStats.totalRevenue.toLocaleString()} د.ج
                    </p>
                    <span className="stat-change positive">
                      ↑ 8.5% {t('from_last_month') || 'من الشهر الماضي'}
                    </span>
                  </div>
                </div>

                <div className="stat-card overview-card">
                  <div className="stat-icon">⭐</div>
                  <div className="stat-details">
                    <h4>{t('average_rating') || 'متوسط التقييم'}</h4>
                    <p className="stat-value">
                      {reportStats.averageRating}/5.0
                    </p>
                    <span className="stat-change positive">👍 رائع جداً</span>
                  </div>
                </div>

                <div className="stat-card overview-card">
                  <div className="stat-icon">🛣️</div>
                  <div className="stat-details">
                    <h4>{t('total_distance') || 'إجمالي المسافة'}</h4>
                    <p className="stat-value">{reportStats.totalDistance} كم</p>
                    <span className="stat-change positive">
                      ↑ 15.3% {t('from_last_month') || 'من الشهر الماضي'}
                    </span>
                  </div>
                </div>

                <div className="stat-card overview-card">
                  <div className="stat-icon">❌</div>
                  <div className="stat-details">
                    <h4>{t('canceled_orders') || 'الطلبات الملغاة'}</h4>
                    <p className="stat-value">{reportStats.canceledOrders}</p>
                    <span className="stat-change negative">
                      ↓ 4.9% {t('cancellation_rate') || 'معدل الإلغاء'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 📊 رسم بياني شهري */}
              <div className="chart-section">
                <div className="chart-header">
                  <h3>📈 {t('monthly_trends') || 'الاتجاهات الشهرية'}</h3>
                  <div className="chart-controls">
                    <select
                      value={chartType}
                      onChange={e => setChartType(e.target.value)}
                      className="chart-type-select"
                    >
                      <option value="line">
                        📈 {t('line_chart') || 'رسم خطي'}
                      </option>
                      <option value="bar">
                        📊 {t('bar_chart') || 'رسم أعمدة'}
                      </option>
                      <option value="area">
                        📉 {t('area_chart') || 'رسم بياني'}
                      </option>
                    </select>
                  </div>
                </div>

                <div className="chart-container">
                  <div className="chart-placeholder">
                    {/* هنا سيتم إضافة Chart.js أو Recharts */}
                    <div className="chart-mock">
                      <div className="mock-bar" style={{ height: '40%' }}></div>
                      <div className="mock-bar" style={{ height: '50%' }}></div>
                      <div className="mock-bar" style={{ height: '45%' }}></div>
                      <div className="mock-bar" style={{ height: '60%' }}></div>
                      <div className="mock-bar" style={{ height: '65%' }}></div>
                      <div className="mock-bar" style={{ height: '70%' }}></div>
                      <div className="mock-bar" style={{ height: '75%' }}></div>
                      <div className="mock-bar" style={{ height: '80%' }}></div>
                    </div>
                  </div>

                  <div className="chart-legend">
                    <div className="legend-item">
                      <span
                        className="legend-color"
                        style={{ backgroundColor: '#3b82f6' }}
                      ></span>
                      <span>{t('sales') || 'المبيعات'}</span>
                    </div>
                    <div className="legend-item">
                      <span
                        className="legend-color"
                        style={{ backgroundColor: '#22c55e' }}
                      ></span>
                      <span>{t('orders') || 'الطلبات'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 💰 التاب الثاني - المبيعات */}
          {activeTab === 'sales' && (
            <div className="reports-panel active">
              <div className="table-section">
                <h3>📊 {t('monthly_sales') || 'المبيعات الشهرية'}</h3>
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>{t('month') || 'الشهر'}</th>
                      <th>{t('sales_amount') || 'مبلغ المبيعات'}</th>
                      <th>{t('orders_count') || 'عدد الطلبات'}</th>
                      <th>{t('average_per_order') || 'متوسط الطلب'}</th>
                      <th>{t('growth') || 'النمو'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlySales.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.month}</td>
                        <td className="amount">
                          {item.sales.toLocaleString()} د.ج
                        </td>
                        <td className="center">{item.orders}</td>
                        <td className="center">
                          {Math.round(
                            item.sales / item.orders
                          ).toLocaleString()}{' '}
                          د.ج
                        </td>
                        <td className={`growth ${idx > 0 ? 'positive' : ''}`}>
                          {idx > 0
                            ? `↑ ${Math.round(
                                ((item.sales - monthlySales[idx - 1].sales) /
                                  monthlySales[idx - 1].sales) *
                                  100
                              )}%`
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* إحصائيات إضافية */}
              <div className="insights-grid">
                <div className="insight-card">
                  <h4>🎯 {t('top_month') || 'أفضل شهر'}</h4>
                  <p className="insight-value">أغسطس</p>
                  <p className="insight-desc">50,000 د.ج</p>
                </div>
                <div className="insight-card">
                  <h4>📊 {t('average_monthly') || 'متوسط شهري'}</h4>
                  <p className="insight-value">39,062 د.ج</p>
                  <p className="insight-desc">من 8 أشهر</p>
                </div>
                <div className="insight-card">
                  <h4>📈 {t('total_growth') || 'إجمالي النمو'}</h4>
                  <p className="insight-value">92%</p>
                  <p className="insight-desc">من يناير إلى أغسطس</p>
                </div>
              </div>
            </div>
          )}

          {/* 🚚 التاب الثالث - التوصيلات */}
          {activeTab === 'deliveries' && (
            <div className="reports-panel active">
              <div className="table-section">
                <h3>📦 {t('delivery_statistics') || 'إحصائيات التوصيلات'}</h3>
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>{t('day') || 'اليوم'}</th>
                      <th>{t('completed') || 'مكتملة'}</th>
                      <th>{t('pending') || 'معلقة'}</th>
                      <th>{t('canceled') || 'ملغاة'}</th>
                      <th>{t('total') || 'إجمالي'}</th>
                      <th>{t('success_rate') || 'معدل النجاح'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveryStats.map((item, idx) => {
                      const total =
                        item.completed + item.pending + item.canceled;
                      const successRate = Math.round(
                        (item.completed / total) * 100
                      );
                      return (
                        <tr key={idx}>
                          <td>{item.period}</td>
                          <td className="completed">{item.completed}</td>
                          <td className="pending">{item.pending}</td>
                          <td className="canceled">{item.canceled}</td>
                          <td className="center">{total}</td>
                          <td>
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{ width: `${successRate}%` }}
                              ></div>
                              <span className="progress-text">
                                {successRate}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 💳 التاب الرابع - الأرباح */}
          {activeTab === 'earnings' && (
            <div className="reports-panel active">
              <div className="earnings-grid">
                {earningsData.map((item, idx) => (
                  <div key={idx} className="earnings-card">
                    <div className="earnings-header">
                      <h4>{item.category}</h4>
                      <span className="earnings-percentage">
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="earnings-amount">
                      {item.amount.toLocaleString()} د.ج
                    </div>
                    <div className="earnings-bar">
                      <div
                        className="earnings-fill"
                        style={{ width: `${item.percentage * 10}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="earnings-summary">
                <div className="summary-card">
                  <h3>💰 {t('earnings_summary') || 'ملخص الأرباح'}</h3>
                  <div className="summary-items">
                    <div className="summary-item">
                      <span>{t('gross_earnings') || 'الأرباح الإجمالية'}:</span>
                      <span className="amount">450,000 د.ج</span>
                    </div>
                    <div className="summary-item">
                      <span>{t('fees_deducted') || 'الرسوم المحتسبة'}:</span>
                      <span className="amount negative">22,500 د.ج</span>
                    </div>
                    <div className="summary-item">
                      <span>{t('incentives') || 'الحوافز والمكافآت'}:</span>
                      <span className="amount positive">50,000 د.ج</span>
                    </div>
                    <div className="summary-item total">
                      <span>{t('net_earnings') || 'صافي الأرباح'}</span>
                      <span className="amount">477,500 د.ج</span>
                    </div>
                  </div>
                </div>

                <div className="summary-card">
                  <h3>📅 {t('payment_schedule') || 'جدول الدفع'}</h3>
                  <div className="payment-info">
                    <p>
                      <strong>{t('last_payment') || 'آخر دفعة'}</strong>: 15
                      يناير 2024
                    </p>
                    <p>
                      <strong>{t('next_payment') || 'الدفعة القادمة'}</strong>:
                      15 فبراير 2024
                    </p>
                    <p>
                      <strong>{t('payment_method') || 'طريقة الدفع'}</strong>:
                      تحويل بنكي
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 📋 التاب الخامس - التفاصيل */}
          {activeTab === 'details' && (
            <div className="reports-panel active">
              <div className="table-section">
                <h3>📋 {t('recent_orders') || 'آخر الطلبات'}</h3>
                <table className="reports-table detailed-table">
                  <thead>
                    <tr>
                      <th>{t('order_id') || 'رقم الطلب'}</th>
                      <th>{t('date') || 'التاريخ'}</th>
                      <th>{t('amount') || 'المبلغ'}</th>
                      <th>{t('distance') || 'المسافة'}</th>
                      <th>{t('status') || 'الحالة'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order, idx) => (
                      <tr key={idx}>
                        <td className="order-id">{order.id}</td>
                        <td>{order.date}</td>
                        <td className="amount">
                          {order.amount.toLocaleString()} د.ج
                        </td>
                        <td>{order.distance} كم</td>
                        <td>
                          <span className={`status-badge ${order.status}`}>
                            ✅ {t('completed') || 'مكتمل'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
