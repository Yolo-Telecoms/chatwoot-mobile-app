// File: src/navigation/tabs/BottomTabBar.tsx

import { PropsWithChildren } from 'react';
import { Platform, Pressable } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';
import { BlurView, BlurViewProps } from '@react-native-community/blur';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';

import { selectCurrentState } from '@/store/conversation/conversationHeaderSlice';
import {
  ConversationIconFilled,
  ConversationIconOutline,
  InboxIconFilled,
  InboxIconOutline,
  SettingsIconFilled,
  SettingsIconOutline,
} from '@/svg-icons';
// Import tw from twrnc with a named default import:
import tw from 'twrnc';
import { useHaptic, useScaleAnimation, useTabBarHeight } from '@/utils';

import { TabParamList } from './AppTabs';
import { useAppSelector } from '@/hooks';

// Wrap BlurView in reanimated
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const tabExitSpringConfig = { damping: 20, stiffness: 360, mass: 1 };
const tabEnterSpringConfig = { damping: 30, stiffness: 360, mass: 1 };

// 1) Typed props for the icon component
type TabBarIconsProps = {
  focused: boolean;
  route: RouteProp<TabParamList, keyof TabParamList>;
};

function TabBarIcons({ focused, route }: TabBarIconsProps) {
  switch (route.name) {
    case 'Conversations':
      return focused ? <ConversationIconFilled /> : <ConversationIconOutline />;
    case 'Inbox':
      return focused ? <InboxIconFilled /> : <InboxIconOutline />;
    case 'Settings':
      return focused ? <SettingsIconFilled /> : <SettingsIconOutline />;
    default:
      return null;
  }
}

// 2) Typed props for our background container
type TabBarBackgroundProps = BlurViewProps & PropsWithChildren<unknown>;

function TabBarBackground({ children, style, blurAmount, blurType }: TabBarBackgroundProps) {
  const currentState = useAppSelector(selectCurrentState);
  const tabBarHeight = useTabBarHeight();

  const derivedAnimatedState = useDerivedValue(() =>
    currentState === 'Select'
      ? withSpring(1, tabExitSpringConfig)
      : withSpring(0, tabEnterSpringConfig),
  );

  const animatedTabBarStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(derivedAnimatedState.value, [0, 1], [0, tabBarHeight]),
      },
    ],
  }));

  // iOS: use blur, Android: standard view
  return Platform.OS === 'ios' ? (
    <AnimatedBlurView
      blurAmount={blurAmount}
      blurType={blurType}
      style={[style, animatedTabBarStyle]}>
      {children}
    </AnimatedBlurView>
  ) : (
    <Animated.View style={[style, animatedTabBarStyle]}>{children}</Animated.View>
  );
}

// 3) Typed props for each tab item
type TabItemProps = {
  onPress: () => void;
  onLongPress: () => void;
  isFocused: boolean;
  options: {
    tabBarAccessibilityLabel?: string;
    tabBarTestID?: string;
  };
  route: RouteProp<TabParamList, keyof TabParamList>;
};

function TabItem({ onPress, onLongPress, isFocused, options, route }: TabItemProps) {
  const { handlers, animatedStyle } = useScaleAnimation();

  return (
    <Animated.View style={[tw`justify-center items-center flex-1 bg-transparent`, animatedStyle]}>
      <Pressable
        hitSlop={{ top: 2, left: 10, right: 10, bottom: 10 }}
        {...handlers}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        testID={options.tabBarTestID}
        onPress={onPress}
        onLongPress={onLongPress}>
        <TabBarIcons focused={isFocused} route={route} />
      </Pressable>
    </Animated.View>
  );
}

// 4) The actual bottom tab bar
export function BottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const hapticSelection = useHaptic();
  const tabBarHeight = useTabBarHeight();

  return (
    <TabBarBackground
      blurAmount={25}
      blurType="light"
      style={Platform.select({
        ios: [
          tw`flex flex-row absolute w-full bottom-0 pl-[72px] pr-[71px] pt-[11px] pb-8 bg-[#00000009]`,
          { height: tabBarHeight },
        ],
        android: [
          tw`flex flex-row absolute w-full bottom-0 pl-[72px] pr-[71px] py-[11px] bg-white`,
          { height: tabBarHeight },
        ],
      })}>
      {/* Optional line at the top */}
      <Animated.View style={tw`absolute inset-0 h-[1px] bg-blackA-A3`} />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          hapticSelection?.();
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TabItem
            key={route.key}
            route={route as RouteProp<TabParamList, keyof TabParamList>}
            options={options}
            isFocused={isFocused}
            onPress={onPress}
            onLongPress={onLongPress}
          />
        );
      })}
    </TabBarBackground>
  );
}
