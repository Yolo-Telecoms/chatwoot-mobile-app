// File: src/components-next/common/spinner/Spinner.tsx

import React, { useEffect } from 'react';
import { ViewProps, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import tw from 'twrnc';

import { LoadingIcon } from '@/svg-icons';
import { withAnchorPoint } from '@/utils';
import { Icon } from '@/components-next';

interface SpinnerProps extends Pick<ViewProps, 'style'> {
  size: number;
  stroke?: string;
}

/**
 * A custom style that extends ViewStyle but narrows `transform` to
 * what we actually use (rotate).
 */
type SpinnerRotateViewStyle = Omit<ViewStyle, 'transform'> & {
  transform?: { rotate: string }[];
};

export const Spinner = ({ size, style, stroke }: SpinnerProps) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(rotation.value + 1, {
        duration: 1350,
        easing: Easing.bezier(0, 0, 0.58, 1),
      }),
      -1,
      false,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle<SpinnerRotateViewStyle>(() => {
    // Rotate around center using withAnchorPoint
    const rawTransforms = withAnchorPoint(
      { transform: [{ rotate: `${rotation.value * 360}deg` }] },
      { x: 0.5, y: 0.5 },
      { width: size, height: size },
    );

    // Strip out 'transformOrigin' or any extraneous keys
    const { transformOrigin, ...finalTransforms } = rawTransforms;
    return finalTransforms as SpinnerRotateViewStyle;
  });

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      style={[tw`flex items-center justify-center`, animatedStyle, style]}>
      <Icon icon={<LoadingIcon stroke={stroke} />} size={size} />
    </Animated.View>
  );
};
