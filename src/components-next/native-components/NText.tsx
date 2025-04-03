// File: src/components-next/native-components/NText.tsx

// 1) Import TextNativeComponent as a default import, if it has one:
import TextNativeComponent from 'react-native/Libraries/Text/TextNativeComponent';

// 2) Export it under a new name:
export const NativeText = TextNativeComponent;

// 3) If you want an Animated version:
// import Animated from 'react-native-reanimated';
// export const AnimatedNativeText = Animated.createAnimatedComponent(NativeText);
