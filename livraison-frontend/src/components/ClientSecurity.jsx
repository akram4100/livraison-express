import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const ClientSecurity = ({ user = {} }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [activeTab, setActiveTab] = useState('password');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = e => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = e => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('كلمات المرور غير متطابقة');
      return;
    }
    console.log('تم تغيير كلمة المرور');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    alert('تم تغيير كلمة المرور بنجاح');
  };

  return (
    <div className={`client-security-container ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Background */}
      <div className="security-background">
        <div className="security-shape-1"></div>
        <div className="security-shape-2"></div>
        <div className="security-shape-3"></div>
      </div>

      {/* Main Content */}
      <div className="security-content">
        {/* Header */}
        <div className="security-header">
          <div className="security-title">
            <h2>🔒 {t('security')}</h2>
            <p>إدارة إعدادات الأمان والخصوصية</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="security-tabs">
          <button
            className={`security-tab ${
              activeTab === 'password' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('password')}
          >
            🔐 تغيير كلمة المرور
          </button>
          <button
            className={`security-tab ${
              activeTab === 'sessions' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('sessions')}
          >
            📱 الجلسات النشطة
          </button>
          <button
            className={`security-tab ${
              activeTab === 'privacy' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('privacy')}
          >
            🛡️ الخصوصية
          </button>
        </div>

        {/* Tab Content */}
        <div className="security-panels">
          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="security-panel active">
              <div className="panel-content">
                <h3>🔐 تغيير كلمة المرور</h3>
                <p className="panel-description">
                  اختر كلمة مرور قوية لحماية حسابك
                </p>

                <form onSubmit={handlePasswordSubmit} className="password-form">
                  <div className="form-group">
                    <label>كلمة المرور الحالية</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="أدخل كلمة المرور الحالية"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>كلمة المرور الجديدة</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="أدخل كلمة المرور الجديدة"
                      required
                    />
                    <small>
                      حد أدنى 8 أحرف، يجب أن تحتوي على أحرف وأرقام ورموز
                    </small>
                  </div>

                  <div className="form-group">
                    <label>تأكيد كلمة المرور</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="أعد إدخال كلمة المرور الجديدة"
                      required
                    />
                  </div>

                  <button type="submit" className="btn-update">
                    تحديث كلمة المرور
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="security-panel active">
              <div className="panel-content">
                <h3>📱 الجلسات النشطة</h3>
                <p className="panel-description">
                  إدارة الأجهزة المرتبطة بحسابك
                </p>

                <div className="sessions-list">
                  <div className="session-card active">
                    <div className="session-info">
                      <div className="session-icon">💻</div>
                      <div className="session-details">
                        <h4>Windows 10</h4>
                        <p>Chrome - الجزائر</p>
                        <small>الجهاز الحالي</small>
                      </div>
                    </div>
                    <span className="session-status">النجلسة الحالية</span>
                  </div>

                  <div className="session-card">
                    <div className="session-info">
                      <div className="session-icon">📱</div>
                      <div className="session-details">
                        <h4>iPhone 12</h4>
                        <p>Safari - الجزائر</p>
                        <small>آخر تسجيل دخول: أمس</small>
                      </div>
                    </div>
                    <button className="btn-revoke">إلغاء</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="security-panel active">
              <div className="panel-content">
                <h3>🛡️ إعدادات الخصوصية</h3>
                <p className="panel-description">
                  التحكم في كيفية استخدام بيانات حسابك
                </p>

                <div className="privacy-options">
                  <div className="privacy-item">
                    <div className="privacy-info">
                      <h4>تلقي الإشعارات</h4>
                      <p>احصل على تنبيهات حول طلباتك والتحديثات المهمة</p>
                    </div>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        id="notifications"
                        defaultChecked
                      />
                      <label htmlFor="notifications"></label>
                    </div>
                  </div>

                  <div className="privacy-item">
                    <div className="privacy-info">
                      <h4>مشاركة البيانات</h4>
                      <p>السماح للشركاء بمعرفة موقعك لتحسين الخدمة</p>
                    </div>
                    <div className="toggle-switch">
                      <input type="checkbox" id="data-sharing" defaultChecked />
                      <label htmlFor="data-sharing"></label>
                    </div>
                  </div>

                  <div className="privacy-item">
                    <div className="privacy-info">
                      <h4>الاتصالات التسويقية</h4>
                      <p>تلقي عروض خاصة وتحديثات عن الخدمات الجديدة</p>
                    </div>
                    <div className="toggle-switch">
                      <input type="checkbox" id="marketing" />
                      <label htmlFor="marketing"></label>
                    </div>
                  </div>
                </div>

                <button className="btn-save-privacy">💾 حفظ الإعدادات</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientSecurity;
