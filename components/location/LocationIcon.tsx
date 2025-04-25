import React from 'react';
import { Location } from '../../types/Location';
import { MapPin, Utensils, Castle, Landmark } from 'lucide-react';

interface LocationIconProps {
  location: Location | null;
}

const LocationIcon = ({ location }: LocationIconProps) => {
  const typeIcon = location?.type === 'restaurant' ? (
    <Utensils className="h-4 w-4" />
  ) : location?.type === 'attraction' ? (
    <Landmark className="h-4 w-4" />
  ) : (
    <MapPin className="h-4 w-4" />
  );

  return <>{typeIcon}</>;
};

export default LocationIcon;
