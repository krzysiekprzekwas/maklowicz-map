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
      animate={{ opacity: 1, scale: 1,    borderRadius: 16  }}
      exit={{    opacity: 0, scale: 0.1,  borderRadius: 130 }}
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
        width: 260,
        zIndex: 9000,
        transformOrigin: 'center bottom',
        x: '-50%',
        y: '-100%',
        overflow: 'hidden',
        backgroundColor: 'white',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        pointerEvents: 'auto',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Close button — top-right corner */}
      <button
        onClick={e => { e.stopPropagation(); onClose(); }}
        className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm z-10"
        aria-label="Zamknij"
      >
        <X className="h-4 w-4 text-gray-500" />
      </button>

      {/* Image (only when present) */}
      {location.image && (
        <img
          src={location.image}
          alt={location.name}
          className="w-full h-36 object-cover block cursor-pointer"
          onClick={onOpenDetails}
        />
      )}

      {/* Info row — tap/click opens full details */}
      <div
        className="px-3 py-2.5 cursor-pointer hover:bg-secondary transition-colors"
        onClick={onOpenDetails}
      >
        <div className="flex items-center gap-1.5">
          <TypeIcon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          <span className="font-bold text-primary text-sm leading-snug line-clamp-1 flex-1">
            {location.name}
          </span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mt-0.5">
          {location.summary || location.address}
        </p>
      </div>
    </motion.div>
  );
}
