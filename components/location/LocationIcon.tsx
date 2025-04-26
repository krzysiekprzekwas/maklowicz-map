import React from 'react';
import { LocationType } from '../../types/Location';
import { MapPin, Utensils, Landmark } from 'lucide-react';

interface LocationIconProps {
  type: LocationType | null;
}

const LocationIcon = ({ type }: LocationIconProps) => {
  const typeIcon = type === 'restaurant' ? (
    <Utensils className="h-4 w-4" />
  ) : type === 'attraction' ? (
    <Landmark className="h-4 w-4" />
  ) : (
    <MapPin className="h-4 w-4" />
  );

  return <>{typeIcon}</>;
};

export default LocationIcon;
