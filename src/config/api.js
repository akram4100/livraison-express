// src/config/api.js
import envConfig from '../../src/config/environment.js';

let API_BASE = '';

// تهيئة الـ API base بشكل غير متزامن
const initializeAPI = async () => {
  const config = await envConfig.getConfig();
  API_BASE = config.baseUrl;
  console.log('🌐 API Base URL:', API_BASE);
  return API_BASE;
};

// دالة للطلبات مع التأكد من تهيئة الـ API
export const apiRequest = async (endpoint, options = {}) => {
  if (!API_BASE) {
    await initializeAPI();
  }
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

// تصدير الـ API_BASE مع تهيئة افتراضية
export const getAPIBase = async () => {
  if (!API_BASE) {
    await initializeAPI();
  }
  return API_BASE;
};

export default getAPIBase;