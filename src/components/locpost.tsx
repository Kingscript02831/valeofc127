
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";

export interface UserLocation {
  latitude: number | null;
  longitude: number | null;
  city: string | null;
}

export const useUserLocation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast: toastHook } = useToast();

  // Obter a localização atual do usuário logado
  const { data: currentUserLocation, refetch: refetchUserLocation } = useQuery({
    queryKey: ['userLocation'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return null;

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('location, city')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        // Se o perfil não tiver localização definida
        if (!profile?.location && !profile?.city) {
          return null;
        }

        // Extrair coordenadas do tipo geometry/geography do Supabase
        let latitude = null;
        let longitude = null;
        let city = profile.city;

        // Se for um objeto PostGIS/geografia
        if (profile.location && typeof profile.location === 'object') {
          // Em objetos PostGIS, as coordenadas podem estar em diferentes formatos
          // Esta é uma simplificação, pode precisar ser adaptada conforme a estrutura exata
          if ('coordinates' in profile.location) {
            longitude = profile.location.coordinates[0];
            latitude = profile.location.coordinates[1];
          } else if ('x' in profile.location && 'y' in profile.location) {
            longitude = profile.location.x;
            latitude = profile.location.y;
          }
        }

        return { latitude, longitude, city } as UserLocation;
      } catch (error) {
        console.error("Erro ao buscar localização do usuário:", error);
        return null;
      }
    },
    enabled: true,
  });

  // Função para atualizar a localização do usuário
  const updateUserLocation = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError("Usuário não autenticado");
        toast.error("Você precisa estar logado para atualizar sua localização");
        return null;
      }

      // Solicitar permissão de geolocalização do navegador
      if (!navigator.geolocation) {
        setError("Geolocalização não suportada pelo navegador");
        toast.error("Seu navegador não suporta geolocalização");
        return null;
      }

      // Promisificar a API de geolocalização
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Criar o objeto de localização no formato do PostGIS
      const locationObject = {
        type: 'Point',
        coordinates: [longitude, latitude]
      };

      // Atualizar o perfil do usuário com as novas coordenadas
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          location: locationObject,
          location_updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success("Localização atualizada com sucesso");
      refetchUserLocation();
      return { latitude, longitude, city: currentUserLocation?.city } as UserLocation;
    } catch (error) {
      console.error("Erro ao atualizar localização:", error);
      const errorMessage = (error instanceof Error) ? error.message : "Erro desconhecido";
      setError(errorMessage);
      toast.error(`Erro ao atualizar localização: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Obter localização atual a partir do navegador sem atualizar o perfil
  const getCurrentBrowserLocation = () => {
    return new Promise<UserLocation | null>((resolve, reject) => {
      if (!navigator.geolocation) {
        toast.error("Seu navegador não suporta geolocalização");
        reject(new Error("Geolocalização não suportada"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ 
            latitude, 
            longitude, 
            city: currentUserLocation?.city 
          });
        },
        (error) => {
          console.error("Erro ao obter localização do navegador:", error);
          toast.error("Não foi possível obter sua localização");
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    });
  };

  return {
    userLocation: currentUserLocation,
    isLoading,
    error,
    updateUserLocation,
    getCurrentBrowserLocation,
    refetchUserLocation
  };
};

// Componente para gerenciar e exibir a localização atual
export const LocationManager = () => {
  const { userLocation, isLoading, error, updateUserLocation } = useUserLocation();

  return (
    <div className="p-4 bg-white dark:bg-card shadow rounded-md">
      <h3 className="text-lg font-semibold mb-2">Sua Localização</h3>
      
      {isLoading ? (
        <p className="text-muted-foreground">Atualizando localização...</p>
      ) : userLocation ? (
        <div>
          <p className="text-sm">
            {userLocation.city ? (
              <>Cidade: {userLocation.city}</>
            ) : (
              <>
                Latitude: {userLocation.latitude?.toFixed(6)}<br />
                Longitude: {userLocation.longitude?.toFixed(6)}
              </>
            )}
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Localização não disponível</p>
      )}

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      <button 
        onClick={updateUserLocation}
        disabled={isLoading}
        className="mt-2 px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary/90 transition"
      >
        {isLoading ? "Atualizando..." : "Atualizar Localização"}
      </button>
    </div>
  );
};

// Função para calcular a distância entre dois pontos em km
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distância em km
  return distance;
};

export default useUserLocation;
