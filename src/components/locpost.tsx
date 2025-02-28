import React from 'react';
import { MapPin } from 'lucide-react';
import { Profile } from '@/types/profile';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LocationDisplayProps {
  userId: string;
  defaultCity?: string;
}

const LocationDisplay = ({ userId, defaultCity }: LocationDisplayProps) => {
  // Buscar o perfil do usuário para obter a cidade
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('city, location_id')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return null;
      }
      
      return data as Profile;
    },
    enabled: !!userId,
  });

  // Buscar detalhes da localização se tivermos um location_id
  const { data: locationData } = useQuery({
    queryKey: ['locationDetails', userProfile?.location_id],
    queryFn: async () => {
      if (!userProfile?.location_id) return null;
      
      const { data, error } = await supabase
        .from('locations')
        .select('name, state')
        .eq('id', userProfile.location_id)
        .single();
      
      if (error) {
        console.error('Erro ao buscar localização:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!userProfile?.location_id,
  });

  // Determine which city to show
  const cityToDisplay = locationData?.name || userProfile?.city || defaultCity || '';
  const stateToDisplay = locationData?.state || '';

  // If no location information, don't show anything
  if (!cityToDisplay) {
    return null;
  }

  // Format the location text with max length handling
  const formatLocationText = (city: string, state: string) => {
    const maxCityLength = 15; // Maximum characters for city name
    let formattedCity = city.toUpperCase();
    
    if (formattedCity.length > maxCityLength) {
      formattedCity = `${formattedCity.substring(0, maxCityLength)}...`;
    }

    return state ? `${formattedCity}-${state.toUpperCase()}` : formattedCity;
  };

  const locationText = formatLocationText(cityToDisplay, stateToDisplay);

  return (
    <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 truncate max-w-[200px]">
      <MapPin className="h-3 w-3 flex-shrink-0" /> 
      <span className="truncate">{locationText}</span>
    </p>
  );
};

export default LocationDisplay;
