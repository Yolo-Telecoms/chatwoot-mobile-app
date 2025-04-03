// File: src/screens/chat-screen/components/message-components/AttachedMedia.tsx

import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Asset } from 'react-native-image-picker';
import Animated, {
  LinearTransition,
  SlideInDown,
  SlideInUp,
  SlideOutDown,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { ResizeMode, Video } from 'expo-av';
import { Image } from 'expo-image';

import { AttachFileIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { useScaleAnimation } from '@/utils';
import { Icon } from '@/components-next/common';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectAttachments, deleteAttachment } from '@/store/conversation/sendMessageSlice';

/** Replace require with a top-level import for your image asset */
import imageCellTimeStampOverlay from '../../../../assets/local/ImageCellTimeStampOverlay.png';

export const PlayIcon = () => {
  return (
    <Svg width="8" height="11" viewBox="0 0 10 13" fill="none">
      <Path d="M0 13V0L10 6.80952L0 13Z" fill="white" fillOpacity="1" />
    </Svg>
  );
};

const formatSecondsToMinutes = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
};

const DeleteIcon = () => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 12 12" fill="none">
      <Path
        d="M9 3L3 9M3 3L9 9"
        stroke="black"
        strokeOpacity="0.478"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

type AttachedMediaProps = {
  item: Asset;
  index: number;
};

type AttachedImageProps = AttachedMediaProps & { attachmentsLength: number };

const AttachedImage = ({ item, index, attachmentsLength }: AttachedImageProps) => {
  const dispatch = useAppDispatch();
  const { animatedStyle, handlers } = useScaleAnimation();

  const handleOnDelete = () => {
    dispatch(deleteAttachment(index));
  };

  return (
    <Animated.View
      entering={SlideInDown.springify().damping(20).stiffness(120)}
      exiting={SlideOutDown.springify().damping(20).stiffness(120)}
      style={tailwind`pr-3 relative`}>
      <Animated.View
        layout={LinearTransition.springify()}
        style={tailwind.style(
          'h-23 w-[137px] rounded-lg',
          index === attachmentsLength - 1 ? 'mr-4' : '',
        )}>
        <Image source={{ uri: item.uri }} style={tailwind`h-full w-full rounded-lg`} />
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            tailwind`border-[1px] rounded-lg border-[#0000000F] z-50`,
          ]}
        />
        <Animated.View
          style={[
            tailwind`absolute h-[19px] w-[19px] border-[1px] border-blackA-A6 bg-whiteA-A11 rounded-full justify-center items-center right-[2px] top-[2px] z-50`,
            animatedStyle,
          ]}>
          <Pressable onPress={handleOnDelete} hitSlop={8} {...handlers}>
            <Icon icon={<DeleteIcon />} size={12} />
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
};

type AttachedVideoProps = AttachedMediaProps & { attachmentsLength: number };

const AttachedVideo = ({ item, index, attachmentsLength }: AttachedVideoProps) => {
  const dispatch = useAppDispatch();
  const { animatedStyle, handlers } = useScaleAnimation();

  const handleOnDelete = () => {
    dispatch(deleteAttachment(index));
  };

  return (
    <Animated.View
      entering={SlideInDown.springify().damping(20).stiffness(120)}
      exiting={SlideOutDown.springify().damping(20).stiffness(120)}
      style={tailwind`pr-3 relative`}>
      <Animated.View
        layout={LinearTransition.springify()}
        style={tailwind.style(
          'h-23 w-[137px] rounded-lg',
          index === attachmentsLength - 1 ? 'mr-4' : '',
        )}>
        {item.uri ? (
          <Video
            shouldPlay={false}
            resizeMode={ResizeMode.COVER}
            source={{ uri: item.uri }}
            style={tailwind`h-full w-full rounded-lg`}
          />
        ) : null}
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            tailwind`border-[1px] rounded-lg border-[#0000000F] z-50`,
          ]}
        />
        <Animated.View
          style={[
            tailwind`absolute h-[19px] w-[19px] border-[1px] border-blackA-A6 bg-whiteA-A11 rounded-full justify-center items-center right-[2px] top-[2px] z-50`,
            animatedStyle,
          ]}>
          <Pressable onPress={handleOnDelete} hitSlop={8} {...handlers}>
            <Icon icon={<DeleteIcon />} size={12} />
          </Pressable>
        </Animated.View>
        {/* Updated import for the overlay image */}
        <Image
          style={[
            StyleSheet.absoluteFillObject,
            tailwind`rounded-lg`,
            { transform: [{ rotateY: '180deg' }] },
          ]}
          source={imageCellTimeStampOverlay}
        />
        <Animated.View style={tailwind`absolute z-50 left-2 bottom-2 flex flex-row items-center`}>
          <PlayIcon />
          <Animated.Text
            style={tailwind`text-whiteA-A12 text-xs font-inter-420-20 leading-[14px] tracking-[0.32px] pl-1`}>
            {typeof item.duration === 'number'
              ? formatSecondsToMinutes(Math.round(item.duration))
              : null}
          </Animated.Text>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
};

type AttachedFileProps = AttachedMediaProps & { attachmentsLength: number };

const AttachedFile = ({ item, index, attachmentsLength }: AttachedFileProps) => {
  const dispatch = useAppDispatch();
  const { animatedStyle, handlers } = useScaleAnimation();

  const handleOnDelete = () => {
    dispatch(deleteAttachment(index));
  };

  return (
    <Animated.View
      entering={SlideInDown.springify().damping(20).stiffness(120)}
      exiting={SlideOutDown.springify().damping(20).stiffness(120)}
      style={tailwind`pr-3 relative`}>
      <Animated.View
        layout={LinearTransition.springify()}
        style={tailwind.style(
          'h-23 w-[137px] rounded-lg items-center justify-center',
          index === attachmentsLength - 1 ? 'mr-4' : '',
        )}>
        <Animated.View style={tailwind`items-center justify-center px-4`}>
          <Icon size={24} icon={<AttachFileIcon />} />
          <Animated.Text
            numberOfLines={1}
            ellipsizeMode="middle"
            style={tailwind`text-base tracking-[0.32px] leading-[22px] font-inter-normal-20 pt-1 text-gray-950`}>
            {item.fileName}
          </Animated.Text>
        </Animated.View>
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            tailwind`border-[1px] rounded-lg border-[#0000000F] z-50`,
          ]}
        />
        <Animated.View
          style={[
            tailwind`absolute h-[19px] w-[19px] border-[1px] border-blackA-A6 bg-whiteA-A11 rounded-full justify-center items-center right-[2px] top-[2px] z-50`,
            animatedStyle,
          ]}>
          <Pressable onPress={handleOnDelete} hitSlop={8} {...handlers}>
            <Icon icon={<DeleteIcon />} size={12} />
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
};

export const AttachedMedia = () => {
  const attachments = useAppSelector(selectAttachments);

  const handleRenderItem = ({ item, index }: { item: Asset; index: number }) => {
    if (item.type?.includes('image')) {
      return <AttachedImage item={item} index={index} attachmentsLength={attachments.length} />;
    }
    if (item.type?.includes('video')) {
      return <AttachedVideo item={item} index={index} attachmentsLength={attachments.length} />;
    }
    return <AttachedFile item={item} index={index} attachmentsLength={attachments.length} />;
  };

  return attachments.length > 0 ? (
    <Animated.View style={tailwind`py-4`}>
      <Animated.FlatList
        itemLayoutAnimation={LinearTransition.springify().damping(25).stiffness(200)}
        entering={SlideInUp}
        exiting={SlideOutDown}
        style={tailwind`px-4 pr-12`}
        horizontal
        showsHorizontalScrollIndicator={false}
        data={attachments}
        renderItem={handleRenderItem}
        keyExtractor={(item: Asset, index) => item.uri ?? index.toString()}
      />
    </Animated.View>
  ) : null;
};
