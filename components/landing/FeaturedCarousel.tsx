import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronRight } from 'lucide-react';
import { TYPE_META } from '../../src/lib/locationTypeMeta';
import type { Location } from '../../types/Location';

function LocationCard({ location }: { location: Location }) {
  const meta = TYPE_META[location.type] ?? TYPE_META.tourist_attraction;
  const TypeIcon = meta.icon;

  return (
    <Link
      href={`/map?placeId=${encodeURIComponent(location.id)}`}
      className="block rounded-2xl border border-neutral-200 bg-neutral-0 overflow-hidden hover:shadow-200 transition-shadow"
    >
      <div className="h-48 bg-bg-primary overflow-hidden">
        {location.image ? (
          <img
            src={location.image}
            alt={location.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <TypeIcon className="h-10 w-10 text-primary opacity-20" />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-7 h-7 flex items-center justify-center rounded-full bg-accent flex-shrink-0">
            <TypeIcon className="h-3.5 w-3.5 text-neutral-1000" />
          </span>
          <span className="font-semibold text-neutral-1000 text-sm line-clamp-1">
            {location.name}
          </span>
        </div>
        <p className="text-xs text-neutral-500 leading-relaxed line-clamp-3">
          {location.summary || location.address}
        </p>
      </div>
    </Link>
  );
}

interface FeaturedCarouselProps {
  locations: Location[];
}

export function FeaturedCarousel({ locations }: FeaturedCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start', skipSnaps: false },
    [Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative">
      {/* Carousel viewport */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex gap-4 pl-4 md:pl-[max(1rem,calc((100%-48rem)/2+1rem))]">
          {locations.map((loc) => (
            <div key={loc.id} className="flex-[0_0_75%] min-w-0 md:flex-[0_0_320px]">
              <LocationCard location={loc} />
            </div>
          ))}
        </div>
      </div>

      {/* Next arrow */}
      <button
        onClick={() => emblaApi?.scrollNext()}
        className="absolute right-3 top-[calc(50%-28px)] -translate-y-1/2 w-10 h-10 rounded-full bg-neutral-1000/70 text-neutral-0 flex items-center justify-center shadow-lg backdrop-blur-sm hover:bg-neutral-1000/90 transition-colors"
        aria-label="Następny"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-4">
        {scrollSnaps.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === selectedIndex ? 'bg-neutral-1000' : 'bg-neutral-300'
            }`}
            aria-label={`Slajd ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
