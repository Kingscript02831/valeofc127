
import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface LocationContextType {
  userCity: string | null;
  userLocation: { lat: number; lng: number } | null;
  loading: boolean;
  error: string | null;
  updateUserLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType>({
  userCity: null,
  userLocation: null,
  loading: true,
  error: null,
  updateUserLocation: async () => {}
});

export const useUserLocation = () => useContext(LocationContext);

interface LocationManagerProps {
  children: React.ReactNode;
}

export const LocationManager: React.FC<LocationManagerProps> = ({ children }) => {
  const [userCity, setUserCity] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
      setLoading(false);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setUserCity(null);
      setUserLocation(null);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('city, location')
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setUserCity(data.city || null);
        
        // Handle location data from profile
        if (data.location) {
          try {
            // If it's a geography type converted to string, we need to parse it
            if (typeof data.location === 'string') {
              const match = data.location.match(/POINT\(([^ ]+) ([^)]+)\)/);
              if (match) {
                setUserLocation({
                  lng: parseFloat(match[1]),
                  lat: parseFloat(match[2])
                });
              }
            } 
            // If it's already a parsed object/point
            else if (data.location.lat && data.location.lng) {
              setUserLocation({
                lat: data.location.lat,
                lng: data.location.lng
              });
            }
          } catch (err) {
            console.error('Failed to parse location data:', err);
            setUserLocation(null);
          }
        } else {
          setUserLocation(null);
        }
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to fetch user location');
    } finally {
      setLoading(false);
    }
  };

  const updateUserLocation = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      setLoading(true);
      await fetchUserProfile();
    } catch (err) {
      console.error('Error updating location:', err);
      setError('Failed to update location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocationContext.Provider
      value={{
        userCity,
        userLocation,
        loading,
        error,
        updateUserLocation
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

// Function to calculate distance between two points
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  if (!lat1 || !lng1 || !lat2 || !lng2) return -1;

  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};
