// File: src/helpers/ToastHelper.js

import Toast from 'react-native-toast-message';

export const showToast = ({ message }) => {
  Toast.show({
    type: 'success', // could be 'success', 'info', 'error', etc.
    text1: message, // main message text
    position: 'bottom',
    visibilityTime: 3000, // 3 seconds
  });
};
