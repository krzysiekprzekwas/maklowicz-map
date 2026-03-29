import { LocationType } from '../../types/Location';
import { TYPE_META } from '../../src/lib/locationTypeMeta';
import { MapPin } from 'lucide-react';

interface LocationIconProps {
  type: LocationType | null;
}

const LocationIcon = ({ type }: LocationIconProps) => {
  if (type && TYPE_META[type]) {
    const Icon = TYPE_META[type].icon;
    return <Icon className="h-5 w-5" />;
  }
  return <MapPin className="h-5 w-5" />;
};

export default LocationIcon;
