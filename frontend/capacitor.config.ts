import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.empresa.suplementos',
  appName: 'Suplementos',
  webDir: 'www',
  server: {
    androidScheme: 'https',
  },
};

export default config;