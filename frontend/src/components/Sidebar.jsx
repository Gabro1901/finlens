import { motion } from 'framer-motion';
import { BarChart3, MessageSquare, Clock, Database, Settings, Hexagon } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'report', icon: BarChart3, label: 'Report', hasContent: true },
  { id: 'history', icon: Clock, label: 'History', hasContent: false },
];

export default function Sidebar({ 
  activeView, 
  onNavigate, 
  onOpenSettings, 
  hasReport 
}) {
  const handleClick = (item) => {
    onNavigate(item.id);
  };

  return (
    <aside className="sidebar-bg fixed left-0 top-0 bottom-0 z-50 flex flex-col items-center py-4" style={{ width: 'var(--sidebar-width)' }}>
      {/* Logo */}
      <div className="mb-8 flex items-center justify-center">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
          <Hexagon className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-1 w-full">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          const isDisabled = item.id === 'report' && !hasReport;

          return (
            <div key={item.id} className="relative w-full flex justify-center">
              {/* Active indicator bar */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-rose-400"
                  style={{ boxShadow: '0 0 12px rgba(244, 63, 94, 0.5)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              
              <button
                onClick={() => handleClick(item)}
                disabled={isDisabled}
                title={item.label}
                className={`
                  group relative w-10 h-10 rounded-xl flex items-center justify-center
                  transition-all duration-200 ease-out
                  ${isActive 
                    ? 'text-rose-400 bg-rose-500/10' 
                    : isDisabled 
                      ? 'text-zinc-700 cursor-not-allowed' 
                      : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }
                `}
              >
                <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.2 : 1.8} />
                
                {/* Tooltip */}
                <span className="
                  absolute left-full ml-3 px-2.5 py-1.5 rounded-lg
                  bg-zinc-800 border border-zinc-700 text-zinc-200
                  text-xs font-medium whitespace-nowrap
                  opacity-0 scale-95 pointer-events-none
                  group-hover:opacity-100 group-hover:scale-100
                  transition-all duration-150
                  shadow-xl
                ">
                  {item.label}
                </span>
              </button>
            </div>
          );
        })}
      </nav>

      {/* Settings at bottom */}
      <button
        onClick={onOpenSettings}
        title="Settings"
        className="group relative w-10 h-10 rounded-xl flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50 transition-all duration-200"
      >
        <Settings className="w-[18px] h-[18px]" strokeWidth={1.8} />
        <span className="
          absolute left-full ml-3 px-2.5 py-1.5 rounded-lg
          bg-zinc-800 border border-zinc-700 text-zinc-200
          text-xs font-medium whitespace-nowrap
          opacity-0 scale-95 pointer-events-none
          group-hover:opacity-100 group-hover:scale-100
          transition-all duration-150
          shadow-xl
        ">
          Settings
        </span>
      </button>
    </aside>
  );
}
