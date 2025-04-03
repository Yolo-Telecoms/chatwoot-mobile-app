/* eslint-disable @typescript-eslint/no-explicit-any */
// File: src/components-next/native-components/index.ts

import * as ReactNative from 'react-native';
import ViewNativeComponent from 'react-native/Libraries/Components/View/ViewNativeComponent';
import TextAncestorContext from 'react-native/Libraries/Text/TextAncestor';

/**
 * Returns base React Native views (with special fallback logic).
 */
export function getBaseViews() {
  // We'll be lenient: treat `View` as `any` so we don't conflict with
  // ReactNative.View's static property forceTouchAvailable.
  let View: any = ReactNative.View;
  let TextAncestor: any = null;

  if (process.env.NODE_ENV !== 'test') {
    View = ViewNativeComponent; // no forced type
    TextAncestor = TextAncestorContext;
  }

  return {
    View,
    // We can keep these typed normally, since they're from react-native
    Text: ReactNative.Text,
    StyleSheet: ReactNative.StyleSheet,
    TextAncestor,
    Pressable: ReactNative.Pressable,
  };
}

// Export other modules as well
export * from './NText';
export * from './NView';
