// File: src/components-next/spinner/Spinner.tsx

import { useEffect } from 'react';
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

import { LoadingIcon } from '../../svg-icons';
import { withAnchorPoint } from '../../utils';
import { Icon } from '../common/icon';

interface SpinnerProps extends Pick<ViewProps, 'style'> {
  size: number;
  stroke?: string;
}

/**
 * A type for Reanimated's style that extends ViewStyle
 * but ensures `transform` is the only transform we set.
 */
type SpinnerViewStyle = Omit<ViewStyle, 'transform'> & {
  transform?: { rotate: string }[];
};

export function Spinner({ size, style, stroke }: SpinnerProps) {
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
  }, [rotation]);

  // Use the typed style so Reanimated sees it as a valid "DefaultStyle".
  const animatedStyle = useAnimatedStyle<SpinnerViewStyle>(() => {
    const rawTransforms = withAnchorPoint(
      { transform: [{ rotate: `${rotation.value * 360}deg` }] },
      { x: 0.5, y: 0.5 },
      { width: size, height: size },
    );

    // Remove 'transformOrigin' or any other non-ViewStyle fields
    const { transformOrigin, ...rest } = rawTransforms;
    return rest as SpinnerViewStyle;
  });

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      style={[tw`flex items-center justify-center`, animatedStyle, style]}>
      <Icon icon={<LoadingIcon stroke={stroke} />} size={size} />
    </Animated.View>
  );
}
