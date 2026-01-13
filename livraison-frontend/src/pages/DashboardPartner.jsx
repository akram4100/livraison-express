import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrReader } from 'react-qr-reader';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../style/dashboardPartner.css';

export default function DashboardPartner() {
  const [user, setUser] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [manualSessionId, setManualSessionId] = useState('');
  const [cameraError, setCameraError] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [lastScanTime, setLastScanTime] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(true);
  const { t, i18n } = useTranslation();
  const scanRef = useRef(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [recentActivity, setRecentActivity] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const [storeFormData, setStoreFormData] = useState({
    name: '',
    description: '',
    category: '',
    address: '',
    phone: '',
    email: '',
    logo: null,
    banner: null,
  });

  // 🎯 إحصائيات خاصة بالشريك
  const [partnerStats, setPartnerStats] = useState({
    totalDeliveries: 0,
    pendingDeliveries: 0,
    completedDeliveries: 0,
    totalEarnings: 0,
    activeOrders: 0,
    canceledOrders: 0,
  });

  // 🎯 قائمة الطلبات النشطة للشريك
  const [activeOrders, setActiveOrders] = useState([
    {
      id: 'ORD-001',
      customer: 'محمد أحمد',
      address: 'شارع الرياض، حي النخيل',
      amount: '1500 د.ج',
      status: 'pending',
      time: '10:30 AM',
    },
    {
      id: 'ORD-002',
      customer: 'أحمد خالد',
      address: 'حي السلام، عمارة 15',
      amount: '2300 د.ج',
      status: 'in_progress',
      time: '11:15 AM',
    },
    {
      id: 'ORD-003',
      customer: 'سارة محمد',
      address: 'حي الأمل، شارع 20',
      amount: '1800 د.ج',
      status: 'ready',
      time: '12:00 PM',
    },
  ]);

  // 🎯 إشعارات الشريك
  const [partnerNotifications, setPartnerNotifications] = useState([
    {
      id: 1,
      type: 'new_order',
      message: 'طلب جديد من مطعم الندى',
      time: 'الآن',
      read: false,
    },
    {
      id: 2,
      type: 'delivery_update',
      message: 'تم تسليم الطلب #ORD-045',
      time: 'قبل 30 دقيقة',
      read: true,
    },
    {
      id: 3,
      type: 'payment',
      message: 'تم تحويل 5000 د.ج إلى حسابك',
      time: 'قبل ساعتين',
      read: true,
    },
  ]);

  const [stores, setStores] = useState([
    {
      id: 1,
      name: 'مطعم الندى',
      category: 'مطعم',
      description: 'أفضل المأكولات التقليدية',
      address: 'شارع الرياض، حي النخيل',
      phone: '0551234567',
      email: 'info@alnada.com',
      status: 'active',
      logo: 'https://via.placeholder.com/60',
      banner: 'https://via.placeholder.com/400x150',
      orders: 156,
      revenue: '45,000 د.ج',
      rating: 4.5,
    },
    {
      id: 2,
      name: 'مقهى القهوة الذهبية',
      category: 'مقهى',
      description: 'قهوة عربية أصيلة',
      address: 'حي السلام، عمارة 15',
      phone: '0557654321',
      email: 'coffee@golden.com',
      status: 'active',
      logo: 'https://via.placeholder.com/60',
      banner: 'https://via.placeholder.com/400x150',
      orders: 89,
      revenue: '23,500 د.ج',
      rating: 4.8,
    },
  ]);

  const [storeFilter, setStoreFilter] = useState('all');
  const [formSuccess, setFormSuccess] = useState(false);
  const [isCreatingStore, setIsCreatingStore] = useState(false);

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

    if (window.innerWidth <= 768) {
      closeSidebarAndShowHeader();
    }

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

  // 🎯 دوال مساعدة للنشاط (معدلة للشريك)
  const getActivityMessage = section => {
    const messages = {
      dashboard: t('viewed_dashboard'),
      scanner: t('opened_scanner'),
      orders: t('viewed_orders'),
      deliveries: t('viewed_deliveries'),
      earnings: t('viewed_earnings'),
      schedule: t('viewed_schedule'),
      profile: t('opened_profile'),
      settings: t('opened_settings'),
      my_stores: t('opened_create_store'),
    };
    return messages[section];
  };

  const getSectionIcon = section => {
    const icons = {
      dashboard: '📊',
      scanner: '📷',
      orders: '📦',
      my_stores: '🏪',
      deliveries: '🚚',
      earnings: '💰',
      schedule: '📅',
      profile: '👤',
      settings: '⚙️',
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
      if (headerCollapsed) {
        clientContent.style.paddingTop = '50px';
      } else {
        clientContent.style.paddingTop = '120px';
      }
    } else if (clientContent) {
      clientContent.style.paddingTop = '0';
    }
  }, [headerCollapsed, headerVisible]);

  // ✅ تأثير المصادقة والإعدادات
  useEffect(() => {
    // قراءة البيانات من localStorage بشكل صحيح
    const userData = localStorage.getItem('user'); // ✅ صحيح

    if (userData) {
      try {
        const userObj = JSON.parse(userData);

        // 🔍 التحقق من أن المستخدم هو شريك
        if (userObj.role !== 'partner') {
          console.error(
            '❌ [ROLE_ERROR] - هذا المستخدم ليس شريكاً:',
            userObj.role
          );
          handleLogout();
          return;
        }

        setUser(userObj);
        setIsAuthenticated(true);
        console.log(
          '✅ [PARTNER_AUTH] - تم تسجيل الدخول كشريك:',
          userObj.email
        );
      } catch (error) {
        console.error('❌ [AUTH_ERROR] - خطأ في المصادقة:', error);
        handleLogout();
      }
    } else {
      console.error('❌ [AUTH_ERROR] - لا توجد بيانات مستخدم');
      handleLogout();
    }
    if (userData) {
      try {
        const userObj = JSON.parse(userData);
        setUser(userObj);
        setIsAuthenticated(true);
        console.log(
          '✅ [PARTNER_AUTH] - تم تسجيل الدخول كشريك:',
          userObj.email
        );
      } catch (error) {
        console.error('❌ [AUTH_ERROR] - خطأ في المصادقة');
        handleLogout();
      }
    }

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
  // 🎯 أضف useEffect لجلب المتاجر عند التحميل
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      fetchStores();
    }
  }, [isAuthenticated, user]);
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

  // ========== 🎯 كود المسح الضوئي - محفوظ كما هو ==========
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

  // 🎯 نسخة معدلة بنفس تقنية العميل
  const processSessionId = async sessionId => {
    try {
      setScanResult(t('processing_session'));

      const scanResponse = await fetch(
        'https://livraison-api-x45n.onrender.com/api/mobile/scan-qr',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            user_type: 'partner', // أضف هذا
          }),
        }
      );

      const scanData = await scanResponse.json();

      if (scanData.success) {
        setScanResult(t('qr_scanned_confirming'));

        // 🔥 **استدعاء confirmLogin مثل العميل**
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

  // 🔥 **أضف نفس دالة confirmLogin مع تعديلات الشريك**
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
            user_type: 'partner', // تحديد أنه شريك
            action: 'delivery_confirmation', // إجراء مختلف
          }),
        }
      );

      const confirmData = await confirmResponse.json();

      if (confirmData.success) {
        setScanResult(t('delivery_confirmed_success'));

        // 🎯 **إذا كان هناك رابط توجيه في الاستجابة**
        if (confirmData.redirect_url) {
          setTimeout(() => {
            // توجيه تلقائي
            window.location.href = confirmData.redirect_url;
          }, 2000);
        } else {
          // تحديث الإحصائيات مثل حالياً
          setPartnerStats(prev => ({
            ...prev,
            completedDeliveries: prev.completedDeliveries + 1,
            totalEarnings: prev.totalEarnings + (confirmData.amount || 0),
          }));

          setTimeout(() => {
            setScanResult(t('continue_using_app'));
            scanRef.current = false;
          }, 3000);
        }
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
  // ========== نهاية كود المسح الضوئي ==========

  const handleLogout = () => {
    stopCamera();
    localStorage.removeItem('partner');
    localStorage.removeItem('partner_token');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/partner-login');
  };

  // 🎯 دالة تحديث حالة الطلب (للشريك)
  const updateOrderStatus = (orderId, newStatus) => {
    setActiveOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );

    // تحديث الإحصائيات بناءً على الحالة الجديدة
    if (newStatus === 'completed') {
      setPartnerStats(prev => ({
        ...prev,
        completedDeliveries: prev.completedDeliveries + 1,
        activeOrders: prev.activeOrders - 1,
      }));
    } else if (newStatus === 'canceled') {
      setPartnerStats(prev => ({
        ...prev,
        canceledOrders: prev.canceledOrders + 1,
        activeOrders: prev.activeOrders - 1,
      }));
    }
  };

  // 🎯 دالة قراءة الإشعار
  const markNotificationAsRead = notificationId => {
    setPartnerNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="auth-required">
        <div className="auth-message">
          <div className="auth-icon">🔐</div>
          <h2>{t('partner_login_required')}</h2>
          <p>{t('partner_login_required_message')}</p>
          <button
            onClick={() => navigate('/partner-login')}
            className="auth-btn primary"
          >
            {t('go_to_partner_login')}
          </button>
        </div>
      </div>
    );
  }

  // 🎯 مكون بطاقات الإحصائيات - معدل للشريك
  const PartnerStatsCards = () => (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon">📊</div>
        <div className="stat-info">
          <h3>{partnerStats.totalDeliveries}</h3>
          <p>{t('total_deliveries')}</p>
        </div>
      </div>

      <div className="stat-card success">
        <div className="stat-icon">✅</div>
        <div className="stat-info">
          <h3>{partnerStats.completedDeliveries}</h3>
          <p>{t('completed_deliveries')}</p>
        </div>
      </div>

      <div className="stat-card warning">
        <div className="stat-icon">⏳</div>
        <div className="stat-info">
          <h3>{partnerStats.activeOrders}</h3>
          <p>{t('active_orders')}</p>
        </div>
      </div>

      <div className="stat-card earnings">
        <div className="stat-icon">💰</div>
        <div className="stat-info">
          <h3>{partnerStats.totalEarnings.toLocaleString()} د.ج</h3>
          <p>{t('total_earnings')}</p>
        </div>
      </div>
    </div>
  );

  // 🎯 مكون النشاط الأخير - معدل للشريك
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

  // 🎯 مكون الطلبات النشطة - خاص بالشريك
  const ActiveOrders = () => (
    <div className="active-orders">
      <h3>📦 {t('active_orders')}</h3>
      <div className="orders-list">
        {activeOrders.map(order => (
          <div key={order.id} className="order-item-partner">
            <div className="order-header">
              <h4>{order.id}</h4>
              <span className={`order-status-badge ${order.status}`}>
                {order.status === 'pending' && '⏳ ' + t('pending')}
                {order.status === 'in_progress' && '🚚 ' + t('in_progress')}
                {order.status === 'ready' && '✅ ' + t('ready')}
              </span>
            </div>
            <div className="order-details">
              <p>
                <strong>{t('customer')}:</strong> {order.customer}
              </p>
              <p>
                <strong>{t('address')}:</strong> {order.address}
              </p>
              <p>
                <strong>{t('amount')}:</strong> {order.amount}
              </p>
            </div>
            <div className="order-actions">
              {order.status === 'pending' && (
                <button
                  className="action-btn small primary"
                  onClick={() => updateOrderStatus(order.id, 'in_progress')}
                >
                  🚚 {t('start_delivery')}
                </button>
              )}
              {order.status === 'in_progress' && (
                <button
                  className="action-btn small success"
                  onClick={() => updateOrderStatus(order.id, 'completed')}
                >
                  ✅ {t('complete_delivery')}
                </button>
              )}
              <button
                className="action-btn small secondary"
                onClick={() => updateOrderStatus(order.id, 'canceled')}
              >
                ❌ {t('cancel')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  // 🎯 بعد الدوال الأخرى، أضف:

  // دالة فتح إنشاء متجر جديد
  const openCreateStore = () => {
    setIsCreatingStore(true);
    navigateToSection('my_stores');
    setFormSuccess(false);
    // إعادة تعيين نموذج
    setStoreFormData({
      name: '',
      description: '',
      category: '',
      address: '',
      phone: '',
      email: '',
      logo: null,
      banner: null,
    });
  };
  // في DashboardPartner.jsx - أضف هذه الوظائف

  // 🎯 دالة جلب المتاجر من API
  const fetchStores = async () => {
    try {
      const response = await fetch(
        `https://livraison-api-x45n.onrender.com/api/partner/stores?owner_email=${user.email}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setStores(data.stores);
      } else {
        console.error('❌ Error fetching stores:', data.message);
      }
    } catch (error) {
      console.error('❌ Network error fetching stores:', error);
    }
  };

  // 🎯 دالة إنشاء متجر عبر API
  const handleCreateStore = async e => {
    e.preventDefault();

    try {
      console.log('🚀 Creating new store via API:', storeFormData);

      // تحضير بيانات المتجر
      const storeData = {
        name: storeFormData.name,
        description: storeFormData.description,
        category: storeFormData.category,
        address: storeFormData.address,
        phone: storeFormData.phone,
        email: storeFormData.email,
        owner_id: user.id || user.email,
        owner_email: user.email,
        logo_url: storeFormData.logo || 'https://via.placeholder.com/200',
        banner_url:
          storeFormData.banner || 'https://via.placeholder.com/1200x400',
      };

      // استدعاء API
      const response = await fetch(
        'https://livraison-api-x45n.onrender.com/api/partner/stores/create',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(storeData),
        }
      );

      const data = await response.json();

      if (data.success) {
        setFormSuccess(true);

        // إضافة المتجر الجديد للقائمة
        const newStore = {
          id: data.store_id,
          ...storeData,
          status: 'active',
          orders: 0,
          revenue: '0 د.ج',
          rating: 0,
        };

        setStores(prev => [newStore, ...prev]);

        // إعادة تعيين النموذج
        setTimeout(() => {
          setStoreFormData({
            name: '',
            description: '',
            category: '',
            address: '',
            phone: '',
            email: '',
            logo: null,
            banner: null,
          });
          setIsCreatingStore(false);
        }, 2000);

        // تحديث النشاط
        const newActivity = {
          icon: '🏪',
          message: t('store_created_successfully'),
          time: getCurrentTime(),
        };
        setRecentActivity(prev => [newActivity, ...prev.slice(0, 4)]);
      } else {
        console.error('❌ API error:', data.message);
        setScanResult(t('store_creation_failed') + ': ' + data.message);
      }
    } catch (error) {
      console.error('❌ Network error creating store:', error);
      setScanResult(t('store_creation_failed') + ': ' + error.message);
    }
  };

  // 🎯 دالة حذف متجر عبر API
  const handleDeleteStore = async storeId => {
    if (window.confirm(t('confirm_delete_store'))) {
      try {
        const response = await fetch(
          `https://livraison-api-x45n.onrender.com/api/partner/stores/${storeId}?user_email=${user.email}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();

        if (data.success) {
          // تحديث القائمة محلياً
          setStores(prev => prev.filter(store => store.id !== storeId));

          const newActivity = {
            icon: '🗑️',
            message: t('store_deleted_successfully'),
            time: getCurrentTime(),
          };
          setRecentActivity(prev => [newActivity, ...prev.slice(0, 4)]);
        } else {
          alert('❌ ' + data.message);
        }
      } catch (error) {
        console.error('❌ Error deleting store:', error);
        alert(t('store_deletion_failed'));
      }
    }
  };

  // دالة العودة لقائمة المتاجر
  const backToStoresList = () => {
    setIsCreatingStore(false);
    navigateToSection('my_stores');
    setFormSuccess(false);
  };

  // في DashboardPartner.jsx - تعديل دالة تحميل الصور
  const handleImageUpload = async (type, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result.split(',')[1]; // إزالة data:image/png;base64,

        // حفظ الصورة مؤقتاً في النموذج
        setStoreFormData(prev => ({
          ...prev,
          [type]: reader.result,
        }));

        // إذا كان هناك storeId (في حالة التحديث)
        if (storeFormData.id) {
          const result = await storeService.uploadImage(
            storeFormData.id,
            type,
            base64Image
          );

          if (result.success) {
            console.log(`✅ ${type} uploaded to server`);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // دالة تصفية المتاجر
  const filteredStores = stores.filter(store => {
    if (storeFilter === 'all') return true;
    if (storeFilter === 'active') return store.status === 'active';
    if (storeFilter === 'inactive') return store.status === 'inactive';
    return true;
  });
  // 🎯 مكون الإشعارات - خاص بالشريك
  const PartnerNotifications = () => (
    <div className="partner-notifications">
      <h3>🔔 {t('notifications')}</h3>
      <div className="notifications-list">
        {partnerNotifications.map(notification => (
          <div
            key={notification.id}
            className={`notification-item ${
              notification.read ? 'read' : 'unread'
            }`}
            onClick={() => markNotificationAsRead(notification.id)}
          >
            <div className="notification-icon">
              {notification.type === 'new_order' && '🆕'}
              {notification.type === 'delivery_update' && '📦'}
              {notification.type === 'payment' && '💰'}
            </div>
            <div className="notification-content">
              <p>{notification.message}</p>
              <span className="notification-time">{notification.time}</span>
            </div>
            {!notification.read && <div className="notification-dot"></div>}
          </div>
        ))}
      </div>
    </div>
  );

  // 🎯 الإجراءات السريعة للشريك
  const PartnerQuickActions = () => (
    <div className="quick-actions">
      <h3>⚡ {t('quick_actions')}</h3>
      <div className="actions-grid">
        {isMobile && (
          <button
            className="action-card"
            onClick={() => navigateToSection('scanner')}
          >
            <div className="action-icon">📷</div>
            <span>{t('scan_delivery')}</span>
          </button>
        )}

        <button
          className="action-card"
          onClick={() => navigateToSection('orders')}
        >
          <div className="action-icon">📦</div>
          <span>{t('view_orders')}</span>
        </button>

        <button
          className="action-card"
          onClick={() => navigateToSection('earnings')}
        >
          <div className="action-icon">💰</div>
          <span>{t('view_earnings')}</span>
        </button>

        <button
          className="action-card"
          onClick={() => navigateToSection('schedule')}
        >
          <div className="action-icon">📅</div>
          <span>{t('schedule')}</span>
        </button>
      </div>
    </div>
  );

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
                  <h1>🚚 Livraison Partner</h1>
                  <p>{t('partner_dashboard')}</p>
                </div>
              </div>

              <div className="header-right unified-right">
                <div className="user-info">
                  <span>
                    {t('welcome_partner')}, {user?.nom || user?.company_name}
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

      {/* زر فتح الشريط الجانبي العائم */}
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

      {/* الشريط الجانبي */}
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
                <div className="user-avatar partner">
                  {user?.nom ? user.nom.charAt(0).toUpperCase() : 'P'}
                </div>
                <div className="user-info">
                  <h3>{user?.nom || user?.company_name || t('partner')}</h3>
                  <p>{user?.email || t('partner_account')}</p>
                  <small className="partner-badge">
                    👑 {t('verified_partner')}
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

            {/* 🆕 إضافة حاوية السكرول بار هنا */}
            <div className="sidebar-scroll-container">
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
                    📷 {t('scan_delivery')}
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
                    activeSection === 'my_stores' ? 'active' : ''
                  }`}
                  onClick={() => {
                    navigateToSection('my_stores');
                    closeSidebarAndShowHeader();
                  }}
                >
                  🏪 {t('my_stores')}
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
                    activeSection === 'earnings' ? 'active' : ''
                  }`}
                  onClick={() => {
                    navigateToSection('earnings');
                    closeSidebarAndShowHeader();
                  }}
                >
                  💰 {t('earnings')}
                </button>

                <button
                  className={`nav-item ${
                    activeSection === 'schedule' ? 'active' : ''
                  }`}
                  onClick={() => {
                    navigateToSection('schedule');
                    closeSidebarAndShowHeader();
                  }}
                >
                  📅 {t('schedule')}
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
                    navigateToSection('settings');
                    closeSidebarAndShowHeader();
                  }}
                >
                  ⚙️ {t('settings')}
                </button>

                {/* 🆕 قسم إضافي للاختبار */}
                <div className="nav-section-divider">
                  <span>{t('additional_features')}</span>
                </div>

                <button
                  className="nav-item"
                  onClick={() => {
                    navigateToSection('reports');
                    closeSidebarAndShowHeader();
                  }}
                >
                  📈 {t('reports')}
                </button>

                <button
                  className="nav-item"
                  onClick={() => {
                    navigateToSection('support');
                    closeSidebarAndShowHeader();
                  }}
                >
                  🆘 {t('support')}
                </button>

                <button
                  className="nav-item"
                  onClick={() => {
                    navigateToSection('help');
                    closeSidebarAndShowHeader();
                  }}
                >
                  ❓ {t('help_center')}
                </button>

                <button
                  onClick={handleLogout}
                  className="nav-item logout-sidebar-btn"
                >
                  🚪 {t('logout')}
                </button>

                {/* 🆕 مساحة في الأسفل لتحسين المظهر */}
                <div className="sidebar-spacer"></div>
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
                  👋 {t('welcome_back_partner')},{' '}
                  {user?.nom || user?.company_name}!
                </h2>
                <p>{t('partner_dashboard_overview')}</p>
                {!isMobile && (
                  <div className="desktop-message">
                    <p>
                      💻 <strong>وضع الشريك:</strong> يمكنك مسح رموز التوصيل أو
                      إدخال رمز الجلسة يدوياً
                    </p>
                  </div>
                )}
              </div>

              <PartnerStatsCards />

              <div className="content-grid">
                <div className="content-column">
                  <ActiveOrders />
                </div>
                <div className="content-column">
                  <PartnerNotifications />
                </div>
                <div className="content-column">
                  <PartnerQuickActions />
                  <RecentActivity />
                </div>
              </div>
            </div>
          )}

          {/* 🎯 قسم الماسح - للجوال فقط */}
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
                          <h3>{t('click_to_scan_delivery')}</h3>
                          <p>{t('scan_qr_to_confirm')}</p>
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
                <h3>📝 {t('or_enter_delivery_code')}</h3>
                <form onSubmit={handleManualQRSubmit} className="manual-form">
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder={t('enter_delivery_code')}
                      value={manualSessionId}
                      onChange={e => setManualSessionId(e.target.value)}
                      className="session-input"
                    />
                    <button type="submit" className="submit-btn">
                      {t('confirm_delivery')}
                    </button>
                  </div>
                </form>
              </div>

              <div className="instructions-section">
                <div className="instructions">
                  <h3>💡 {t('how_delivery_system_works')}:</h3>
                  <ul>
                    <li>✅ {t('system_works_partner_1')}</li>
                    <li>✅ {t('system_works_partner_2')}</li>
                    <li>✅ {t('system_works_partner_3')}</li>
                    <li>✅ {t('system_works_partner_4')}</li>
                  </ul>
                </div>
              </div>
            </section>
          )}
          {/* 🎯 قسم متاجري */}
          {activeSection === 'my_stores' && !isCreatingStore && (
            <div className="my-stores-content">
              <div className="section-header">
                <h2>🏪 {t('my_stores')}</h2>
                <p>{t('manage_your_stores')}</p>
              </div>

              {/* قسم اختيار الإجراء */}
              <div className="stores-action-section">
                <h3 style={{ color: 'white', marginBottom: '1rem' }}>
                  {t('what_would_you_like_to_do')}
                </h3>
                <div className="action-cards-grid">
                  {/* بطاقة إنشاء متجر */}
                  <div
                    className="action-card-large create-store"
                    onClick={openCreateStore}
                  >
                    <div className="action-icon-large">🏪</div>
                    <div className="action-content">
                      <h3>{t('create_new_store')}</h3>
                      <p>{t('create_store_description')}</p>
                      <span className="action-badge">
                        ✨ {t('recommended')}
                      </span>
                    </div>
                  </div>

                  {/* بطاقة إدارة المتاجر */}
                  <div
                    className="action-card-large manage-stores"
                    onClick={() => navigateToSection('manage_stores')}
                  >
                    <div className="action-icon-large">📊</div>
                    <div className="action-content">
                      <h3>{t('manage_existing_stores')}</h3>
                      <p>{t('manage_stores_description')}</p>
                      <span className="action-badge">
                        📁 {stores.length} {t('stores')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 🎯 قسم إنشاء متجر جديد */}
          {activeSection === 'my_stores' && isCreatingStore && (
            <div className="my-stores-content">
              <div className="section-header">
                <button
                  className="action-btn secondary small"
                  onClick={backToStoresList}
                  style={{ marginBottom: '1rem' }}
                >
                  ↩️ {t('back_to_stores')}
                </button>
                <h2>🏪 {t('create_new_store')}</h2>
                <p>{t('fill_store_details')}</p>
              </div>

              {/* رسالة النجاح */}
              {formSuccess && (
                <div className="success-message">
                  <div className="message-icon">✅</div>
                  <p>{t('store_created_successfully')}</p>
                  <button
                    className="action-btn small success"
                    onClick={() => setFormSuccess(false)}
                  >
                    ✖️
                  </button>
                </div>
              )}

              {/* نموذج إنشاء المتجر */}
              <form onSubmit={handleCreateStore} className="create-store-form">
                {/* القسم 1: المعلومات الأساسية */}
                <div className="form-section">
                  <h4>📝 {t('basic_information')}</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="required">🏪 {t('store_name')}</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder={t('enter_store_name')}
                        value={storeFormData.name}
                        onChange={e =>
                          setStoreFormData(prev => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="required">📂 {t('category')}</label>
                      <select
                        className="form-select"
                        value={storeFormData.category}
                        onChange={e =>
                          setStoreFormData(prev => ({
                            ...prev,
                            category: e.target.value,
                          }))
                        }
                        required
                      >
                        <option value="">{t('select_category')}</option>
                        <option value="restaurant">{t('restaurant')}</option>
                        <option value="cafe">{t('cafe')}</option>
                        <option value="bakery">{t('bakery')}</option>
                        <option value="grocery">{t('grocery')}</option>
                        <option value="other">{t('other')}</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="required">📍 {t('address')}</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder={t('enter_store_address')}
                        value={storeFormData.address}
                        onChange={e =>
                          setStoreFormData(prev => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="required">📞 {t('phone_number')}</label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder={t('enter_phone_number')}
                        value={storeFormData.phone}
                        onChange={e =>
                          setStoreFormData(prev => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>📝 {t('description')}</label>
                    <textarea
                      className="form-input form-textarea"
                      placeholder={t('enter_store_description')}
                      value={storeFormData.description}
                      onChange={e =>
                        setStoreFormData(prev => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows="3"
                    />
                  </div>
                </div>

                {/* القسم 2: الصور */}
                <div className="form-section">
                  <h4>🖼️ {t('store_images')}</h4>
                  <div className="image-upload-section">
                    {/* شعار المتجر */}
                    <div className="upload-area">
                      <label
                        htmlFor="logo-upload"
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="upload-icon">🖼️</div>
                        <p>{t('upload_logo')}</p>
                        <small>{t('recommended_size')}: 200x200</small>
                      </label>
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={e => handleImageUpload('logo', e)}
                        style={{ display: 'none' }}
                      />
                      {storeFormData.logo && (
                        <div className="image-preview">
                          <img
                            src={storeFormData.logo}
                            alt={t('logo_preview')}
                          />
                        </div>
                      )}
                    </div>

                    {/* بانر المتجر */}
                    <div className="upload-area">
                      <label
                        htmlFor="banner-upload"
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="upload-icon">🎨</div>
                        <p>{t('upload_banner')}</p>
                        <small>{t('recommended_size')}: 1200x400</small>
                      </label>
                      <input
                        id="banner-upload"
                        type="file"
                        accept="image/*"
                        onChange={e => handleImageUpload('banner', e)}
                        style={{ display: 'none' }}
                      />
                      {storeFormData.banner && (
                        <div className="image-preview">
                          <img
                            src={storeFormData.banner}
                            alt={t('banner_preview')}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* القسم 3: معلومات الاتصال */}
                <div className="form-section">
                  <h4>📧 {t('contact_information')}</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>📧 {t('email')}</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder={t('enter_email')}
                        value={storeFormData.email}
                        onChange={e =>
                          setStoreFormData(prev => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* أزرار النموذج */}
                <div className="form-actions">
                  <button
                    type="button"
                    className="form-btn secondary"
                    onClick={backToStoresList}
                  >
                    ❌ {t('cancel')}
                  </button>
                  <button type="submit" className="form-btn primary">
                    🏪 {t('my_stores')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 🎯 قسم إدارة المتاجر */}
          {activeSection === 'manage_stores' && (
            <div className="my-stores-content">
              <div className="section-header">
                <button
                  className="action-btn secondary small"
                  onClick={() => navigateToSection('my_stores')}
                  style={{ marginBottom: '1rem' }}
                >
                  ↩️ {t('back')}
                </button>
                <h2>📊 {t('manage_stores')}</h2>
                <p>{t('view_and_manage_all_stores')}</p>
              </div>

              <div className="manage-stores-content">
                {/* مرشحات */}
                <div className="stores-filter">
                  <button
                    className={`filter-btn ${
                      storeFilter === 'all' ? 'active' : ''
                    }`}
                    onClick={() => setStoreFilter('all')}
                  >
                    📁 {t('all_stores')} ({stores.length})
                  </button>
                  <button
                    className={`filter-btn ${
                      storeFilter === 'active' ? 'active' : ''
                    }`}
                    onClick={() => setStoreFilter('active')}
                  >
                    ✅ {t('active_stores')} (
                    {stores.filter(s => s.status === 'active').length})
                  </button>
                  <button
                    className={`filter-btn ${
                      storeFilter === 'inactive' ? 'active' : ''
                    }`}
                    onClick={() => setStoreFilter('inactive')}
                  >
                    ⏸️ {t('inactive_stores')} (
                    {stores.filter(s => s.status === 'inactive').length})
                  </button>
                </div>

                {/* شبكة المتاجر */}
                {filteredStores.length > 0 ? (
                  <div className="stores-grid">
                    {filteredStores.map(store => (
                      <div key={store.id} className="store-card">
                        <div className="store-banner">
                          <img src={store.banner} alt={store.name} />
                          <span className={`store-status ${store.status}`}>
                            {store.status === 'active'
                              ? '✅ ' + t('active')
                              : '⏸️ ' + t('inactive')}
                          </span>
                        </div>

                        <div className="store-info">
                          <div className="store-header">
                            <div className="store-logo">
                              <img src={store.logo} alt={store.name} />
                            </div>
                            <div className="store-title">
                              <h4>{store.name}</h4>
                              <p>
                                📂 {store.category} • ⭐ {store.rating}
                              </p>
                            </div>
                          </div>

                          <p
                            style={{
                              color: 'rgba(255,255,255,0.9)',
                              fontSize: '0.9rem',
                              marginBottom: '1rem',
                            }}
                          >
                            {store.description}
                          </p>

                          <div className="store-stats">
                            <div className="stat-item">
                              <span className="stat-value">{store.orders}</span>
                              <span className="stat-label">{t('orders')}</span>
                            </div>
                            <div className="stat-item">
                              <span className="stat-value">
                                {store.revenue}
                              </span>
                              <span className="stat-label">{t('revenue')}</span>
                            </div>
                          </div>

                          <div className="store-actions">
                            <button className="store-btn edit">
                              ✏️ {t('edit')}
                            </button>
                            <button className="store-btn view">
                              👁️ {t('view')}
                            </button>
                            <button
                              className="store-btn delete"
                              onClick={() => handleDeleteStore(store.id)}
                            >
                              🗑️ {t('delete')}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-stores">
                    <div className="no-stores-icon">🏪</div>
                    <p>{t('no_stores_found')}</p>
                    <button
                      className="create-first-store-btn"
                      onClick={openCreateStore}
                    >
                      🏪 {t('create_first_store')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 🆕 رسالة للمستخدمين على الكمبيوتر */}
          {activeSection === 'scanner' && !isMobile && (
            <div className="desktop-scanner-message">
              <div className="message-container">
                <div className="message-icon">💻</div>
                <h2>{t('scanner_not_available_on_desktop')}</h2>
                <p>{t('use_mobile_or_enter_code')}</p>

                <div className="manual-input-section">
                  <h3>📝 {t('enter_delivery_code_manually')}</h3>
                  <form onSubmit={handleManualQRSubmit} className="manual-form">
                    <div className="input-group">
                      <input
                        type="text"
                        placeholder={t('enter_delivery_code_here')}
                        value={manualSessionId}
                        onChange={e => setManualSessionId(e.target.value)}
                        className="session-input"
                      />
                      <button type="submit" className="submit-btn">
                        {t('confirm_delivery')}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="alternative-actions">
                  <button
                    className="action-btn primary"
                    onClick={() => navigateToSection('dashboard')}
                  >
                    {t('back_to_dashboard')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* أقسام أخرى للشريك */}
          {activeSection === 'orders' && (
            <div className="orders-content">
              <div className="section-header">
                <h2>📦 {t('all_orders')}</h2>
                <p>{t('manage_all_orders')}</p>
              </div>
              <div className="content-placeholder">
                <p>🚧 {t('under_development')}</p>
              </div>
            </div>
          )}

          {activeSection === 'deliveries' && (
            <div className="deliveries-content">
              <div className="section-header">
                <h2>🚚 {t('delivery_history')}</h2>
                <p>{t('view_delivery_history')}</p>
              </div>
              <div className="content-placeholder">
                <p>🚧 {t('under_development')}</p>
              </div>
            </div>
          )}

          {activeSection === 'earnings' && (
            <div className="earnings-content">
              <div className="section-header">
                <h2>💰 {t('earnings_reports')}</h2>
                <p>{t('view_earnings_reports')}</p>
              </div>
              <div className="content-placeholder">
                <p>🚧 {t('under_development')}</p>
              </div>
            </div>
          )}

          {activeSection === 'schedule' && (
            <div className="schedule-content">
              <div className="section-header">
                <h2>📅 {t('delivery_schedule')}</h2>
                <p>{t('manage_delivery_schedule')}</p>
              </div>
              <div className="content-placeholder">
                <p>🚧 {t('under_development')}</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
