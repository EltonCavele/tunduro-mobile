import { forwardRef } from 'react';

import { TextInput as RNTextInput, type TextInputProps } from 'react-native';

import { resolvePoppinsTextStyle } from 'lib/resolve-poppins-style';

export const TextInput = forwardRef<RNTextInput, TextInputProps>(function AppTextInput(
  { style, ...props },
  ref
) {
  return (
    <RNTextInput ref={ref} {...props} style={resolvePoppinsTextStyle(style, 'input')} />
  );
});

export type { TextInputProps };
