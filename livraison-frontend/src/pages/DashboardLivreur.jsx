import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrReader } from 'react-qr-reader';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../style/dashboardLivreur.css';

export default function DashboardLivreur() {
  const [user, setUser] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [manualSessionId, setManualSessionId] = useState('');
  const [cameraError, setCameraError] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [lastScanTime, setLastScanTime] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const { t, i18n } = useTranslation();
  const scanRef = useRef(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [recentActivity, setRecentActivity] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  
  // 🎯 بيانات عامل التوصيل
  const [currentDelivery, setCurrentDelivery] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [deliveryStats, setDeliveryStats] = useState({
    totalDeliveries: 0,
    completedToday: 0,
    pendingDeliveries: 0,
    earningsToday: 0,
  });

  // 🎯 كشف نوع الجهاز
  useEffect(() => {
    const checkDevice = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
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

  // 🎯 تأثير لتحسس حركة التمرير
  useEffect(() => {
    const handleScroll = () => {
      const currentPosition = window.pageYOffset;

      if (currentPosition > 10 && currentPosition > scrollPosition) {
        setHeaderCollapsed(true);
      }
      else if (currentPosition < scrollPosition) {
        setHeaderCollapsed(false);
      }

      setScrollPosition(currentPosition);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrollPosition]);

  // 🎯 تأثير لتحديث padding عند طي الشريط
  useEffect(() => {
    const livreurContent = document.querySelector('.livreur-content');
    if (livreurContent) {
      if (headerCollapsed) {
        livreurContent.style.paddingTop = '50px';
      } else {
        livreurContent.style.paddingTop = '120px';
      }
    }
  }, [headerCollapsed]);

  // ✅ تأثير المصادقة والإعدادات
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const userType = localStorage.getItem('userType') || 'livreur'; // ⚠️ حل مؤقت للتطوير

    if (userData) {
      try {
        const userObj = JSON.parse(userData);
        setUser(userObj);
        setIsAuthenticated(true);
        console.log('✅ [LIVREUR_AUTH] - تسجيل دخول عامل توصيل:', userObj.nom);
        
        // تحميل بيانات عامل التوصيل
        loadLivreurData(userObj.id);
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
  }, [activeSection, t, i18n.language]);

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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // 🎯 دوال مساعدة للنشاط
  const getActivityMessage = section => {
    const messages = {
      scanner: t('opened_scanner'),
      deliveries: t('viewed_deliveries'),
      earnings: t('viewed_earnings'),
      profile: t('opened_profile'),
      map: t('opened_map'),
    };
    return messages[section];
  };

  const getSectionIcon = section => {
    const icons = {
      scanner: '📷',
      deliveries: '📦',
      earnings: '💰',
      profile: '👤',
      map: '🗺️',
    };
    return icons[section] || '📄';
  };

  const getCurrentTime = () => {
    const now = new Date();
    if (i18n.language === 'ar') return 'الآن';
    if (i18n.language === 'fr') return 'Maintenant';
    return 'Just now';
  };

  // 🎯 تحميل بيانات عامل التوصيل
  const loadLivreurData = async (livreurId) => {
    try {
      // بيانات تجريبية
      setDeliveryStats({
        totalDeliveries: 147,
        completedToday: 8,
        pendingDeliveries: 3,
        earningsToday: 12500,
      });

      setDeliveries([
        {
          id: 1,
          orderId: 'ORD-001',
          clientName: 'أحمد محمد',
          address: 'شارع الأمير عبد القادر، رقم 12',
          amount: 1500,
          status: 'pending',
          createdAt: '2024-01-15 10:30',
          estimatedTime: '30 دقيقة',
        },
        {
          id: 2,
          orderId: 'ORD-002',
          clientName: 'سارة خالد',
          address: 'حي الرياض، عمارة رقم 5',
          amount: 2300,
          status: 'in_progress',
          createdAt: '2024-01-15 11:00',
          estimatedTime: '20 دقيقة',
        },
        {
          id: 3,
          orderId: 'ORD-003',
          clientName: 'محمد علي',
          address: 'شارع بن مهيدي',
          amount: 1800,
          status: 'pending',
          createdAt: '2024-01-15 11:30',
          estimatedTime: '45 دقيقة',
        },
      ]);

      setCurrentDelivery({
        id: 2,
        orderId: 'ORD-002',
        clientName: 'سارة خالد',
        address: 'حي الرياض، عمارة رقم 5',
        amount: 2300,
        status: 'in_progress',
        phone: '0551234567',
        notes: 'الاتصال قبل الوصول',
      });

    } catch (error) {
      console.error('❌ [LOAD_DATA_ERROR] - خطأ في تحميل البيانات:', error);
    }
  };

  // 🎯 معالجة التوصيلات
  const acceptDelivery = async (deliveryId) => {
    try {
      setScanResult('✅ تم قبول التوصيلة بنجاح');
      loadLivreurData(user?.id);
    } catch (error) {
      console.error('❌ [ACCEPT_ERROR] - خطأ في قبول التوصيلة:', error);
      setScanResult('❌ حدث خطأ في قبول التوصيلة');
    }
  };

  const startDelivery = async (deliveryId) => {
    try {
      setScanResult('🚚 بدأت التوصيلة');
      loadLivreurData(user?.id);
    } catch (error) {
      console.error('❌ [START_ERROR] - خطأ في بدء التوصيلة:', error);
      setScanResult('❌ حدث خطأ في بدء التوصيلة');
    }
  };

  const completeDelivery = async (deliveryId) => {
    try {
      setScanResult('✅ تم إكمال التوصيلة بنجاح');
      setCurrentDelivery(null);
      loadLivreurData(user?.id);
    } catch (error) {
      console.error('❌ [COMPLETE_ERROR] - خطأ في إكمال التوصيلة:', error);
      setScanResult('❌ حدث خطأ في إكمال التوصيلة');
    }
  };

  // 🎯 معالجة نتيجة المسح - نفس تقنية الزبون
  const handleScan = result => {
    if (result && result.text && !scanRef.current) {
      const now = Date.now();
      // منع المسح المتكرر في وقت قصير (1 ثانية)
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

  // معالجة الأخطاء - نفس تقنية الزبون
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

      // المسح عبر API
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
        
        // ✅ معالجة خاصة لعامل التوصيل
        if (scanData.delivery_id) {
          // إذا كان الرمز لتأكيد تسليم
          await confirmDelivery(sessionId, scanData.delivery_id);
        } else {
          // إذا كان الرمز عادي
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

  // 🎯 تأكيد التسليم للعميل
  const confirmDelivery = async (sessionId, deliveryId) => {
    try {
      const confirmResponse = await fetch(
        'https://livraison-api-x45n.onrender.com/api/confirm-delivery',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            delivery_id: deliveryId,
            livreur_id: user?.id,
          }),
        }
      );

      const confirmData = await confirmResponse.json();
      if (confirmData.success) {
        setScanResult('✅ تم تأكيد التسليم بنجاح');
        
        // تحديث البيانات
        loadLivreurData(user?.id);
        
        setTimeout(() => {
          setScanResult(t('continue_using_app'));
          scanRef.current = false;
        }, 3000);
      } else {
        setScanResult(`❌ ${confirmData.message}`);
        scanRef.current = false;
      }
    } catch (error) {
      console.error('❌ [CONFIRM_ERROR] - خطأ في تأكيد التسليم:', error);
      setScanResult('❌ خطأ في تأكيد التسليم');
      scanRef.current = false;
    }
  };

  const handleLogout = () => {
    stopCamera();
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  // 🎯 دالة التنقل الذكية بين الأقسام
  const navigateToSection = section => {
    setActiveSection(section);
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
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
          <h3>{deliveryStats.totalDeliveries}</h3>
          <p>{t('total_deliveries')}</p>
        </div>
      </div>

      <div className="stat-card success">
        <div className="stat-icon">✅</div>
        <div className="stat-info">
          <h3>{deliveryStats.completedToday}</h3>
          <p>{t('completed_today')}</p>
        </div>
      </div>

      <div className="stat-card warning">
        <div className="stat-icon">⏳</div>
        <div className="stat-info">
          <h3>{deliveryStats.pendingDeliveries}</h3>
          <p>{t('pending_deliveries')}</p>
        </div>
      </div>

      <div className="stat-card info">
        <div className="stat-icon">💰</div>
        <div className="stat-info">
          <h3>{deliveryStats.earningsToday.toLocaleString()} د.ج</h3>
          <p>{t('earnings_today')}</p>
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

  // 🎯 مكون التوصيلات الحالية
  const CurrentDeliveryCard = () => {
    if (!currentDelivery) {
      return (
        <div className="no-current-delivery">
          <div className="no-delivery-icon">🚚</div>
          <h3>لا توجد توصيلة نشطة حالياً</h3>
          <p>انتظر حتى يتم تعيين توصيلة لك</p>
        </div>
      );
    }

    return (
      <div className="current-delivery-card">
        <div className="delivery-header">
          <h3>📦 التوصيلة النشطة</h3>
          <div className="delivery-status active">🟢 قيد التوصيل</div>
        </div>
        
        <div className="delivery-info">
          <div className="info-row">
            <span className="info-label">رقم الطلب:</span>
            <span className="info-value">{currentDelivery.orderId}</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">العميل:</span>
            <span className="info-value">{currentDelivery.clientName}</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">العنوان:</span>
            <span className="info-value">{currentDelivery.address}</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">المبلغ:</span>
            <span className="info-value amount">{currentDelivery.amount.toLocaleString()} د.ج</span>
          </div>
        </div>
        
        <div className="delivery-actions">
          <button 
            className="action-btn primary"
            onClick={() => completeDelivery(currentDelivery.id)}
          >
            ✅ تم التسليم
          </button>
          <button className="action-btn secondary">
            📞 اتصال بالعميل
          </button>
        </div>
      </div>
    );
  };

  // 🎯 مكون قائمة التوصيلات المتاحة
  const DeliveriesList = () => (
    <div className="deliveries-list">
      <h3>📋 التوصيلات المتاحة</h3>
      <div className="deliveries-container">
        {deliveries.map(delivery => (
          <div key={delivery.id} className="delivery-item">
            <div className="delivery-main-info">
              <div className="delivery-id">
                <span className="delivery-icon">📦</span>
                <span>{delivery.orderId}</span>
              </div>
              
              <div className="delivery-details">
                <div className="client-info">
                  <span className="client-name">{delivery.clientName}</span>
                  <span className="delivery-time">{delivery.estimatedTime}</span>
                </div>
                
                <div className="delivery-address">
                  <span className="address-icon">📍</span>
                  <span>{delivery.address}</span>
                </div>
              </div>
              
              <div className="delivery-amount">
                <span className="amount">{delivery.amount.toLocaleString()} د.ج</span>
              </div>
            </div>
            
            <div className="delivery-actions">
              {delivery.status === 'pending' && (
                <button
                  className="accept-btn"
                  onClick={() => acceptDelivery(delivery.id)}
                >
                  ✅ قبول التوصيلة
                </button>
              )}
              
              {delivery.status === 'accepted' && (
                <button
                  className="start-btn"
                  onClick={() => startDelivery(delivery.id)}
                >
                  🚚 بدأ التوصيل
                </button>
              )}
              
              {delivery.status === 'in_progress' && (
                <button
                  className="complete-btn"
                  onClick={() => completeDelivery(delivery.id)}
                >
                  ✅ تم التسليم
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 🎯 مكون الإجراءات السريعة
  const QuickActions = () => (
    <div className="quick-actions">
      <h3>⚡ {t('quick_actions')}</h3>
      <div className="actions-grid">
        <button
          className="action-card"
          onClick={() => navigateToSection('deliveries')}
        >
          <div className="action-icon">📦</div>
          <span>قبول توصيلات</span>
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
          onClick={() => navigateToSection('map')}
        >
          <div className="action-icon">🗺️</div>
          <span>عرض الخريطة</span>
        </button>

        <button
          className="action-card"
          onClick={() => navigateToSection('earnings')}
        >
          <div className="action-icon">💰</div>
          <span>الأرباح</span>
        </button>
      </div>
    </div>
  );

  return (
    <div
      className={`livreur-dashboard ${darkMode ? 'dark' : ''} ${
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

      {/* 🌐 شريط الرأس المدمج مع اللغة والوضع الليلي */}
      <motion.header
        className={`dashboard-header merged-header ${
          headerCollapsed ? 'collapsed' : ''
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="header-content-wrapper"
          initial={false}
          animate={{
            height: headerCollapsed ? 0 : 'auto',
            opacity: headerCollapsed ? 0 : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="header-top-row">
            {/* قسم اللغة */}
            <div className="header-language-section">
              <span className="section-label">{t('language')}:</span>
              <div className="language-buttons">
                <button
                  className={i18n.language === 'fr' ? 'active' : ''}
                  onClick={() => changeLanguage('fr')}
                >
                  🇫🇷
                </button>
                <button
                  className={i18n.language === 'en' ? 'active' : ''}
                  onClick={() => changeLanguage('en')}
                >
                  🇬🇧
                </button>
                <button
                  className={i18n.language === 'ar' ? 'active' : ''}
                  onClick={() => changeLanguage('ar')}
                >
                  🇸🇦
                </button>
              </div>
            </div>

            {/* قسم الوضع الليلي */}
            <div className="header-darkmode-section">
              <button
                className={`darkmode-toggle ${darkMode ? 'dark' : 'light'}`}
                onClick={toggleDarkMode}
              >
                <span className="toggle-icon">{darkMode ? '☀️' : '🌙'}</span>
                <span className="toggle-text">
                  {darkMode ? t('light_mode') : t('dark_mode')}
                </span>
              </button>
            </div>
          </div>

          <div className="header-main-row">
            <div className="header-left">
              <div className="header-title">
                <h1>🚚 Livreur Dashboard</h1>
                <p>{t('delivery_management_system')}</p>
              </div>
            </div>

            <div className="header-right">
              <div className="user-info">
                <span>
                  {t('welcome')}, {user?.nom}
                </span>
                <small className="user-role">👷 عامل توصيل</small>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.header>

      {/* 🆕 الزر العائم للشريط الجانبي */}
      {!sidebarOpen && (
        <motion.button
          className="floating-sidebar-toggle"
          onClick={() => setSidebarOpen(true)}
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

      {/* هيكل المحتوى */}
      <div className="livreur-content">
        <AnimatePresence>
          {sidebarOpen && (
            <>
              {/* 🆕 طبقة خلفية شفافة لإغلاق الشريط */}
              <motion.div
                className="sidebar-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
              />

              <motion.div
                className={`livreur-sidebar ${sidebarOpen ? 'open' : ''}`}
                initial={{ x: -320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -320, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{ top: headerCollapsed ? '50px' : '120px' }}
              >
                {/* 🆕 هيدر الشريط الجانبي */}
                <div className="sidebar-header">
                  <div className="sidebar-user">
                    <div className="user-avatar">
                      {user?.nom ? user.nom.charAt(0).toUpperCase() : 'L'}
                    </div>
                    <div className="user-info">
                      <h3>{user?.nom || t('user')}</h3>
                      <p>عامل توصيل</p>
                      <small className="user-status active">🟢 متصل</small>
                    </div>
                  </div>
                  <button
                    className="sidebar-close-btn"
                    onClick={() => setSidebarOpen(false)}
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

                {/* 🆕 منطقة التنقل */}
                <div className="sidebar-nav-container">
                  <nav className="sidebar-nav">
                    <button
                      className={`nav-item ${
                        activeSection === 'dashboard' ? 'active' : ''
                      }`}
                      onClick={() => navigateToSection('dashboard')}
                    >
                      📊 {t('dashboard')}
                    </button>
                    
                    {/* 🆕 إخفاء زر الماسح الضوئي لمستخدمي الكمبيوتر */}
                    {isMobile && (
                      <button
                        className={`nav-item ${
                          activeSection === 'scanner' ? 'active' : ''
                        }`}
                        onClick={() => navigateToSection('scanner')}
                      >
                        📷 {t('scan_qr')}
                      </button>
                    )}
                    
                    <button
                      className={`nav-item ${
                        activeSection === 'deliveries' ? 'active' : ''
                      }`}
                      onClick={() => navigateToSection('deliveries')}
                    >
                      📦 التوصيلات
                    </button>
                    
                    <button
                      className={`nav-item ${
                        activeSection === 'map' ? 'active' : ''
                      }`}
                      onClick={() => navigateToSection('map')}
                    >
                      🗺️ الخريطة
                    </button>
                    
                    <button
                      className={`nav-item ${
                        activeSection === 'earnings' ? 'active' : ''
                      }`}
                      onClick={() => navigateToSection('earnings')}
                    >
                      💰 الأرباح
                    </button>
                    
                    <div className="nav-section-divider">
                      <span>الإعدادات</span>
                    </div>
                    
                    <button
                      className="nav-item"
                      onClick={() => navigateToSection('profile')}
                    >
                      👤 الملف الشخصي
                    </button>
                    
                    <button
                      className="nav-item"
                      onClick={() => navigateToSection('availability')}
                    >
                      🕐 حالة التوفر
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="nav-item logout-sidebar-btn"
                    >
                      🚪 تسجيل الخروج
                    </button>
                  </nav>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <main className="livreur-main">
          {/* 🎯 قسم لوحة التحكم */}
          {activeSection === 'dashboard' && (
            <div className="dashboard-content">
              {/* قسم الترحيب */}
              <div className="welcome-section">
                <h2>
                  👋 أهلاً بك، {user?.nom}!
                </h2>
                <p>إحصائيات وأداء عملك اليوم</p>
                {currentDelivery && (
                  <div className="active-delivery-alert">
                    <p>
                      ⚡ <strong>لديك توصيلة نشطة:</strong> {currentDelivery.orderId}
                    </p>
                  </div>
                )}
                {!isMobile && (
                  <div className="desktop-message">
                    <p>
                      💻 <strong>وضع الكمبيوتر:</strong> يمكنك إدخال رمز الجلسة يدوياً
                    </p>
                  </div>
                )}
              </div>

              {/* التوصيلة الحالية */}
              <CurrentDeliveryCard />

              {/* إحصائيات سريعة */}
              <StatsCards />

              {/* شبكة المحتوى الحالية */}
              <div className="content-grid">
                <div className="content-column">
                  <RecentActivity />
                </div>
                <div className="content-column">
                  <DeliveriesList />
                </div>
                <div className="content-column">
                  <QuickActions />
                </div>
              </div>
            </div>
          )}

          {/* 🎯 قسم الماسح - يظهر فقط للمستخدمين على الجوال */}
          {activeSection === 'scanner' && isMobile && (
            <section className="scanner-section">
              <div className="section-header">
                <h2>🔍 {t('delivery_qr_scanner')}</h2>
                <p>{t('scan_to_confirm_delivery')}</p>
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
                {/* مساحة الكاميرا الرئيسية - النقر لتفعيل */}
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
                          <p>قم بمسح رمز الاستلام من العميل</p>
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
                <h3>📝 أو أدخل رمز الجلسة يدوياً</h3>
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

              <div className="instructions-section">
                <div className="instructions">
                  <h3>💡 كيفية استخدام الماسح:</h3>
                  <ul>
                    <li>✅ قم بمسح رمز QR من تطبيق العميل</li>
                    <li>✅ تأكد من جودة الإضاءة والمسافة</li>
                    <li>✅ حافظ على ثبات الهاتف أثناء المسح</li>
                    <li>✅ انتظر تأكيد الاستلام من النظام</li>
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* 🆕 رسالة للمستخدمين على الكمبيوتر عند محاولة الوصول للماسح */}
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

          {/* 🎯 قسم التوصيلات */}
          {activeSection === 'deliveries' && (
            <div className="deliveries-content">
              <div className="section-header">
                <h2>📦 إدارة التوصيلات</h2>
                <p>جميع التوصيلات المطلوبة والمكتملة</p>
              </div>
              
              <div className="deliveries-management">
                <div className="deliveries-filters">
                  <div className="filter-buttons">
                    <button className="filter-btn active">الكل</button>
                    <button className="filter-btn">المعلقة</button>
                    <button className="filter-btn">قيد التوصيل</button>
                    <button className="filter-btn">المكتملة</button>
                  </div>
                  
                  <div className="search-box">
                    <input type="text" placeholder="🔍 بحث في التوصيلات..." />
                  </div>
                </div>
                
                <DeliveriesList />
              </div>
            </div>
          )}

          {/* 🎯 قسم الخريطة */}
          {activeSection === 'map' && (
            <div className="map-content">
              <div className="section-header">
                <h2>🗺️ خريطة التوصيلات</h2>
                <p>عرض جميع التوصيلات على الخريطة</p>
              </div>
              
              <div className="delivery-map">
                <div className="map-container">
                  <div className="map-placeholder">
                    <div className="map-overlay">
                      <div className="map-marker current">
                        <div className="marker-icon">📍</div>
                        <div className="marker-label">موقعك الحالي</div>
                      </div>
                      
                      {deliveries.slice(0, 3).map((delivery, index) => (
                        <div key={delivery.id} className="map-marker delivery">
                          <div className="marker-icon">📦</div>
                          <div className="marker-label">
                            {delivery.clientName} - {delivery.orderId}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="map-instructions">
                      <p>🗺️ سيتم دمج خرائط Google هنا</p>
                      <small>للعرض الفعلي للخرائط، تحتاج إلى مفتاح Google Maps API</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 🎯 قسم الأرباح */}
          {activeSection === 'earnings' && (
            <div className="earnings-content">
              <div className="section-header">
                <h2>💰 تقرير الأرباح</h2>
                <p>تفاصيل أرباحك وإحصائياتك المالية</p>
              </div>
              
              <div className="earnings-summary">
                <div className="earnings-grid">
                  <div className="earnings-card">
                    <div className="earnings-icon">💰</div>
                    <div className="earnings-info">
                      <h4>اليوم</h4>
                      <p className="amount">{deliveryStats.earningsToday.toLocaleString()} د.ج</p>
                      <small>{deliveryStats.completedToday} توصيلة</small>
                    </div>
                  </div>
                  
                  <div className="earnings-card">
                    <div className="earnings-icon">📅</div>
                    <div className="earnings-info">
                      <h4>هذا الأسبوع</h4>
                      <p className="amount">{(deliveryStats.earningsToday * 7).toLocaleString()} د.ج</p>
                      <small>مقدر</small>
                    </div>
                  </div>
                  
                  <div className="earnings-card">
                    <div className="earnings-icon">📊</div>
                    <div className="earnings-info">
                      <h4>المعدل اليومي</h4>
                      <p className="amount">{Math.round(deliveryStats.earningsToday / deliveryStats.completedToday).toLocaleString()} د.ج</p>
                      <small>لكل توصيلة</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}