import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const PartnerSupport = ({ user = {} }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // State Management
  const [activeTab, setActiveTab] = useState('tickets');
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'technical',
    priority: 'medium',
    description: '',
  });

  // Support Tickets Data
  const [tickets] = useState([
    {
      id: 'TKT-2024-001',
      title: 'مشكلة في التطبيق',
      category: 'technical',
      priority: 'high',
      status: 'open',
      date: '2024-01-15',
      response: false,
    },
    {
      id: 'TKT-2024-002',
      title: 'استفسار عن الدفع',
      category: 'billing',
      priority: 'medium',
      status: 'open',
      date: '2024-01-14',
      response: true,
    },
    {
      id: 'TKT-2024-003',
      title: 'طلب تفعيل الحساب',
      category: 'account',
      priority: 'low',
      status: 'resolved',
      date: '2024-01-10',
      response: true,
    },
    {
      id: 'TKT-2024-004',
      title: 'مشكلة في الخريطة',
      category: 'technical',
      priority: 'high',
      status: 'open',
      date: '2024-01-12',
      response: false,
    },
    {
      id: 'TKT-2024-005',
      title: 'استفسار عن الأرباح',
      category: 'billing',
      priority: 'medium',
      status: 'resolved',
      date: '2024-01-08',
      response: true,
    },
  ]);

  // FAQ Data
  const [faqs] = useState([
    {
      id: 1,
      question: 'كيفية البدء مع تطبيق التوصيل؟',
      answer:
        'انقر على زر "البدء الآن" وأكمل خطوات التسجيل. ستحتاج إلى التحقق من بيانات هويتك وتحميل صورة.',
      category: 'getting-started',
    },
    {
      id: 2,
      question: 'كيف يتم حساب الأرباح؟',
      answer:
        'يتم حساب الأرباح بناءً على عدد التوصيلات الناجحة ومسافة التوصيل. يمكنك مشاهدة التفاصيل في قسم الأرباح.',
      category: 'billing',
    },
    {
      id: 3,
      question: 'ما هي طرق الدفع المتاحة؟',
      answer:
        'نحن ندعم التحويل البنكي والمحفظة الرقمية والبطاقات الائتمانية. يمكنك اختيار الطريقة المفضلة من إعداداتك.',
      category: 'billing',
    },
    {
      id: 4,
      question: 'كيف أتواصل مع فريق الدعم؟',
      answer:
        'يمكنك فتح تذكرة دعم هنا أو التواصل معنا عبر البريد الإلكتروني أو الهاتف. متوسط وقت الرد 24 ساعة.',
      category: 'support',
    },
    {
      id: 5,
      question: 'هل هناك رسوم للاشتراك؟',
      answer: 'لا، التطبيق مجاني تماماً. نأخذ نسبة صغيرة من كل توصيلة ناجحة.',
      category: 'billing',
    },
    {
      id: 6,
      question: 'كيفية تحسين معدل الأرباح؟',
      answer:
        'حافظ على تقييم عالي، قبل الطلبات في الوقت المحدد، والتزم بتعليمات السلامة. كلما زاد أدائك، زادت الحوافز.',
      category: 'getting-started',
    },
  ]);

  // Contact Information
  const [contactInfo] = useState([
    {
      type: 'email',
      label: 'البريد الإلكتروني',
      value: 'support@livraison.com',
      icon: '📧',
    },
    {
      type: 'phone',
      label: 'رقم الهاتف',
      value: '+213 123 456 789',
      icon: '📞',
    },
    {
      type: 'whatsapp',
      label: 'WhatsApp',
      value: '+213 123 456 789',
      icon: '💬',
    },
    {
      type: 'location',
      label: 'الموقع',
      value: 'الجزائر - الجزائر العاصمة',
      icon: '📍',
    },
  ]);

  // Working Hours
  const [workingHours] = useState([
    { day: 'السبت - الخميس', hours: '09:00 - 20:00' },
    { day: 'الجمعة', hours: '14:00 - 20:00' },
  ]);

  // Form Handlers
  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitTicket = e => {
    e.preventDefault();
    console.log('تم إرسال التذكرة:', formData);
    setFormData({
      title: '',
      category: 'technical',
      priority: 'medium',
      description: '',
    });
    setShowNewTicketForm(false);
    alert('تم إرسال التذكرة بنجاح!');
  };

  // Helper Functions
  const getStatusBadge = status => {
    const badges = {
      open: { color: '#f59e0b', label: t('open') },
      pending: { color: '#3b82f6', label: t('pending') },
      resolved: { color: '#22c55e', label: t('resolved') },
      closed: { color: '#6b7280', label: t('closed') },
    };
    return badges[status] || badges.open;
  };

  const getPriorityBadge = priority => {
    const badges = {
      high: { color: '#ef4444', label: t('high') },
      medium: { color: '#f59e0b', label: t('medium') },
      low: { color: '#22c55e', label: t('low') },
    };
    return badges[priority] || badges.medium;
  };

  const getCategoryLabel = category => {
    const labels = {
      technical: t('technical'),
      billing: t('billing'),
      account: t('account'),
      other: t('other'),
    };
    return labels[category] || category;
  };

  return (
    <div className={`partner-support-container ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Animated Background */}
      <div className="support-background">
        <div className="support-shape-1"></div>
        <div className="support-shape-2"></div>
        <div className="support-shape-3"></div>
      </div>

      {/* Main Content */}
      <div className="support-content">
        {/* Header */}
        <div className="support-header">
          <div className="header-title">
            <h2>🆘 {t('support')}</h2>
            <p>{t('support_subtitle')}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="support-tabs">
          <button
            className={`support-tab ${activeTab === 'tickets' ? 'active' : ''}`}
            onClick={() => setActiveTab('tickets')}
          >
            🎫 {t('support_tickets')}
          </button>
          <button
            className={`support-tab ${activeTab === 'faq' ? 'active' : ''}`}
            onClick={() => setActiveTab('faq')}
          >
            ❓ {t('faq')}
          </button>
          <button
            className={`support-tab ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            📞 {t('contact_us')}
          </button>
        </div>

        {/* Tab Panels */}
        <div className="support-panels">
          {/* TICKETS TAB */}
          {activeTab === 'tickets' && (
            <div className="support-panel active">
              {/* New Ticket Button */}
              <div className="tickets-header">
                <button
                  className="btn-new-ticket"
                  onClick={() => setShowNewTicketForm(!showNewTicketForm)}
                >
                  ➕ {t('new_ticket')}
                </button>
              </div>

              {/* New Ticket Form */}
              {showNewTicketForm && (
                <div className="ticket-form-wrapper">
                  <form onSubmit={handleSubmitTicket} className="ticket-form">
                    <h3>{t('create_new_ticket')}</h3>

                    <div className="form-group">
                      <label>{t('ticket_title')}</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder={t('enter_title')}
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>{t('category')}</label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                        >
                          <option value="technical">{t('technical')}</option>
                          <option value="billing">{t('billing')}</option>
                          <option value="account">{t('account')}</option>
                          <option value="other">{t('other')}</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>{t('priority')}</label>
                        <select
                          name="priority"
                          value={formData.priority}
                          onChange={handleInputChange}
                        >
                          <option value="low">{t('low')}</option>
                          <option value="medium">{t('medium')}</option>
                          <option value="high">{t('high')}</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>{t('description')}</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder={t('describe_issue')}
                        rows="4"
                        required
                      ></textarea>
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="btn-submit">
                        {t('submit_ticket')}
                      </button>
                      <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => setShowNewTicketForm(false)}
                      >
                        {t('cancel')}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Tickets List */}
              <div className="tickets-list">
                {tickets.map((ticket, idx) => (
                  <div key={idx} className="ticket-card">
                    <div className="ticket-header">
                      <div className="ticket-info">
                        <h4>{ticket.id}</h4>
                        <p className="ticket-title">{ticket.title}</p>
                      </div>
                      <div className="ticket-badges">
                        <span
                          className="badge status"
                          style={{
                            backgroundColor: getStatusBadge(ticket.status)
                              .color,
                          }}
                        >
                          {getStatusBadge(ticket.status).label}
                        </span>
                        <span
                          className="badge priority"
                          style={{
                            backgroundColor: getPriorityBadge(ticket.priority)
                              .color,
                          }}
                        >
                          {getPriorityBadge(ticket.priority).label}
                        </span>
                      </div>
                    </div>
                    <div className="ticket-body">
                      <div className="ticket-meta">
                        <span>{getCategoryLabel(ticket.category)}</span>
                        <span>{ticket.date}</span>
                      </div>
                      <div className="ticket-response">
                        {ticket.response ? (
                          <span className="response-yes">
                            ✅ {t('responded')}
                          </span>
                        ) : (
                          <span className="response-no">
                            ⏳ {t('awaiting_response')}
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="btn-view-ticket">
                      {t('view_details')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQ TAB */}
          {activeTab === 'faq' && (
            <div className="support-panel active">
              <div className="faq-container">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="faq-item">
                    <div className="faq-question">
                      <h4>{faq.question}</h4>
                      <span className="faq-icon">+</span>
                    </div>
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CONTACT TAB */}
          {activeTab === 'contact' && (
            <div className="support-panel active">
              {/* Contact Information */}
              <div className="contact-section">
                <h3>{t('contact_information')}</h3>
                <div className="contact-grid">
                  {contactInfo.map((info, idx) => (
                    <div key={idx} className="contact-card">
                      <div className="contact-icon">{info.icon}</div>
                      <div className="contact-details">
                        <h4>{info.label}</h4>
                        <p>{info.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Working Hours */}
              <div className="contact-section">
                <h3>{t('working_hours')}</h3>
                <div className="working-hours">
                  {workingHours.map((schedule, idx) => (
                    <div key={idx} className="hour-item">
                      <span className="day">{schedule.day}</span>
                      <span className="time">{schedule.hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div className="contact-section">
                <h3>{t('quick_links')}</h3>
                <div className="quick-links">
                  <a href="#" className="quick-link">
                    📖 {t('documentation')}
                  </a>
                  <a href="#" className="quick-link">
                    🎓 {t('tutorials')}
                  </a>
                  <a href="#" className="quick-link">
                    💬 {t('community')}
                  </a>
                  <a href="#" className="quick-link">
                    🐛 {t('bug_report')}
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerSupport;
