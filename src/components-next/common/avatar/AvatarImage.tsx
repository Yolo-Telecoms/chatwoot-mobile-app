import React, { useEffect } from 'react';
import { Image, ImageProps as ExpoImageProps, ImageErrorEventData } from 'expo-image';
import { avatarTheme, tailwind } from '@/theme';
import { cx } from '@/utils';

interface AvatarImageProps {
  /** Additional expo-image props (no RN props) */
  imageProps?: Partial<ExpoImageProps>;
  /** The source for the image */
  src?: ExpoImageProps['source'];
  /** If true, the avatar is square */
  squared?: boolean;
  /** Size key for some theme definition */
  size: keyof typeof avatarTheme.borderRadius.size;
  /** Called if no valid URI or the image fails to load */
  handleFallback: () => void;
}

export const AvatarImage: React.FC<AvatarImageProps> = ({
  imageProps,
  src,
  squared,
  size,
  handleFallback,
}) => {
  // If there's a remote image with empty URI, call fallback immediately
  useEffect(() => {
    if (typeof src === 'object' && 'uri' in src && !src.uri) {
      handleFallback();
    }
  }, [src, handleFallback]);

  const handleExpoImageError = (_err: ImageErrorEventData) => {
    handleFallback();
  };

  return (
    <Image
      source={src}
      style={[
        avatarTheme.borderRadius.size[size],
        tailwind.style(cx(avatarTheme.image, !squared ? avatarTheme.circular : '')),
      ]}
      onError={handleExpoImageError}
      {...imageProps}
    />
  );
};
