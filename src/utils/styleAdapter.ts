import type {
  Falsy,
  PressableStateCallbackType,
  RegisteredStyle,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { StyleSheet } from 'react-native';

/**
 * If `valueOrFn` is a function, call it with `args`, otherwise return as-is.
 */
function runIfFn<T, Args extends unknown[]>(
  valueOrFn: T | ((...fnArgs: Args) => T),
  ...args: Args
): T {
  // Instead of a generic "isFunction" type guard, we do a manual cast here.
  if (typeof valueOrFn === 'function') {
    const fn = valueOrFn as (...fnArgs: Args) => T;
    return fn(...args);
  }
  return valueOrFn;
}

/**
 * styleAdapter:
 *  - Accepts a `style` that may be a style object or a function returning a style.
 *  - If `touchState` is provided, calls the style function with that state.
 *  - Flattens any array of styles.
 */
export const styleAdapter = (
  style: StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>),
  touchState?: PressableStateCallbackType,
): ViewStyle | Falsy | RegisteredStyle<ViewStyle> => {
  const _style = touchState ? runIfFn(style, touchState) : style;
  const __style = !Array.isArray(_style) ? _style : StyleSheet.flatten(_style);
  return __style as ViewStyle | Falsy | RegisteredStyle<ViewStyle>;
};
