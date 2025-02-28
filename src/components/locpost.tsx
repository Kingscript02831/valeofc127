
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

  // Determinar qual cidade mostrar
  const cityToDisplay = locationData?.name || userProfile?.city || defaultCity || '';
  const stateToDisplay = locationData?.state || '';

  // Se não temos informações de localização, não mostramos nada
  if (!cityToDisplay) {
    return null;
  }

  const locationText = stateToDisplay 
    ? `${cityToDisplay.toUpperCase()}-${stateToDisplay.toUpperCase()}`
    : cityToDisplay.toUpperCase();

  return (
    <p className="text-sm text-muted-foreground font-medium uppercase flex items-center gap-1">
      <MapPin className="h-4 w-4" /> 
      {locationText}
    </p>
  );
};

export default LocationDisplay;
