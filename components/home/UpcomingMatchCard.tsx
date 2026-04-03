import { Calendar, Clock3, MapPin } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { BookingStatus, getBookingStatusLabel } from 'lib/calendar-bookings';

interface UpcomingMatchCardProps {
  dayLabel: string;
  timeLabel: string;
  courtLabel: string;
  courtName: string;
  opponentName: string;
  status: BookingStatus;
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
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-2">
      <View className="items-center justify-center rounded-full bg-[#EEF3EE] p-2">
        <Icon size={14} stroke="#1F3125" strokeWidth={2.5} />
      </View>
      <View>
        <Text className="text-[10px] uppercase tracking-wider text-[#7A7A7A]">{label}</Text>
        <Text className="text-[14px] text-[#121512]">{value}</Text>
      </View>
    </View>
  );
}

function getStatusConfig(status: BookingStatus) {
  if (status === BookingStatus.CONFIRMED) {
    return { bgClass: 'bg-[#BDE111]', textClass: 'text-[#171717]', iconColor: '#171717' };
  }
  if (status === BookingStatus.PENDING) {
    return { bgClass: 'bg-[#FFF0CC]', textClass: 'text-[#835600]', iconColor: '#835600' };
  }
  return { bgClass: 'bg-[#E5EAE4]', textClass: 'text-[#6B746D]', iconColor: '#6B746D' };
}

export function UpcomingMatchCard({
  dayLabel,
  timeLabel,
  courtLabel,
  courtName,
  opponentName,
  status,
}: UpcomingMatchCardProps) {
  const statusConfig = getStatusConfig(status);

  return (
    <View
      className="mb-3 overflow-hidden rounded-[24px] border border-[#E5EAE4] bg-white p-4"
      style={{
        shadowColor: '#102017',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
      }}>
      <View className="mb-4 flex-row items-center justify-between">
        <View
          className={`flex-row items-center gap-2 rounded-full ${statusConfig.bgClass} px-3 py-1.5`}>
          <Calendar size={12} stroke={statusConfig.iconColor} strokeWidth={2.5} />
          <Text className={`text-[11px] uppercase tracking-wider ${statusConfig.textClass}`}>
            {getBookingStatusLabel(status)}
          </Text>
        </View>
        <Text className="text-[14px] text-[#121512]">{timeLabel}</Text>
      </View>

      <View className="mb-5 flex-row items-center justify-between">
        <MatchStat icon={MapPin} label={courtLabel} value={courtName} />
      </View>

      <View className="flex-row items-center rounded-[18px] bg-[#F6F7F3] p-3">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-2xl bg-[#D2E4C6]">
          <Text className="text-[13px] text-[#1F3125]">{getInitials(opponentName) || '?'}</Text>
        </View>

        <View className="flex-1">
          <Text className="text-[11px] uppercase tracking-wider text-[#7A7A7A]">Adversário</Text>
          <Text className="text-[15px] text-[#121512]">{opponentName || 'Sem adversário'}</Text>
        </View>

        <View className="items-center justify-center rounded-full bg-white px-3 py-1.5 ">
          <Text className="text-[11px] text-[#1F3125]">Pronto</Text>
        </View>
      </View>
    </View>
  );
}
