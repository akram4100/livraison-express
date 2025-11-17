import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.akram.livraison',
  appName: 'Livraison Express',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    // 🔥 هذا السطر الحاسم لحل مشكلة الاتصال
    url: 'http://localhost:8080',
    cleartext: true
  },
  plugins: {
    Camera: {
      enableUpload: true
    },
    Geolocation: {
      enableHighAccuracy: true
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;