import { LinearGradient } from 'expo-linear-gradient';
import { Clock3, MapPin } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Image, Text, View } from 'react-native';

interface UpcomingMatchCardProps {
  dayLabel: string;
  timeLabel: string;
  courtLabel: string;
  courtName: string;
  opponentName: string;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function MatchStat({
  icon: Icon,
  label,
  value,
  align = 'left',
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  align?: 'left' | 'right';
}) {
  const alignment = align === 'right' ? 'items-end' : 'items-start';

  return (
    <View
      className={`flex-1 rounded-[22px] border border-[#E2E8DF] bg-[#F7F8F4] px-4 py-3 ${alignment}`}>
      <View className="mb-2 flex-row items-center">
        <Icon size={14} stroke="#1F3125" strokeWidth={2.1} />
        <Text className="ml-2 text-[11px] font-semibold uppercase tracking-[0.8px] text-[#5E685F]">
          {label}
        </Text>
      </View>

      <Text className="text-[18px] font-semibold leading-5.5 text-[#121512]">{value}</Text>
    </View>
  );
}

function OpponentRow({ opponentName }: { opponentName: string }) {
  return (
    <View className="mt-3 flex-row items-center rounded-[22px] border border-[#E5EAE4] bg-white px-4 py-4">
      <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-[#1F3125]">
        <Text className="text-[14px] font-bold text-white">{getInitials(opponentName)}</Text>
      </View>

      <View className="flex-1">
        <Text className="text-[11px] font-medium text-[#6F776F]">Oponente</Text>
        <Text className="mt-0.5 text-[16px] font-semibold leading-5 text-[#121512]">
          {opponentName}
        </Text>
      </View>

      <View className="rounded-full bg-[#EEF3EE] px-3 py-1.5">
        <Text className="text-[11px] font-semibold text-[#1F3125]">Pronto</Text>
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
    <View
      className="mt-4 overflow-hidden rounded-[30px] border border-[#E5EAE4] bg-[#F6F7F3]"
      style={{
        shadowColor: '#102017',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 4,
      }}>
      <View className="relative">
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1542144582-1ba00456b5e3?auto=format&fit=crop&w=1200&q=80',
          }}
          className="h-55 w-full"
          resizeMode="cover"
        />

        <LinearGradient
          className="absolute inset-0"
          colors={['rgba(10, 22, 15, 0.18)', 'rgba(10, 22, 15, 0.46)', 'rgba(10, 22, 15, 0.94)']}
        />

        <View className="absolute left-4 top-4 rounded-full bg-[#0F1A12] px-3 py-1.5">
          <Text className="text-[11px] font-semibold uppercase tracking-[0.9px] text-[#F4F7F2]">
            Proxima partida
          </Text>
        </View>

        <View className="absolute inset-x-4 bottom-4 flex-row gap-3">
          <MatchStat icon={Clock3} label={dayLabel} value={timeLabel} />
          <MatchStat icon={MapPin} label={courtLabel} value={courtName} align="right" />
        </View>
      </View>

      <View className="bg-[#F6F7F3] px-4 pb-4 pt-4">
        <Text className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#6B746D]">
          Jogador confirmado
        </Text>

        <OpponentRow opponentName={opponentName} />
      </View>
    </View>
  );
}
