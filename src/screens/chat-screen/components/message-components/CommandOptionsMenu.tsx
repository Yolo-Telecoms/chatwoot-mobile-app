// File: src/screens/chat-screen/components/message-components/CommandOptionsMenu.tsx

import React from 'react';
import { Alert, Linking, Platform, Pressable, Text } from 'react-native';
import { Asset, launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { pick, types, DocumentPickerResponse } from '@react-native-documents/picker';

import { useAppDispatch } from '@/hooks';
import { AppDispatch } from '@/store'; // <--- Import your typed dispatch
import { updateAttachments } from '@/store/conversation/sendMessageSlice';
import { useRefsContext } from '@/context';
import { AttachFileIcon, CameraIcon, PhotosIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { useHaptic, useScaleAnimation } from '@/utils';
import { Icon } from '@/components-next/common';
import { MAXIMUM_FILE_UPLOAD_SIZE } from '@/constants';
import i18n from '@/i18n';
import { showToast } from '@/helpers/ToastHelper';
import { findFileSize } from '@/helpers/FileHelper';

/**
 * Validate file size, then dispatch
 */
export async function validateFileAndSetAttachments(dispatch: AppDispatch, attachment: Asset) {
  if (findFileSize(attachment.fileSize) <= MAXIMUM_FILE_UPLOAD_SIZE) {
    dispatch(updateAttachments([attachment]));
  } else {
    showToast({ message: i18n.t('CONVERSATION.FILE_SIZE_LIMIT') });
  }
}

/** Allows picking from the device's photo library */
export async function handleOpenPhotosLibrary(dispatch: AppDispatch): Promise<void> {
  if (Platform.OS === 'ios') {
    request(
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.PHOTO_LIBRARY
        : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    ).then(async result => {
      if (result === RESULTS.BLOCKED) {
        Alert.alert(
          'Permission Denied',
          'The permission to access the photo library has been denied and cannot be requested again. Please enable it in your device settings if you wish to access photos.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings(),
            },
          ],
          { cancelable: false },
        );
      }
      if (result === RESULTS.GRANTED || result === RESULTS.LIMITED) {
        const pickedAssets = await launchImageLibrary({
          quality: 1,
          selectionLimit: 4,
          mediaType: 'mixed',
          presentationStyle: 'formSheet',
        });
        if (pickedAssets.didCancel) {
          // User canceled
        } else if (pickedAssets.errorCode) {
          // Handle error
        } else if (pickedAssets.assets && pickedAssets.assets.length > 0) {
          validateFileAndSetAttachments(dispatch, pickedAssets.assets[0]);
        }
      }
    });
  } else {
    request(PERMISSIONS.ANDROID.ACCESS_MEDIA_LOCATION).then(async result => {
      if (result === RESULTS.BLOCKED) {
        Alert.alert(
          'Permission Denied',
          'The permission to access the photo library has been denied and cannot be requested again. Please enable it in your device settings if you wish to access photos.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings(),
            },
          ],
          { cancelable: false },
        );
      }
      if (result === RESULTS.GRANTED) {
        const pickedAssets = await launchImageLibrary({
          quality: 1,
          selectionLimit: 4,
          mediaType: 'mixed',
          presentationStyle: 'formSheet',
        });
        if (pickedAssets.didCancel) {
          // User canceled
        } else if (pickedAssets.errorCode) {
          // Handle error
        } else if (pickedAssets.assets && pickedAssets.assets.length > 0) {
          validateFileAndSetAttachments(dispatch, pickedAssets.assets[0]);
        }
      }
    });
  }
}

/** Allows capturing from camera */
export async function handleLaunchCamera(dispatch: AppDispatch): Promise<void> {
  request(Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA).then(
    async result => {
      if (result === RESULTS.BLOCKED) {
        Alert.alert(
          'Permission Denied',
          'The permission to access the camera has been denied and cannot be requested again. Please enable it in your device settings if you wish to use the camera feature.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings(),
            },
          ],
          { cancelable: false },
        );
      }
      if (RESULTS.GRANTED === result) {
        const imageResult = await launchCamera({
          presentationStyle: 'formSheet',
          mediaType: 'mixed',
        });
        if (imageResult.didCancel) {
          // User canceled
        } else if (imageResult.errorCode) {
          // Handle error
        } else if (imageResult.assets && imageResult.assets.length > 0) {
          validateFileAndSetAttachments(dispatch, imageResult.assets[0]);
        }
      }
    },
  );
}

/** Maps a DocumentPickerResponse to the shape used by our store. */
function mapObject(originalObject: DocumentPickerResponse): Asset[] {
  return [
    {
      fileName: originalObject.name ?? '',
      fileSize: originalObject.size ?? 0,
      type: originalObject.type ?? '',
      uri: originalObject.uri ?? '',
    },
  ];
}

/** Allows picking files from the device. */
export async function handleAttachFile(dispatch: AppDispatch): Promise<void> {
  try {
    const results = await pick({
      types: [
        types.allFiles,
        types.images,
        types.plainText,
        types.audio,
        types.pdf,
        types.zip,
        types.csv,
        types.doc,
        types.docx,
        types.ppt,
        types.pptx,
        types.xls,
        types.xlsx,
      ],
      presentationStyle: 'formSheet',
    });

    if (results.length === 0) {
      // User canceled
      return;
    }

    const pickedAsset = mapObject(results[0])[0];
    validateFileAndSetAttachments(dispatch, pickedAsset);
  } catch (err) {
    if (err instanceof Error && err.message.toLowerCase().includes('cancel')) {
      // User canceled
    } else {
      throw err;
    }
  }
}

/** Menu data */
const ADD_MENU_OPTIONS = [
  {
    icon: <PhotosIcon />,
    title: 'Photos',
    handlePress: handleOpenPhotosLibrary,
  },
  {
    icon: <CameraIcon />,
    title: 'Camera',
    handlePress: handleLaunchCamera,
  },
  {
    icon: <AttachFileIcon />,
    title: 'Attach File',
    handlePress: handleAttachFile,
  },
];

/** Type for each menu item */
type MenuOptionProps = {
  index: number;
  menuOption: (typeof ADD_MENU_OPTIONS)[0];
};

const MenuOption = (props: MenuOptionProps) => {
  const { index, menuOption } = props;
  const dispatch = useAppDispatch();
  const { macrosListSheetRef } = useRefsContext();
  const { animatedStyle, handlers } = useScaleAnimation();
  const hapticSelection = useHaptic();

  const handlePress = () => {
    hapticSelection?.();
    menuOption.handlePress(dispatch);

    if (menuOption.title === 'Macros') {
      macrosListSheetRef.current?.present();
    }
  };

  return (
    <Animated.View style={[tailwind`mb-3`, animatedStyle]}>
      <Pressable onPress={handlePress} {...handlers}>
        <Animated.View key={index} style={tailwind`flex-row items-center justify-start`}>
          <Animated.View style={tailwind`p-2`}>
            <Icon icon={menuOption.icon} size={24} />
          </Animated.View>
          <Text
            style={tailwind`text-base font-inter-normal-20 leading-[18px] tracking-[0.24px] text-gray-950 pl-5`}>
            {menuOption.title}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

export const CommandOptionsMenu = () => {
  const { bottom } = useSafeAreaInsets();
  const isAndroid = Platform.OS === 'android';

  // Adjust container height based on device inset
  const containerHeight = isAndroid
    ? 150 + (bottom === 0 ? 16 : bottom)
    : 110 + (bottom === 0 ? 16 : bottom);

  return (
    <Animated.View
      entering={SlideInDown.springify().damping(38).stiffness(240)}
      exiting={SlideOutDown.springify().damping(38).stiffness(240)}
      style={tailwind.style('mx-1 pt-2 items-start', `h-[${containerHeight}px]`)}>
      {ADD_MENU_OPTIONS.map((menuOption, index) => (
        <MenuOption key={menuOption.title} menuOption={menuOption} index={index} />
      ))}
    </Animated.View>
  );
};
