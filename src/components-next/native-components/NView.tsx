// File: src/components-next/native-components/NView.tsx

import Animated from 'react-native-reanimated';
// Import ES module instead of require()
import ViewNativeComponent from 'react-native/Libraries/Components/View/ViewNativeComponent';

export const NativeView = ViewNativeComponent;

export const AnimatedNativeView = Animated.createAnimatedComponent(
  NativeView,
) as unknown as typeof NativeView;
