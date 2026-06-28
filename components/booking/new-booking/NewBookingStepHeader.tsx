import { Text } from 'components/app/Text';
import { View } from 'react-native';

interface NewBookingStepHeaderProps {
  currentStep: number;
  subtitle?: string;
  title: string;
  totalSteps: number;
}

export function NewBookingStepHeader({
  currentStep,
  subtitle,
  title,
  totalSteps,
}: NewBookingStepHeaderProps) {
  return (
    <View className="mb-7">
      <View className="mb-5 flex-row gap-2">
        {Array.from({ length: totalSteps }, (_, index) => (
          <View
            key={index}
            className={`h-2 flex-1 rounded-full ${
              index < currentStep ? 'bg-[#BDE111]' : 'bg-[#E8E8EC]'
            }`}
          />
        ))}
      </View>

      <Text className="font-label text-[15px] text-[#696969]">
        Passo {currentStep}/{totalSteps}
      </Text>

      <Text className="mt-2 font-title-bold text-[30px] leading-[37px] text-[#101010]">
        {title}
      </Text>

      {subtitle ? (
        <Text className="mt-3 font-label text-[16px] leading-[24px] text-[#5A5A5A]">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
