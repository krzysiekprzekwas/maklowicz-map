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
      className="flex overflow-hidden rounded-2xl border border-secondary-border mx-3 my-2 bg-white cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick(location)}
    >
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-28 h-28 bg-secondary flex items-center justify-center">
        {location.image ? (
          <img
            src={location.image}
            alt={location.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <TypeIcon className="h-8 w-8 text-primary opacity-30" />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 p-3">
        <div className="flex items-center gap-1.5 mb-0.5">
          <TypeIcon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          <span className="font-semibold text-primary text-sm line-clamp-1">
            {location.name}
          </span>
        </div>
        <p className="text-xs text-gray-500 line-clamp-3">{location.summary || location.address}</p>
        <p className="text-xs text-gray-400 mt-0.5">{location.country}</p>
      </div>
    </div>
  );
}
