import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.thredwallet.app',
  appName: 'Thred',
  webDir: 'dist/thred-mobile',
  bundledWebRuntime: false,
  server: {
    url: "https://wallet.thredwallet.com"
  }
};

export default config;
