import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const ClientStores = ({ stores: propsStores }) => {
  const { t } = useTranslation();
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiUrl, setApiUrl] = useState('');

  // بيانات عينة من المتاجر (للاستخدام كـ fallback فقط)
  const sampleStores = [
    {
      id: 'store_001',
      name: 'مطعم الندى',
      category: 'restaurant',
      description: 'أفضل المأكولات التقليدية والعربية',
      address: 'شارع الرياض، حي النخيل',
      phone: '0551234567',
      logo_url: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=الندى',
      banner_url:
        'https://via.placeholder.com/400x200/FF6B6B/FFFFFF?text=مطعم+الندى',
      rating: 4.7,
      total_reviews: 89,
      status: 'active',
      delivery_fee: 200,
      min_order: 1000,
      preparation_time: 30,
      open: true,
      hours: '09:00 - 23:00',
    },
    {
      id: 'store_002',
      name: 'مقهى القهوة الذهبية',
      category: 'cafe',
      description: 'قهوة عربية أصيلة ومشروبات ساخنة',
      address: 'حي السلام، عمارة 15',
      phone: '0557654321',
      logo_url: 'https://via.placeholder.com/150/FFD166/FFFFFF?text=القهوة',
      banner_url:
        'https://via.placeholder.com/400x200/FFD166/FFFFFF?text=القهوة+الذهبية',
      rating: 4.8,
      total_reviews: 67,
      status: 'active',
      delivery_fee: 150,
      min_order: 500,
      preparation_time: 15,
      open: true,
      hours: '07:00 - 01:00',
    },
    {
      id: 'store_003',
      name: 'مخبز الأصالة',
      category: 'bakery',
      description: 'خبز طازج وحلويات تقليدية',
      address: 'شارع الثورة، المركز التجاري',
      phone: '0551122334',
      logo_url: 'https://via.placeholder.com/150/EF476F/FFFFFF?text=الأصالة',
      banner_url:
        'https://via.placeholder.com/400x200/EF476F/FFFFFF?text=مخبز+الأصالة',
      rating: 4.5,
      total_reviews: 112,
      status: 'active',
      delivery_fee: 100,
      min_order: 300,
      preparation_time: 20,
      open: true,
      hours: '06:00 - 22:00',
    },
    {
      id: 'store_004',
      name: 'متجر الفواكه الطازجة',
      category: 'grocery',
      description: 'فواكه وخضروات طازجة يومياً',
      address: 'حي الأمل، شارع 20',
      phone: '0555567890',
      logo_url: 'https://via.placeholder.com/150/06D6A0/FFFFFF?text=الفواكه',
      banner_url:
        'https://via.placeholder.com/400x200/06D6A0/FFFFFF?text=الفواكه+الطازجة',
      rating: 4.6,
      total_reviews: 45,
      status: 'active',
      delivery_fee: 75,
      min_order: 250,
      preparation_time: 10,
      open: true,
      hours: '08:00 - 20:00',
    },
    {
      id: 'store_005',
      name: 'محل الشاي والأعشاب',
      category: 'tea',
      description: 'أجود أنواع الشاي والأعشاب الطبيعية',
      address: 'حي النرجس، عمارة 8',
      phone: '0556789012',
      logo_url: 'https://via.placeholder.com/150/118AB2/FFFFFF?text=الشاي',
      banner_url:
        'https://via.placeholder.com/400x200/118AB2/FFFFFF?text=الشاي+والأعشاب',
      rating: 4.9,
      total_reviews: 78,
      status: 'active',
      delivery_fee: 120,
      min_order: 400,
      preparation_time: 12,
      open: true,
      hours: '09:00 - 21:00',
    },
    {
      id: 'store_006',
      name: 'مطبخ الصحة والعافية',
      category: 'healthy',
      description: 'طعام صحي وخالي من الدهون',
      address: 'حي الحرية، شارع الرياضة',
      phone: '0557890123',
      logo_url: 'https://via.placeholder.com/150/06FFA5/FFFFFF?text=الصحة',
      banner_url:
        'https://via.placeholder.com/400x200/06FFA5/FFFFFF?text=الصحة+والعافية',
      rating: 4.4,
      total_reviews: 56,
      status: 'active',
      delivery_fee: 180,
      min_order: 800,
      preparation_time: 25,
      open: true,
      hours: '10:00 - 22:00',
    },
  ];

  const categories = [
    { id: 'all', label: 'كل المتاجر', icon: '🏪' },
    { id: 'restaurant', label: 'مطاعم', icon: '🍽️' },
    { id: 'cafe', label: 'مقاهي', icon: '☕' },
    { id: 'bakery', label: 'مخابز', icon: '🥖' },
    { id: 'grocery', label: 'بقالة', icon: '🥬' },
    { id: 'tea', label: 'شاي وأعشاب', icon: '🍵' },
    { id: 'healthy', label: 'صحي', icon: '🥗' },
  ];

  // 🔥 جلب المتاجر من API عند تحميل المكون
  useEffect(() => {
    // تعيين apiUrl الافتراضي إذا لم يكن موجوداً
    if (!localStorage.getItem('apiUrl')) {
      localStorage.setItem('apiUrl', 'http://localhost:8080');
    }
    fetchStoresFromAPI();
  }, []);

  // دالة تنسيق البيانات من Firebase لتطابق الهيكل المتوقع
  const normalizeStore = (store) => {
    return {
      id: store.id || 'unknown',
      name: store.name || 'متجر بدون اسم',
      category: store.category || 'restaurant',
      description: store.description || 'وصف المتجر',
      address: store.address || 'عنوان غير محدد',
      phone: store.phone || '---',
      logo_url: store.logo_url || store.logo || 'https://via.placeholder.com/150/999/FFF?text=متجر',
      banner_url: store.banner_url || store.banner || 'https://via.placeholder.com/400x200/999/FFF?text=متجر',
      rating: store.rating || 4.5,
      total_reviews: store.total_reviews || 0,
      status: store.status || 'active',
      delivery_fee: store.delivery_fee || 0,
      min_order: store.min_order || 0,
      preparation_time: store.preparation_time || 20,
      open: store.open !== false, // افتراض مفتوح إذا لم يُحدد
      hours: store.hours || '09:00 - 23:00',
    };
  };

  // دالة جلب المتاجر من السيرفر (Firebase)
  const fetchStoresFromAPI = async () => {
    try {
      setLoading(true);
      setError(null);

      // تحديد URL السيرفر
      const baseURL = localStorage.getItem('apiUrl') || 'http://localhost:8080';
      setApiUrl(baseURL);

      console.log(`🔥 جاري جلب المتاجر من: ${baseURL}/api/client/stores`);

      const response = await fetch(`${baseURL}/api/client/stores`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log(`📡 رد السيرفر: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ تم جلب ${data.stores?.length || 0} متجر من Firebase`);
        console.log('📊 البيانات الأولى:', JSON.stringify(data.stores?.[0], null, 2));
        
        if (data.stores && data.stores.length > 0) {
          // تنسيق البيانات
          const normalizedStores = data.stores.map(normalizeStore);
          console.log('✅ تم تنسيق البيانات');
          console.log('📊 أول متجر بعد التنسيق:', JSON.stringify(normalizedStores[0], null, 2));
          
          setStores(normalizedStores);
          setFilteredStores(normalizedStores);
          console.log('✅✅ تم تحميل المتاجر من قاعدة البيانات بنجاح!');
        } else {
          console.warn('⚠️ لا توجد متاجر في قاعدة البيانات');
          setStores(sampleStores);
          setFilteredStores(sampleStores);
        }
      } else {
        console.warn(`⚠️ فشل الاتصال بالسيرفر: ${response.status}`);
        setStores(sampleStores);
        setFilteredStores(sampleStores);
      }
    } catch (err) {
      console.error('❌ خطأ في جلب المتاجر:', err);
      setError(err.message);
      // استخدام البيانات العينة كـ fallback
      setStores(sampleStores);
      setFilteredStores(sampleStores);
    } finally {
      setLoading(false);
    }
  };

  // إذا تم تمرير stores من الخارج (props)، استخدمها
  useEffect(() => {
    if (propsStores && propsStores.length > 0) {
      setStores(propsStores);
      setFilteredStores(propsStores);
    }
  }, [propsStores]);

  useEffect(() => {
    filterStores();
  }, [selectedCategory, searchTerm, stores]);

  const filterStores = () => {
    if (!stores || stores.length === 0) {
      console.warn('⚠️ لا توجد متاجر للتصفية');
      setFilteredStores([]);
      return;
    }

    let filtered = stores;

    // تصفية حسب الفئة
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(store => store.category === selectedCategory);
      console.log(`📋 تم تصفية حسب الفئة ${selectedCategory}: ${filtered.length} متاجر`);
    }

    // تصفية حسب البحث
    if (searchTerm) {
      filtered = filtered.filter(
        store =>
          (store.name && store.name.includes(searchTerm)) ||
          (store.description && store.description.includes(searchTerm)) ||
          (store.address && store.address.includes(searchTerm))
      );
      console.log(`🔍 تم البحث عن "${searchTerm}": ${filtered.length} متاجر`);
    }

    console.log(`✅ عدد المتاجر المعروضة: ${filtered.length}`);
    setFilteredStores(filtered);
  };

  const renderStars = rating => {
    return (
      <div className="stars">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < Math.floor(rating) ? 'filled' : ''}>
            ⭐
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="client-stores-container">
      {/* الخلفية المتحركة */}
      <div className="stores-background">
        <div className="stores-shape-1"></div>
        <div className="stores-shape-2"></div>
        <div className="stores-shape-3"></div>
      </div>

      <div className="stores-content">
        {/* رسالة تصحيح للمطورين */}
        {stores.length === 0 && !loading && (
          <div style={{
            background: '#fff3cd',
            border: '2px solid #ffc107',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px',
            direction: 'rtl',
            textAlign: 'right'
          }}>
            <strong>⚠️ تنبيه:</strong> لا توجد متاجر!
            <div style={{ fontSize: '12px', marginTop: '8px', color: '#555' }}>
              ✓ تحقق من أن السيرفر يعمل: <code>node server-render.js</code>
              <br />✓ تحقق من أن Firebase متصل
              <br />✓ تحقق من أن هناك متاجر نشطة في Firestore
              <br />✓ فتح DevTools (F12) لرؤية الأخطاء
            </div>
          </div>
        )}

        {/* رأس القسم */}
        <motion.div
          className="stores-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2>🏪 {t('stores') || 'المتاجر'}</h2>
          <p>{t('discover_stores') || 'اكتشف أفضل المتاجر والخدمات'}</p>
        </motion.div>

        {/* شريط البحث والتصفية */}
        <motion.div
          className="stores-search-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="search-box">
            <input
              type="text"
              placeholder={t('search_stores') || 'ابحث عن متجر...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
        </motion.div>

        {/* تصفية الفئات */}
        <motion.div
          className="stores-categories"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${
                selectedCategory === category.id ? 'active' : ''
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-label">{category.label}</span>
            </button>
          ))}
        </motion.div>

        {/* شبكة المتاجر */}
        <div className="stores-grid">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>{t('loading') || 'جاري التحميل...'}</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <div className="error-icon">⚠️</div>
              <p>خطأ: {error}</p>
              <p className="error-hint">جاري استخدام بيانات عينة</p>
            </div>
          ) : filteredStores.length > 0 ? (
            filteredStores.map((store, index) => (
              <motion.div
                key={store.id}
                className="store-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -10 }}
              >
                {/* صورة المتجر */}
                <div className="store-image-wrapper">
                  <img
                    src={store.banner_url}
                    alt={store.name}
                    className="store-banner"
                  />
                  <div className="store-status">
                    {store.open ? (
                      <span className="status-open">
                        🟢 {t('open') || 'مفتوح'}
                      </span>
                    ) : (
                      <span className="status-closed">
                        🔴 {t('closed') || 'مغلق'}
                      </span>
                    )}
                  </div>
                  <img
                    src={store.logo_url}
                    alt={store.name}
                    className="store-logo"
                  />
                </div>

                {/* معلومات المتجر */}
                <div className="store-info">
                  <div className="store-header-info">
                    <h3 className="store-name">{store.name}</h3>
                    <div className="store-rating">
                      {renderStars(store.rating)}
                      <span className="rating-text">
                        ({store.total_reviews})
                      </span>
                    </div>
                  </div>

                  <p className="store-description">{store.description}</p>

                  <div className="store-meta">
                    <div className="meta-item">
                      <span className="meta-icon">⏱️</span>
                      <span className="meta-text">
                        {store.preparation_time} {t('min') || 'دقيقة'}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">🚚</span>
                      <span className="meta-text">
                        {store.delivery_fee} {t('da') || 'د.ج'}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">📍</span>
                      <span className="meta-text">{store.address}</span>
                    </div>
                  </div>

                  <div className="store-features">
                    <span className="feature">
                      📱 {t('delivery') || 'توصيل'}
                    </span>
                    <span className="feature">
                      🏪 {t('pickup') || 'استلام'}
                    </span>
                  </div>
                </div>

                {/* زر الفتح */}
                <button className="btn-open-store">
                  <span>{t('view_store') || 'عرض المتجر'}</span>
                  <span className="btn-arrow">→</span>
                </button>
              </motion.div>
            ))
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <p>{t('no_stores_found') || 'لم يتم العثور على متاجر'}</p>
            </div>
          )}
        </div>

        {/* إحصائيات */}
        <motion.div
          className="stores-stats"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="stat-item">
            <div className="stat-icon">🏪</div>
            <div className="stat-info">
              <p className="stat-label">
                {t('total_stores') || 'إجمالي المتاجر'}
              </p>
              <p className="stat-value">{stores.length}</p>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">⚡</div>
            <div className="stat-info">
              <p className="stat-label">{t('available_now') || 'متوفر الآن'}</p>
              <p className="stat-value">{stores.filter(s => s.open).length}</p>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <p className="stat-label">{t('avg_rating') || 'متوسط التقييم'}</p>
              <p className="stat-value">
                {(
                  stores.reduce((acc, s) => acc + s.rating, 0) / stores.length
                ).toFixed(1)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ClientStores;
