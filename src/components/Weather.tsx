
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Cloud, CloudRain, Sun, Loader2 } from "lucide-react";

const Weather = () => {
  const { data: config } = useQuery({
    queryKey: ['site_configuration'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_configuration')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: weather, isLoading } = useQuery({
    queryKey: ['weather', config?.location_city],
    queryFn: async () => {
      if (!config?.enable_weather || !config?.weather_api_key) return null;
      
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${config.location_city},${config.location_state},${config.location_country}&appid=${config.weather_api_key}&units=metric&lang=pt_br`
      );
      
      if (!response.ok) throw new Error('Erro ao carregar dados do clima');
      return response.json();
    },
    enabled: !!config?.enable_weather && !!config?.weather_api_key
  });

  if (!config?.enable_weather) return null;
  
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Carregando clima...</span>
      </div>
    );
  }

  if (!weather) return null;

  const getWeatherIcon = (weatherId: number) => {
    if (weatherId >= 200 && weatherId < 600) return <CloudRain className="h-5 w-5" />;
    if (weatherId >= 800) return <Sun className="h-5 w-5" />;
    return <Cloud className="h-5 w-5" />;
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      {getWeatherIcon(weather.weather[0].id)}
      <span>{Math.round(weather.main.temp)}°C</span>
      <span>{weather.weather[0].description}</span>
      <span>•</span>
      <span>{config.location_city}</span>
    </div>
  );
};

export default Weather;
