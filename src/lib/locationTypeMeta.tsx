import { ComponentType } from 'react';

interface IconProps {
  className?: string;
}

const ICON_PATHS: Record<string, string> = {
  restaurant:         '/icons/restaurant.svg',
  cafe:               '/icons/cafe.svg',
  nature:             '/icons/nature.svg',
  art_culture:        '/icons/art_and_culture.svg',
  museum:             '/icons/museum.svg',
  shopping:           '/icons/shopping.svg',
  hotel:              '/icons/hotel.svg',
  tourist_attraction: '/icons/tourist-attraction.svg',
};

function createIconComponent(src: string): ComponentType<IconProps> {
  const IconComponent = ({ className }: IconProps) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={className} />
  );
  return IconComponent;
}

export const TYPE_META: Record<string, { label: string; icon: ComponentType<IconProps>; iconPath: string }> = {
  restaurant:         { label: 'Restauracja',          icon: createIconComponent(ICON_PATHS.restaurant),         iconPath: ICON_PATHS.restaurant         },
  cafe:               { label: 'Kawiarnia',            icon: createIconComponent(ICON_PATHS.cafe),               iconPath: ICON_PATHS.cafe               },
  nature:             { label: 'Przyroda i plener',    icon: createIconComponent(ICON_PATHS.nature),             iconPath: ICON_PATHS.nature             },
  art_culture:        { label: 'Sztuka i kultura',     icon: createIconComponent(ICON_PATHS.art_culture),        iconPath: ICON_PATHS.art_culture        },
  museum:             { label: 'Muzeum',               icon: createIconComponent(ICON_PATHS.museum),             iconPath: ICON_PATHS.museum             },
  shopping:           { label: 'Zakupy',               icon: createIconComponent(ICON_PATHS.shopping),           iconPath: ICON_PATHS.shopping           },
  hotel:              { label: 'Hotel',                icon: createIconComponent(ICON_PATHS.hotel),              iconPath: ICON_PATHS.hotel              },
  tourist_attraction: { label: 'Atrakcja turystyczna', icon: createIconComponent(ICON_PATHS.tourist_attraction), iconPath: ICON_PATHS.tourist_attraction },
};

export const LOCATION_TYPES = [
  { type: 'restaurant',         label: 'Restauracje',          icon: TYPE_META.restaurant.icon         },
  { type: 'cafe',               label: 'Kawiarnie',            icon: TYPE_META.cafe.icon               },
  { type: 'nature',             label: 'Przyroda i plener',    icon: TYPE_META.nature.icon             },
  { type: 'art_culture',        label: 'Sztuka i kultura',     icon: TYPE_META.art_culture.icon        },
  { type: 'museum',             label: 'Muzea',                icon: TYPE_META.museum.icon             },
  { type: 'shopping',           label: 'Zakupy',               icon: TYPE_META.shopping.icon           },
  { type: 'hotel',              label: 'Hotele',               icon: TYPE_META.hotel.icon              },
  { type: 'tourist_attraction', label: 'Atrakcje turystyczne', icon: TYPE_META.tourist_attraction.icon },
] as const;
