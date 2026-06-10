import { useQuery } from '@tanstack/react-query';

import { weatherQueryKeys } from 'lib/query-keys';
import { getClubWeather } from 'services/weather.service';

const WEATHER_STALE_TIME_MS = 10 * 60_000;

export function useWeatherQuery() {
  return useQuery({
    queryKey: weatherQueryKeys.club,
    queryFn: getClubWeather,
    staleTime: WEATHER_STALE_TIME_MS,
  });
}
