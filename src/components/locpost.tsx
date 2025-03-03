
import React from 'react';
import { MapPin } from 'lucide-react';

interface LocationDisplayProps {
  locationName?: string;
}

const LocationDisplay: React.FC<LocationDisplayProps> = ({ locationName }) => {
  if (!locationName) return null;
  
  return (
    <div className="flex items-center text-xs text-muted-foreground">
      <MapPin className="h-3 w-3 mr-1" />
      <span>{locationName}</span>
    </div>
  );
};

export default LocationDisplay;
