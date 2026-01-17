import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function PartnerSettings({
  user = {},
  onLogout,
  onUpdateSettings,
}) {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('general');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [settings, setSettings] = useState({
    // الإعدادات العامة
    displayName: user.name || 'الشريك',
    email: user.email || '',
    phone: user.phone || '',
    language: i18n.language || 'ar',
    theme: 'dark',

    // الإشعارات
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    orderNotifications: true,
    paymentNotifications: true,
    newsNotifications: false,

    // الخصوصية والأمان
    twoFactorAuth: false,
    profileVisibility: 'public',
    showPhoneNumber: true,
    showEmail: false,

    // التفضيلات
    darkMode: true,
    compactView: false,
    soundEnabled: true,
    vibrationEnabled: true,
  });

  const [changedSettings, setChangedSettings] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // 🎯 دالة تحديث الإعدادات
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
    setChangedSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // 🎯 دالة حفظ الإعدادات
  const handleSaveSettings = async () => {
    try {
      // محاكاة حفظ الإعدادات
      console.log('تحديث الإعدادات:', changedSettings);

      if (onUpdateSettings) {
        await onUpdateSettings(changedSettings);
      }

      setSuccessMessage('✅ تم حفظ الإعدادات بنجاح!');
      setChangedSettings({});

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setErrorMessage('❌ حدث خطأ أثناء حفظ الإعدادات');
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    }
  };

  // 🎯 دالة تصدير البيانات
  const handleExportData = () => {
    const userData = {
      ...user,
      settings,
      exportDate: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `partner-data-${new Date().getTime()}.json`;
    link.click();

    setSuccessMessage('✅ تم تصدير البيانات بنجاح!');
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // 🎯 دالة حذف الحساب
  const handleDeleteAccount = async () => {
    try {
      console.log('حذف الحساب');
      setSuccessMessage('✅ تم حذف الحساب بنجاح!');

      setTimeout(() => {
        if (onLogout) {
          onLogout();
        }
      }, 2000);
    } catch (error) {
      setErrorMessage('❌ حدث خطأ أثناء حذف الحساب');
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    }
  };

  return (
    <div className="partner-settings-container">
      {/* 🎨 الخلفية الديناميكية */}
      <div className="settings-background">
        <div className="settings-shape settings-shape-1"></div>
        <div className="settings-shape settings-shape-2"></div>
        <div className="settings-shape settings-shape-3"></div>
      </div>

      {/* 📱 محتوى الإعدادات */}
      <div className="settings-content">
        {/* 🎯 رسائل النجاح والخطأ */}
        {successMessage && (
          <div className="message-banner success-banner">
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="message-banner error-banner">
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 📋 رأس الإعدادات */}
        <div className="settings-header">
          <h2>⚙️ {t('settings') || 'الإعدادات'}</h2>
          <p>{t('manage_your_settings') || 'إدارة إعدادات حسابك والتفضيلات'}</p>
        </div>

        {/* 🔖 التابات الرئيسية */}
        <div className="settings-tabs">
          <button
            className={`settings-tab ${
              activeTab === 'general' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('general')}
          >
            ⚡ عام
          </button>
          <button
            className={`settings-tab ${
              activeTab === 'notifications' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('notifications')}
          >
            🔔 الإشعارات
          </button>
          <button
            className={`settings-tab ${
              activeTab === 'privacy' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('privacy')}
          >
            🔒 الخصوصية
          </button>
          <button
            className={`settings-tab ${
              activeTab === 'preferences' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('preferences')}
          >
            🎨 التفضيلات
          </button>
          <button
            className={`settings-tab ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            💾 البيانات
          </button>
        </div>

        {/* 📄 محتوى التابات */}
        <div className="settings-panels">
          {/* ⚡ القسم الأول - الإعدادات العامة */}
          {activeTab === 'general' && (
            <div className="settings-panel active">
              <div className="settings-section">
                <h3>📋 البيانات الأساسية</h3>

                <div className="settings-group">
                  <label>📝 اسم العرض</label>
                  <input
                    type="text"
                    className="settings-input"
                    value={settings.displayName}
                    onChange={e =>
                      handleSettingChange('displayName', e.target.value)
                    }
                    placeholder="أدخل اسمك"
                  />
                </div>

                <div className="settings-group">
                  <label>📧 البريد الإلكتروني</label>
                  <input
                    type="email"
                    className="settings-input"
                    value={settings.email}
                    onChange={e => handleSettingChange('email', e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>

                <div className="settings-group">
                  <label>📱 رقم الهاتف</label>
                  <input
                    type="tel"
                    className="settings-input"
                    value={settings.phone}
                    onChange={e => handleSettingChange('phone', e.target.value)}
                    placeholder="+213 55 123 4567"
                  />
                </div>
              </div>

              <div className="settings-section">
                <h3>🌍 اللغة والمنطقة</h3>

                <div className="settings-group">
                  <label>🌐 اللغة المفضلة</label>
                  <select
                    className="settings-select"
                    value={settings.language}
                    onChange={e =>
                      handleSettingChange('language', e.target.value)
                    }
                  >
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                  </select>
                </div>

                <div className="settings-info">
                  ℹ️ ستتم إعادة تحميل اللغة عند الحفظ
                </div>
              </div>
            </div>
          )}

          {/* 🔔 القسم الثاني - الإشعارات */}
          {activeTab === 'notifications' && (
            <div className="settings-panel active">
              <div className="settings-section">
                <h3>📨 قنوات الإشعارات</h3>

                <div className="settings-toggle-group">
                  <div className="toggle-item">
                    <div className="toggle-info">
                      <h4>📧 إشعارات البريد الإلكتروني</h4>
                      <p>استقبل التحديثات عبر البريد الإلكتروني</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={e =>
                          handleSettingChange(
                            'emailNotifications',
                            e.target.checked
                          )
                        }
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="toggle-item">
                    <div className="toggle-info">
                      <h4>📱 رسائل SMS</h4>
                      <p>استقبل رسائل نصية قصيرة</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.smsNotifications}
                        onChange={e =>
                          handleSettingChange(
                            'smsNotifications',
                            e.target.checked
                          )
                        }
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="toggle-item">
                    <div className="toggle-info">
                      <h4>🔔 إشعارات الويب</h4>
                      <p>استقبل إشعارات فورية في الموقع</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.pushNotifications}
                        onChange={e =>
                          handleSettingChange(
                            'pushNotifications',
                            e.target.checked
                          )
                        }
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h3>📬 أنواع الإشعارات</h3>

                <div className="settings-toggle-group">
                  <div className="toggle-item">
                    <div className="toggle-info">
                      <h4>📦 إشعارات الطلبات</h4>
                      <p>تنبيهات حول طلبات جديدة وتحديثات</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.orderNotifications}
                        onChange={e =>
                          handleSettingChange(
                            'orderNotifications',
                            e.target.checked
                          )
                        }
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="toggle-item">
                    <div className="toggle-info">
                      <h4>💰 إشعارات الدفع</h4>
                      <p>تنبيهات حول العمليات المالية</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.paymentNotifications}
                        onChange={e =>
                          handleSettingChange(
                            'paymentNotifications',
                            e.target.checked
                          )
                        }
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="toggle-item">
                    <div className="toggle-info">
                      <h4>📰 أخبار وعروض</h4>
                      <p>ابقَ على اطلاع بأحدث العروض</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.newsNotifications}
                        onChange={e =>
                          handleSettingChange(
                            'newsNotifications',
                            e.target.checked
                          )
                        }
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 🔒 القسم الثالث - الخصوصية والأمان */}
          {activeTab === 'privacy' && (
            <div className="settings-panel active">
              <div className="settings-section">
                <h3>🔐 الأمان</h3>

                <div className="settings-toggle-group">
                  <div className="toggle-item">
                    <div className="toggle-info">
                      <h4>🔑 المصادقة الثنائية</h4>
                      <p>أضف طبقة إضافية من الأمان لحسابك</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.twoFactorAuth}
                        onChange={e =>
                          handleSettingChange('twoFactorAuth', e.target.checked)
                        }
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <button className="settings-link-btn">
                  🔄 تغيير كلمة المرور
                </button>
              </div>

              <div className="settings-section">
                <h3>👁️ الخصوصية</h3>

                <div className="settings-group">
                  <label>🌐 رؤية الملف الشخصي</label>
                  <select
                    className="settings-select"
                    value={settings.profileVisibility}
                    onChange={e =>
                      handleSettingChange('profileVisibility', e.target.value)
                    }
                  >
                    <option value="public">🌍 عام</option>
                    <option value="private">🔒 خاص</option>
                    <option value="friends">👥 الأصدقاء فقط</option>
                  </select>
                </div>

                <div className="settings-toggle-group">
                  <div className="toggle-item">
                    <div className="toggle-info">
                      <h4>📱 إظهار رقم الهاتف</h4>
                      <p>دع الآخرين يرى رقم هاتفك</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.showPhoneNumber}
                        onChange={e =>
                          handleSettingChange(
                            'showPhoneNumber',
                            e.target.checked
                          )
                        }
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="toggle-item">
                    <div className="toggle-info">
                      <h4>📧 إظهار البريد الإلكتروني</h4>
                      <p>دع الآخرين يرى بريدك الإلكتروني</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.showEmail}
                        onChange={e =>
                          handleSettingChange('showEmail', e.target.checked)
                        }
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h3>⚙️ الجلسات النشطة</h3>
                <button className="settings-link-btn danger">
                  🚪 تسجيل الخروج من كل الأجهزة
                </button>
              </div>
            </div>
          )}

          {/* 🎨 القسم الرابع - التفضيلات */}
          {activeTab === 'preferences' && (
            <div className="settings-panel active">
              <div className="settings-section">
                <h3>🎨 المظهر</h3>

                <div className="settings-toggle-group">
                  <div className="toggle-item">
                    <div className="toggle-info">
                      <h4>🌙 الوضع الليلي</h4>
                      <p>تفعيل الوضع الليلي الممل للعينين</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.darkMode}
                        onChange={e =>
                          handleSettingChange('darkMode', e.target.checked)
                        }
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="toggle-item">
                    <div className="toggle-info">
                      <h4>📦 العرض المضغوط</h4>
                      <p>عرض أكثر كثافة للعناصر</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.compactView}
                        onChange={e =>
                          handleSettingChange('compactView', e.target.checked)
                        }
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h3>🔊 الصوت والاهتزاز</h3>

                <div className="settings-toggle-group">
                  <div className="toggle-item">
                    <div className="toggle-info">
                      <h4>🔊 الأصوات</h4>
                      <p>تشغيل أصوات الإخطارات</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.soundEnabled}
                        onChange={e =>
                          handleSettingChange('soundEnabled', e.target.checked)
                        }
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="toggle-item">
                    <div className="toggle-info">
                      <h4>📳 الاهتزاز</h4>
                      <p>اهتزاز الهاتف عند الإخطارات</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.vibrationEnabled}
                        onChange={e =>
                          handleSettingChange(
                            'vibrationEnabled',
                            e.target.checked
                          )
                        }
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h3>ℹ️ معلومات الحساب</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">نوع الحساب:</span>
                    <span className="info-value">🤝 شريك توصيل</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">حالة الحساب:</span>
                    <span className="info-value" style={{ color: '#22c55e' }}>
                      ✅ نشط
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">تاريخ الانضمام:</span>
                    <span className="info-value">
                      {new Date().toLocaleDateString('ar-DZ')}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">آخر تحديث للملف:</span>
                    <span className="info-value">
                      {new Date().toLocaleDateString('ar-DZ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 💾 القسم الخامس - البيانات والخصوصية */}
          {activeTab === 'data' && (
            <div className="settings-panel active">
              <div className="settings-section">
                <h3>📊 تصدير البيانات</h3>
                <p className="section-description">
                  قم بتحميل نسخة من بيانات حسابك على جهازك
                </p>
                <button
                  className="settings-action-btn primary"
                  onClick={handleExportData}
                >
                  💾 تصدير البيانات
                </button>
              </div>

              <div className="settings-section">
                <h3>📋 سجل الأنشطة</h3>
                <div className="activity-log">
                  <div className="log-item">
                    <span className="log-time">اليوم الساعة 10:30 AM</span>
                    <span className="log-action">
                      تسجيل دخول من Firefox على Windows
                    </span>
                  </div>
                  <div className="log-item">
                    <span className="log-time">أمس الساعة 3:15 PM</span>
                    <span className="log-action">
                      تحديث معلومات الملف الشخصي
                    </span>
                  </div>
                  <div className="log-item">
                    <span className="log-time">منذ يومين الساعة 8:00 AM</span>
                    <span className="log-action">تغيير الإعدادات</span>
                  </div>
                  <div className="log-item">
                    <span className="log-time">منذ أسبوع الساعة 2:45 PM</span>
                    <span className="log-action">
                      تسجيل دخول من Chrome على Android
                    </span>
                  </div>
                </div>
              </div>

              <div className="settings-section danger-zone">
                <h3>⚠️ منطقة الخطر</h3>
                <p className="danger-description">
                  هذه الإجراءات لا يمكن التراجع عنها. يرجى توخي الحذر.
                </p>

                <div className="danger-actions">
                  <button
                    className="settings-action-btn danger"
                    onClick={() => setShowConfirmDelete(true)}
                  >
                    🗑️ حذف الحساب نهائياً
                  </button>
                </div>

                {/* ✅ نافذة تأكيد الحذف */}
                {showConfirmDelete && (
                  <div className="delete-confirmation">
                    <div className="confirmation-header">
                      <h4>⚠️ تأكيد حذف الحساب</h4>
                      <p>هذا الإجراء سيحذف حسابك وجميع بيانات للأبد</p>
                    </div>
                    <div className="confirmation-actions">
                      <button
                        className="confirm-btn danger"
                        onClick={handleDeleteAccount}
                      >
                        نعم، احذف حسابي
                      </button>
                      <button
                        className="confirm-btn secondary"
                        onClick={() => setShowConfirmDelete(false)}
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 💾 أزرار الحفظ */}
        {Object.keys(changedSettings).length > 0 && (
          <div className="settings-footer">
            <button className="save-btn primary" onClick={handleSaveSettings}>
              💾 حفظ التغييرات
            </button>
            <button
              className="save-btn secondary"
              onClick={() => {
                setChangedSettings({});
              }}
            >
              ❌ إلغاء
            </button>
            <span className="unsaved-indicator">
              ⏱️ لديك تغييرات غير محفوظة
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
