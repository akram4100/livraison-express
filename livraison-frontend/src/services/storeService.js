// src/services/storeService.js
const API_BASE_URL = 'https://livraison-api-x45n.onrender.com';

export const storeService = {
  // جلب جميع متاجر الشريك
  async getStores(ownerEmail, status = 'all') {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/partner/stores?owner_email=${ownerEmail}&status=${status}`
      );
      return await response.json();
    } catch (error) {
      console.error('❌ Store service error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  // إنشاء متجر جديد
  async createStore(storeData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/partner/stores/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeData)
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Create store error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  // تحديث متجر
  async updateStore(storeId, updateData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/partner/stores/${storeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Update store error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  // حذف متجر
  async deleteStore(storeId, userEmail) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/partner/stores/${storeId}?user_email=${userEmail}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        }
      );
      return await response.json();
    } catch (error) {
      console.error('❌ Delete store error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  // رفع صورة
  async uploadImage(storeId, imageType, imageData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/partner/stores/upload-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: storeId,
          image_type: imageType,
          image_data: imageData
        })
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Upload image error:', error);
      return { success: false, message: 'Network error' };
    }
  }
};