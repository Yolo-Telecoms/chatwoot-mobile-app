// File: src/screens/chat-screen/components/message-components/VideoBubble.tsx

import { useCallback, useEffect, useRef, useState, Fragment } from 'react';
import { Platform, Pressable } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut } from 'react-native-reanimated';
import {
  AVPlaybackStatus,
  ResizeMode,
  Video,
  VideoFullscreenUpdate,
  VideoFullscreenUpdateEvent,
} from 'expo-av';
import { Image } from 'expo-image';
import { tailwind } from '@/theme';
import { Spinner } from '@/components-next/spinner';

// Import the image asset directly, so no require() call
import playIconPng from '../../../../assets/local/PlayIcon.png';

type VideoBubbleProps = {
  videoSrc: string;
};

type VideoPlayerProps = Pick<VideoBubbleProps, 'videoSrc'> & {
  playerEnabled?: boolean;
};

export function VideoBubblePlayer(props: VideoPlayerProps) {
  const { videoSrc, playerEnabled = true } = props;

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
      // Restart from beginning after finishing
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
        style={tailwind`w-full ios:h-full aspect-video`}
        ref={videoRef}
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
            {/* Use the ES-imported PNG */}
            <Image source={playIconPng} style={tailwind`h-12 w-12 z-10`} />
          </Pressable>
        </Animated.View>
      )}
    </>
  );
}

export function VideoBubble({ videoSrc }: VideoBubbleProps) {
  return (
    <>
      <VideoBubblePlayer videoSrc={videoSrc} />
      {/* 
        // TODO: Possibly fix or remove the commented code for the ImageBackground overlay, etc.
      */}
    </>
  );
}
