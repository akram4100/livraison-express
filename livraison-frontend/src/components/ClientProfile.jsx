import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const ClientProfile = ({ user = {} }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'أحمد',
    lastName: 'محمد',
    email: user?.email || 'client@example.com',
    phone: '+213 123 456 789',
    address: 'الجزائر العاصمة - الجزائر',
    city: 'الجزائر',
  });

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log('تم حفظ البيانات:', formData);
    setEditMode(false);
  };

  return (
    <div className={`client-profile-container ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Background Shapes */}
      <div className="profile-background">
        <div className="profile-shape-1"></div>
        <div className="profile-shape-2"></div>
        <div className="profile-shape-3"></div>
      </div>

      {/* Main Content */}
      <div className="profile-content">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-title">
            <h2>👤 {t('profile')}</h2>
            <p>{t('manage_your_profile')}</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="profile-card-main">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {user?.nom ? user.nom.charAt(0).toUpperCase() : 'C'}
            </div>
            <div className="profile-avatar-info">
              <h3>
                {formData.firstName} {formData.lastName}
              </h3>
              <p>{formData.email}</p>
            </div>
          </div>

          <div className="profile-actions">
            <button
              className="btn-edit-profile"
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? '❌ إلغاء' : '✏️ تعديل الملف'}
            </button>
          </div>
        </div>

        {/* Profile Form */}
        {!editMode ? (
          <div className="profile-info-grid">
            <div className="info-card">
              <label>{t('full_name')}</label>
              <p>
                {formData.firstName} {formData.lastName}
              </p>
            </div>
            <div className="info-card">
              <label>{t('email')}</label>
              <p>{formData.email}</p>
            </div>
            <div className="info-card">
              <label>{t('phone')}</label>
              <p>{formData.phone}</p>
            </div>
            <div className="info-card">
              <label>{t('address')}</label>
              <p>{formData.address}</p>
            </div>
          </div>
        ) : (
          <form className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label>الاسم الأول</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="أدخل الاسم الأول"
                />
              </div>
              <div className="form-group">
                <label>الاسم الأخير</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="أدخل الاسم الأخير"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('email')}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="أدخل البريد الإلكتروني"
                />
              </div>
              <div className="form-group">
                <label>{t('phone')}</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="أدخل رقم الهاتف"
                />
              </div>
            </div>

            <div className="form-group full">
              <label>{t('address')}</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="أدخل العنوان الكامل"
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-save" onClick={handleSave}>
                💾 حفظ التغييرات
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setEditMode(false)}
              >
                إلغاء
              </button>
            </div>
          </form>
        )}

        {/* Additional Info */}
        <div className="profile-additional">
          <div className="additional-card">
            <h3>📋 معلومات الحساب</h3>
            <div className="info-list">
              <div className="info-item">
                <span>نوع الحساب:</span>
                <strong>عميل</strong>
              </div>
              <div className="info-item">
                <span>عضو منذ:</span>
                <strong>يناير 2024</strong>
              </div>
              <div className="info-item">
                <span>حالة الحساب:</span>
                <strong className="status-active">✅ نشط</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;
