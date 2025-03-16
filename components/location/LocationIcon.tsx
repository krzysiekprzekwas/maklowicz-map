import React from 'react';
import { Location } from '../../types/Location';

interface LocationIconProps {
    location: Location | null;
  }

const LocationIcon = ({ location }: LocationIconProps) => {

    const typeIcon = location.type === 'restaurant' ? '🍴' : 
    location.type === 'attraction' ? '🏛️' : '📍';


    return (
        <span>
            {typeIcon}
        </span>
    );
};

export default LocationIcon; 