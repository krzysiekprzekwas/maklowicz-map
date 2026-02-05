import L from 'leaflet';

/**
 * Creates a custom cluster icon that matches the app's visual style
 * Subtle clustering that blends with the existing design
 */
export function createClusterCustomIcon(cluster: any) {
  const childCount = cluster.getChildCount();
  const markers = cluster.getAllChildMarkers();
  
  // Determine dominant location type in cluster
  const typeCounts = { restaurant: 0, attraction: 0, other: 0 };
  markers.forEach((marker: any) => {
    const type = marker.options?.locationType || 'other';
    if (type in typeCounts) {
      typeCounts[type as keyof typeof typeCounts]++;
    }
  });
  
  // Find dominant type
  const dominantType = Object.entries(typeCounts).reduce((a, b) => 
    a[1] > b[1] ? a : b
  )[0] as 'restaurant' | 'attraction' | 'other';

  // Color schemes matching your Tailwind config
  const colorSchemes = {
    restaurant: {
      bg: '#fff3cd',
      border: '#ffc107',
      text: '#8c6d07',
    },
    attraction: {
      bg: '#e0d6f9',
      border: '#8a63d2',
      text: '#502d8e',
    },
    other: {
      bg: '#fdd8d8',
      border: '#e57373',
      text: '#a73737',
    },
  };

  const colors = colorSchemes[dominantType];
  
  // Size based on cluster count (subtle scaling)
  let size = 40;
  let fontSize = '14px';
  let borderWidth = 3;
  
  if (childCount >= 50) {
    size = 55;
    fontSize = '16px';
    borderWidth = 4;
  } else if (childCount >= 20) {
    size = 48;
    fontSize = '15px';
    borderWidth = 3;
  } else if (childCount >= 10) {
    size = 44;
    fontSize = '14px';
    borderWidth = 3;
  }

  // Create HTML for cluster
  const html = `
    <div style="
      display: flex;
      justify-content: center;
      align-items: center;
      width: ${size}px;
      height: ${size}px;
      background-color: ${colors.bg};
      border: ${borderWidth}px solid ${colors.border};
      border-radius: 50%;
      color: ${colors.text};
      font-weight: 600;
      font-size: ${fontSize};
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      position: relative;
    ">
      ${childCount}
      <div style="
        content: '';
        position: absolute;
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 12px 10px 0 10px;
        border-color: ${colors.border} transparent transparent transparent;
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-cluster-icon',
    iconSize: L.point(size, size + 12, true),
    iconAnchor: [size / 2, size + 12],
  });
}
