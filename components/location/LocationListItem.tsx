import { Location } from '../../types/Location';
import { TYPE_META } from '../../src/lib/locationTypeMeta';

interface LocationListItemProps {
  location: Location;
  onClick?: (location: Location) => void;
  href?: string;
}

export function LocationListItem({ location, onClick, href }: LocationListItemProps) {
  const meta = TYPE_META[location.type] ?? TYPE_META.tourist_attraction;
  const TypeIcon = meta.icon;

  const content = (
    <div className="flex">
      {/* Inset thumbnail */}
      <div className="flex-shrink-0 w-36 p-2.5">
        <div className="w-full h-full rounded-xl overflow-hidden bg-bg-primary flex items-center justify-center aspect-square">
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
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0 py-3 pr-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-7 h-7 flex items-center justify-center rounded-full bg-accent flex-shrink-0">
            <TypeIcon className="h-5 w-5 text-neutral-1000" />
          </span>
          <span className="font-semibold text-neutral-1000 text-sm line-clamp-1">
            {location.name}
          </span>
        </div>
        <p className="text-xs text-neutral-500 leading-relaxed line-clamp-4">
          {location.summary || location.address}
        </p>
      </div>
    </div>
  );

  const className = "rounded-2xl border border-neutral-200 bg-neutral-0 cursor-pointer hover:shadow-200 transition-shadow overflow-hidden block mx-3 my-2";

  if (href) {
    return <a href={href} className={className}>{content}</a>;
  }

  return (
    <div className={className} onClick={onClick ? () => onClick(location) : undefined}>
      {content}
    </div>
  );
}
