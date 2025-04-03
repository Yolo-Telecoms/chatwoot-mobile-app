// File: src/helpers/UrlHelper.js

import { Platform, Linking, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import { URL_REGEX } from '@/constants';
import i18n from '../i18n';

export const openURL = ({ URL }) => {
  if (!URL) return;

  // Validate URL first
  if (!URL_REGEX.test(URL)) {
    Alert.alert(
      i18n.t('COMMON.INVALID_URL_TITLE'),
      `${i18n.t('COMMON.INVALID_URL_MESSAGE')}: ${URL}`,
    );
    return;
  }

  // If on iOS, open in the built-in browser app
  // If on Android, open in an in-app browser
  if (Platform.OS === 'android') {
    WebBrowser.openBrowserAsync(URL);
  } else {
    Linking.openURL(URL);
  }
};

export const openNumber = ({ phoneNumber }) => {
  if (!phoneNumber) return;
  Linking.openURL(`tel:${phoneNumber}`);
};

export const openEmail = ({ email }) => {
  if (!email) return;
  Linking.openURL(`mailto:${email}`);
};
