import { StyleSheet, type StyleProp, type TextStyle } from 'react-native';

import { typography } from 'lib/typography';

type TypographyRole = 'body' | 'input';

function mapWeightToFontFamily(
  weight: TextStyle['fontWeight'] | undefined,
  role: TypographyRole
): string {
  const base = role === 'input' ? typography.input : typography.body;

  if (weight === undefined || weight === null || weight === 'normal' || weight === '400') {
    return base;
  }

  if (weight === '500' || weight === 'medium') {
    return typography.button;
  }

  if (weight === '600' || weight === 'semibold') {
    return typography.title;
  }

  if (
    weight === '700' ||
    weight === 'bold' ||
    weight === '800' ||
    weight === '900' ||
    weight === 'heavy'
  ) {
    return typography.titleBold;
  }

  if (typeof weight === 'number') {
    if (weight >= 700) {
      return typography.titleBold;
    }

    if (weight >= 600) {
      return typography.title;
    }

    if (weight >= 500) {
      return typography.button;
    }
  }

  return base;
}

function isPoppinsFamily(fontFamily: TextStyle['fontFamily']) {
  return typeof fontFamily === 'string' && fontFamily.startsWith('Poppins_');
}

export function resolvePoppinsTextStyle(
  style: StyleProp<TextStyle> | undefined,
  role: TypographyRole = 'body'
): StyleProp<TextStyle> {
  const flat = StyleSheet.flatten(style);

  if (!flat) {
    return { fontFamily: role === 'input' ? typography.input : typography.body };
  }

  if (isPoppinsFamily(flat.fontFamily)) {
    const { fontWeight: _fontWeight, ...rest } = flat;
    return rest;
  }

  const fontFamily = mapWeightToFontFamily(flat.fontWeight, role);
  const { fontWeight: _fontWeight, ...rest } = flat;

  return {
    ...rest,
    fontFamily,
  };
}
