// File: src/helpers/ErrorHelper.js

import * as Sentry from '@sentry/react-native';
import { Alert } from 'react-native';
import { setNativeExceptionHandler, setJSExceptionHandler } from 'react-native-exception-handler';

import i18n from '../i18n';
import { showToast } from './ToastHelper';

/**
 * The global JS error handler for uncaught exceptions in JavaScript.
 *
 * @param {Error} e - The error object
 * @param {boolean} isFatal - If true, means it’s a fatal error
 */
function errorHandler(e, isFatal) {
  // Log to Sentry
  Sentry.captureException(e);

  if (isFatal) {
    // Show a fatal error alert
    Alert.alert(
      i18n.t('COMMON.ERROR_TITLE'),
      `${i18n.t('COMMON.ERROR')}: ${isFatal ? 'Fatal:' : ''} ${e.name} ${e.message} 
       ${i18n.t('COMMON.REPORT_MESSAGE')}`,
      [
        {
          text: i18n.t('COMMON.CLOSE'),
        },
      ],
    );
  } else {
    // For non-fatal errors, we can just log to console or show a toast
    // eslint-disable-next-line no-console
    console.log('Non-fatal error:', e);
    // Optionally show a toast:
    showToast({ message: i18n.t('COMMON.ERROR_GENERIC') });
  }
}

export default {
  init() {
    // Hook the native exception handler
    setNativeExceptionHandler(
      exceptionString => {
        // Catch native crashes, forward them to Sentry
        Sentry.captureException(new Error(exceptionString), {
          logger: 'NativeExceptionHandler',
        });
      },
      false, // if true, the app is force-quit on iOS
    );

    // Hook the JS exception handler
    // The second argument determines if dev mode is allowed
    setJSExceptionHandler(errorHandler, false);
  },
};
