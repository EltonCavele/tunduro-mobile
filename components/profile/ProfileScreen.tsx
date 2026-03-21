import {
  BarChart3,
  LogOut,
  Star,
  Wallet,
} from 'lucide-react-native';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfileActionRow } from './ProfileActionRow';
import { ProfileHeaderCard } from './ProfileHeaderCard';

export function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-1 pb-6 pt-1">
        <ProfileHeaderCard />

        <View className="mt-4 px-3">
          <ProfileActionRow icon={Star} label="Minha subscricao" />
          <ProfileActionRow icon={Wallet} label="Pagamentos" />
          <ProfileActionRow icon={BarChart3} label="Estatisticas" />
          <ProfileActionRow icon={LogOut} isLast label="Sair da conta" />
        </View>
      </View>
    </SafeAreaView>
  );
}
