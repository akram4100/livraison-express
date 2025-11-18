import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.akram.livraison',
  appName: 'Livraison Express',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
