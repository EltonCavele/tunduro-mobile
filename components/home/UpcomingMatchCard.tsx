import { User } from 'lucide-react-native';
import { Image, Text, View } from 'react-native';

interface UpcomingMatchCardProps {
  dayLabel: string;
  timeLabel: string;
  courtLabel: string;
  courtName: string;
  opponentName: string;
}

function MatchMetaBlock({
  label,
  value,
  align = 'left',
}: {
  label: string;
  value: string;
  align?: 'left' | 'right';
}) {
  const alignment = align === 'right' ? 'items-end' : 'items-start';

  return (
    <View className={alignment}>
      <Text className="text-xs font-semibold uppercase tracking-[0.6px] text-black">{label}</Text>
      <Text className="mt-0.5 text-[18px] font-bold leading-[22px] text-black">{value}</Text>
    </View>
  );
}

function OpponentRow({ opponentName }: { opponentName: string }) {
  return (
    <View className="mt-4 flex-row items-center">
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-[#D9D9D9]">
        <User size={18} stroke="#1f1f1f" />
      </View>

      <View className="flex-1">
        <Text className="text-xs font-medium text-[#191919]">Oponente</Text>
        <Text className="text-[18px] font-bold leading-[22px] text-black">{opponentName}</Text>
      </View>
    </View>
  );
}

export function UpcomingMatchCard({
  dayLabel,
  timeLabel,
  courtLabel,
  courtName,
  opponentName,
}: UpcomingMatchCardProps) {
  return (
    <View className="mt-4 rounded-2xl bg-[#1F31250D] px-4 pb-4 pt-4">
      <View className="flex-row items-start justify-between">
        <MatchMetaBlock label={dayLabel} value={timeLabel} />
        <MatchMetaBlock label={courtLabel} value={courtName} align="right" />
      </View>

      <View className="mt-3 h-[1px] bg-gray-300" />

      <OpponentRow opponentName={opponentName} />

      <Image
        source={{
          uri: 'https://images.unsplash.com/photo-1542144582-1ba00456b5e3?auto=format&fit=crop&w=1200&q=80',
        }}
        className="mt-4 h-[240px] w-full rounded-[18px]"
        resizeMode="cover"
      />
    </View>
  );
}
