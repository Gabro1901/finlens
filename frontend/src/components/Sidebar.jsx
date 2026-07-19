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
    <aside className="sidebar-bg fixed left-0 top-0 bottom-0 z-50 flex flex-col items-center py-6" style={{ width: 'var(--sidebar-width)' }}>
      {/* Logo */}
      <div className="mb-10 flex items-center justify-center">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-theme-accent to-[#e5d2b0] flex items-center justify-center shadow-lg shadow-theme-accent/20">
          <Hexagon className="w-6 h-6 text-theme-bg" strokeWidth={2.5} />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-4 w-full">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          const isDisabled = item.id === 'report' && !hasReport;

          return (
            <div key={item.id} className="relative w-full flex justify-center">
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-theme-accent"
                  style={{ boxShadow: '0 0 16px rgba(248, 231, 201, 0.6)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              
              <button
                onClick={() => handleClick(item)}
                disabled={isDisabled}
                title={item.label}
                className={`
                  group relative w-12 h-12 rounded-2xl flex items-center justify-center
                  transition-all duration-200 ease-out
                  ${isActive 
                    ? 'text-theme-accent bg-theme-accent/15 shadow-[0_0_15px_rgba(248,231,201,0.15)] border border-theme-accent/30' 
                    : isDisabled 
                      ? 'text-zinc-700 cursor-not-allowed' 
                      : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }
                `}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                
                {/* Tooltip */}
                <span className="
                  absolute left-full ml-4 px-3 py-2 rounded-xl
                  bg-zinc-800 border border-zinc-700 text-zinc-100
                  text-xs font-semibold whitespace-nowrap
                  opacity-0 scale-95 pointer-events-none
                  group-hover:opacity-100 group-hover:scale-100
                  transition-all duration-200
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
        className="group relative w-12 h-12 rounded-2xl flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50 transition-all duration-200"
      >
        <Settings className="w-5 h-5" strokeWidth={2} />
        <span className="
          absolute left-full ml-4 px-3 py-2 rounded-xl
          bg-zinc-800 border border-zinc-700 text-zinc-100
          text-xs font-semibold whitespace-nowrap
          opacity-0 scale-95 pointer-events-none
          group-hover:opacity-100 group-hover:scale-100
          transition-all duration-200
          shadow-xl
        ">
          Settings
        </span>
      </button>
    </aside>
  );
}

