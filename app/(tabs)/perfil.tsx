import { UserRound } from 'lucide-react-native';

import { TabPlaceholderScreen } from 'components/screens/TabPlaceholderScreen';

export default function PerfilScreen() {
  return (
    <TabPlaceholderScreen
      description="Gerencie seus dados, preferências da conta e informações do jogador."
      icon={UserRound}
      title="Perfil"
    />
  );
}
