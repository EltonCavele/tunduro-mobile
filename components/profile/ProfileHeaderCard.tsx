import { Pencil, Phone } from 'lucide-react-native';
import { ImageBackground, Pressable, Text, View } from 'react-native';

import type { UserProfile } from 'lib/auth.types';
import {
  formatPhoneNumber,
  getUserDisplayName,
  getUserHandle,
  getUserInitials,
} from 'lib/auth-utils';

const START_PAGE_IMAGE = require('../../assets/imgs/tennis.jpg');

interface ProfileHeaderCardProps {
  user: UserProfile;
  onEditPress?: () => void;
}

export function ProfileHeaderCard({ user, onEditPress }: ProfileHeaderCardProps) {
  const displayName = getUserDisplayName(user);
  const handle = getUserHandle(user);
  const contactPhone = formatPhoneNumber(user.phone);

  return (
    <View className="bg-white">
      <ImageBackground
        className="h-[170px] w-full"
        resizeMode="cover"
        source={START_PAGE_IMAGE}></ImageBackground>

      <View className="px-4 pb-1">
        <View className="mt-4 flex flex-row items-center justify-between">
          <Text className="text-[16px] font-semibold tracking-[-0.2px] text-[#111111]">
            {displayName}
          </Text>

          <Pressable
            accessibilityRole="button"
            className="mb-1 flex-row items-center rounded-2xl bg-[#233B2B] px-4 py-3"
            disabled={!onEditPress}
            onPress={onEditPress}>
            <Pencil size={12} stroke="#FFFFFF" strokeWidth={2.1} />
            <Text className="ml-1.5 text-[15px] font-medium text-white">Editar</Text>
          </Pressable>
        </View>

        <Text className="mt-0.5 text-[12px] text-[#7E7E7E]">{handle}</Text>

        <View className="mt-4 flex-row flex-wrap items-center">
          <View className="flex-row items-center">
            <Phone size={14} stroke="#8B8B8B" strokeWidth={2} />
            <Text className="ml-1.5 text-[12px] text-[#7C7C7C]">{contactPhone}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
