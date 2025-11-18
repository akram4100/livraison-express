// src/services/apiService.js
import MOBILE_CONFIG from '../config/mobileConfig';

class ApiService {
  constructor() {
    this.baseURL = this.getBaseURL();
    this.isMobile = this.detectMobile();
  }

  // اكتشاف إذا كان التطبيق يعمل على موبايل
  detectMobile() {
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || 
           window.capacitor !== undefined;
  }

  // الحصول على عنوان API المناسب
  getBaseURL() {
    if (this.detectMobile()) {
      // في التطبيق المحمول، استخدم عنوان IP ثابت
      return MOBILE_CONFIG.API_BASE;
    } else {
      // في المتصفح، استخدم localhost
      return "http://localhost:8080/api";
    }
  }

  // دالة fetch محسنة
  async fetchAPI(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`🌐 API Request: ${url}`);
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error(`❌ API Error (${url}):`, error);
      
      // محاولة استخدام localhost كبديل في حالة فشل الاتصال
      if (this.isMobile && this.baseURL !== "http://localhost:8080/api") {
        console.log("🔄 Trying fallback to localhost...");
        this.baseURL = "http://localhost:8080/api";
        return this.fetchAPI(endpoint, options);
      }
      
      throw new Error(`Connection failed: ${error.message}`);
    }
  }

  // دوال مساعدة للـ APIs المختلفة
  async login(credentials) {
    return this.fetchAPI('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    return this.fetchAPI('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async sendResetCode(email) {
    return this.fetchAPI('/send-reset-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyResetCode(data) {
    return this.fetchAPI('/verify-reset-code', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resetPassword(data) {
    return this.fetchAPI('/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export default new ApiService();
