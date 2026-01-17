import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * 🆕 مكون إدارة منتجات المتجر المعاد تصميمه بالكامل
 * تصميم حديث مع واجهة زجاجية (Glassmorphic) وتجربة مستخدم محسنة
 */
const StoreProductsManagement = ({
  currentStore,
  editingProduct,
  productFormData,
  setProductFormData,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onBack,
  products = [],
}) => {
  const { t } = useTranslation();
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreviewError, setImagePreviewError] = useState(false);

  // تحديث بيانات النموذج عند اختيار منتج للتعديل
  useEffect(() => {
    if (editingProduct) {
      setProductFormData({
        name: editingProduct.name || '',
        price: editingProduct.price || 0,
        category: editingProduct.category || 'أطباق رئيسية',
        available: editingProduct.available !== false,
        description: editingProduct.description || '',
      });
      setImageUrl(editingProduct.image || '');
      setImagePreviewError(false);
    }
  }, [editingProduct, setProductFormData]);

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setProductFormData({
      ...productFormData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageUrlChange = e => {
    const url = e.target.value;
    setImageUrl(url);
    setImagePreviewError(false);
  };

  const handleImageSelect = file => {
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        setImageUrl(e.target.result);
        setImagePreviewError(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeviceUpload = e => {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file);
  };

  const handleClearForm = () => {
    setProductFormData({
      name: '',
      price: 0,
      category: 'أطباق رئيسية',
      available: true,
      description: '',
    });
    setImageUrl('');
    setImagePreviewError(false);
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (!productFormData.name || !productFormData.price) {
      alert(t('الرجاء ملء جميع الحقول المطلوبة'));
      return;
    }

    const productData = {
      ...productFormData,
      image: imageUrl,
    };

    if (editingProduct) {
      onUpdateProduct({ ...editingProduct, ...productData });
    } else {
      onAddProduct(productData);
    }

    handleClearForm();
  };

  const handleCancelEdit = () => {
    handleClearForm();
    if (typeof onBack === 'function') {
      onBack();
    }
  };

  const handleImageDelete = () => {
    setImageUrl('');
    setImagePreviewError(false);
  };

  const handleImageZoom = () => {
    if (imageUrl) {
      window.open(imageUrl, '_blank');
    }
  };

  const isFormValid = productFormData.name && productFormData.price > 0;
  const categories = [
    'أطباق رئيسية',
    'مقبلات',
    'مشروبات',
    'حلويات',
    'وجبات سريعة',
  ];

  return (
    <div className="store-products-management">
      {/* زر الرجوع */}
      {onBack && (
        <button
          className="back-button"
          onClick={onBack}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '1rem',
            transition: 'all 0.2s ease',
          }}
        >
          ← {t('رجوع')}
        </button>
      )}

      <div className="products-management-container">
        {/* شارة التعديل */}
        {editingProduct && (
          <div className="redesigned-editing-badge">
            <div className="editing-badge-content">
              <span className="editing-badge-icon">✏️</span>
              <span className="editing-badge-text">
                قيد التعديل: <strong>{editingProduct.name}</strong>
              </span>
            </div>
            <button
              onClick={handleCancelEdit}
              className="redesigned-form-btn danger"
              style={{
                flex: 'none',
                minWidth: 'auto',
                padding: '0.5rem 1rem',
              }}
            >
              ❌ {t('إلغاء')}
            </button>
          </div>
        )}

        {/* نموذج إضافة/تعديل المنتج */}
        <div className="redesigned-add-product-section">
          <h2 className="section-title">
            {editingProduct ? '✏️ تعديل المنتج' : '➕ إضافة منتج جديد'}
          </h2>

          <form onSubmit={handleSubmit}>
            {/* شبكة الحقول */}
            <div className="redesigned-form-grid">
              {/* اسم المنتج */}
              <div className="redesigned-form-group">
                <label className="redesigned-form-label required">
                  🍽️ {t('اسم المنتج')}
                </label>
                <input
                  type="text"
                  name="name"
                  className="redesigned-form-input"
                  placeholder={t('أدخل اسم المنتج')}
                  value={productFormData.name}
                  onChange={handleInputChange}
                  style={{
                    transform: 'none',
                    animation: 'none',
                  }}
                  required
                />
                <span className="form-hint">أدخل اسم المنتج بوضوح</span>
              </div>

              {/* السعر */}
              <div className="redesigned-form-group">
                <label className="redesigned-form-label required">
                  💰 {t('السعر')}
                </label>
                <input
                  type="number"
                  name="price"
                  className="redesigned-form-input"
                  placeholder={t('0')}
                  value={productFormData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="50"
                  style={{
                    transform: 'none',
                    animation: 'none',
                  }}
                  required
                />
                <span className="form-hint">السعر بالعملة المحلية</span>
              </div>

              {/* الفئة */}
              <div className="redesigned-form-group">
                <label className="redesigned-form-label required">
                  📂 {t('الفئة')}
                </label>
                <select
                  name="category"
                  className="redesigned-form-input redesigned-form-select"
                  value={productFormData.category}
                  onChange={handleInputChange}
                  style={{
                    transform: 'none',
                    animation: 'none',
                  }}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <span className="form-hint">اختر الفئة المناسبة</span>
              </div>

              {/* التوفر */}
              <div className="redesigned-form-group">
                <label className="redesigned-form-label">
                  📊 {t('التوفر')}
                </label>
                <div className="redesigned-checkbox-group">
                  <label className="redesigned-checkbox-label">
                    <input
                      type="checkbox"
                      name="available"
                      className="redesigned-checkbox"
                      checked={productFormData.available}
                      onChange={handleInputChange}
                    />
                    {productFormData.available ? '✅ متوفر' : '❌ غير متوفر'}
                  </label>
                </div>
                <span className="form-hint">حدد هل المنتج متوفر الآن</span>
              </div>

              {/* الوصف */}
              <div className="redesigned-form-group full-width">
                <label className="redesigned-form-label">📝 {t('الوصف')}</label>
                <textarea
                  name="description"
                  className="redesigned-form-input redesigned-form-textarea"
                  placeholder={t('أدخل وصف المنتج')}
                  value={productFormData.description}
                  onChange={handleInputChange}
                  rows="4"
                  style={{
                    transform: 'none',
                    animation: 'none',
                  }}
                />
                <span className="form-hint">صف المنتج بشكل موجز وجذاب</span>
              </div>
            </div>

            {/* قسم تحميل الصور */}
            <div className="redesigned-image-upload-section">
              <div className="upload-section-title">🖼️ {t('صورة المنتج')}</div>

              {/* رابط الصورة */}
              <div className="redesigned-form-group full-width">
                <label className="redesigned-form-label">
                  🔗 {t('رابط الصورة')}
                </label>
                <input
                  type="url"
                  className="redesigned-form-input"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={handleImageUrlChange}
                  style={{
                    transform: 'none',
                    animation: 'none',
                  }}
                />
              </div>

              {/* أزرار التحميل */}
              <div className="redesigned-upload-buttons">
                <label className="redesigned-upload-btn">
                  <span className="upload-btn-icon">📱</span>
                  <span className="upload-btn-text">{t('من الجهاز')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleDeviceUpload}
                  />
                </label>

                <button
                  type="button"
                  className="redesigned-upload-btn"
                  onClick={() => {
                    const url = prompt('أدخل رابط الصورة من Unsplash:');
                    if (url) {
                      setImageUrl(url);
                      setImagePreviewError(false);
                    }
                  }}
                >
                  <span className="upload-btn-icon">🌄</span>
                  <span className="upload-btn-text">Unsplash</span>
                </button>

                <button
                  type="button"
                  className="redesigned-upload-btn"
                  onClick={() => {
                    const url = prompt('أدخل رابط الصورة:');
                    if (url) {
                      setImageUrl(url);
                      setImagePreviewError(false);
                    }
                  }}
                >
                  <span className="upload-btn-icon">🔗</span>
                  <span className="upload-btn-text">{t('رابط يدوي')}</span>
                </button>
              </div>

              {/* معاينة الصورة */}
              <div
                className={`redesigned-image-preview-container ${
                  imageUrl ? 'has-image' : ''
                }`}
              >
                {imageUrl && !imagePreviewError ? (
                  <>
                    <img
                      src={imageUrl}
                      alt="معاينة المنتج"
                      onError={() => setImagePreviewError(true)}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <div className="preview-actions-bar">
                      <button
                        type="button"
                        className="preview-action-btn"
                        onClick={handleImageZoom}
                        title="تكبير"
                      >
                        🔍
                      </button>
                      <button
                        type="button"
                        className="preview-action-btn"
                        onClick={handleImageDelete}
                        title="حذف"
                      >
                        ❌
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="image-preview-placeholder">
                    <span className="placeholder-icon">🖼️</span>
                    <p>
                      {imagePreviewError
                        ? 'خطأ في تحميل الصورة'
                        : 'لم يتم اختيار صورة بعد'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* أزرار النموذج */}
            <div className="redesigned-form-actions">
              <button
                type="button"
                className="redesigned-form-btn secondary"
                onClick={handleClearForm}
              >
                🔄 {t('مسح')}
              </button>

              {editingProduct && (
                <button
                  type="button"
                  className="redesigned-form-btn danger"
                  onClick={handleCancelEdit}
                >
                  ❌ {t('إلغاء')}
                </button>
              )}

              <button
                type="submit"
                className="redesigned-form-btn primary"
                disabled={!isFormValid}
              >
                {editingProduct ? (
                  <>✅ {t('تحديث المنتج')}</>
                ) : (
                  <>➕ {t('إضافة المنتج')}</>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* قائمة المنتجات الحالية */}
        <div className="products-list-section">
          <h3 className="section-title">
            📋 {t('المنتجات الحالية')} ({products.length})
          </h3>

          {products && products.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.5rem',
                marginTop: '1.5rem',
              }}
            >
              {products.map((product, idx) => (
                <div
                  key={product.id || idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background =
                      'rgba(255, 255, 255, 0.12)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background =
                      'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* صورة المنتج */}
                  {product.image && (
                    <div
                      style={{
                        width: '100%',
                        height: '180px',
                        overflow: 'hidden',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        onError={e => {
                          e.target.src =
                            'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                  )}

                  {/* معلومات المنتج */}
                  <div style={{ padding: '1rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <h4
                        style={{
                          color: 'white',
                          margin: 0,
                          fontSize: '1rem',
                          fontWeight: '600',
                        }}
                      >
                        {product.name}
                      </h4>
                      {product.available !== false && (
                        <span
                          style={{
                            background: 'rgba(34, 197, 94, 0.2)',
                            color: '#22c55e',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                          }}
                        >
                          ✅ متوفر
                        </span>
                      )}
                    </div>

                    <p
                      style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.9rem',
                        margin: '0.5rem 0',
                      }}
                    >
                      💰 {product.price} ريال
                    </p>

                    {product.description && (
                      <p
                        style={{
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: '0.85rem',
                          margin: '0.5rem 0',
                          lineHeight: '1.4',
                        }}
                      >
                        {product.description.substring(0, 100)}
                        {product.description.length > 100 && '...'}
                      </p>
                    )}

                    {/* أزرار الإجراءات */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginTop: '1rem',
                      }}
                    >
                      <button
                        onClick={() => {
                          // تمرير المنتج للتعديل
                          if (typeof window !== 'undefined') {
                            const editEvent = new CustomEvent('editProduct', {
                              detail: product,
                            });
                            window.dispatchEvent(editEvent);
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          background: 'rgba(59, 130, 246, 0.2)',
                          color: '#3b82f6',
                          border: '1px solid rgba(59, 130, 246, 0.5)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => {
                          e.target.style.background = 'rgba(59, 130, 246, 0.3)';
                        }}
                        onMouseLeave={e => {
                          e.target.style.background = 'rgba(59, 130, 246, 0.2)';
                        }}
                      >
                        ✏️ {t('تعديل')}
                      </button>

                      <button
                        onClick={() => {
                          if (confirm('هل تريد حذف هذا المنتج؟')) {
                            onDeleteProduct(product.id);
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          background: 'rgba(239, 68, 68, 0.2)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.5)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => {
                          e.target.style.background = 'rgba(239, 68, 68, 0.3)';
                        }}
                        onMouseLeave={e => {
                          e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                        }}
                      >
                        🗑️ {t('حذف')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '2rem',
                color: 'rgba(255, 255, 255, 0.6)',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
              <p>لم تضف أي منتجات بعد</p>
              <p style={{ fontSize: '0.9rem' }}>
                ابدأ بإضافة منتج جديد من النموذج أعلاه
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreProductsManagement;
