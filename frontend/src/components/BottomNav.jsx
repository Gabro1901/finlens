import { motion } from 'framer-motion';
import { Search, BarChart3, Clock } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', icon: Search, label: 'Search', alwaysEnabled: true },
  { id: 'report', icon: BarChart3, label: 'Report', hasContent: true },
  { id: 'history', icon: Clock, label: 'History', alwaysEnabled: true },
];

export default function BottomNav({ 
  activeView, 
  onNavigate, 
  hasReport 
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-liquid rounded-t-[2.5rem] flex items-center justify-evenly px-6 shadow-2xl" style={{ height: 'var(--bottom-nav-height)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        // If activeView is 'report' but there is no report, we are visually on the home screen
        const effectiveActiveView = (activeView === 'report' && !hasReport) ? 'home' : activeView;
        const isActive = effectiveActiveView === item.id;
        const isDisabled = item.id === 'report' && !hasReport;

        return (
          <div key={item.id} className="relative flex flex-col items-center justify-center">
            <button
              onClick={() => onNavigate(item.id)}
              disabled={isDisabled}
              className={`
                relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300
                ${isActive 
                  ? 'text-rose-400 bg-rose-500/15 shadow-[0_0_20px_rgba(244,63,94,0.15)]' 
                  : isDisabled 
                    ? 'text-zinc-700 cursor-not-allowed' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }
              `}
            >
              <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
            </button>
            {isActive && (
              <motion.div
                layoutId="mobile-nav-indicator"
                className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-rose-400"
                style={{ boxShadow: '0 0 10px rgba(244, 63, 94, 0.8)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
