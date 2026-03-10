import L from 'leaflet';

/**
 * Creates a custom cluster icon that matches the app's visual style
 * Subtle clustering that blends with the existing design
 */
export function createClusterCustomIcon(cluster: any) {
  const childCount = cluster.getChildCount();
  const markers = cluster.getAllChildMarkers();
  
  // Determine dominant location type in cluster
  const typeCounts = { restaurant: 0, tourist_attraction: 0 };
  markers.forEach((marker: any) => {
    const type = marker.options?.locationType || 'tourist_attraction';
    const key = type === 'restaurant' ? 'restaurant' : 'tourist_attraction';
    typeCounts[key]++;
  });

  // Find dominant type
  const dominantType = Object.entries(typeCounts).reduce((a, b) =>
    a[1] > b[1] ? a : b
  )[0] as 'restaurant' | 'tourist_attraction';

  // Color schemes matching your Tailwind config
  const colorSchemes = {
    restaurant: {
      bg: '#fff3cd',
      border: '#ffc107',
      text: '#8c6d07',
    },
    tourist_attraction: {
      bg: '#dbeafe',
      border: '#3b82f6',
      text: '#1e3a8a',
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
