import { Pencil, Phone, ShieldCheck } from 'lucide-react-native';
import { Image, ImageBackground, Pressable, Text, View } from 'react-native';

import type { UserProfile } from 'lib/auth.types';
import { formatPhoneNumber, getUserDisplayName } from 'lib/auth-utils';

const START_PAGE_IMAGE = require('../../assets/imgs/tennis.jpg');

interface ProfileHeaderCardProps {
  user: UserProfile;
  onEditPress?: () => void;
}

export function ProfileHeaderCard({ user, onEditPress }: ProfileHeaderCardProps) {
  const displayName = getUserDisplayName(user);
  const contactPhone = formatPhoneNumber(user.phone);
  const initials = (user.firstName?.[0] || '') + (user.lastName?.[0] || '');

  return (
    <View className="bg-white">
      <ImageBackground className="h-[140px] w-full" resizeMode="cover" source={START_PAGE_IMAGE}>
        <View className="h-full w-full bg-black/10" />
      </ImageBackground>

      <View className="px-5">
        <View className="relative -mt-12 mb-3 flex-row items-end justify-between">
          <View className="relative">
            <View className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-[#F5F7F6]">
              {user.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} className="h-full w-full" />
              ) : (
                <View className="h-full w-full items-center justify-center">
                  <Text className="text-[28px] font-bold text-[#1B3022]">
                    {initials.toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
            </View>
            {user.isVerified && (
              <View className="absolute bottom-1 right-1 rounded-full border-2 border-white bg-[#4CAF50] p-1">
                <ShieldCheck size={12} color="white" />
              </View>
            )}
          </View>

          <Pressable
            accessibilityRole="button"
            className="mb-1 flex-row items-center rounded-xl bg-primary px-5 py-3 active:opacity-90"
            disabled={!onEditPress}
            onPress={onEditPress}>
            <Pencil size={12} strokeWidth={2.5} />
            <Text className="ml-2 text-[13px] font-bold ">Editar </Text>
          </Pressable>
        </View>

        <View>
          <View className="flex-row items-center">
            <Text className="text-[22px] font-bold tracking-[-0.5px] text-[#1A1A1A]">
              {displayName}
            </Text>
          </View>

          <View className="mt-2 flex-row items-center">
            <View className="flex-row items-center rounded-md bg-[#F5F7F6] px-2 py-1">
              <Phone size={12} stroke="#7E7E7E" strokeWidth={2} />
              <Text className="ml-1.5 text-[12px] font-medium text-[#7E7E7E]">{contactPhone}</Text>
            </View>

            {user.level && (
              <View className="ml-2 flex-row items-center rounded-md bg-[#E8F5E9] px-2 py-1">
                <Text className="text-[10px] font-bold uppercase tracking-[0.5px] text-[#2E7D32]">
                  {user.level}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
