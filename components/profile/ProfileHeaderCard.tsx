import { LinearGradient } from 'expo-linear-gradient';
import { BadgeCheck, Mail, Phone } from 'lucide-react-native';
import { ImageBackground, Text, View } from 'react-native';

import type { UserProfile } from 'lib/auth.types';
import { getUserDisplayName, getUserInitials } from 'lib/auth-utils';

const START_PAGE_IMAGE = require('../../assets/imgs/startpage.png');

interface ProfileHeaderCardProps {
  user: UserProfile;
}

export function ProfileHeaderCard({ user }: ProfileHeaderCardProps) {
  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(user);

  return (
    <View className="bg-white">
      <ImageBackground
        className="h-[88px] w-full overflow-hidden rounded-[4px]"
        resizeMode="cover"
        source={START_PAGE_IMAGE}>
        <LinearGradient
          className="flex-1 px-3 pb-2 pt-2"
          colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.5)']}>
          <Text className="text-center text-[13px] font-medium text-white">Perfil</Text>
        </LinearGradient>
      </ImageBackground>

      <View className="px-1 pb-1">
        <View className="-mt-6 flex-row items-end justify-between pr-2">
          <LinearGradient
            className="h-[54px] w-[54px] items-center justify-center rounded-full border-[3px] border-white"
            colors={['#C8F5A9', '#74D7B1', '#63A7EE']}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}>
            <Text className="text-[18px] font-semibold text-white">{initials}</Text>
          </LinearGradient>

          <View className="mb-1 flex-row items-center rounded-full bg-[#314335] px-3 py-1">
            <BadgeCheck size={10} stroke="#FFFFFF" strokeWidth={2.2} />
            <Text className="ml-1 text-[10px] font-medium text-white">
              {user.isVerified ? 'Verificada' : 'Pendente'}
            </Text>
          </View>
        </View>

        <Text className="mt-2 text-[18px] font-semibold tracking-[-0.3px] text-[#111111]">
          {displayName}
        </Text>
        <Text className="mt-0.5 text-[11px] uppercase text-[#8A8A8A]">{user.role}</Text>

        <View className="mt-3 flex-row flex-wrap items-center">
          <View className="flex-row items-center">
            <Mail size={12} stroke="#6F6F6F" strokeWidth={2} />
            <Text className="ml-1.5 text-[12px] text-[#6F6F6F]">{user.email}</Text>
          </View>

          <View className="mx-3 h-1 w-1 rounded-full bg-[#B7B7B7]" />

          <View className="flex-row items-center">
            <Phone size={12} stroke="#6F6F6F" strokeWidth={2} />
            <Text className="ml-1.5 text-[12px] text-[#6F6F6F]">
              {user.phone || 'Sem telefone'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
