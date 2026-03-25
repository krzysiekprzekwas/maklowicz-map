import { motion } from 'framer-motion';
import { List, Map } from 'lucide-react';

interface ViewToggleProps {
  activeView: 'map' | 'list';
  onViewChange: (view: 'map' | 'list') => void;
}

const VIEWS = [
  { id: 'list' as const, label: 'Lista', icon: List },
  { id: 'map' as const, label: 'Mapa', icon: Map },
];

export function ViewToggle({ activeView, onViewChange }: ViewToggleProps) {
  return (
    <div
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9990]
                 bg-neutral-0 rounded-full shadow-200 border border-neutral-200
                 flex items-center p-1"
    >
      {VIEWS.map(({ id, label, icon: Icon }) => {
        const isActive = activeView === id;
        return (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            aria-pressed={isActive}
            className="relative flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold select-none transition-colors duration-150"
            style={{ color: isActive ? '#FFFFFF' : '#00071A' }}
          >
            {isActive && (
              <motion.span
                layoutId="view-toggle-thumb"
                className="absolute inset-0 rounded-full"
                style={{ zIndex: -1, backgroundColor: '#00071A' }} /* neutral-1000 */
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Icon className="h-4 w-4" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
