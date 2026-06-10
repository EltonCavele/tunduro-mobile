import {
  CLUB_WEATHER_LAT,
  CLUB_WEATHER_LON,
  CLUB_WEATHER_TIMEZONE,
} from 'lib/weather.constants';

const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const HOURLY_FORECAST_COUNT = 8;

export interface ClubWeatherCurrent {
  humidity: number;
  temperature: number;
  weatherCode: number;
  windSpeed: number;
}

export interface ClubWeatherHourly {
  temperature: number;
  time: string;
  weatherCode: number;
}

export interface ClubWeather {
  current: ClubWeatherCurrent;
  hourly: ClubWeatherHourly[];
}

interface OpenMeteoForecastResponse {
  current?: {
    relative_humidity_2m?: number;
    temperature_2m?: number;
    weather_code?: number;
    wind_speed_10m?: number;
  };
  hourly?: {
    temperature_2m?: number[];
    time?: string[];
    weather_code?: number[];
  };
}

function buildHourlyForecast(response: OpenMeteoForecastResponse): ClubWeatherHourly[] {
  const times = response.hourly?.time ?? [];
  const temperatures = response.hourly?.temperature_2m ?? [];
  const weatherCodes = response.hourly?.weather_code ?? [];
  const nowMs = Date.now();

  const upcoming = times
    .map((time, index) => ({
      time,
      temperature: temperatures[index],
      weatherCode: weatherCodes[index],
    }))
    .filter((entry) => {
      const entryMs = new Date(entry.time).getTime();
      return !Number.isNaN(entryMs) && entryMs >= nowMs;
    })
    .slice(0, HOURLY_FORECAST_COUNT);

  return upcoming
    .filter(
      (entry): entry is { time: string; temperature: number; weatherCode: number } =>
        typeof entry.temperature === 'number' && typeof entry.weatherCode === 'number'
    )
    .map((entry) => ({
      time: entry.time,
      temperature: entry.temperature,
      weatherCode: entry.weatherCode,
    }));
}

export async function getClubWeather(): Promise<ClubWeather> {
  const params = new URLSearchParams({
    latitude: String(CLUB_WEATHER_LAT),
    longitude: String(CLUB_WEATHER_LON),
    timezone: CLUB_WEATHER_TIMEZONE,
    current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
    hourly: 'temperature_2m,weather_code',
    forecast_days: '1',
  });

  const response = await fetch(`${OPEN_METEO_FORECAST_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error('weather.error.fetchFailed');
  }

  const data = (await response.json()) as OpenMeteoForecastResponse;
  const current = data.current;

  if (
    typeof current?.temperature_2m !== 'number' ||
    typeof current?.relative_humidity_2m !== 'number' ||
    typeof current?.weather_code !== 'number' ||
    typeof current?.wind_speed_10m !== 'number'
  ) {
    throw new Error('weather.error.invalidResponse');
  }

  return {
    current: {
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      weatherCode: current.weather_code,
      windSpeed: current.wind_speed_10m,
    },
    hourly: buildHourlyForecast(data),
  };
}
