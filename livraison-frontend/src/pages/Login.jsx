import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../style/homepage.css';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Homepage({ globalDarkMode, updateGlobalDarkMode }) {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [resetEmail, setResetEmail] = useState('');
  const [telegramSession, setTelegramSession] = useState(null);
  const [telegramStatus, setTelegramStatus] = useState('');
  const telegramPollRef = useRef(null);
  // 🔹 نظام العرض المتعدد
  const [activeView, setActiveView] = useState('login'); // "login", "forgot", "qr"

  // 🔹 حالة QR
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrSessionId, setQrSessionId] = useState('');
  const [qrLoading, setQrLoading] = useState(false);
  const [qrStatus, setQrStatus] = useState(''); // "waiting", "scanned", "confirmed", "error"

  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const checkIntervalRef = useRef(null);

  // 🔹 إحصائيات ديناميكية
  const [stats, setStats] = useState({
    deliveries: 0,
    users: 0,
    cities: 0,
    satisfaction: 0,
  });

  // 🔹 محاكاة الإحصائيات الحية
  useEffect(() => {
    setStats({
      deliveries: 28476,
      users: 12543,
      cities: 156,
      satisfaction: 98,
    });

    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        deliveries: prev.deliveries + Math.floor(Math.random() * 3),
        users: prev.users + Math.floor(Math.random() * 2),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 🔹 مزامنة الوضع الليلي واللغة
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'fr';

    setDarkMode(savedDarkMode);
    i18n.changeLanguage(savedLanguage);

    if (updateGlobalDarkMode) {
      updateGlobalDarkMode(savedDarkMode);
    }
  }, [i18n, updateGlobalDarkMode]);

  // 🔹 تنظيف الـ intervals
  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, []);

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

    if (updateGlobalDarkMode) {
      updateGlobalDarkMode(newDarkMode);
    }
  };

  // ✅ تسجيل الدخول العادي
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        'https://livraison-api-x45n.onrender.com/api/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, mot_de_passe: motDePasse }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || '❌ ' + t('login_error'));
        setLoading(false);
        return;
      }

      setIsLoggedIn(true);
      setUserRole(data.user.role);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', 'user-token');

      switch (data.user.role) {
        case 'admin':
          navigate('/dashboard-admin');
          break;
        case 'livreur':
          navigate('/dashboard-livreur');
          break;
        case 'partner':
          navigate('/dashboard-partner');
          break;
        case 'client':
          navigate('/dashboard-client');
          break;
        default:
          navigate('/dashboard-client');
      }
    } catch (error) {
      console.error('❌ ' + t('error'), error);
      alert('❌ ' + t('server_connection_error'));
    } finally {
      setLoading(false);
    }
  };

  // 🔹 إرسال كود إعادة التعيين
  const handleForgotPassword = async e => {
    e.preventDefault();
    if (!resetEmail) return alert(t('enter_email_alert'));

    try {
      const response = await fetch(
        'https://livraison-api-x45n.onrender.com/api/send-reset-code',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: resetEmail }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || '❌ ' + t('server_error'));
        return;
      }

      alert(data.message || '✅ ' + t('code_sent_success'));
      setActiveView('login');
      setResetEmail('');
      navigate('/verify-otp', { state: { email: resetEmail } });
    } catch (error) {
      console.error('❌ ' + t('error'), error);
      alert('❌ ' + t('server_connection_error'));
    }
  };
  // إنشاء جلسة QR جديدة
  const generateTelegramQR = async () => {
    setQrLoading(true);
    setTelegramStatus('waiting');
    setTelegramSession(null);

    try {
      const response = await fetch(
        'https://livraison-api-x45n.onrender.com/api/create-telegram-qr',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setTelegramSession({
        sessionId: data.session_id,
        qrUrl: data.qr_url,
        expiresAt: data.expires_at,
      });

      setTelegramStatus('waiting');

      // بدء مراقبة الجلسة
      startTelegramPolling(data.session_id);
    } catch (error) {
      console.error('Telegram QR error:', error);
      setTelegramStatus('error');
      alert('❌ فشل في إنشاء رمز QR');
    } finally {
      setQrLoading(false);
    }
  };

  // مراقبة حالة الجلسة
  const startTelegramPolling = sessionId => {
    if (telegramPollRef.current) {
      clearInterval(telegramPollRef.current);
    }

    telegramPollRef.current = setInterval(async () => {
      try {
        const response = await fetch(
          `https://livraison-api-x45n.onrender.com/api/check-telegram-session/${sessionId}`
        );
        const data = await response.json();

        if (data.success) {
          const session = data.session;

          if (session.status === 'confirmed' && session.user_data) {
            // ✅ تم الدخول بنجاح!
            clearInterval(telegramPollRef.current);
            setTelegramStatus('confirmed');
            handleTelegramLoginSuccess(session.user_data);
          } else if (session.status === 'expired') {
            clearInterval(telegramPollRef.current);
            setTelegramStatus('expired');
          }
        }
      } catch (error) {
        console.error('Telegram polling error:', error);
      }
    }, 2000);
  };

  // معالجة الدخول الناجح
  const handleTelegramLoginSuccess = userData => {
    console.log('🎉 Telegram login successful!', userData);

    setIsLoggedIn(true);
    setUserRole(userData.role);

    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', 'telegram-qr-token');
    localStorage.setItem('login_method', 'telegram_qr');

    setTimeout(() => {
      switch (userData.role) {
        case 'admin':
          navigate('/dashboard-admin');
          break;
        case 'livreur':
          navigate('/dashboard-livreur');
          break;
        case 'partner':
          navigate('/dashboard-partner');
          break;
        case 'client':
          navigate('/dashboard-client');
          break;
        default:
          navigate('/dashboard-client');
      }
    }, 1500);
  };

  // تنظيف
  useEffect(() => {
    return () => {
      if (telegramPollRef.current) {
        clearInterval(telegramPollRef.current);
      }
    };
  }, []);
  // 🔹 إنشاء QR Code - معدل بدون headers مشكلة
  const generateQRCode = async () => {
    setQrLoading(true);
    setQrStatus('waiting');
    setQrCodeUrl('');
    setQrSessionId('');

    console.log('🎯 Starting QR code generation...');

    try {
      const response = await fetch(
        'https://livraison-api-x45n.onrender.com/api/create-qr-session',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // ❌ إزالة headers التي تسبب مشكلة CORS
            // "Cache-Control": "no-cache",
            // "Pragma": "no-cache"
          },
          body: JSON.stringify({
            type: 'login',
            source: 'login_page',
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ QR session response:', data);

      if (!data.success) {
        throw new Error(data.message || 'Failed to create QR session');
      }

      // حفظ بيانات الجلسة
      const sessionData = {
        session_id: data.session_id,
        created_at: new Date().toISOString(),
        expires_at: data.expires_at,
        qr_url: data.qr_url,
      };

      localStorage.setItem('qrSessionData', JSON.stringify(sessionData));

      // تحديث الحالة
      setQrCodeUrl(data.qr_url);
      setQrSessionId(data.session_id);
      setQrStatus('waiting');

      console.log('✅ QR session created:', data.session_id);

      // بدء مراقبة الجلسة
      startSessionChecking(data.session_id);
    } catch (error) {
      console.error('❌ QR generation failed:', error);
      setQrStatus('error');

      // محاولة استخدام endpoint بديل بدون مشاكل CORS
      try {
        console.log('🔄 Trying alternative QR generation method...');
        await generateQRCodeAlternative();
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        alert(
          '❌ تعذر إنشاء رمز QR. يرجى المحاولة مرة أخرى أو استخدام تسجيل الدخول العادي.'
        );
      }
    } finally {
      setQrLoading(false);
    }
  };

  // 🔹 الطريقة البديلة لإنشاء QR Code
  const generateQRCodeAlternative = async () => {
    try {
      // محاولة استخدام endpoint التصحيح
      const response = await fetch(
        'https://livraison-api-x45n.onrender.com/api/debug/create-qr-session',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'login',
            debug_info: {
              source: 'login_page_alternative',
              timestamp: Date.now(),
            },
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setQrCodeUrl(data.qr_url);
        setQrSessionId(data.session_id);
        setQrStatus('waiting');

        localStorage.setItem(
          'qrSessionData',
          JSON.stringify({
            session_id: data.session_id,
            created_at: new Date().toISOString(),
            expires_at: data.expires_at,
          })
        );

        startSessionChecking(data.session_id);
      } else {
        throw new Error(data.message || 'Alternative method failed');
      }
    } catch (error) {
      throw new Error(`Alternative: ${error.message}`);
    }
  };

  // 🔹 نظام مراقبة الجلسات - معدل بدون headers مشكلة
  const startSessionChecking = sessionId => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }

    let attempts = 0;
    const maxAttempts = 45;

    console.log(`🔍 Starting session monitoring: ${sessionId}`);

    checkIntervalRef.current = setInterval(async () => {
      attempts++;

      if (attempts > maxAttempts) {
        console.log('⏰ Session monitoring timeout');
        clearInterval(checkIntervalRef.current);
        setQrStatus('error');
        return;
      }

      try {
        console.log(`🔍 Checking session ${sessionId} (attempt ${attempts})`);

        // ❌ إزالة headers المسببة لمشكلة CORS
        const response = await fetch(
          `https://livraison-api-x45n.onrender.com/api/qr-session/${sessionId}`
        );

        const data = await response.json();

        if (data.success) {
          const session = data.session;
          console.log('🔄 Session status:', session.status);
          setQrStatus(session.status);

          if (session.status === 'confirmed' && session.user_data) {
            console.log('✅ Login confirmed via QR');
            clearInterval(checkIntervalRef.current);
            await handleQRLoginSuccess(session.user_data);
          }

          if (session.status === 'expired' || session.status === 'error') {
            console.log('❌ Session expired or error');
            clearInterval(checkIntervalRef.current);
            setQrStatus('error');
          }
        } else {
          console.log('❌ Session check failed:', data.message);
          if (attempts > 5) {
            setQrStatus('error');
            clearInterval(checkIntervalRef.current);
          }
        }
      } catch (error) {
        console.error('❌ Session check error:', error);

        if (attempts > 10 && attempts % 5 === 0) {
          console.log('🔄 Retrying after connection error...');
        }
      }
    }, 2000);
  };

  // 🔹 معالجة تسجيل الدخول الناجح عبر QR
  const handleQRLoginSuccess = async userData => {
    if (!userData || !userData.email) {
      console.error('❌ Invalid user data received');
      alert('❌ بيانات المستخدم غير صالحة');
      return;
    }

    console.log('🎉 QR Login Successful!', userData);

    // تحديث الحالة فوراً
    setQrStatus('confirmed');
    setIsLoggedIn(true);
    setUserRole(userData.role);

    // حفظ بيانات المستخدم
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', 'qr-auth-token');
    localStorage.setItem('login_method', 'qr_code');
    localStorage.setItem('login_timestamp', new Date().toISOString());

    // تنظيف جلسة QR
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }

    // الانتظار قليلاً ثم التوجيه
    setTimeout(() => {
      console.log('🔄 Redirecting after QR login...');

      switch (userData.role) {
        case 'admin':
          window.location.href = '/dashboard-admin';
          break;
        case 'livreur':
          window.location.href = '/dashboard-livreur';
          break;
        case 'partner':
          window.location.href = '/dashboard-partner';
          break;
        case 'client':
        default:
          window.location.href = '/dashboard-client';
          break;
      }
    }, 2000);
  };

  // 🔹 تجديد QR Code
  const refreshQRCode = async () => {
    console.log('🔄 Refreshing QR code...');

    // تنظيف الحالة الحالية
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }

    setQrCodeUrl('');
    setQrSessionId('');
    setQrStatus('');

    // إعطاء تأخير بسيط
    await new Promise(resolve => setTimeout(resolve, 300));

    // إنشاء QR جديد
    await generateQRCode();

    console.log('✅ QR code refreshed');
  };

  // 🔹 نسخ النص إلى الحافظة
  const copyToClipboard = text => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log('📋 Text copied to clipboard');
      })
      .catch(err => {
        console.error('❌ Failed to copy text: ', err);
      });
  };

  // 🎯 التمرير إلى الأقسام
  const scrollToSection = sectionId => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  // إذا كان المستخدم مسجلاً
  if (isLoggedIn) {
    return (
      <div className="loading-container">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="loading-content"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="loading-spinner"
          >
            ⚡
          </motion.div>
          <h2>{t('redirecting_dashboard')}</h2>
          <p>
            {t('role')}: {userRole}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className={`homepage-container ${darkMode ? 'dark' : ''} ${
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

      {/* 🌐 شريط اللغة والوضع الليلي */}
      <div
        className={`language-darkmode-bar ${
          i18n.language === 'ar' ? 'rtl' : 'ltr'
        }`}
      >
        <div className="language-section">
          <span className="section-label">{t('language')}:</span>
          <div className="language-buttons">
            <button
              className={i18n.language === 'fr' ? 'active' : ''}
              onClick={() => changeLanguage('fr')}
            >
              🇫🇷 Français
            </button>
            <button
              className={i18n.language === 'en' ? 'active' : ''}
              onClick={() => changeLanguage('en')}
            >
              🇬🇧 English
            </button>
            <button
              className={i18n.language === 'ar' ? 'active' : ''}
              onClick={() => changeLanguage('ar')}
            >
              🇸🇦 العربية
            </button>
          </div>
        </div>

        <div className="darkmode-section">
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

      {/* 🎯 التنقل */}
      <motion.nav
        className="dynamic-nav"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="nav-brand">
          <motion.div className="logo" whileHover={{ scale: 1.1, rotate: 5 }}>
            🚚
          </motion.div>
          <span>Livraison Express</span>
        </div>

        <div className="nav-center">
          {['hero', 'stats', 'login'].map(section => (
            <button
              key={section}
              className={`nav-item ${
                activeSection === section ? 'active' : ''
              }`}
              onClick={() => scrollToSection(section)}
            >
              {section === 'hero' && `🏠 ${t('home')}`}
              {section === 'stats' && `📊 ${t('stats')}`}
              {section === 'login' && `🔐 ${t('login')}`}
            </button>
          ))}
        </div>

        <div className="nav-placeholder"></div>
      </motion.nav>

      {/* 🎯 الهيرو */}
      <section id="hero" className="hero-dynamic">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="title-main">Livraison Express</span>
            <span className="title-sub">{t('fastest_delivery_partner')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {t('hero_description')}
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              className="cta-btn primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
            >
              🚀 {t('get_started_free')}
            </motion.button>
            <motion.button
              className="cta-btn secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToSection('login')}
            >
              🔐 {t('sign_in')}
            </motion.button>
          </motion.div>
        </motion.div>

        <div className="hero-visuals">
          <motion.div
            className="visual-element delivery-truck"
            animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            🚚
          </motion.div>
          <motion.div
            className="visual-element package"
            animate={{ y: [0, -15, 0], rotate: [0, 5, 0, -5, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          >
            📦
          </motion.div>
          <motion.div
            className="visual-element location"
            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2,
            }}
          >
            📍
          </motion.div>
        </div>
      </section>

      {/* 📊 الإحصائيات */}
      <section id="stats" className="stats-dynamic">
        <motion.div
          className="stats-container"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {t('real_time_stats')}
          </motion.h2>

          <div className="stats-grid">
            {[
              {
                icon: '📦',
                value: stats.deliveries,
                label: t('deliveries_completed'),
                badge: t('live'),
              },
              {
                icon: '👥',
                value: stats.users,
                label: t('happy_customers'),
                badge: t('growing'),
              },
              {
                icon: '🌍',
                value: stats.cities,
                label: t('cities_covered'),
                badge: t('nationwide'),
              },
              {
                icon: '⭐',
                value: `${stats.satisfaction}%`,
                label: t('satisfaction_rate'),
                badge: t('excellent'),
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="stat-card"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-number">
                  {typeof stat.value === 'number'
                    ? stat.value.toLocaleString()
                    : stat.value}
                </div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-badge">{stat.badge}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 🔐 قسم تسجيل الدخول */}
      <section id="login" className="login-dynamic">
        <motion.div
          className="login-section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2>{t('account_access')}</h2>
          <p>{t('sign_in_to_manage')}</p>
        </motion.div>

        <div className="login-container">
          <AnimatePresence mode="wait">
            {/* 🔐 عرض تسجيل الدخول العادي */}
            {activeView === 'login' && (
              <motion.div
                key="login-view"
                className="auth-view-container"
                initial={{ opacity: 0, x: 0 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="login-header"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3>{t('welcome_back')}!</h3>
                  <p>{t('sign_in_to_access')}</p>
                </motion.div>

                <motion.form
                  className="login-form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.div
                    className="input-group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label>📧 {t('email_address')}</label>
                    <input
                      type="email"
                      placeholder={t('enter_your_email')}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </motion.div>

                  <motion.div
                    className="input-group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <label>🔒 {t('password')}</label>
                    <input
                      type="password"
                      placeholder={t('enter_your_password')}
                      value={motDePasse}
                      onChange={e => setMotDePasse(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </motion.div>

                  <motion.div
                    className="forgot-password-link"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveView('forgot')}
                    >
                      {t('forgot_password')}?
                    </button>
                  </motion.div>

                  <motion.button
                    type="submit"
                    className={`login-btn ${loading ? 'loading' : ''}`}
                    disabled={loading}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                  >
                    {loading ? (
                      <>
                        <div className="spinner"></div>
                        {t('signing_in')}...
                      </>
                    ) : (
                      `🔐 ${t('sign_in')}`
                    )}
                  </motion.button>

                  {/* 🔐 خيار QR */}
                  <motion.div
                    className="qr-login-option"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <div className="divider">
                      <span>{t('or')}</span>
                    </div>

                    <motion.button
                      type="button"
                      className="qr-login-btn"
                      onClick={() => setActiveView('qr')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="qr-icon">📱</span>
                      {t('login_with_qr')}
                    </motion.button>
                  </motion.div>
                </motion.form>

                <motion.div
                  className="login-footer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <p>
                    {t('no_account')}{' '}
                    <button
                      className="signup-link"
                      onClick={() => navigate('/register')}
                    >
                      {t('create_account')}
                    </button>
                  </p>
                </motion.div>
              </motion.div>
            )}

            {/* 🔑 عرض نسيت كلمة السر */}
            {activeView === 'forgot' && (
              <motion.div
                key="forgot-view"
                className="auth-view-container"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="login-header"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <button
                    className="back-button"
                    onClick={() => setActiveView('login')}
                  >
                    ← الرجوع
                  </button>
                  <h3>🔑 إعادة تعيين كلمة السر</h3>
                  <p>أدخل بريدك الإلكتروني لإرسال رمز التحقق</p>
                </motion.div>

                <motion.form
                  className="login-form"
                  onSubmit={handleForgotPassword}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="input-group">
                    <label>📧 البريد الإلكتروني</label>
                    <input
                      type="email"
                      placeholder="أدخل بريدك الإلكتروني"
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      required
                    />
                  </div>

                  <motion.button
                    type="submit"
                    className="login-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    📧 إرسال رمز التحقق
                  </motion.button>
                </motion.form>
              </motion.div>
            )}

            {/* 📱 عرض تسجيل الدخول بـ QR */}
            {activeView === 'qr' && (
              <motion.div
                key="qr-view"
                className="auth-view-container"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="login-header"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <button
                    className="back-button"
                    onClick={() => setActiveView('login')}
                  >
                    ← الرجوع
                  </button>
                  <h3>📱 تسجيل الدخول برمز QR</h3>
                  <p>قم بإنشاء رمز QR وقم بمسحه من تطبيق الجوال</p>
                </motion.div>

                <motion.div
                  className="login-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {!qrCodeUrl ? (
                    <div className="qr-init-content">
                      <div className="qr-placeholder">
                        <div className="qr-icon-large">📱</div>
                        <p>انقر أدناه لإنشاء رمز QR فريد</p>
                      </div>

                      <motion.button
                        className="login-btn"
                        onClick={generateQRCode}
                        disabled={qrLoading}
                        whileHover={{ scale: qrLoading ? 1 : 1.02 }}
                        whileTap={{ scale: qrLoading ? 1 : 0.98 }}
                      >
                        {qrLoading ? (
                          <>
                            <div className="spinner"></div>
                            جاري إنشاء الرمز...
                          </>
                        ) : (
                          `🎯 إنشاء رمز QR`
                        )}
                      </motion.button>
                    </div>
                  ) : (
                    <div className="qr-active-content">
                      {/* صورة QR */}
                      <div className="qr-image-container">
                        <img
                          src={qrCodeUrl}
                          alt="QR Code"
                          className="qr-code"
                        />

                        {/* حالة QR */}
                        <div className={`qr-status ${qrStatus}`}>
                          <div className="status-indicator"></div>
                          <span>
                            {qrStatus === 'waiting' && '⏳ في انتظار المسح'}
                            {qrStatus === 'scanned' &&
                              '📱 تم المسح - جاري التأكيد'}
                            {qrStatus === 'confirmed' && '✅ تم التأكيد بنجاح'}
                            {qrStatus === 'error' && '❌ حدث خطأ'}
                          </span>
                        </div>
                      </div>

                      {/* التعليمات */}
                      <div className="qr-instructions">
                        <h4>كيفية الاستخدام:</h4>
                        <ol>
                          <li>افتح تطبيق الجوال</li>
                          <li>انتقل إلى قسم المسح</li>
                          <li>قم بمسح هذا الرمز</li>
                          <li>قم بتأكيد التسجيل على الجوال</li>
                        </ol>
                      </div>

                      {/* الإجراءات */}
                      <div className="qr-actions">
                        <button
                          className="action-btn secondary"
                          onClick={refreshQRCode}
                        >
                          🔄 إنشاء جديد
                        </button>
                        <button
                          className="action-btn secondary"
                          onClick={() => setActiveView('login')}
                        >
                          ↩ الرجوع للتسجيل
                        </button>
                      </div>

                      {/* رسائل الحالة */}
                      {qrStatus === 'confirmed' && (
                        <div className="success-message">
                          <div className="success-icon">✅</div>
                          <p>تم تسجيل الدخول بنجاح! جاري التوجيه...</p>
                        </div>
                      )}

                      {qrStatus === 'error' && (
                        <div className="error-message">
                          <p>فشل في إنشاء الرمز. يرجى المحاولة مرة أخرى.</p>
                          <button
                            className="retry-btn"
                            onClick={generateQRCode}
                          >
                            🔄 حاول مرة أخرى
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 🦶 الفوتر */}
      <footer className="simple-footer">
        <div className="footer-content">
          <p>&copy; 2024 Livraison Express. {t('all_rights_reserved')}</p>
          <div className="footer-links">
            <button onClick={() => scrollToSection('hero')}>{t('home')}</button>
            <button onClick={() => scrollToSection('stats')}>
              {t('stats')}
            </button>
            <button onClick={() => scrollToSection('login')}>
              {t('login')}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
