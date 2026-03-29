import L from 'leaflet';
import { TYPE_META } from '../../src/lib/locationTypeMeta';

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

    const tooltipHtml = !isMobile && title
        ? `<div class="${styles.markerTooltip}">${title}</div>`
        : '';

    const iconHtml = `<div><img src="${iconSrc}" alt="" class="${styles.markerIconContent}" />${tooltipHtml}</div>`;

    let finalClassName = styles.customMarkerIcon;

    if (isSelected) {
        finalClassName = `${styles.customMarkerIcon} ${styles.selectedHighlight}`;
    } else if (isFilteredOut) {
        finalClassName = `${styles.customMarkerIcon} ${styles.filteredOut}`;
    }

    const options: L.DivIconOptions = {
        className: finalClassName,
        html: iconHtml,
        iconSize: [40, 45],
        iconAnchor: [20, 45],
        popupAnchor: [0, -45],
    };

  return L.divIcon(options);
};

export default createCustomIcon;
