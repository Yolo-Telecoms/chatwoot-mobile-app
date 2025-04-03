// File: src/helpers/ToastHelper.js

import { Snackbar } from 'react-native-snackbar';

export const showToast = ({ message }) => {
  Snackbar.show({
    text: message,
    duration: Snackbar.LENGTH_SHORT,
  });
};
