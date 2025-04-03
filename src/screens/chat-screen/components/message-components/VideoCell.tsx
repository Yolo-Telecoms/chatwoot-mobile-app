// File: src/screens/chat-screen/components/message-components/VideoCell.tsx

import { useCallback, useEffect, useRef, useState, FC } from 'react';
import { Platform, Pressable, Text } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut } from 'react-native-reanimated';
import {
  AVPlaybackStatus,
  ResizeMode,
  Video,
  VideoFullscreenUpdate,
  VideoFullscreenUpdateEvent,
} from 'expo-av';
import { Image, ImageBackground } from 'expo-image';

import { tailwind } from '@/theme';
import { Channel, Message, MessageStatus, UnixTimestamp } from '@/types';
import { unixTimestampToReadableTime } from '@/utils';
import { Avatar } from '@/components-next/common';
import { Spinner } from '@/components-next/spinner';
import { MenuOption, MessageMenu } from '../message-menu';
import { MESSAGE_TYPES } from '@/constants';
import { DeliveryStatus } from './DeliveryStatus';

// Use ES imports instead of require()
import playIconPng from '../../../../assets/local/PlayIcon.png';
import imageCellTimeStampOverlay from '../../../../assets/local/ImageCellTimeStampOverlay.png';

type VideoCellProps = {
  videoSrc: string;
  shouldRenderAvatar: boolean;
  messageType: number;
  sender: Message['sender'];
  timeStamp: UnixTimestamp;
  status: MessageStatus;
  channel?: Channel;
  isPrivate: boolean;
  sourceId?: string | null;
  menuOptions: MenuOption[];
  errorMessage?: string;
};

type VideoPlayerProps = Pick<VideoCellProps, 'videoSrc'> & {
  playerEnabled?: boolean;
};

export const VideoPlayer: FC<VideoPlayerProps> = ({ videoSrc, playerEnabled = true }) => {
  const videoRef = useRef<Video>(null);
  const [playVideo, setPlayVideo] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoStatus, setVideoStatus] = useState<AVPlaybackStatus | null>(null);

  const handlePlayPress = () => {
    setPlayVideo(true);
    videoRef.current?.presentFullscreenPlayer();
    videoRef.current?.playAsync();
  };

  useEffect(() => {
    if (videoStatus?.isLoaded && videoStatus.didJustFinish) {
      videoRef.current?.playFromPositionAsync(0);
      setPlayVideo(false);
    }
  }, [videoStatus]);

  const handlePlaybackStatus = (status: AVPlaybackStatus) => {
    setVideoStatus(status);
  };

  const handleOnFullScreenUpdate = (event: VideoFullscreenUpdateEvent) => {
    if (event.fullscreenUpdate === VideoFullscreenUpdate.PLAYER_WILL_DISMISS) {
      setPlayVideo(false);
    }
  };

  const handleOnLoadStart = useCallback(() => {
    setVideoLoading(true);
  }, []);

  const handleOnLoad = useCallback(() => {
    setVideoLoading(false);
  }, []);

  return (
    <>
      <Video
        ref={videoRef}
        style={tailwind`w-full ios:h-full aspect-video`}
        source={{ uri: videoSrc }}
        shouldPlay={playVideo}
        resizeMode={Platform.OS === 'android' ? ResizeMode.CONTAIN : ResizeMode.COVER}
        onLoadStart={handleOnLoadStart}
        onLoad={handleOnLoad}
        onPlaybackStatusUpdate={handlePlaybackStatus}
        onFullscreenUpdate={handleOnFullScreenUpdate}
      />
      {videoLoading && (
        <Animated.View style={tailwind`absolute inset-0 flex items-center justify-center`}>
          <Spinner size={20} />
        </Animated.View>
      )}
      {!playVideo && playerEnabled && (
        <Animated.View
          entering={FadeIn.duration(300).easing(Easing.ease)}
          exiting={FadeOut.duration(300).easing(Easing.ease)}
          style={tailwind`absolute inset-0 flex items-center justify-center`}>
          <Pressable
            onPress={handlePlayPress}
            style={tailwind`h-full w-full flex items-center justify-center`}>
            <Image source={playIconPng} style={tailwind`h-12 w-12 z-10`} />
          </Pressable>
        </Animated.View>
      )}
    </>
  );
};

export const VideoCell: FC<VideoCellProps> = props => {
  const {
    videoSrc,
    sender,
    shouldRenderAvatar,
    messageType,
    timeStamp,
    status,
    menuOptions,
    isPrivate,
    channel,
    sourceId,
    errorMessage,
  } = props;

  const isIncoming = messageType === MESSAGE_TYPES.INCOMING;
  const isOutgoing = messageType === MESSAGE_TYPES.OUTGOING;

  // Convert potential null or undefined to string | undefined
  const avatarSrc = sender?.thumbnail ? { uri: sender.thumbnail ?? undefined } : undefined;

  return (
    <Animated.View
      entering={FadeIn.duration(300).easing(Easing.ease)}
      style={tailwind.style(
        'w-full my-[1px]',
        isIncoming && 'items-start',
        isOutgoing && 'items-end',
        !shouldRenderAvatar && isIncoming ? 'ml-7' : '',
        !shouldRenderAvatar && isOutgoing ? 'pr-7' : '',
        shouldRenderAvatar ? 'pb-2' : '',
      )}>
      <Animated.View style={tailwind`flex flex-row`}>
        {isIncoming && shouldRenderAvatar && (
          <Animated.View style={tailwind`flex items-end justify-end mr-1`}>
            <Avatar size="md" src={avatarSrc} name={sender?.name || ''} />
          </Animated.View>
        )}
        <MessageMenu menuOptions={menuOptions}>
          <Animated.View
            style={tailwind.style(
              'relative w-[300px] aspect-video rounded-[14px] overflow-hidden',
              shouldRenderAvatar
                ? isOutgoing
                  ? 'rounded-br-none'
                  : isIncoming
                    ? 'rounded-bl-none'
                    : ''
                : '',
            )}>
            <VideoPlayer videoSrc={videoSrc} />

            <Animated.View
              pointerEvents="none"
              entering={FadeIn.duration(300).easing(Easing.ease)}
              exiting={FadeOut.duration(300).easing(Easing.ease)}>
              <ImageBackground
                source={imageCellTimeStampOverlay}
                style={tailwind.style(
                  'absolute bottom-0 right-0 h-15 w-33 z-20',
                  shouldRenderAvatar
                    ? isOutgoing
                      ? 'rounded-br-none'
                      : isIncoming
                        ? 'rounded-bl-none'
                        : ''
                    : '',
                )}>
                <Animated.View style={tailwind`flex flex-row absolute right-3 bottom-[5px]`}>
                  <Text
                    style={tailwind`text-xs font-inter-420-20 tracking-[0.32px] leading-[14px] text-whiteA-A12 pr-1`}>
                    {unixTimestampToReadableTime(timeStamp)}
                  </Text>
                  <DeliveryStatus
                    isPrivate={isPrivate}
                    status={status}
                    messageType={messageType}
                    channel={channel}
                    errorMessage={errorMessage || ''}
                    sourceId={sourceId}
                  />
                </Animated.View>
              </ImageBackground>
            </Animated.View>
          </Animated.View>
        </MessageMenu>
        {sender?.name && isOutgoing && shouldRenderAvatar && (
          <Animated.View style={tailwind`flex items-end justify-end ml-1`}>
            <Avatar size="md" src={avatarSrc} name={sender.name} />
          </Animated.View>
        )}
      </Animated.View>
    </Animated.View>
  );
};
