import type {
  Falsy,
  PressableStateCallbackType,
  RegisteredStyle,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { StyleSheet } from 'react-native';

/** A generic function type: any params, any return */
type AnyFn = (...args: unknown[]) => unknown;

/**
 * Type guard: checks if `value` is a function
 */
function isFunction(value: unknown): value is AnyFn {
  return typeof value === 'function';
}

/**
 * If `valueOrFn` is a function, call it with `args`, otherwise just return it.
 */
function runIfFn<T, Args extends unknown[]>(
  valueOrFn: T | ((...fnArgs: Args) => T),
  ...args: Args
): T {
  return isFunction(valueOrFn) ? valueOrFn(...args) : valueOrFn;
}

const defaultAnchorPoint = { x: 0.5, y: 0.5 };

export const styleAdapter = (
  style: StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>),
  touchState?: PressableStateCallbackType,
): ViewStyle | Falsy | RegisteredStyle<ViewStyle> => {
  const _style = touchState ? runIfFn(style, touchState) : style;
  const __style = !Array.isArray(_style) ? _style : StyleSheet.flatten(_style);
  return __style as ViewStyle | Falsy | RegisteredStyle<ViewStyle>;
};
