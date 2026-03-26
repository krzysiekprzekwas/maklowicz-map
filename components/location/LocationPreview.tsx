import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Location } from '../../types/Location';
import { TYPE_META } from '../../src/lib/locationTypeMeta';

interface LocationPreviewProps {
  location: Location;
  pixelPosition: { x: number; y: number };
  onOpenDetails: () => void;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function LocationPreview({
  location,
  pixelPosition,
  onOpenDetails,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: LocationPreviewProps) {
  const typeMeta = TYPE_META[location.type] ?? TYPE_META.tourist_attraction;
  const TypeIcon = typeMeta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.15, borderRadius: 130 }}
      animate={{ opacity: 1, scale: 1, borderRadius: 16 }}
      exit={{ opacity: 0, scale: 0.1, borderRadius: 130 }}
      transition={{
        type: 'spring',
        stiffness: 380,
        damping: 28,
        opacity: { type: 'tween', duration: 0.12 },
      }}
      style={{
        position: 'absolute',
        left: pixelPosition.x,
        top: pixelPosition.y - 8,
        width: 240,
        zIndex: 9000,
        transformOrigin: 'center bottom',
        x: '-50%',
        y: '-100%',
        overflow: 'hidden',
        backgroundColor: 'white',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        pointerEvents: 'auto',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Inset image with rounded corners */}
      {location.image && (
        <div className="px-2.5 pt-2.5 relative">
          <img
            src={location.image}
            alt={location.name}
            className="w-full h-32 object-cover rounded-xl block cursor-pointer"
            onClick={onOpenDetails}
          />
          {/* Close button — on image */}
          <button
            onClick={e => { e.stopPropagation(); onClose(); }}
            className="absolute top-4 right-4 w-[42px] h-[42px] flex items-center justify-center rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm"
            aria-label="Zamknij"
          >
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>
      )}

      {/* Info */}
      <div
        className="px-3 py-2.5 cursor-pointer hover:bg-bg-primary transition-colors"
        onClick={onOpenDetails}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-8 h-8 flex items-center justify-center rounded-full bg-accent flex-shrink-0">
            <TypeIcon className="h-4 w-4 text-neutral-1000" />
          </span>
          <span className="font-semibold text-neutral-1000 text-sm leading-snug line-clamp-1 flex-1">
            {location.name}
          </span>
        </div>
        <p className="text-xs text-neutral-500 leading-relaxed line-clamp-3 mt-0.5">
          {location.summary || location.address}
        </p>
      </div>
    </motion.div>
  );
}
