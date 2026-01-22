import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cashflow.manager',
  appName: 'Cash Flow Manager',
  webDir: 'dist',
  server: {
    url: 'https://cash-flow-app-theta.vercel.app/',
    cleartext: true
  }
};

export default config;
