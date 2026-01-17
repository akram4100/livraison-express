import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrReader } from 'react-qr-reader';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../style/dashboardClient.css';
import '../style/client-profile-security.css';
import '../style/client-orders-deliveries-payments.css';
import '../style/client-stores.css';
import ClientProfile from '../components/ClientProfile';
import ClientSecurity from '../components/ClientSecurity';
import ClientOrders from '../components/ClientOrders';
import ClientDeliveries from '../components/ClientDeliveries';
import ClientPayments from '../components/ClientPayments';
import ClientStores from '../components/ClientStores';

export default function DashboardClient() {
  const [user, setUser] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [manualSessionId, setManualSessionId] = useState('');
  const [cameraError, setCameraError] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [lastScanTime, setLastScanTime] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // تغيير الافتراضي إلى false
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(true); // حالة جديدة للتحكم في ظهور الرأس
  const { t, i18n } = useTranslation();
  const scanRef = useRef(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [recentActivity, setRecentActivity] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [stores, setStores] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState({
    totalScans: 0,
    successfulScans: 0,
    pendingDeliveries: 0,
    completedDeliveries: 0,
  });

  // 🎯 كشف نوع الجهاز
  useEffect(() => {
    const checkDevice = () => {
      const mobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      setIsMobile(mobile);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, []);

  // تأثير لإغلاق الشريط الجانبي عند تغيير القسم
  useEffect(() => {
    // إغلاق الشريط الجانبي تلقائياً عند التنقل على الجوال
    if (isMobile && sidebarOpen) {
      closeSidebarAndShowHeader();
    }
  }, [activeSection, isMobile]);

  // تأثير لإغلاق الشريط الجانبي عند تغيير حجم النافذة
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && sidebarOpen) {
        closeSidebarAndShowHeader();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  // 🎯 دالة التنقل الذكية بين الأقسام
  const navigateToSection = section => {
    setActiveSection(section);

    // إغلاق الشريط الجانبي عند تغيير القسم (للجوال)
    if (window.innerWidth <= 768) {
      closeSidebarAndShowHeader();
    }

    // إضافة نشاط للشريط الجانبي
    const activityMessage = getActivityMessage(section);
    if (activityMessage) {
      const newActivity = {
        icon: getSectionIcon(section),
        message: activityMessage,
        time: getCurrentTime(),
      };
      setRecentActivity(prev => [newActivity, ...prev.slice(0, 4)]);
    }
  };

  // 🎯 دوال مساعدة للنشاط
  const getActivityMessage = section => {
    const messages = {
      scanner: t('opened_scanner'),
      orders: t('viewed_orders'),
      deliveries: t('viewed_deliveries'),
      payments: t('viewed_payments'),
      profile: t('opened_profile'),
      security: t('opened_security'),
    };
    return messages[section];
  };

  const getSectionIcon = section => {
    const icons = {
      scanner: '📷',
      orders: '📦',
      deliveries: '🚚',
      payments: '💳',
      profile: '👤',
      security: '🔒',
    };
    return icons[section] || '📄';
  };

  const getCurrentTime = () => {
    const now = new Date();
    if (i18n.language === 'ar') return 'الآن';
    if (i18n.language === 'fr') return 'Maintenant';
    return 'Just now';
  };

  // 🆕 تأثير لتحسس حركة التمرير
  useEffect(() => {
    const handleScroll = () => {
      const currentPosition = window.pageYOffset || 0;

      if (currentPosition === 0) {
        setHeaderCollapsed(false);
      } else {
        setHeaderCollapsed(true);
      }

      setScrollPosition(currentPosition);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 🆕 تأثير لتحديث padding عند طي الشريط
  useEffect(() => {
    const clientContent = document.querySelector('.client-content');
    if (clientContent && headerVisible) {
      // فقط إذا كان الرأس ظاهراً
      if (headerCollapsed) {
        clientContent.style.paddingTop = '50px';
      } else {
        clientContent.style.paddingTop = '120px';
      }
    } else if (clientContent) {
      // إذا كان الرأس مخفياً (الشريط الجانبي مفتوح)
      clientContent.style.paddingTop = '0';
    }
  }, [headerCollapsed, headerVisible]);

  // ✅ تأثير المصادقة والإعدادات
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const userObj = JSON.parse(userData);
        setUser(userObj);
        setIsAuthenticated(true);
        console.log('✅ [AUTH] - تم تسجيل الدخول:', userObj.email);
      } catch (error) {
        console.error('❌ [AUTH_ERROR] - خطأ في المصادقة');
        handleLogout();
      }
    }

    // تحميل إعدادات الوضع الليلي واللغة
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'fr';

    setDarkMode(savedDarkMode);
    i18n.changeLanguage(savedLanguage);

    return () => {
      scanRef.current = false;
    };
  }, [i18n]);

  // ✅ تأثير منفصل لتتبع النشاط عند تغيير القسم
  useEffect(() => {
    if (activeSection !== 'dashboard') {
      const activityMessage = getActivityMessage(activeSection);
      if (activityMessage) {
        const newActivity = {
          icon: getSectionIcon(activeSection),
          message: activityMessage,
          time: getCurrentTime(),
        };

        setRecentActivity(prev => [newActivity, ...prev.slice(0, 4)]);
      }
    }

    // 🔥 جلب المتاجر عند الذهاب إلى قسم المتاجر
    if (activeSection === 'stores') {
      fetchAllStores();
    }
  }, [activeSection, t, i18n.language]);

  // 🏪 دالة جلب المتاجر من الـ API
  const fetchAllStores = async () => {
    try {
      console.log('🏪 جاري جلب المتاجر من الـ API...');
      
      // استخدم REACT_APP_API_URL من .env في الإنتاج
      let baseURL = process.env.REACT_APP_API_URL;
      
      // إذا لم تكن موجودة، استخدم localStorage
      if (!baseURL) {
        baseURL = localStorage.getItem('apiUrl');
      }
      
      // إذا لم تكن موجودة أيضاً، استخدم localhost للتطوير
      if (!baseURL) {
        baseURL = 'http://localhost:8080/api';
      }
      
      // إزالة /api من النهاية إذا كانت موجودة، لأننا سنضيفها في الـ URL
      const apiBase = baseURL.replace(/\/api\/?$/, '');
      
      console.log(`📍 API Base URL: ${apiBase}`);
      
      const response = await fetch(`${apiBase}/api/stores`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ تم جلب ${data.stores?.length || 0} متجر`);
        if (data.stores && data.stores.length > 0) {
          setStores(data.stores);
          console.log('✅✅ تم تحديث المتاجر بنجاح!');
        }
      } else {
        console.warn('⚠️ فشل جلب المتاجر من السيرفر');
      }
    } catch (error) {
      console.error('❌ خطأ في جلب المتاجر:', error);
    }
  };

  // 🌍 تغيير اللغة
  const changeLanguage = lang => {
    i18n.changeLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  // 🎨 تبديل الوضع الليلي
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  // 🔄 دوال التحكم في الشريط الجانبي والرأس
  const openSidebarAndHideHeader = () => {
    setSidebarOpen(true);
    setHeaderVisible(false);
    document.body.classList.add('sidebar-active');
    document.body.classList.remove('header-active');
  };

  const closeSidebarAndShowHeader = () => {
    setSidebarOpen(false);
    setHeaderVisible(true);
    document.body.classList.remove('sidebar-active');
    document.body.classList.add('header-active');
  };

  // معالجة نتيجة المسح - محسنة مع منع التكرار
  const handleScan = result => {
    if (result && result.text && !scanRef.current) {
      const now = Date.now();
      if (now - lastScanTime < 1000) {
        return;
      }

      console.log('✅ [QR_SCANNED] - تم مسح الرمز:', result.text);
      setScanResult(t('qr_scanned_processing'));
      setLastScanTime(now);
      scanRef.current = true;
      setScanning(false);
      processScannedCode(result.text);
    }
  };

  // معالجة الأخطاء - محسنة تماماً
  const handleError = error => {
    setScanCount(prev => prev + 1);

    const isInternalError =
      !error ||
      (error && !error.name) ||
      (error &&
        error.message &&
        typeof error.message === 'string' &&
        (error.message.includes('selectBestPatterns') ||
          error.message.includes('find') ||
          error.message.includes('detect') ||
          error.message.includes('decode') ||
          error.message.includes('pattern') ||
          error.message.includes('Canvas2D') ||
          error.message.includes('willReadFrequently') ||
          error.message === 't' ||
          error.message.length < 3));

    if (isInternalError) {
      return;
    }

    console.warn('⚠️ [SCAN_WARNING] - تحذير في المسح:', error);

    if (error.name === 'NotAllowedError') {
      setScanResult(t('camera_permission_denied'));
      setCameraError(true);
      setScanning(false);
    } else if (error.name === 'NotFoundError') {
      setScanResult(t('camera_not_found'));
      setCameraError(true);
      setScanning(false);
    } else if (error.name === 'NotSupportedError') {
      setScanResult(t('camera_not_supported'));
      setCameraError(true);
      setScanning(false);
    } else if (error.name === 'OverconstrainedError') {
      setScanResult(t('camera_constraints_error'));
      setCameraError(true);
      setScanning(false);
    } else if (
      error.name === 'UnknownError' &&
      error.message.includes('setPhotoOptions')
    ) {
      return;
    }
  };

  const processScannedCode = async decodedText => {
    try {
      let sessionId;

      try {
        const qrData = JSON.parse(decodedText);
        if (qrData.session_id) {
          sessionId = qrData.session_id;
        } else if (qrData.type === 'livraison_qr') {
          sessionId = qrData.session_id;
        }
      } catch (e) {
        if (decodedText.includes('session_id=')) {
          const urlParams = new URLSearchParams(decodedText.split('?')[1]);
          sessionId = urlParams.get('session_id');
        } else {
          sessionId = decodedText;
        }
      }

      if (!sessionId) {
        setScanResult(t('session_id_not_found'));
        scanRef.current = false;
        return;
      }

      await processSessionId(sessionId);
    } catch (error) {
      console.error('❌ [PROCESS_ERROR] - خطأ في معالجة الرمز:', error);
      setScanResult(t('qr_processing_error'));
      scanRef.current = false;
    }
  };

  // بدء الكاميرا بالنقر على الإطار
  const startCamera = () => {
    console.log('🚀 [START_CAMERA] - بدء تشغيل الكاميرا');
    setScanning(true);
    setCameraError(false);
    setScanResult(t('starting_camera'));
    setScanCount(0);
    scanRef.current = false;
  };

  // إيقاف الكاميرا
  const stopCamera = () => {
    console.log('🛑 [STOP_CAMERA] - إيقاف الكاميرا');
    setScanning(false);
    setScanResult('');
    scanRef.current = false;
  };

  // إعادة تشغيل الكاميرا
  const restartCamera = () => {
    console.log('🔄 [RESTART_CAMERA] - إعادة تشغيل الكاميرا');
    stopCamera();
    setTimeout(startCamera, 1000);
  };

  // 🎯 معالجة QR يدوياً
  const handleManualQRSubmit = async e => {
    e.preventDefault();
    if (!manualSessionId.trim()) {
      setScanResult(t('please_enter_session_id'));
      return;
    }
    await processSessionId(manualSessionId.trim());
  };

  const processSessionId = async sessionId => {
    try {
      setScanResult(t('processing_session'));

      const scanResponse = await fetch(
        'https://livraison-api-x45n.onrender.com/api/mobile/scan-qr',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId }),
        }
      );

      const scanData = await scanResponse.json();

      if (scanData.success) {
        setScanResult(t('qr_scanned_confirming'));
        if (user && user.email) {
          await confirmLogin(sessionId);
        } else {
          setScanResult(t('qr_scanned_success'));
          scanRef.current = false;
        }
      } else {
        setScanResult(`❌ ${scanData.message}`);
        scanRef.current = false;
      }
    } catch (error) {
      console.error('❌ [API_ERROR] - خطأ في الاتصال بالخادم:', error);
      setScanResult(t('server_connection_error'));
      scanRef.current = false;
    }
  };

  const confirmLogin = async sessionId => {
    try {
      const confirmResponse = await fetch(
        'https://livraison-api-x45n.onrender.com/api/confirm-telegram-login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            user: user,
          }),
        }
      );

      const confirmData = await confirmResponse.json();
      if (confirmData.success) {
        setScanResult(t('login_confirmed_success'));

        setTimeout(() => {
          setScanResult(t('continue_using_app'));
          scanRef.current = false;
        }, 3000);
      } else {
        setScanResult(`❌ ${confirmData.message}`);
        scanRef.current = false;
      }
    } catch (error) {
      console.error('❌ [CONFIRM_ERROR] - خطأ في تأكيد الدخول:', error);
      setScanResult(t('login_confirmation_error'));
      scanRef.current = false;
    }
  };

  const handleLogout = () => {
    stopCamera();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <div className="auth-required">
        <div className="auth-message">
          <div className="auth-icon">🔐</div>
          <h2>{t('login_required')}</h2>
          <p>{t('login_required_message')}</p>
          <button
            onClick={() => navigate('/login')}
            className="auth-btn primary"
          >
            {t('go_to_login')}
          </button>
        </div>
      </div>
    );
  }

  // 🎯 مكون بطاقات الإحصائيات
  const StatsCards = () => (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon">📊</div>
        <div className="stat-info">
          <h3>{statsData.totalScans}</h3>
          <p>{t('total_scans')}</p>
        </div>
      </div>

      <div className="stat-card success">
        <div className="stat-icon">✅</div>
        <div className="stat-info">
          <h3>{statsData.successfulScans}</h3>
          <p>{t('successful_scans')}</p>
        </div>
      </div>

      <div className="stat-card warning">
        <div className="stat-icon">⏳</div>
        <div className="stat-info">
          <h3>{statsData.pendingDeliveries}</h3>
          <p>{t('pending_deliveries')}</p>
        </div>
      </div>

      <div className="stat-card info">
        <div className="stat-icon">🎉</div>
        <div className="stat-info">
          <h3>{statsData.completedDeliveries}</h3>
          <p>{t('completed_deliveries')}</p>
        </div>
      </div>
    </div>
  );

  // 🎯 مكون النشاط الأخير
  const RecentActivity = () => (
    <div className="recent-activity">
      <h3>📋 {t('recent_activity')}</h3>
      <div className="activity-list">
        {recentActivity.length > 0 ? (
          recentActivity.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className="activity-icon">{activity.icon}</div>
              <div className="activity-content">
                <p>{activity.message}</p>
                <span className="activity-time">{activity.time}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="no-activity">
            <p>{t('no_recent_activity')}</p>
          </div>
        )}
      </div>
    </div>
  );

  // 🎯 مكون الطلبات الحديثة
  const RecentOrders = () => (
    <div className="recent-orders">
      <h3>📦 {t('recent_orders')}</h3>
      <div className="orders-list">
        <div className="order-item">
          <div className="order-info">
            <h4>ORD-001</h4>
            <p>{t('pending_delivery')}</p>
          </div>
          <div className="order-status pending">⏳</div>
        </div>
        <div className="order-item">
          <div className="order-info">
            <h4>ORD-002</h4>
            <p>{t('in_transit')}</p>
          </div>
          <div className="order-status in-transit">🚚</div>
        </div>
      </div>
    </div>
  );

  const QuickActions = () => (
    <div className="quick-actions">
      <h3>⚡ {t('quick_actions')}</h3>
      <div className="actions-grid">
        <button
          className="action-card"
          onClick={() => navigateToSection('stores')}
        >
          <div className="action-icon">🛍️</div>
          <span>المتاجر</span>
        </button>

        {isMobile && (
          <button
            className="action-card"
            onClick={() => navigateToSection('scanner')}
          >
            <div className="action-icon">📷</div>
            <span>{t('scan_qr')}</span>
          </button>
        )}

        <button
          className="action-card"
          onClick={() => navigateToSection('orders')}
        >
          <div className="action-icon">📦</div>
          <span>{t('new_order')}</span>
        </button>

        <button
          className="action-card"
          onClick={() => navigateToSection('deliveries')}
        >
          <div className="action-icon">🔍</div>
          <span>{t('track_delivery')}</span>
        </button>
      </div>
    </div>
  );

  // 🆕 مكون المتاجر
  const StoresBrowser = () => {
    const [stores, setStores] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchStores = async () => {
        try {
          setLoading(true);
          const response = await fetch(
            'https://livraison-api-x45n.onrender.com/api/stores'
          );
          const data = await response.json();

          if (data.success) {
            setStores(data.stores);
          } else {
            setStores(getDemoStores());
          }
        } catch (error) {
          console.error('❌ خطأ في جلب المتاجر:', error);
          setStores(getDemoStores());
        } finally {
          setLoading(false);
        }
      };

      fetchStores();
    }, []);

    const getDemoStores = () => [
      {
        id: 1,
        name: 'مطعم الندى',
        category: 'restaurants',
        image: '/images/store1.jpg',
        rating: 4.5,
        reviews: 128,
        description: 'أفضل المأكولات الشرقية',
        deliveryTime: '30-45',
        deliveryFee: '200',
        isActive: true,
      },
      {
        id: 2,
        name: 'سوبرماركت المدينة',
        category: 'supermarkets',
        image: '/images/store2.jpg',
        rating: 4.2,
        reviews: 89,
        description: 'كل ما تحتاجه من منتجات',
        deliveryTime: '45-60',
        deliveryFee: '150',
        isActive: true,
      },
      {
        id: 3,
        name: 'صيدلية الحياة',
        category: 'pharmacy',
        image: '/images/store3.jpg',
        rating: 4.8,
        reviews: 204,
        description: 'أدوية ومستحضرات طبية',
        deliveryTime: '25-35',
        deliveryFee: '180',
        isActive: true,
      },
    ];

    const categories = [
      { id: 'all', name: 'الكل', icon: '🏪' },
      { id: 'restaurants', name: 'مطاعم', icon: '🍕' },
      { id: 'supermarkets', name: 'سوبرماركت', icon: '🛒' },
      { id: 'pharmacy', name: 'صيدليات', icon: '💊' },
    ];

    const filteredStores =
      selectedCategory === 'all'
        ? stores.filter(store => store.isActive)
        : stores.filter(
            store => store.category === selectedCategory && store.isActive
          );

    if (loading) {
      return (
        <section className="stores-browser">
          <div className="section-header">
            <h2>🛍️ المتاجر الشريكة</h2>
            <p>جاري تحميل المتاجر...</p>
          </div>
          <div className="stores-loading">
            <div className="loading-spinner"></div>
          </div>
        </section>
      );
    }

    return (
      <section className="stores-browser">
        <div className="section-header">
          <h2>🛍️ المتاجر الشريكة</h2>
          <p>اختر من بين أفضل المتاجر في مدينتك</p>
        </div>

        <div className="categories-filter">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${
                selectedCategory === category.id ? 'active' : ''
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        <div className="stores-grid">
          {filteredStores.map(store => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>

        {filteredStores.length === 0 && (
          <div className="no-stores">
            <div className="no-stores-icon">🏪</div>
            <h3>لا توجد متاجر متاحة</h3>
            <p>لا توجد متاجر في هذه الفئة حالياً</p>
          </div>
        )}
      </section>
    );
  };

  // 🆕 مكون بطاقة المتجر المنفصل
  const StoreCard = ({ store }) => {
    const navigate = useNavigate();

    const handleStoreClick = () => {
      navigate(`/store/${store.id}`);
    };

    return (
      <div className="store-card" onClick={handleStoreClick}>
        <div className="store-image">
          <div className="store-image-placeholder">
            {store.category === 'restaurants' && '🍕'}
            {store.category === 'supermarkets' && '🛒'}
            {store.category === 'pharmacy' && '💊'}
          </div>
          <div className="store-badge">⭐ {store.rating}</div>
          {store.isActive && (
            <div className="store-status active">🟢 مفتوح</div>
          )}
        </div>

        <div className="store-info">
          <h4>{store.name}</h4>
          <p className="store-description">{store.description}</p>

          <div className="store-meta">
            <div className="meta-item">
              <span className="meta-icon">⏱️</span>
              <span>{store.deliveryTime} دقيقة</span>
            </div>
            <div className="meta-item">
              <span className="meta-icon">💰</span>
              <span>{store.deliveryFee} د.ج</span>
            </div>
            <div className="meta-item">
              <span className="meta-icon">📝</span>
              <span>{store.reviews} تقييم</span>
            </div>
          </div>

          <button className="browse-store-btn">تصفح المتجر</button>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`QR-scanner ${darkMode ? 'dark' : ''} ${
        i18n.language === 'ar' ? 'rtl' : 'ltr'
      }`}
    >
      {/* 🌐 خلفية ديناميكية */}
      <div className="dynamic-bg">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
      </div>

      {/* 🌐 شريط الرأس - يظهر فقط عندما يكون الشريط الجانبي مغلقاً */}
      {headerVisible && (
        <motion.header
          className={`dashboard-header merged-header ${
            headerCollapsed ? 'collapsed' : ''
          }`}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="header-content-wrapper unified-header"
            initial={false}
            animate={{
              height: headerCollapsed ? 0 : 'auto',
              opacity: headerCollapsed ? 0 : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            {/* الصف العلوي */}
            <div className="header-top-row unified">
              <div className="header-left unified-left">
                <div className="header-title">
                  <h1>🚚 Livraison Express</h1>
                  <p>{t('qr_scanner_system')}</p>
                </div>
              </div>

              <div className="header-right unified-right">
                <div className="user-info">
                  <span>
                    {t('welcome')}, {user?.nom}
                  </span>
                  <small className="device-type">
                    {isMobile ? '📱 Mobile' : '💻 Desktop'}
                  </small>
                </div>
              </div>
            </div>

            {/* الصف السفلي */}
            <div className="header-bottom-row unified">
              <div className="header-controls">
                <div className="header-language-section unified-section">
                  <span className="section-label">{t('language')}:</span>
                  <div
                    className="language-buttons"
                    role="group"
                    aria-label={t('language')}
                  >
                    <button
                      className={i18n.language === 'fr' ? 'active' : ''}
                      onClick={() => changeLanguage('fr')}
                      aria-pressed={i18n.language === 'fr'}
                    >
                      𝖥𝖱
                    </button>
                    <button
                      className={i18n.language === 'en' ? 'active' : ''}
                      onClick={() => changeLanguage('en')}
                      aria-pressed={i18n.language === 'en'}
                    >
                      𝖤𝖭
                    </button>
                    <button
                      className={i18n.language === 'ar' ? 'active' : ''}
                      onClick={() => changeLanguage('ar')}
                      aria-pressed={i18n.language === 'ar'}
                    >
                      𝖠𝖱
                    </button>
                  </div>
                </div>

                <div className="header-darkmode-section unified-section">
                  <button
                    className={`darkmode-toggle ${darkMode ? 'dark' : 'light'}`}
                    onClick={toggleDarkMode}
                    aria-label={darkMode ? t('light_mode') : t('dark_mode')}
                  >
                    <span className="toggle-icon">
                      {darkMode ? '☀️' : '🌙'}
                    </span>
                    <span className="toggle-text">
                      {darkMode ? t('light_mode') : t('dark_mode')}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.header>
      )}

      {/* زر فتح الشريط الجانبي العائم - يظهر فقط عندما يكون الرأس ظاهراً والشريط الجانبي مغلقاً */}
      {headerVisible && !sidebarOpen && (
        <motion.button
          className="floating-sidebar-toggle"
          onClick={openSidebarAndHideHeader}
          aria-label={t('open_sidebar')}
          aria-expanded={sidebarOpen}
          aria-controls="clientSidebar"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 25,
            delay: 0.5,
          }}
          whileHover={{ scale: 1.1, x: 5 }}
          whileTap={{ scale: 0.9 }}
          title={t('open_sidebar')}
        >
          <div className="sidebar-toggle-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                d="M4 6h16M4 12h16M4 18h16"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="sidebar-toggle-text">{t('open_sidebar')}</span>
        </motion.button>
      )}

      {/* الشريط الجانبي - يظهر فقط عندما يكون الرأس مخفياً */}
      {sidebarOpen && (
        <>
          <div
            className="sidebar-backdrop"
            onClick={closeSidebarAndShowHeader}
          />

          <motion.div
            id="clientSidebar"
            className="client-sidebar"
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="sidebar-header">
              <div className="sidebar-user">
                <div className="user-avatar">
                  {user?.nom ? user.nom.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="user-info">
                  <h3>{user?.nom || t('user')}</h3>
                  <p>{user?.email || t('guest')}</p>
                  <small className="device-badge">
                    {isMobile ? '📱 Mobile' : '💻 Desktop'}
                  </small>
                </div>
              </div>
              <button
                className="sidebar-close-btn"
                onClick={closeSidebarAndShowHeader}
                title={t('close_sidebar')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="sidebar-nav-container">
              <nav className="sidebar-nav">
                <button
                  className={`nav-item ${
                    activeSection === 'dashboard' ? 'active' : ''
                  }`}
                  onClick={() => {
                    navigateToSection('dashboard');
                    closeSidebarAndShowHeader();
                  }}
                >
                  📊 {t('dashboard')}
                </button>

                {isMobile && (
                  <button
                    className={`nav-item ${
                      activeSection === 'scanner' ? 'active' : ''
                    }`}
                    onClick={() => {
                      navigateToSection('scanner');
                      closeSidebarAndShowHeader();
                    }}
                  >
                    📷 {t('scan_qr')}
                  </button>
                )}

                <button
                  className={`nav-item ${
                    activeSection === 'orders' ? 'active' : ''
                  }`}
                  onClick={() => {
                    navigateToSection('orders');
                    closeSidebarAndShowHeader();
                  }}
                >
                  📦 {t('my_orders')}
                </button>

                <button
                  className={`nav-item ${
                    activeSection === 'deliveries' ? 'active' : ''
                  }`}
                  onClick={() => {
                    navigateToSection('deliveries');
                    closeSidebarAndShowHeader();
                  }}
                >
                  🚚 {t('deliveries')}
                </button>

                <button
                  className={`nav-item ${
                    activeSection === 'stores' ? 'active' : ''
                  }`}
                  onClick={() => {
                    navigateToSection('stores');
                    closeSidebarAndShowHeader();
                  }}
                >
                  🛍️ المتاجر
                </button>

                <button
                  className={`nav-item ${
                    activeSection === 'payments' ? 'active' : ''
                  }`}
                  onClick={() => {
                    navigateToSection('payments');
                    closeSidebarAndShowHeader();
                  }}
                >
                  💳 {t('payments')}
                </button>

                <div className="nav-section-divider">
                  <span>{t('settings')}</span>
                </div>

                <button
                  className="nav-item"
                  onClick={() => {
                    navigateToSection('profile');
                    closeSidebarAndShowHeader();
                  }}
                >
                  👤 {t('profile')}
                </button>

                <button
                  className="nav-item"
                  onClick={() => {
                    navigateToSection('security');
                    closeSidebarAndShowHeader();
                  }}
                >
                  🔒 {t('security')}
                </button>

                <button
                  onClick={handleLogout}
                  className="nav-item logout-sidebar-btn"
                >
                  🚪 {t('logout')}
                </button>
              </nav>
            </div>
          </motion.div>
        </>
      )}

      {/* المحتوى الرئيسي */}
      <div className="client-content">
        <main className="client-main">
          {/* 🎯 قسم لوحة التحكم */}
          {activeSection === 'dashboard' && (
            <div className="dashboard-content">
              <div className="welcome-section">
                <h2>
                  👋 {t('welcome_back')}, {user?.nom}!
                </h2>
                <p>{t('dashboard_overview')}</p>
                {!isMobile && (
                  <div className="desktop-message">
                    <p>
                      💻 <strong>وضع الكمبيوتر:</strong> يمكنك إدخال رمز الجلسة
                      يدوياً
                    </p>
                  </div>
                )}
              </div>

              <StoresBrowser />
              <StatsCards />

              <div className="content-grid">
                <div className="content-column">
                  <RecentActivity />
                </div>
                <div className="content-column">
                  <RecentOrders />
                </div>
                <div className="content-column">
                  <QuickActions />
                </div>
              </div>
            </div>
          )}

          {/* 🎯 قسم الماسح - للجوال فقط */}
          {activeSection === 'scanner' && isMobile && (
            <section className="scanner-section">
              <div className="section-header">
                <h2>🔍 {t('secure_qr_scanner')}</h2>
                <p>{t('click_to_activate_camera')}</p>
                <div className="debug-info">
                  <small>
                    {t('camera_status')}: {scanning ? t('active') : t('ready')}
                  </small>
                  {scanning && (
                    <small>
                      {' '}
                      | {t('scan_attempts')}: {scanCount}
                    </small>
                  )}
                </div>
              </div>

              <div className="scanner-container">
                <div className="main-scanner-area">
                  {!scanning ? (
                    <motion.div
                      className="scanner-ready-state"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className="scanner-placeholder"
                        onClick={startCamera}
                      >
                        <div className="scanner-icon">📷</div>
                        <div className="scanner-instruction">
                          <h3>{t('click_to_activate_camera')}</h3>
                          <p>{t('press_anywhere_to_scan')}</p>
                        </div>
                        <div className="scanner-guidelines">
                          <div className="guideline-line"></div>
                          <div className="guideline-text">
                            {t('camera_will_activate')}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="scanner-active-state"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="camera-container">
                        <QrReader
                          onResult={(result, error) => {
                            if (result) {
                              handleScan(result);
                            }
                            if (error) {
                              handleError(error);
                            }
                          }}
                          constraints={{
                            facingMode: 'environment',
                            width: { ideal: 1280 },
                            height: { ideal: 720 },
                          }}
                          className="qr-reader"
                          videoContainerStyle={{
                            padding: 0,
                            margin: 0,
                            width: '100%',
                            height: '100%',
                            borderRadius: '12px',
                          }}
                          videoStyle={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '12px',
                          }}
                          scanDelay={500}
                        />
                        <div className="scan-overlay">
                          <div
                            className="scan-frame"
                            onClick={stopCamera}
                          ></div>
                          <p>{t('click_frame_to_stop')}</p>
                          <div className="scan-stats">
                            <small>
                              {t('scan_attempts')}: {scanCount}
                            </small>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="scan-status">
                    <div
                      className={`scan-result ${
                        scanResult.includes('✅') || scanResult.includes('🎉')
                          ? 'success'
                          : scanResult.includes('❌')
                          ? 'error'
                          : 'info'
                      }`}
                    >
                      {scanResult}
                    </div>
                  </div>

                  {cameraError && (
                    <div className="error-message">
                      <p>⚠️ {t('camera_error_message')}</p>
                      <button onClick={restartCamera} className="retry-btn">
                        🔄 {t('retry')}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="manual-input-section">
                <h3>📝 {t('or_enter_session_manually')}</h3>
                <form onSubmit={handleManualQRSubmit} className="manual-form">
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder={t('enter_session_id_placeholder')}
                      value={manualSessionId}
                      onChange={e => setManualSessionId(e.target.value)}
                      className="session-input"
                    />
                    <button type="submit" className="submit-btn">
                      {t('confirm_session')}
                    </button>
                  </div>
                </form>
              </div>

              <div className="instructions-section">
                <div className="instructions">
                  <h3>💡 {t('how_system_works')}:</h3>
                  <ul>
                    <li>✅ {t('system_works_1')}</li>
                    <li>✅ {t('system_works_2')}</li>
                    <li>✅ {t('system_works_3')}</li>
                    <li>✅ {t('system_works_4')}</li>
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* 🆕 رسالة للمستخدمين على الكمبيوتر */}
          {activeSection === 'scanner' && !isMobile && (
            <div className="desktop-scanner-message">
              <div className="message-container">
                <div className="message-icon">💻</div>
                <h2>الماسح الضوئي غير متاح على الكمبيوتر</h2>
                <p>
                  للمسح الضوئي للرموز QR، يرجى استخدام تطبيق الجوال أو إدخال رمز
                  الجلسة يدوياً أدناه
                </p>

                <div className="manual-input-section">
                  <h3>📝 أدخل رمز الجلسة يدوياً</h3>
                  <form onSubmit={handleManualQRSubmit} className="manual-form">
                    <div className="input-group">
                      <input
                        type="text"
                        placeholder="أدخل رمز الجلسة هنا"
                        value={manualSessionId}
                        onChange={e => setManualSessionId(e.target.value)}
                        className="session-input"
                      />
                      <button type="submit" className="submit-btn">
                        تأكيد الجلسة
                      </button>
                    </div>
                  </form>
                </div>

                <div className="alternative-actions">
                  <button
                    className="action-btn primary"
                    onClick={() => navigateToSection('dashboard')}
                  >
                    العودة للوحة التحكم
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* أقسام أخرى */}
          {activeSection === 'stores' && <ClientStores stores={stores} />}

          {activeSection === 'orders' && <ClientOrders />}

          {activeSection === 'deliveries' && <ClientDeliveries />}

          {activeSection === 'payments' && <ClientPayments />}
        </main>
      </div>
    </div>
  );
}
