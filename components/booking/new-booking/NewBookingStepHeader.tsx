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
    <View className="mb-8">
      <View className="mb-6 flex-row gap-2">
        {Array.from({ length: totalSteps }, (_, index) => (
          <View
            key={index}
            className={`h-1 flex-1 rounded-full ${
              index < currentStep ? 'bg-[#BDE111]' : 'bg-[#E8E8EC]'
            }`}
          />
        ))}
      </View>

      <Text className="font-label text-[13px] text-[#8A8A8A]">
        Passo {currentStep} de {totalSteps}
      </Text>

      <Text className="font-title-bold mt-2 text-[28px] leading-[34px] tracking-[-0.4px] text-[#101010]">
        {title}
      </Text>

      {subtitle ? (
        <Text className="font-label mt-3 text-[15px] leading-[22px] text-[#5A5A5A]">{subtitle}</Text>
      ) : null}
    </View>
  );
}
