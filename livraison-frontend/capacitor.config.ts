import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.akram.livraison',
  appName: 'Livraison Express',
  webDir: 'www',
  server: {
    url: 'https://livraison-api-x45n.onrender.com',
    cleartext: true
  }
};

export default config;
