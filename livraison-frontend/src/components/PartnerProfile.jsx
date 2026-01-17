import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * 🆕 مكون الملف الشخصي للشريك
 * تصميم احترافي مع معلومات شاملة والقدرة على التعديل
 */
const PartnerProfile = ({ user, onLogout, onUpdateProfile }) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });

  const handleEditChange = e => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleSaveProfile = async () => {
    if (onUpdateProfile) {
      await onUpdateProfile(editData);
    }
    setIsEditing(false);
  };

  const stats = [
    {
      label: '📦 الطلبات',
      value: user?.totalOrders || 0,
      color: '#3b82f6',
    },
    {
      label: '✅ المكتملة',
      value: user?.completedOrders || 0,
      color: '#22c55e',
    },
    {
      label: '💰 الأرباح',
      value: `${user?.earnings || 0} د.ج`,
      color: '#f59e0b',
    },
    {
      label: '⭐ التقييم',
      value: user?.rating || '0.0',
      color: '#ef4444',
    },
  ];

  return (
    <div className="partner-profile-container">
      {/* خلفية ديناميكية */}
      <div className="profile-background">
        <div className="profile-shape profile-shape-1"></div>
        <div className="profile-shape profile-shape-2"></div>
        <div className="profile-shape profile-shape-3"></div>
      </div>

      <div className="profile-content">
        {/* رأس الملف الشخصي */}
        <div className="profile-header">
          {/* الصورة الشخصية */}
          <div className="profile-avatar-section">
            <div className="avatar-container">
              <img
                src={
                  editData.avatar ||
                  'https://via.placeholder.com/150/4a5568/ffffff?text=User'
                }
                alt="الملف الشخصي"
                className="profile-avatar"
              />
              {isEditing && (
                <label className="avatar-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = event => {
                          setEditData({
                            ...editData,
                            avatar: event.target?.result,
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <span className="upload-icon">📷</span>
                </label>
              )}
              <div className="status-badge">✅ نشط</div>
            </div>

            {/* المعلومات الأساسية */}
            <div className="profile-info">
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editData.name}
                  onChange={handleEditChange}
                  className="profile-input profile-name-input"
                  placeholder="اسم الشريك"
                />
              ) : (
                <h1 className="profile-name">{editData.name || 'الشريك'}</h1>
              )}
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={editData.email}
                  onChange={handleEditChange}
                  className="profile-input"
                  placeholder="البريد الإلكتروني"
                />
              ) : (
                <p className="profile-email">{editData.email}</p>
              )}
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div className="profile-actions">
            {!isEditing ? (
              <>
                <button
                  className="profile-btn primary"
                  onClick={() => setIsEditing(true)}
                >
                  ✏️ {t('edit')}
                </button>
                <button className="profile-btn secondary" onClick={onLogout}>
                  🚪 {t('logout')}
                </button>
              </>
            ) : (
              <>
                <button
                  className="profile-btn primary"
                  onClick={handleSaveProfile}
                >
                  💾 {t('save')}
                </button>
                <button
                  className="profile-btn secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setEditData({
                      name: user?.name || '',
                      email: user?.email || '',
                      phone: user?.phone || '',
                      bio: user?.bio || '',
                      avatar: user?.avatar || '',
                    });
                  }}
                >
                  ❌ {t('cancel')}
                </button>
              </>
            )}
          </div>
        </div>

        {/* الإحصائيات */}
        <div className="profile-stats">
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-box">
              <div className="stat-value" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* المعلومات التفصيلية */}
        <div className="profile-details-section">
          <h2 className="section-title">📋 المعلومات الشخصية</h2>

          <div className="details-grid">
            {/* رقم الهاتف */}
            <div className="detail-card">
              <div className="detail-icon">📱</div>
              <div className="detail-content">
                <label className="detail-label">رقم الهاتف</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={editData.phone}
                    onChange={handleEditChange}
                    className="profile-input"
                    placeholder="رقم الهاتف"
                  />
                ) : (
                  <p className="detail-value">
                    {editData.phone || 'لم يتم تحديده'}
                  </p>
                )}
              </div>
            </div>

            {/* البريد الإلكتروني */}
            <div className="detail-card">
              <div className="detail-icon">📧</div>
              <div className="detail-content">
                <label className="detail-label">البريد الإلكتروني</label>
                <p className="detail-value">{editData.email}</p>
              </div>
            </div>

            {/* تاريخ الانضمام */}
            <div className="detail-card">
              <div className="detail-icon">📅</div>
              <div className="detail-content">
                <label className="detail-label">تاريخ الانضمام</label>
                <p className="detail-value">{user?.joinDate || '2024-01-15'}</p>
              </div>
            </div>

            {/* حالة الحساب */}
            <div className="detail-card">
              <div className="detail-icon">✅</div>
              <div className="detail-content">
                <label className="detail-label">حالة الحساب</label>
                <p className="detail-value">
                  <span className="status-active">نشط</span>
                </p>
              </div>
            </div>
          </div>

          {/* السيرة الذاتية */}
          <div className="bio-section">
            <h3 className="bio-title">💬 نبذة عني</h3>
            {isEditing ? (
              <textarea
                name="bio"
                value={editData.bio}
                onChange={handleEditChange}
                className="profile-textarea"
                placeholder="اكتب نبذة عنك..."
                rows="4"
              />
            ) : (
              <p className="bio-text">
                {editData.bio || 'لم تضف نبذة عنك بعد'}
              </p>
            )}
          </div>
        </div>

        {/* قسم الإعدادات والتفضيلات */}
        <div className="profile-settings-section">
          <h2 className="section-title">⚙️ الإعدادات والتفضيلات</h2>

          <div className="settings-list">
            {/* إشعارات */}
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-icon">🔔</div>
                <div className="setting-text">
                  <p className="setting-name">الإشعارات</p>
                  <p className="setting-description">
                    استقبل إخطارات عن الطلبات الجديدة
                  </p>
                </div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>

            {/* البريد الإلكتروني */}
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-icon">📧</div>
                <div className="setting-text">
                  <p className="setting-name">رسائل البريد الإلكتروني</p>
                  <p className="setting-description">
                    استقبل تقارير أسبوعية وشهرية
                  </p>
                </div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>

            {/* الخصوصية */}
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-icon">🔒</div>
                <div className="setting-text">
                  <p className="setting-name">الخصوصية</p>
                  <p className="setting-description">تحكم في من يرى معلوماتك</p>
                </div>
              </div>
              <button className="setting-link">تكوين →</button>
            </div>

            {/* الأمان */}
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-icon">🔐</div>
                <div className="setting-text">
                  <p className="setting-name">الأمان</p>
                  <p className="setting-description">
                    غيّر كلمة المرور والمصادقة الثنائية
                  </p>
                </div>
              </div>
              <button className="setting-link">تحديث →</button>
            </div>
          </div>
        </div>

        {/* الأنشطة الأخيرة */}
        <div className="profile-activity-section">
          <h2 className="section-title">📊 الأنشطة الأخيرة</h2>

          <div className="activity-timeline">
            <div className="activity-item">
              <div className="activity-dot"></div>
              <div className="activity-content">
                <p className="activity-title">تم إكمال طلب جديد</p>
                <p className="activity-time">منذ ساعة</p>
              </div>
            </div>

            <div className="activity-item">
              <div className="activity-dot"></div>
              <div className="activity-content">
                <p className="activity-title">تم استقبال دفعة جديدة</p>
                <p className="activity-time">منذ يومين</p>
              </div>
            </div>

            <div className="activity-item">
              <div className="activity-dot"></div>
              <div className="activity-content">
                <p className="activity-title">تم تحديث معلومات الملف الشخصي</p>
                <p className="activity-time">منذ أسبوع</p>
              </div>
            </div>
          </div>
        </div>

        {/* منطقة الخطر */}
        <div className="profile-danger-zone">
          <h2 className="section-title danger">⚠️ منطقة الخطر</h2>
          <div className="danger-content">
            <p>تنبيه! هذه الإجراءات لا يمكن التراجع عنها</p>
            <button className="danger-btn">حذف الحساب نهائياً</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerProfile;
