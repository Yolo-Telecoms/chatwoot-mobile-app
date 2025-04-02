// File: App.tsx
import * as Sentry from '@sentry/react-native';

import expoConstants from 'expo-constants';
import App from './src/app';

const isStorybookEnabled = expoConstants.expoConfig?.extra?.eas?.storybookEnabled;

if (!__DEV__) {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1.0,
    attachScreenshot: true,
  });
}

if (__DEV__) {
  void import('./ReactotronConfig');
}
// Ref: https://dev.to/dannyhw/how-to-swap-between-react-native-storybook-and-your-app-p3o
export default (() => {
  if (isStorybookEnabled === 'true') {
    // eslint-disable-next-line
    return require('./.storybook').default;
  }

  if (!__DEV__) {
    return Sentry.wrap(App);
  }

  console.log('Loading Development App');
  return App;
})();
