import type { LucideIcon } from 'lucide-react-native';
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
} from 'lucide-react-native';

export interface WeatherPresentation {
  icon: LucideIcon;
  label: string;
}

export function getWeatherPresentation(weatherCode: number): WeatherPresentation {
  if (weatherCode === 0) {
    return { icon: Sun, label: 'Céu limpo' };
  }

  if (weatherCode === 1) {
    return { icon: CloudSun, label: 'Principalmente limpo' };
  }

  if (weatherCode === 2) {
    return { icon: CloudSun, label: 'Parcialmente nublado' };
  }

  if (weatherCode === 3) {
    return { icon: Cloud, label: 'Nublado' };
  }

  if (weatherCode === 45 || weatherCode === 48) {
    return { icon: CloudFog, label: 'Neblina' };
  }

  if (weatherCode >= 51 && weatherCode <= 57) {
    return { icon: CloudRain, label: 'Chuvisco' };
  }

  if (weatherCode >= 61 && weatherCode <= 67) {
    return { icon: CloudRain, label: 'Chuva' };
  }

  if (weatherCode >= 71 && weatherCode <= 77) {
    return { icon: CloudSnow, label: 'Neve' };
  }

  if (weatherCode >= 80 && weatherCode <= 82) {
    return { icon: CloudRain, label: 'Aguaceiros' };
  }

  if (weatherCode >= 85 && weatherCode <= 86) {
    return { icon: CloudSnow, label: 'Aguaceiros de neve' };
  }

  if (weatherCode >= 95 && weatherCode <= 99) {
    return { icon: CloudLightning, label: 'Trovoada' };
  }

  return { icon: CloudSun, label: 'Tempo variável' };
}

export function formatTemperature(celsius: number) {
  return `${Math.round(celsius)}°`;
}

export function formatWindSpeed(kmh: number) {
  return `${Math.round(kmh)} km/h`;
}

export function formatHourLabel(isoTime: string) {
  const date = new Date(isoTime);

  if (Number.isNaN(date.getTime())) {
    return '--:--';
  }

  return new Intl.DateTimeFormat('pt-PT', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Maputo',
  }).format(date);
}
