import type { ReactNode } from 'react';

import { CheckCircle } from 'lucide-react-native';
import { Image, Pressable, View } from 'react-native';

import { LoadingIndicator } from 'components/app/LoadingIndicator';
import { Text } from 'components/app/Text';

import { formatCheckInTimeLabel, type BookingPersonViewModel } from './booking-details.helpers';

export function ScreenState({
  actionLabel,
  description,
  isLoading,
  onPress,
  title,
}: {
  actionLabel?: string;
  description: string;
  isLoading?: boolean;
  onPress?: () => void;
  title: string;
}) {
  return (
    <View className="flex-1 items-center justify-center pt-8">
      <View className="max-w-85 flex w-full items-center justify-center rounded-[30px] px-6 py-8">
        {isLoading ? <LoadingIndicator size="large" /> : null}
        <Text className={`text-center text-[20px] text-[#171717] ${isLoading ? 'mt-4' : ''}`}>
          {title}
        </Text>
        <Text className="mt-3 text-center text-[14px] leading-6 text-[#717171]">{description}</Text>

        {actionLabel && onPress ? (
          <Pressable
            accessibilityRole="button"
            className="mt-6 items-center rounded-full bg-[#1F1F1F] px-5 py-3.5"
            onPress={onPress}>
            <Text className="text-[14px] text-white">{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function StatusPill({
  backgroundColor,
  label,
  textColor,
}: {
  backgroundColor: string;
  label: string;
  textColor: string;
}) {
  return (
    <View className="rounded-[12px] px-3 py-2" style={{ backgroundColor }}>
      <Text className="text-[12px]" style={{ color: textColor }}>
        {label}
      </Text>
    </View>
  );
}

export function CheckInStatusCard({
  checkInAt,
  isOrganizer,
  isParticipant,
}: {
  checkInAt: string;
  isOrganizer: boolean;
  isParticipant: boolean;
}) {
  const timeLabel = formatCheckInTimeLabel(checkInAt);
  const title = isOrganizer
    ? 'Já fizeste check-in'
    : isParticipant
      ? 'Check-in da reserva confirmado'
      : 'Check-in registado';

  return (
    <View className="mt-4 rounded-[20px] border border-[#C8E0C0] bg-[#EEF5ED] px-4 py-4">
      <View className="flex-row items-start gap-3">
        <CheckCircle size={22} stroke="#BDE111" strokeWidth={2} />
        <View className="flex-1">
          <Text className="text-[16px] font-semibold text-[#BDE111]">{title}</Text>
          {timeLabel ? (
            <Text className="mt-1 text-[14px] leading-5 text-[#3F5C45]">{`Às ${timeLabel}.`}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export function InfoCard({
  icon,
  subtitle,
  title,
  titleClassName,
}: {
  icon: ReactNode;
  subtitle?: string | null;
  title: string;
  titleClassName?: string;
}) {
  return (
    <View className="w-full flex-1 rounded-lg bg-gray-50 px-4 py-4">
      {icon}
      <Text className={`leading-6.5 mt-5 text-xl text-[#232323] ${titleClassName ?? ''}`}>
        {title}
      </Text>
      {subtitle ? (
        <Text className="mt-2 text-[14px] leading-6 text-[#8A8A8A]">{subtitle}</Text>
      ) : null}
    </View>
  );
}

export function PersonRow({
  item,
  onPressPhone,
  showDivider,
}: {
  item: BookingPersonViewModel;
  onPressPhone?: () => void;
  showDivider: boolean;
}) {
  void onPressPhone;

  return (
    <View
      className={`flex-row items-center py-3 ${showDivider ? 'border-b border-[#ECECEC]' : ''}`}>
      <PersonAvatar avatarUrl={item.avatarUrl} initials={item.initials} />

      <View className="ml-3 flex-1">
        <Text className="text-[17px] text-[#232323]">{item.label}</Text>
        {item.metaLabel ? (
          <Text className="mt-1 text-[14px] text-[#7E7E7E]">{item.metaLabel}</Text>
        ) : null}
      </View>

      {item.statusLabel ? (
        <View className="rounded-full bg-gray-100 px-3 py-1.5">
          <Text className="text-[11px] text-[#4A4A4A]">{item.statusLabel}</Text>
        </View>
      ) : null}
    </View>
  );
}

function PersonAvatar({ avatarUrl, initials }: { avatarUrl: string | null; initials: string }) {
  if (avatarUrl?.trim()) {
    return <Image className="h-12 w-12 rounded-full" source={{ uri: avatarUrl }} />;
  }

  return (
    <View className="h-12 w-12 items-center justify-center rounded-full bg-[#DDE8DE]">
      <Text className="text-[14px] text-[#BDE111]">{initials}</Text>
    </View>
  );
}
