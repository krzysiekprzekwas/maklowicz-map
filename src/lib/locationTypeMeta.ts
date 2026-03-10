import { ComponentType } from 'react';
import { LucideProps, Utensils, Coffee, TreePine, Palette, Landmark, ShoppingBag, Hotel, Compass } from 'lucide-react';

export const TYPE_META: Record<string, { label: string; icon: ComponentType<LucideProps> }> = {
  restaurant:         { label: 'Restauracja',          icon: Utensils       },
  cafe:               { label: 'Kawiarnia',            icon: Coffee         },
  nature:             { label: 'Przyroda i plener',    icon: TreePine       },
  art_culture:        { label: 'Sztuka i kultura',     icon: Palette        },
  museum:             { label: 'Muzeum',               icon: Landmark       },
  shopping:           { label: 'Zakupy',               icon: ShoppingBag    },
  hotel:              { label: 'Hotel',                icon: Hotel          },
  tourist_attraction: { label: 'Atrakcja turystyczna', icon: Compass        },
};

export const LOCATION_TYPES = [
  { type: 'restaurant',         label: 'Restauracje',          icon: Utensils    },
  { type: 'cafe',               label: 'Kawiarnie',            icon: Coffee      },
  { type: 'nature',             label: 'Przyroda i plener',    icon: TreePine    },
  { type: 'art_culture',        label: 'Sztuka i kultura',     icon: Palette     },
  { type: 'museum',             label: 'Muzea',                icon: Landmark    },
  { type: 'shopping',           label: 'Zakupy',               icon: ShoppingBag },
  { type: 'hotel',              label: 'Hotele',               icon: Hotel       },
  { type: 'tourist_attraction', label: 'Atrakcje turystyczne', icon: Compass     },
] as const;
