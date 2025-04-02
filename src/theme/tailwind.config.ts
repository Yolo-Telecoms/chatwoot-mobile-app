// src/theme/tailwind.config.ts

import * as defaultTheme from 'tailwindcss/defaultTheme';
import * as radixUILightColors from './colors/light';
import * as radixUIDarkColors from './colors/dark';
import * as blackA from './colors/blackA';
import * as whiteA from './colors/whiteA';

const chatwootAppColors = {
  ...blackA,
  ...whiteA,
  ...radixUILightColors,
  ...radixUIDarkColors,
};

export const twConfig = {
  // Merge defaultTheme into your config
  theme: {
    ...defaultTheme,
    extend: {
      colors: {
        ...chatwootAppColors,
      },
      fontSize: {
        xs: '12px',
        cxs: '13px',
        md: '15px',
      },
      fontFamily: {
        'inter-normal-20': ['Inter-400-20'],
        'inter-420-20': ['Inter-420-20'],
        'inter-medium-24': ['Inter-500-24'],
        'inter-580-24': ['Inter-580-24'],
        'inter-semibold-20': ['Inter-600-20'],
      },
    },
  },
  plugins: [],
};
