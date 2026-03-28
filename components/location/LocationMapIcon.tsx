import L from 'leaflet';
import { TYPE_META } from '../../src/lib/locationTypeMeta';

const colorClassMap: Partial<Record<LocationType, keyof typeof styles>> = {
    restaurant: 'markerFood',
    cafe:        'markerFood',
    art_culture: 'markerCulture',
    museum:      'markerCulture',
    nature:      'markerNature',
    tourist_attraction: 'markerExplore',
    hotel:    'markerExplore',
    shopping: 'markerExplore',
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
    const meta = TYPE_META[type];
    const iconSrc = meta?.iconPath ?? '';
    if (!meta) {
        console.warn(`No icon found for type: ${type}`);
    }
    const colorClassNameKey = colorClassMap[type] ?? 'markerExplore';
    const colorModuleClass = styles[colorClassNameKey];

    const tooltipHtml = !isMobile && title
        ? `<div class="${styles.markerTooltip}">${title}</div>`
        : '';

    const iconHtml = `<div><img src="${iconSrc}" alt="" class="${styles.markerIconContent}" />${tooltipHtml}</div>`;

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
        iconAnchor: [17, 46],
        popupAnchor: [0, -50],
    };

  return L.divIcon(options);
};

export default createCustomIcon;
