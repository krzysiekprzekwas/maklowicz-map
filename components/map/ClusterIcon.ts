import L from 'leaflet';

/**
 * Creates a custom cluster icon — accent green circle with count
 */
export function createClusterCustomIcon(cluster: any) {
  const childCount = cluster.getChildCount();

  // Size based on cluster count
  let size = 40;
  let fontSize = '14px';

  if (childCount >= 50) {
    size = 55;
    fontSize = '16px';
  } else if (childCount >= 20) {
    size = 48;
    fontSize = '15px';
  } else if (childCount >= 10) {
    size = 44;
    fontSize = '14px';
  }

  const html = `
    <div style="
      display: flex;
      justify-content: center;
      align-items: center;
      width: ${size}px;
      height: ${size}px;
      background-color: #C2FF4E;
      border: 2px solid #00071A;
      border-radius: 50%;
      color: #00071A;
      font-weight: 600;
      font-size: ${fontSize};
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    ">
      ${childCount}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-cluster-icon',
    iconSize: L.point(size, size, true),
    iconAnchor: [size / 2, size / 2],
  });
}
