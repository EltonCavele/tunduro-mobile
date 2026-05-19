import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

export const fonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
} as const;

/** Tipografia semântica da app */
export const typography = {
  body: fonts.regular,
  button: fonts.medium,
  input: fonts.regular,
  label: fonts.regular,
  title: fonts.semibold,
  titleBold: fonts.bold,
} as const;

export const poppinsFontAssets = {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} as const;
