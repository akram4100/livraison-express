import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { QrReader } from "react-qr-reader";
import { motion, AnimatePresence } from "framer-motion";
import "../style/dashboardClient.css";

export default function DashboardClient() {
  const [user, setUser] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [manualSessionId, setManualSessionId] = useState("");
  const [cameraError, setCameraError] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [lastScanTime, setLastScanTime] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const scanRef = useRef(false);
  const navigate = useNavigate();

  // التحقق من تسجيل الدخول
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const userObj = JSON.parse(userData);
        setUser(userObj);
        setIsAuthenticated(true);
        console.log("✅ [AUTH] - تم تسجيل الدخول:", userObj.email);
      } catch (error) {
        console.error("❌ [AUTH_ERROR] - خطأ في المصادقة");
        handleLogout();
      }
    }

    // تحميل إعدادات الوضع الليلي
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);

    return () => {
      scanRef.current = false;
    };
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // معالجة نتيجة المسح - محسنة مع منع التكرار
  const handleScan = (result) => {
    if (result && result.text && !scanRef.current) {
      const now = Date.now();
      // منع المسح المتكرر في وقت قصير (1 ثانية)
      if (now - lastScanTime < 1000) {
        return;
      }

      console.log("✅ [QR_SCANNED] - تم مسح الرمز:", result.text);
      setScanResult("✅ تم مسح الرمز - جاري المعالجة...");
      setLastScanTime(now);
      scanRef.current = true;
      setScanning(false);
      processScannedCode(result.text);
    }
  };

  // معالجة الأخطاء - محسنة تماماً
  const handleError = (error) => {
    // زيادة عداد المسح
    setScanCount(prev => prev + 1);

    // تجاهل كافة الأخطاء الداخلية للمكتبة
    const isInternalError = 
      !error ||
      (error && !error.name) ||
      (error && error.message && typeof error.message === 'string' && (
        error.message.includes('selectBestPatterns') ||
        error.message.includes('find') ||
        error.message.includes('detect') ||
        error.message.includes('decode') ||
        error.message.includes('pattern') ||
        error.message.includes('Canvas2D') ||
        error.message.includes('willReadFrequently') ||
        error.message === 't' || // الخطأ الغامض
        error.message.length < 3 // أي رسالة خطأ قصيرة
      ));

    if (isInternalError) {
      // تجاهل كامل - لا تسجيل ولا تحديث واجهة
      return;
    }
    
    // معالجة الأخطاء الحقيقية فقط
    console.warn("⚠️ [SCAN_WARNING] - تحذير في المسح:", error);
    
    if (error.name === 'NotAllowedError') {
      setScanResult("❌ تم رفض الإذن. يرجى السماح للكاميرا");
      setCameraError(true);
      setScanning(false);
    } else if (error.name === 'NotFoundError') {
      setScanResult("❌ لم يتم العثور على كاميرا");
      setCameraError(true);
      setScanning(false);
    } else if (error.name === 'NotSupportedError') {
      setScanResult("❌ المتصفح لا يدعم الكاميرا");
      setCameraError(true);
      setScanning(false);
    } else if (error.name === 'OverconstrainedError') {
      setScanResult("❌ لا يمكن تلبية متطلبات الكاميرا");
      setCameraError(true);
      setScanning(false);
    } else if (error.name === 'UnknownError' && error.message.includes('setPhotoOptions')) {
      // تجاهل خطأ Capacitor الخاص
      return;
    }
    // تجاهل جميع الأخطاء الأخرى
  };

  const processScannedCode = async (decodedText) => {
    try {      
      let sessionId;
      
      try {
        // محاولة تحليل JSON أولاً
        const qrData = JSON.parse(decodedText);
        if (qrData.session_id) {
          sessionId = qrData.session_id;
        } else if (qrData.type === 'livraison_qr') {
          sessionId = qrData.session_id;
        }
      } catch (e) {
        // إذا فشل التحليل JSON، جرب استخراج session_id من النص
        if (decodedText.includes('session_id=')) {
          const urlParams = new URLSearchParams(decodedText.split('?')[1]);
          sessionId = urlParams.get('session_id');
        } else {
          sessionId = decodedText;
        }
      }
      
      if (!sessionId) {
        setScanResult("❌ لم يتم العثور على معرف الجلسة في الرمز");
        scanRef.current = false;
        return;
      }
      
      await processSessionId(sessionId);
      
    } catch (error) {
      console.error("❌ [PROCESS_ERROR] - خطأ في معالجة الرمز:", error);
      setScanResult("❌ خطأ في معالجة الرمز الممسوح");
      scanRef.current = false;
    }
  };

  // بدء الكاميرا بالنقر على الإطار
  const startCamera = () => {
    console.log("🚀 [START_CAMERA] - بدء تشغيل الكاميرا");
    setScanning(true);
    setCameraError(false);
    setScanResult("📷 جاري تشغيل الكاميرا...");
    setScanCount(0);
    scanRef.current = false;
  };

  // إيقاف الكاميرا
  const stopCamera = () => {
    console.log("🛑 [STOP_CAMERA] - إيقاف الكاميرا");
    setScanning(false);
    setScanResult("");
    scanRef.current = false;
  };

  // إعادة تشغيل الكاميرا
  const restartCamera = () => {
    console.log("🔄 [RESTART_CAMERA] - إعادة تشغيل الكاميرا");
    stopCamera();
    setTimeout(startCamera, 1000);
  };

  // 🎯 معالجة QR يدوياً
  const handleManualQRSubmit = async (e) => {
    e.preventDefault();
    if (!manualSessionId.trim()) {
      setScanResult("❌ يرجى إدخال معرف الجلسة");
      return;
    }
    await processSessionId(manualSessionId.trim());
  };

  const processSessionId = async (sessionId) => {
    try {
      setScanResult("📱 جاري معالجة الجلسة...");
      
      // المسح عبر API
      const scanResponse = await fetch("https://livraison-api-x45n.onrender.com/api/mobile/scan-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId })
      });
      
      const scanData = await scanResponse.json();
      
      if (scanData.success) {
        setScanResult("✅ تم مسح الرمز - جاري تأكيد الهوية...");
        if (user && user.email) {
          await confirmLogin(sessionId);
        } else {
          setScanResult("✅ تم مسح الرمز بنجاح!");
          scanRef.current = false;
        }
      } else {
        setScanResult(`❌ ${scanData.message}`);
        scanRef.current = false;
      }
    } catch (error) {
      console.error("❌ [API_ERROR] - خطأ في الاتصال بالخادم:", error);
      setScanResult("❌ خطأ في الاتصال بالخادم");
      scanRef.current = false;
    }
  };

  const confirmLogin = async (sessionId) => {
    try {
      const confirmResponse = await fetch("https://livraison-api-x45n.onrender.com/api/confirm-telegram-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          user: user
        })
      });
      
      const confirmData = await confirmResponse.json();
      if (confirmData.success) {
        setScanResult("🎉 تم تأكيد الدخول بنجاح على الجهاز الآخر!");
        
        // إظهار رسالة نجاح بدون إعادة توجيه
        setTimeout(() => {
          setScanResult("✅ يمكنك الاستمرار في استخدام التطبيق بشكل طبيعي");
          scanRef.current = false;
        }, 3000);
        
      } else {
        setScanResult(`❌ فشل التأكيد: ${confirmData.message}`);
        scanRef.current = false;
      }
    } catch (error) {
      console.error("❌ [CONFIRM_ERROR] - خطأ في تأكيد الدخول:", error);
      setScanResult("❌ خطأ في تأكيد الدخول");
      scanRef.current = false;
    }
  };

  const handleLogout = () => {
    stopCamera();
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <div className="auth-required">
        <div className="auth-message">
          <div className="auth-icon">🔐</div>
          <h2>يجب تسجيل الدخول</h2>
          <p>يجب تسجيل الدخول لاستخدام ماسح QR التلقائي</p>
          <button onClick={() => navigate('/login')} className="auth-btn primary">
            الانتقال إلى تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`QR-scanner ${darkMode ? "dark" : ""}`}>
      {/* 🌐 شريط الرأس */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <button className="sidebar-toggle" onClick={toggleSidebar}>
              {sidebarOpen ? "◀️" : "▶️"}
            </button>
            <div className="header-title">
              <h1>📱 تطبيق Livraison Express</h1>
              <p>نظام المسح الآمن لرموز QR</p>
            </div>
          </div>
          
          <div className="header-right">
            <div className="user-info">
              <span>مرحباً، {user?.nom}</span>
            </div>
            <button className="darkmode-toggle" onClick={toggleDarkMode}>
              {darkMode ? "☀️" : "🌙"}
            </button>
            <button onClick={handleLogout} className="logout-btn">
              🚪 تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      {/* هيكل المحتوى */}
      <div className="client-content">
        {/* 📱 الشريط الجانبي */}
        <motion.aside 
          className={`client-sidebar ${sidebarOpen ? "open" : "closed"}`}
          initial={{ x: -280 }}
          animate={{ x: sidebarOpen ? 0 : -280 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="sidebar-user">
            <div className="user-avatar">
              {user?.nom ? user.nom.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="user-info">
              <h3>{user?.nom || "مستخدم"}</h3>
              <p>عميل</p>
            </div>
          </div>
          
          <nav className="sidebar-nav">
            <button className="nav-item active">
              📷 مسح QR
            </button>
            <button className="nav-item">
              📊 نشاط المسح
            </button>
            <button className="nav-item">
              ⚙️ الإعدادات
            </button>
          </nav>
          
          <div className="sidebar-footer">
          </div>
        </motion.aside>

        {/* 🎯 المحتوى الرئيسي */}
        <main className="client-main">
          <section className="scanner-section">
            <div className="section-header">
              <h2>🔍 الماسح الآمن لرموز QR</h2>
              <p>انقر على إطار المسح لتفعيل الكاميرا وابدأ المسح الفوري</p>
              <div className="debug-info">
                <small>حالة الكاميرا: {scanning ? '✅ نشطة' : '⏸️ جاهزة'}</small>
                {scanning && <small> | محاولات المسح: {scanCount}</small>}
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
                    <div className="scanner-placeholder" onClick={startCamera}>
                      <div className="scanner-icon">📷</div>
                      <div className="scanner-instruction">
                        <h3>انقر لتفعيل الكاميرا</h3>
                        <p>اضغط على أي مكان في هذا الإطار لبدء المسح الفوري</p>
                      </div>
                      <div className="scanner-guidelines">
                        <div className="guideline-line"></div>
                        <div className="guideline-text">سيتم تفعيل الكاميرا تلقائياً</div>
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
                          facingMode: "environment",
                          width: { ideal: 1280 },
                          height: { ideal: 720 }
                        }}
                        className="qr-reader"
                        videoContainerStyle={{
                          padding: 0,
                          margin: 0,
                          width: '100%',
                          height: '100%',
                          borderRadius: '12px'
                        }}
                        videoStyle={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '12px'
                        }}
                        scanDelay={500}
                      />
                      <div className="scan-overlay">
                        <div className="scan-frame" onClick={stopCamera}></div>
                        <p>انقر على الإطار لإيقاف الكاميرا</p>
                        <div className="scan-stats">
                          <small>محاولات المسح: {scanCount}</small>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div className="scan-status">
                  <div className={`scan-result ${scanResult.includes('✅') || scanResult.includes('🎉') ? 'success' : scanResult.includes('❌') ? 'error' : 'info'}`}>
                    {scanResult}
                  </div>
                </div>

                {cameraError && (
                  <div className="error-message">
                    <p>⚠️ حدث خطأ في الكاميرا. يمكنك استخدام الإدخال اليدوي أدناه.</p>
                    <button onClick={restartCamera} className="retry-btn">
                      🔄 إعادة المحاولة
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="manual-input-section">
              <h3>📝 أو أدخل معرف الجلسة يدوياً</h3>
              <form onSubmit={handleManualQRSubmit} className="manual-form">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="أدخل معرف الجلسة (مثل: qr_123456789)"
                    value={manualSessionId}
                    onChange={(e) => setManualSessionId(e.target.value)}
                    className="session-input"
                  />
                  <button type="submit" className="submit-btn">
                    تأكيد الجلسة
                  </button>
                </div>
              </form>
            </div>
          </section>

          <section className="instructions-section">
            <div className="instructions">
              <h3>💡 كيف يعمل النظام:</h3>
              <ul>
                <li>✅ المسح الناجح يؤكد دخولك على الجهاز الآخر فقط</li>
                <li>✅ لن يتم تسجيل خروجك من هذا الجهاز</li>
                <li>✅ يمكنك الاستمرار في استخدام التطبيق بشكل طبيعي</li>
                <li>✅ النظام آمن ولا يؤثر على جلسة دخولك الحالية</li>
              </ul>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}