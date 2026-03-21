import { BookOpen } from 'lucide-react-native';

import { TabPlaceholderScreen } from 'components/screens/TabPlaceholderScreen';

export default function ReservasScreen() {
  return (
    <TabPlaceholderScreen
      description="Acompanhe as reservas confirmadas, pendentes e o histórico das suas quadras."
      icon={BookOpen}
      title="Reservas"
    />
  );
}
