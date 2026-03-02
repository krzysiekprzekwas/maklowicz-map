import { motion } from 'framer-motion';

interface ViewToggleProps {
  activeView: 'map' | 'list';
  onViewChange: (view: 'map' | 'list') => void;
}

const VIEWS = [
  { id: 'map' as const, label: 'Mapa' },
  { id: 'list' as const, label: 'Lista' },
];

export function ViewToggle({ activeView, onViewChange }: ViewToggleProps) {
  return (
    <div
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9990]
                 bg-white rounded-full shadow-xl border border-secondary-border
                 flex items-center p-1"
    >
      {VIEWS.map(({ id, label }) => {
        const isActive = activeView === id;
        return (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            aria-pressed={isActive}
            className="relative px-6 py-2 rounded-full text-sm font-semibold select-none transition-colors duration-150"
            style={{ color: isActive ? '#f8f5f0' : '#2c1810' }}
          >
            {isActive && (
              <motion.span
                layoutId="view-toggle-thumb"
                className="absolute inset-0 bg-primary rounded-full"
                style={{ zIndex: -1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            {label}
          </button>
        );
      })}
    </div>
  );
}
