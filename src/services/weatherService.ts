import { supabase } from '../lib/supabase';

export interface WeatherData {
  id: string;
  location: string;
  temperature?: number;
  condition?: string;
  humidity?: number;
  wind_speed?: number;
  forecast?: any[];
  fetched_at: string;
  valid_until: string;
}

export const getWeatherData = async (location: string): Promise<WeatherData | null> => {
  const { data, error } = await supabase
    .from('weather_data')
    .select('*')
    .eq('location', location)
    .gt('valid_until', new Date().toISOString())
    .order('fetched_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching weather:', error);
  }

  if (data) {
    return data;
  }

  return generateMockWeather(location);
};

const generateMockWeather = async (location: string): Promise<WeatherData | null> => {
  const mockData = {
    location,
    temperature: Math.round(20 + Math.random() * 15),
    condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
    humidity: Math.round(40 + Math.random() * 40),
    wind_speed: Math.round(5 + Math.random() * 15),
    forecast: Array.from({ length: 7 }, (_, i) => ({
      day: new Date(Date.now() + i * 86400000).toLocaleDateString('en-US', { weekday: 'short' }),
      temp_high: Math.round(20 + Math.random() * 15),
      temp_low: Math.round(10 + Math.random() * 10),
      condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Rain'][Math.floor(Math.random() * 5)],
    })),
  };

  const { data, error } = await supabase
    .from('weather_data')
    .insert(mockData)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error saving weather data:', error);
    return { ...mockData, id: 'temp', fetched_at: new Date().toISOString(), valid_until: new Date(Date.now() + 3600000).toISOString() };
  }

  return data;
};

export const getSampleLocations = (): string[] => {
  return ['Yangon', 'Mandalay', 'Naypyidaw', 'Bago', 'Sagaing'];
};
