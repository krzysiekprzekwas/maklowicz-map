import { Location } from '../../types/Location';
import { TYPE_META } from '../../src/lib/locationTypeMeta';

interface LocationListItemProps {
  location: Location;
  onClick: (location: Location) => void;
}

export function LocationListItem({ location, onClick }: LocationListItemProps) {
  const meta = TYPE_META[location.type] ?? TYPE_META.tourist_attraction;
  const TypeIcon = meta.icon;

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 border-b border-secondary-border last:border-b-0 hover:bg-secondary transition-colors cursor-pointer"
      onClick={() => onClick(location)}
    >
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-secondary flex items-center justify-center">
        {location.image ? (
          <img
            src={location.image}
            alt={location.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <TypeIcon className="h-6 w-6 text-primary opacity-30" />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <TypeIcon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          <span className="font-semibold text-primary text-sm line-clamp-1">
            {location.name}
          </span>
        </div>
        <p className="text-xs text-gray-500 line-clamp-1">{location.address}</p>
        <p className="text-xs text-gray-400 mt-0.5">{location.country}</p>
      </div>
    </div>
  );
}
