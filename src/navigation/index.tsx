import React, { useCallback, useRef } from 'react';
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
import { AppTabs } from './tabs/AppTabs';
import i18n from 'i18n';

import { navigationRef } from '../helpers/NavigationHelper';
import { findConversationLinkFromPush, findNotificationFromFCM } from '../helpers/PushHelper';
import { extractConversationIdFromUrl } from '../helpers/conversationHelpers';
import { useAppSelector } from '@/hooks';
import { selectInstallationUrl, selectLocale } from '@/store/settings/settingsSelectors';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RefsProvider } from '@/context';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
  // 2) Build a minimal config object to pass into getStateFromPathLib:
  const minimalConfig: MinimalOptions<RootParamList> = {
    initialRouteName: options?.initialRouteName,
    // If there's no `screens` in `options`, default to an empty object
    screens: options?.screens ?? {},
  };

  // 3) Use that minimal subset to parse the path:
  const state = getStateFromPathLib(path, minimalConfig);

  // 4) If no conversation ID in URL, let default parse stand:
  const conversationId = extractConversationIdFromUrl({ url: path });
  if (!conversationId) {
    return state;
  }

  // 5) Otherwise, override the route to ChatScreen with additional params:
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

messaging().setBackgroundMessageHandler(async () => {
  // ...
});

export const AppNavigationContainer = () => {
  // If you don't use the second array item (error), just destructure fontsLoaded:
  const [fontsLoaded] = useFonts({
    Inter400,
    Inter420,
    Inter500,
    Inter580,
    Inter600,
  });

  const routeNameRef = useRef<string | undefined>();

  const installationUrl = useAppSelector(selectInstallationUrl);
  const locale = useAppSelector(selectLocale);
  i18n.setLocale(locale);

  // 6) Define your main LinkingOptions. No type overrides needed
  //    because `customGetStateFromPath` matches the official signature.
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

    // Use our strictly typed function
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
