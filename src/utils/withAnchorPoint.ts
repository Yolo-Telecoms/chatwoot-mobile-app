import type { TransformsStyle } from 'react-native';

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

const isValidSize = (size: Size): boolean => {
  'worklet';
  return size.width > 0 && size.height > 0;
};

const defaultAnchorPoint = { x: 0.5, y: 0.5 };

export function withAnchorPoint(
  transform: TransformsStyle,
  anchorPoint: Point,
  size: Size,
): TransformsStyle {
  'worklet';

  if (!isValidSize(size)) {
    return transform;
  }

  const t = transform.transform; // Use `const` instead of `let`
  if (!t) {
    return transform;
  }

  if (typeof t === 'string') {
    // If transform is a string, we can’t push objects into it
    return transform;
  }

  // Make a mutable copy so we can safely .push()
  const transforms = Array.isArray(t) ? [...t] : [t];

  // X-shift
  if (anchorPoint.x !== defaultAnchorPoint.x && size.width) {
    const shiftTranslateX = [{ translateX: size.width * (anchorPoint.x - defaultAnchorPoint.x) }];
    // Insert before
    transforms.unshift(...shiftTranslateX);
    // Insert after
    transforms.push({
      translateX: size.width * (defaultAnchorPoint.x - anchorPoint.x),
    });
  }

  // Y-shift
  if (anchorPoint.y !== defaultAnchorPoint.y && size.height) {
    const shiftTranslateY = [{ translateY: size.height * (anchorPoint.y - defaultAnchorPoint.y) }];
    // Insert before
    transforms.unshift(...shiftTranslateY);
    // Insert after
    transforms.push({
      translateY: size.height * (defaultAnchorPoint.y - anchorPoint.y),
    });
  }

  return { transform: transforms };
}
