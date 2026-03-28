import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
    { align: 'start', skipSnaps: false, containScroll: 'trimSnaps' }
  );

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
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
    <div>
      {/* Carousel viewport with edge fades */}
      <div className="relative">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {locations.map((loc, i) => (
              <div
                key={loc.id}
                className={`flex-[0_0_75%] min-w-0 md:flex-[0_0_320px] pl-4 last:pr-4${
                  i === 0 ? ' md:ml-24' : ''
                }`}
              >
                <LocationCard location={loc} />
              </div>
            ))}
          </div>
        </div>

        {/* Left fade — desktop only */}
        {canScrollPrev && (
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-24 hidden md:block"
            style={{ background: 'linear-gradient(to right, #F6F5F2, transparent)' }}
          />
        )}

        {/* Right fade */}
        {canScrollNext && (
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-24"
            style={{ background: 'linear-gradient(to left, #F6F5F2, transparent)' }}
          />
        )}
      </div>

      {/* Navigation — dots (desktop only) + buttons */}
      <div className="flex items-center justify-end md:justify-center gap-2 mt-4 px-4 md:px-24 relative">
        {/* Dots — desktop only */}
        <div className="hidden md:flex items-center gap-1.5">
          {scrollSnaps.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`w-3 h-3 rounded-full border-[1.5px] border-neutral-1000 transition-colors ${
                i === selectedIndex ? 'bg-neutral-300' : 'bg-transparent'
              }`}
              aria-label={`Slajd ${i + 1}`}
            />
          ))}
        </div>

        {/* Buttons — absolute right on desktop, inline on mobile */}
        <div className="flex gap-2 justify-end md:absolute md:right-24">
          <button
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canScrollPrev}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:bg-neutral-200 disabled:text-neutral-300 bg-neutral-1000 text-neutral-0 hover:bg-accent-blue transition-colors"
            aria-label="Poprzedni"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canScrollNext}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:bg-neutral-200 disabled:text-neutral-300 bg-neutral-1000 text-neutral-0 hover:bg-accent-blue transition-colors"
            aria-label="Następny"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
