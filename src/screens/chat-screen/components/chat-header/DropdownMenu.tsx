// File: src/screens/chat-screen/components/chat-header/DropdownMenu.tsx

import { PropsWithChildren, useCallback, useRef } from 'react';
import { Platform, Pressable, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BottomSheetBackdropProps,
  BottomSheetModal,
  useBottomSheetSpringConfigs,
} from '@gorhom/bottom-sheet';
import * as DropdownMenu from 'zeego/dropdown-menu';

import { BottomSheetWrapper, BottomSheetHeader } from '@/components-next';
import { tailwind } from '@/theme';

export type DashboardList = {
  title: string;
  url?: string;
  onSelect: (url: string | undefined, title: string | undefined) => void;
};

// 1) Provide both arguments to `DropdownMenu.create`
const DropdownMenuTrigger = DropdownMenu.create<React.ComponentProps<typeof DropdownMenu.Trigger>>(
  props => (
    <DropdownMenu.Trigger {...props} asChild>
      <View aria-role="button" style={tailwind`ml-4`}>
        {props.children}
      </View>
    </DropdownMenu.Trigger>
  ),
  'Trigger',
);

const DropdownMenuItem = DropdownMenu.create<React.ComponentProps<typeof DropdownMenu.Item>>(
  props => (
    <DropdownMenu.Item {...props}>
      <View style={tailwind`flex flex-row items-center`}>
        <DropdownMenu.ItemTitle
          style={tailwind`text-base text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px] capitalize`}>
          {props.children}
        </DropdownMenu.ItemTitle>
      </View>
    </DropdownMenu.Item>
  ),
  'Item',
);

// 2) We'll define a simpler custom Backdrop that doesn't rely on `forwardRef`
type BottomSheetBackdropCustomProps = BottomSheetBackdropProps & {
  sheetRef: React.RefObject<BottomSheetModal>;
};

function DropdownMenuBottomSheetBackdrop({
  animatedIndex,
  style,
  sheetRef,
}: BottomSheetBackdropCustomProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animatedIndex.value, [-1, 0], [0, 1]),
  }));

  const handleBackdropPress = () => {
    // Dismiss the bottom sheet
    sheetRef.current?.dismiss({ overshootClamping: true });
  };

  return (
    <Pressable onPress={handleBackdropPress} style={style}>
      <Animated.View style={[tailwind`bg-blackA-A9`, style, animatedStyle]} />
    </Pressable>
  );
}

type ChatDropdownMenuProps = {
  dropdownMenuList: DashboardList[];
  children: React.ReactNode;
};

export function ChatDropdownMenu({
  children,
  dropdownMenuList,
}: PropsWithChildren<ChatDropdownMenuProps>) {
  // 3) Use `BottomSheetModal` as the type, not `BottomSheetModalMethods`
  const contextMenuSheetRef = useRef<BottomSheetModal>(null);

  const openSheet = () => {
    contextMenuSheetRef.current?.present();
  };

  // 4) `closeSheet` is actually used in handleOnOptionSelect
  const closeSheet = () => {
    contextMenuSheetRef.current?.close();
  };

  const { bottom } = useSafeAreaInsets();
  const animationConfigs = useBottomSheetSpringConfigs({
    mass: 1,
    stiffness: 420,
    damping: 30,
  });

  // 5) Provide the custom backdrop, passing the ref as `sheetRef`
  const renderBackdrop = useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <DropdownMenuBottomSheetBackdrop {...backdropProps} sheetRef={contextMenuSheetRef} />
    ),
    [],
  );

  // If platform is Android → use a bottom sheet
  if (Platform.OS === 'android') {
    return (
      <>
        <Pressable onPress={openSheet} style={tailwind`ml-4`} hitSlop={8}>
          {children}
        </Pressable>
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
          // Must pass `children` for `BottomSheetModal`: the content
          snapPoints={[dropdownMenuList.length * 44 + 4 + 37]}>
          <BottomSheetWrapper>
            <BottomSheetHeader headerText="Select action" />
            <Animated.View style={tailwind`py-1 pl-3`}>
              {dropdownMenuList.map((option, index) => {
                const handleOnOptionSelect = () => {
                  option.onSelect(option.url, option.title);
                  setTimeout(() => {
                    closeSheet();
                  }, 100);
                };
                return (
                  <Pressable
                    key={option.title + index}
                    style={tailwind`flex flex-row items-center`}
                    onPress={handleOnOptionSelect}>
                    <Animated.View
                      style={tailwind.style(
                        'flex-1 flex-row justify-between py-[11px] pr-3',
                        index !== dropdownMenuList.length - 1
                          ? 'border-b-[1px] border-blackA-A3'
                          : '',
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

  // Otherwise, iOS → use zeego's DropdownMenu
  return (
    <DropdownMenu.Root>
      <DropdownMenuTrigger>{children}</DropdownMenuTrigger>
      <DropdownMenu.Content>
        {dropdownMenuList.map(menuOption => {
          const handleSelect = () => {
            menuOption.onSelect(menuOption.url, menuOption.title);
          };
          return (
            <DropdownMenuItem key={menuOption.title} onSelect={handleSelect}>
              {menuOption.title}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
