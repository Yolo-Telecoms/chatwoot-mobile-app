import React, { useCallback, useEffect, useRef } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import {
  NavigationContainer,
  LinkingOptions,
  PathConfigMap,
  getStateFromPath as getStateFromPathLib,
} from '@react-navigation/native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';

import notifee from '@notifee/react-native';

import { AppTabs } from './tabs/AppTabs';
import { navigationRef } from '../helpers/NavigationHelper';
import { findConversationLinkFromPush, findNotificationFromFCM } from '../helpers/PushHelper';
import { extractConversationIdFromUrl } from '../helpers/conversationHelpers';
import { useAppSelector } from '@/hooks';
import { selectInstallationUrl, selectLocale } from '@/store/settings/settingsSelectors';
import { RefsProvider } from '@/context';

import Inter400 from '../assets/fonts/Inter-400-20.ttf';
import Inter420 from '../assets/fonts/Inter-420-20.ttf';
import Inter500 from '../assets/fonts/Inter-500-24.ttf';
import Inter580 from '../assets/fonts/Inter-580-24.ttf';
import Inter600 from '../assets/fonts/Inter-600-20.ttf';

/**
 * Your route param types
 */
type RootParamList = {
  ChatScreen: {
    conversationId: number;
    primaryActorId?: number;
    primaryActorType?: string;
  };
};

/**
 * Minimal subset of the `Options<ParamList>` shape that getStateFromPathLib expects:
 * - `initialRouteName` is optional
 * - `screens` is a PathConfigMap for each route
 */
interface MinimalOptions<ParamList extends object> {
  initialRouteName?: string;
  screens: PathConfigMap<ParamList>;
}

/**
 * 1) We'll define our custom getStateFromPath to match the signature
 *    `LinkingOptions<ParamList>['getStateFromPath']`
 */
const customGetStateFromPath: LinkingOptions<RootParamList>['getStateFromPath'] = (
  path,
  options,
) => {
  const minimalConfig: MinimalOptions<RootParamList> = {
    initialRouteName: options?.initialRouteName,
    // If there's no `screens` in `options`, default to an empty object
    screens: options?.screens ?? {},
  };

  const state = getStateFromPathLib(path, minimalConfig);
  const conversationId = extractConversationIdFromUrl({ url: path });

  if (!conversationId) {
    return state;
  }

  const { routes } = state || {};
  let primaryActorId: number | undefined;
  let primaryActorType: string | undefined;

  if (routes && routes[0]?.params) {
    const params = routes[0].params as {
      primaryActorId?: number;
      primaryActorType?: string;
    };
    primaryActorId = params.primaryActorId;
    primaryActorType = params.primaryActorType;
  }

  return {
    routes: [
      {
        name: 'ChatScreen',
        params: {
          conversationId,
          primaryActorId,
          primaryActorType,
        },
      },
    ],
  };
};

/**
 * 2) Set up the background handler for Firebase push messages:
 *    Must be outside of your React component.
 */
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('[BackgroundMessageHandler] remoteMessage:', remoteMessage);

  // 1) Extract data from the message:
  const { data, notification } = remoteMessage;

  // 2) Perform background logic (store data, etc.)
  if (data) {
    console.log('[BackgroundMessageHandler] Data:', data);
    // e.g., storeDataInSecureStore(data.conversationId, data.someOtherField);
  }

  // 3) Display a local notification. For instance, using Notifee:

  if (notification) {
    await notifee.requestPermission();
    await notifee.displayNotification({
      title: notification.title ?? 'New message',
      body: notification.body ?? 'You have a new message',
      android: {
        channelId: 'default',
      },
    });
  }
});

export const AppNavigationContainer = () => {
  const [fontsLoaded] = useFonts({
    Inter400,
    Inter420,
    Inter500,
    Inter580,
    Inter600,
  });

  const routeNameRef = useRef<string | undefined>();

  /**
   * Use react-i18next. This gives us the `i18n` instance,
   * which we can call `changeLanguage(...)` on.
   */
  const { i18n } = useTranslation();

  const installationUrl = useAppSelector(selectInstallationUrl);
  const locale = useAppSelector(selectLocale);

  // Keep the app's language in sync with the Redux store
  useEffect(() => {
    if (locale) {
      i18n.changeLanguage(locale);
    }
  }, [locale, i18n]);

  // 6) Define your main LinkingOptions
  const linking: LinkingOptions<RootParamList> = {
    prefixes: [installationUrl],
    config: {
      screens: {
        ChatScreen: {
          path: 'app/accounts/:accountId/conversations/:conversationId/:primaryActorId?/:primaryActorType?',
          parse: {
            conversationId: Number,
            primaryActorId: Number,
            primaryActorType: decodeURIComponent,
          },
        },
      },
    },
    getStateFromPath: customGetStateFromPath,

    async getInitialURL() {
      // Check if app was opened from a deep link
      const url = await Linking.getInitialURL();
      if (url) {
        return url;
      }

      // Handle notification from quit state
      const message = await messaging().getInitialNotification();
      if (message) {
        const notification = findNotificationFromFCM({ message });
        const conversationLink = findConversationLinkFromPush({
          notification,
          installationUrl,
        });
        if (conversationLink) {
          return conversationLink;
        }
      }
      return undefined;
    },

    subscribe(listener: (url: string) => void) {
      const onReceiveURL = ({ url }: { url: string }) => listener(url);
      const { remove } = Linking.addEventListener('url', onReceiveURL);

      const unsubscribeNotification = messaging().onNotificationOpenedApp(msg => {
        if (msg) {
          const notification = findNotificationFromFCM({ message: msg });
          const conversationLink = findConversationLinkFromPush({
            notification,
            installationUrl,
          });
          if (conversationLink) {
            listener(conversationLink);
          }
        }
      });

      return () => {
        remove();
        unsubscribeNotification();
      };
    },
  };

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer
      linking={linking}
      ref={navigationRef}
      onReady={() => {
        routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
      }}
      onStateChange={() => {
        routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
      }}>
      <BottomSheetModalProvider>
        <View style={styles.navigationLayout} onLayout={onLayoutRootView}>
          <AppTabs />
        </View>
      </BottomSheetModalProvider>
    </NavigationContainer>
  );
};

export const AppNavigator = () => {
  return (
    <GestureHandlerRootView style={styles.navigationLayout}>
      <KeyboardProvider>
        <RefsProvider>
          <SafeAreaProvider>
            <AppNavigationContainer />
          </SafeAreaProvider>
        </RefsProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  navigationLayout: {
    flex: 1,
  },
});
