// src/config/mobileConfig.js
const MOBILE_CONFIG = {
  // في التطبيق المحمول، استخدم عنوان IP الحقيقي أو اسم النطاق
  API_BASE: "http://192.168.1.100:8080/api", // استبدل بـ IP جهازك
  // أو استخدم الخادم الحقيقي إذا كان متاحاً
  // API_BASE: "https://api.livraison-express.com/api",
  
  // إعدادات للتطوير
  IS_MOBILE: true,
  DEBUG_MODE: true
};

export default MOBILE_CONFIG;
