import L from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import { Utensils, Coffee, TreePine, Palette, Landmark, ShoppingBag, Hotel, Compass, LucideProps } from 'lucide-react';

const iconComponentMap: Partial<Record<LocationType, React.ComponentType<LucideProps>>> = {
    restaurant: Utensils,
    cafe: Coffee,
    attraction: Compass,
    tourist_attraction: Compass,
    museum: Landmark,
    art_culture: Palette,
    nature: TreePine,
    shopping: ShoppingBag,
    hotel: Hotel,
};

const colorClassMap: Partial<Record<LocationType, keyof typeof styles>> = {
    restaurant: 'markerYellow',
    cafe: 'markerYellow',
    attraction: 'markerPurple',
    tourist_attraction: 'markerPurple',
    museum: 'markerPurple',
    art_culture: 'markerPurple',
    nature: 'markerRed',
    shopping: 'markerRed',
    hotel: 'markerRed',
};

import styles from './LocationMapIcon.module.css';
import { LocationType } from '../../types/Location';

const createCustomIcon = (
    type: LocationType,
    title: string = '',
    isSelected: boolean = false,
    isFilteredOut: boolean = false,
    isMobile: boolean = false
): L.DivIcon => {
    const IconComponent = iconComponentMap[type] ?? (() => <span>?</span>);
    if (iconComponentMap[type] === undefined) {
        console.warn(`No icon found for type: ${type}`);
    }
    const colorClassNameKey = colorClassMap[type] ?? 'markerRed';
    const colorModuleClass = styles[colorClassNameKey];

    // Don't render tooltips on mobile for better performance
    const iconHtml = ReactDOMServer.renderToString(
        <>
          <div>
            <IconComponent className={styles.markerIconContent} />
            {!isMobile && title && <div className={styles.markerTooltip}>{title}</div>}
          </div>
        </>
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
