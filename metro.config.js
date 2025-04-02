// metro.config.js
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { getSentryExpoConfig } = require('@sentry/react-native/metro');
const withStorybook = require('@storybook/react-native/metro/withStorybook');

const defaultConfig = getDefaultConfig(__dirname);
const sentryConfig = getSentryExpoConfig(__dirname);

const config = {
  ...defaultConfig,
  ...sentryConfig,
  resolver: {
    ...defaultConfig.resolver,
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
};

module.exports = withStorybook(config, {
  enabled: true,
  configPath: path.resolve(__dirname, './.storybook'),
});
