import { CloudSun } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { Text } from 'components/app/Text';
import { formatTemperature } from 'lib/weather-utils';

interface WeatherHeaderButtonProps {
  onPress: () => void;
  temperature?: number;
}

export function WeatherHeaderButton({ onPress, temperature }: WeatherHeaderButtonProps) {
  const hasTemperature = typeof temperature === 'number' && !Number.isNaN(temperature);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Ver estado do tempo"
      className="h-11.5 flex-row items-center justify-center gap-1 rounded-full bg-[#F3F4F2] px-3"
      onPress={onPress}>
      <CloudSun size={20} stroke="#BDE111" strokeWidth={2} />
      {hasTemperature ? (
        <Text className="text-[12px] font-semibold text-[#1F3125]">
          {formatTemperature(temperature)}
        </Text>
      ) : null}
    </Pressable>
  );
}
