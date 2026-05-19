import { forwardRef } from 'react';

import { Text as RNText, type TextProps } from 'react-native';

import { resolvePoppinsTextStyle } from 'lib/resolve-poppins-style';

export const Text = forwardRef<RNText, TextProps>(function AppText({ style, ...props }, ref) {
  return <RNText ref={ref} {...props} style={resolvePoppinsTextStyle(style, 'body')} />;
});

export type { TextProps };
