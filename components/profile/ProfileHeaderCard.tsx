import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Pencil, Phone } from 'lucide-react-native';
import { Image, ImageBackground, Text, View } from 'react-native';

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
}

export function ProfileHeaderCard({ user }: ProfileHeaderCardProps) {
  const displayName = getUserDisplayName(user);
  const handle = getUserHandle(user);
  const initials = getUserInitials(user);
  const contactPhone = formatPhoneNumber(user.phone);
  const locationLabel = user.favoriteCourt || 'Maputo';

  return (
    <View className="bg-white">
      <ImageBackground
        className="h-[170px] w-full"
        resizeMode="cover"
        source={START_PAGE_IMAGE}></ImageBackground>

      <View className="px-4 pb-1">
        <View className="-mt-11 flex-row items-end justify-between">
          <View className="rounded-full border-[3px] border-white bg-white">
            {user.avatarUrl ? (
              <Image
                className="h-[78px] w-[78px] rounded-full"
                resizeMode="cover"
                source={{ uri: user.avatarUrl }}
              />
            ) : (
              <LinearGradient
                className="h-[78px] w-[78px] items-center justify-center rounded-full"
                colors={['#D8FFB2', '#77DDB7', '#5BA8F0']}
                end={{ x: 1, y: 1 }}
                start={{ x: 0, y: 0 }}>
                <Text className="text-[22px] font-semibold text-white">{initials}</Text>
              </LinearGradient>
            )}
          </View>

          <View className="mb-1 flex-row items-center rounded-2xl bg-[#233B2B] px-4 py-3">
            <Pencil size={12} stroke="#FFFFFF" strokeWidth={2.1} />
            <Text className="ml-1.5 text-[15px] font-medium text-white">Editar</Text>
          </View>
        </View>

        <Text className="mt-4 text-[16px] font-semibold tracking-[-0.2px] text-[#111111]">
          {displayName}
        </Text>
        <Text className="mt-0.5 text-[12px] text-[#7E7E7E]">{handle}</Text>

        <View className="mt-4 flex-row flex-wrap items-center">
          <View className="flex-row items-center">
            <MapPin size={14} stroke="#8B8B8B" strokeWidth={2} />
            <Text className="ml-1.5 text-[12px] text-[#7C7C7C]">{locationLabel}</Text>
          </View>

          <View className="ml-6 flex-row items-center">
            <Phone size={14} stroke="#8B8B8B" strokeWidth={2} />
            <Text className="ml-1.5 text-[12px] text-[#7C7C7C]">{contactPhone}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
