
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | number | Date): string {
  const now = new Date();
  const postDate = new Date(date);
  const diffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return 'Agora mesmo';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} min`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d`;
  } else {
    return postDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}

/**
 * Gets the user's location from their profile
 * @param profile The user profile object
 * @returns The location name (city or location_id reference)
 */
export function getUserLocation(profile: any): string | null {
  // First try to get the city directly from profile
  if (profile?.city) {
    return profile.city;
  }
  
  // If location_id is set but city isn't, return the id reference
  if (profile?.location_id) {
    return profile.location_id;
  }
  
  // No location information available
  return null;
}
