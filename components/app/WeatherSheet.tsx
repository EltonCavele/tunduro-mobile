import { Dimensions, Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Droplets, MapPin, Wind, X } from 'lucide-react-native';

import { LoadingIndicator } from 'components/app/LoadingIndicator';
import { Text } from 'components/app/Text';
import { useWeatherQuery } from 'hooks/useWeatherQuery';
import { CLUB_WEATHER_LABEL } from 'lib/weather.constants';
import { getErrorMessage } from 'lib/error-utils';
import {
  formatHourLabel,
  formatTemperature,
  formatWindSpeed,
  getWeatherPresentation,
} from 'lib/weather-utils';

interface WeatherSheetProps {
  onClose: () => void;
  visible: boolean;
}

function WeatherMetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Droplets;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-1 rounded-[20px] bg-[#F4F6F4] px-4 py-4">
      <Icon size={18} stroke="#1F3125" strokeWidth={2} />
      <Text className="mt-3 text-[12px] text-[#6F6F6F]">{label}</Text>
      <Text className="mt-1 text-[16px] font-semibold text-[#171717]">{value}</Text>
    </View>
  );
}

const SHEET_MAX_HEIGHT = Dimensions.get('window').height * 0.9;

export function WeatherSheet({ onClose, visible }: WeatherSheetProps) {
  const insets = useSafeAreaInsets();
  const weatherQuery = useWeatherQuery();
  const weather = weatherQuery.data;

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}>
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar estado do tempo"
          className="absolute inset-0 bg-[rgba(17,17,17,0.3)]"
          onPress={onClose}
        />

        <View
          className="rounded-t-[32px] bg-white"
          style={{ maxHeight: SHEET_MAX_HEIGHT, paddingBottom: Math.max(insets.bottom, 16) }}>
          <View className="items-center pt-3">
            <View className="h-1 w-11 rounded-full bg-[#D9D9DD]" />
          </View>

          <ScrollView
            style={{ maxHeight: SHEET_MAX_HEIGHT - 24 }}
            contentContainerStyle={{
              paddingBottom: 16,
              paddingHorizontal: 24,
              paddingTop: 12,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator>
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="font-title text-[18px] text-[#111111]">Estado do tempo</Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fechar"
                className="h-10 w-10 items-center justify-center rounded-full bg-[#F4F4F6]"
                onPress={onClose}>
                <X color="#181818" size={20} strokeWidth={2.2} />
              </Pressable>
            </View>

            {weatherQuery.isLoading && !weather ? (
              <View className="items-center py-10">
                <LoadingIndicator size="large" />
                <Text className="mt-4 text-center text-[14px] text-[#6D6D6D]">
                  A carregar a previsão do tempo...
                </Text>
              </View>
            ) : weatherQuery.isError || !weather ? (
              <View className="items-center rounded-[24px] bg-[#FFF8F7] px-5 py-8">
                <Text className="text-center text-[16px] font-semibold text-[#171717]">
                  Não foi possível carregar o tempo
                </Text>
                <Text className="mt-2 text-center text-[14px] leading-6 text-[#6D6D6D]">
                  {getErrorMessage(weatherQuery.error, 'Verifica a tua ligação e tenta novamente.')}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  className="mt-5 rounded-full bg-[#1F3125] px-5 py-3"
                  onPress={() => void weatherQuery.refetch()}>
                  <Text className="text-[14px] font-semibold text-white">Tentar novamente</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <View className="mb-5 flex-row items-center">
                  <MapPin size={16} stroke="#1F3125" strokeWidth={2} />
                  <Text className="ml-2 text-[14px] text-[#5A5A5A]">{CLUB_WEATHER_LABEL}</Text>
                </View>

                {(() => {
                  const presentation = getWeatherPresentation(weather.current.weatherCode);
                  const WeatherIcon = presentation.icon;

                  return (
                    <View className="mb-6 rounded-[28px] bg-[#1F3125] px-5 py-6">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className="text-[48px] font-semibold leading-[52px] text-white">
                            {formatTemperature(weather.current.temperature)}
                          </Text>
                          <Text className="mt-1 text-[16px] text-[#C8D5CA]">
                            {presentation.label}
                          </Text>
                        </View>
                        <View className="h-16 w-16 items-center justify-center rounded-full bg-[#2A4030]">
                          <WeatherIcon size={32} stroke="#BDE111" strokeWidth={2} />
                        </View>
                      </View>
                    </View>
                  );
                })()}

                <View className="mb-6 flex-row gap-3">
                  <WeatherMetricCard
                    icon={Droplets}
                    label="Humidade"
                    value={`${Math.round(weather.current.humidity)}%`}
                  />
                  <WeatherMetricCard
                    icon={Wind}
                    label="Vento"
                    value={formatWindSpeed(weather.current.windSpeed)}
                  />
                </View>

                {weather.hourly.length > 0 ? (
                  <View>
                    <Text className="mb-3 text-[15px] font-semibold text-[#171717]">
                      Próximas horas
                    </Text>
                    <View className="rounded-[24px] border border-[#ECECEC] bg-white px-2 py-2">
                      {weather.hourly.map((hour, index) => {
                        const presentation = getWeatherPresentation(hour.weatherCode);
                        const HourIcon = presentation.icon;

                        return (
                          <View
                            key={hour.time}
                            className={`flex-row items-center px-3 py-3 ${
                              index < weather.hourly.length - 1 ? 'border-b border-[#F0F0F0]' : ''
                            }`}>
                            <Text className="w-14 text-[13px] text-[#6F6F6F]">
                              {formatHourLabel(hour.time)}
                            </Text>
                            <View className="mx-3 h-9 w-9 items-center justify-center rounded-full bg-[#F4F6F4]">
                              <HourIcon size={18} stroke="#1F3125" strokeWidth={2} />
                            </View>
                            <Text className="flex-1 text-[13px] text-[#5A5A5A]">
                              {presentation.label}
                            </Text>
                            <Text className="text-[14px] font-semibold text-[#171717]">
                              {formatTemperature(hour.temperature)}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ) : null}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
