// File: src/screens/chat-screen/components/message-menu/MessageMenu.tsx

import React, { PropsWithChildren, useCallback, useRef } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { interpolate, runOnJS, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BottomSheetBackdropProps,
  BottomSheetModal,
  useBottomSheetSpringConfigs,
} from '@gorhom/bottom-sheet';
import * as ContextMenu from 'zeego/context-menu';

import { tailwind } from '@/theme';
import { BottomSheetHeader, BottomSheetWrapper, Icon } from '@/components-next/common';

export type MenuOption = {
  title: string;
  icon: React.ReactNode | JSX.Element;
  handleOnPressMenuOption: () => void;
  destructive?: boolean;
};

type MessageMenuProps = {
  menuOptions: MenuOption[];
};

// 1) Instead of forwardRef, define a normal functional component for the backdrop
type CustomBackdropProps = BottomSheetBackdropProps & {
  sheetRef: React.RefObject<BottomSheetModal>;
};

/**
 * The custom backdrop that dims the screen. We pass `sheetRef` as a normal prop.
 */
function ContextMenuBottomSheetBackdrop({ animatedIndex, style, sheetRef }: CustomBackdropProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animatedIndex.value, [-1, 0], [0, 1]),
  }));

  const handleBackdropPress = () => {
    // We can safely call dismiss on the bottom sheet
    sheetRef.current?.dismiss({ overshootClamping: true });
  };

  return (
    <Pressable onPress={handleBackdropPress} style={style}>
      <Animated.View style={[tailwind`bg-blackA-A9`, style, animatedStyle]} />
    </Pressable>
  );
}

// 2) Our context menu triggers for iOS
const ContextMenuTrigger = ContextMenu.create<React.ComponentProps<typeof ContextMenu.Trigger>>(
  props => (
    <ContextMenu.Trigger {...props} asChild>
      <View aria-role="button">{props.children}</View>
    </ContextMenu.Trigger>
  ),
  'Trigger',
);

const ContextMenuItem = ContextMenu.create<React.ComponentProps<typeof ContextMenu.Item>>(
  props => (
    <ContextMenu.Item {...props}>
      <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        {props.children}
      </View>
    </ContextMenu.Item>
  ),
  'Item',
);

// 3) The main component
export function MessageMenu(props: PropsWithChildren<MessageMenuProps>) {
  const { children, menuOptions } = props;

  // The bottom sheet ref
  const contextMenuSheetRef = useRef<BottomSheetModal>(null);

  const openSheet = () => {
    contextMenuSheetRef.current?.present();
  };

  const { bottom } = useSafeAreaInsets();

  const animationConfigs = useBottomSheetSpringConfigs({
    mass: 1,
    stiffness: 420,
    damping: 30,
  });

  // We don't do anything special on dismiss
  const handleOnDismiss = () => {};

  // Pass the custom prop 'sheetRef' to our backdrop
  const renderBackdrop = useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <ContextMenuBottomSheetBackdrop {...backdropProps} sheetRef={contextMenuSheetRef} />
    ),
    [],
  );

  // Define a long press gesture for Android
  const longPressGesture = Gesture.LongPress()
    .minDuration(500)
    .onStart(() => {
      runOnJS(openSheet)();
    });

  if (Platform.OS === 'android') {
    return (
      <>
        <GestureDetector gesture={longPressGesture}>{children}</GestureDetector>
        <BottomSheetModal
          ref={contextMenuSheetRef}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={tailwind`overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]`}
          handleStyle={tailwind`p-0 h-4 pt-[5px]`}
          style={tailwind`mx-3 rounded-[26px] overflow-hidden`}
          detached
          bottomInset={bottom === 0 ? 12 : bottom}
          animationConfigs={animationConfigs}
          enablePanDownToClose
          snapPoints={[menuOptions.length * 44 + 4 + 37]}
          onDismiss={handleOnDismiss}>
          <BottomSheetWrapper>
            <BottomSheetHeader headerText="Select action" />
            <Animated.View style={tailwind`py-1 pl-3`}>
              {menuOptions.map((option, index) => {
                return (
                  <Pressable
                    key={option.title + index}
                    style={tailwind`flex flex-row items-center`}
                    onPress={option.handleOnPressMenuOption}>
                    <Animated.View>
                      <Icon icon={option.icon} size={24} />
                    </Animated.View>
                    <Animated.View
                      style={tailwind.style(
                        'flex-1 ml-3 flex-row justify-between py-[11px] pr-3',
                        index !== menuOptions.length - 1 ? 'border-b-[1px] border-blackA-A3' : '',
                      )}>
                      <Animated.Text
                        style={tailwind`text-base text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px] capitalize`}>
                        {option.title}
                      </Animated.Text>
                    </Animated.View>
                  </Pressable>
                );
              })}
            </Animated.View>
          </BottomSheetWrapper>
        </BottomSheetModal>
      </>
    );
  }

  // For iOS, we use zeego context menu
  return menuOptions.length > 0 ? (
    <ContextMenu.Root>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenu.Content>
        {menuOptions.map(option => (
          <ContextMenuItem
            key={option.title}
            onSelect={option.handleOnPressMenuOption}
            destructive={option.destructive}>
            {option.icon}
            <ContextMenu.ItemTitle>{option.title}</ContextMenu.ItemTitle>
          </ContextMenuItem>
        ))}
      </ContextMenu.Content>
    </ContextMenu.Root>
  ) : (
    <>{children}</>
  );
}
