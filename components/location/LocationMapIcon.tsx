import L from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import { Utensils, MapPin, LucideProps, Landmark } from 'lucide-react';

const iconComponentMap: Record<LocationType, React.ComponentType<LucideProps>> = {
    restaurant: Utensils,
    attraction: Landmark,
    other: MapPin,
};

const colorClassMap: Record<LocationType, keyof typeof styles> = {
    restaurant: 'markerYellow', 
    attraction: 'markerPurple',
    other: 'markerRed',
};

import styles from './CustomMarker.module.css';
import { LocationType } from '../../types/Location';

const createCustomIcon = (
    type: LocationType,
    isSelected: boolean = false,
    isFilteredOut: boolean = false
): L.DivIcon => {
    const IconComponent = iconComponentMap[type];
    const colorClassNameKey = colorClassMap[type];
    const colorModuleClass = styles[colorClassNameKey];

    const iconHtml = ReactDOMServer.renderToString(
        <IconComponent className={styles.markerIconContent} />
    );

    const baseClassName = `${styles.customMarkerIcon} ${colorModuleClass}`;

    let finalClassName = baseClassName;

    if (isSelected) {
        finalClassName = `${baseClassName} ${styles.selectedHighlight}`;
    } else if (isFilteredOut) {
        finalClassName = `${baseClassName} ${styles.filteredOut}`;
    }
      
    const options: L.DivIconOptions = {
        className: `${finalClassName}`,
        html: iconHtml,
        iconSize: [34, 34],
        iconAnchor: [17, 42],
        popupAnchor: [0, -50],
    };

  return L.divIcon(options);
};

export default createCustomIcon;
